import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

export interface AuthenticatedUser {
  telegramId: string;
  telegramUser: {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
    languageCode?: string;
  };
  tonWallet: {
    address: string;
    isConnected: boolean;
  };
  databaseUser: {
    id: number;
    username?: string;
    wallet_address: string;
    balance: number;
    total_deposit: number;
    total_withdrawn: number;
    total_earned: number;
    team_volume: number;
    rank: string;
    has_nft?: boolean;
    is_active: boolean;
    login_streak: number;
    last_login_date: string;
  } | null;
  isFullyAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  updateUserData: (data: Partial<NonNullable<AuthenticatedUser['databaseUser']>>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const [tonConnectUI] = useTonConnectUI();
  const tonAddress = useTonAddress();
  const telegramData = useSignal(initData.state);
  const { user: dbUser, updateUserData: updateDbUser } = useAuth();

  // Initialize authentication
  useEffect(() => {
    initializeAuth();
  }, [telegramData, tonAddress, dbUser]);

  const initializeAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if we have Telegram data
      if (!telegramData?.user) {
        setError('Please open this app in Telegram');
        setIsLoading(false);
        return;
      }

      const telegramUser = telegramData.user;
      const telegramId = String(telegramUser.id);

      // Create authenticated user object
      const authenticatedUser: AuthenticatedUser = {
        telegramId,
        telegramUser: {
          id: telegramUser.id,
          username: telegramUser.username,
          firstName: telegramUser.firstName,
          lastName: telegramUser.lastName,
          photoUrl: telegramUser.photoUrl,
          languageCode: telegramUser.languageCode,
        },
        tonWallet: {
          address: tonAddress || '',
          isConnected: !!tonAddress,
        },
        databaseUser: dbUser ? {
          id: dbUser.id,
          username: dbUser.username,
          wallet_address: dbUser.wallet_address || '',
          balance: dbUser.balance || 0,
          total_deposit: dbUser.total_deposit || 0,
          total_withdrawn: dbUser.total_withdrawn || 0,
          total_earned: dbUser.total_earned || 0,
          team_volume: dbUser.team_volume || 0,
          rank: dbUser.rank || 'Novice',
          has_nft: dbUser.has_nft,
          is_active: dbUser.is_active || true,
          login_streak: dbUser.login_streak || 0,
          last_login_date: dbUser.last_login_date || new Date().toISOString(),
        } : null,
        isFullyAuthenticated: !!dbUser && !!tonAddress,
        isLoading: false,
        error: null,
      };

      setUser(authenticatedUser);

      // If user has TON wallet connected, update database
      if (tonAddress && dbUser) {
        await updateWalletAddress(dbUser.id, tonAddress);
      }

    } catch (err) {
      console.error('Authentication initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateWalletAddress = async (userId: number, walletAddress: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          wallet_address: walletAddress,
          last_active: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUser(prev => prev ? {
        ...prev,
        databaseUser: prev.databaseUser ? {
          ...prev.databaseUser,
          wallet_address: walletAddress,
        } : null,
        tonWallet: {
          address: walletAddress,
          isConnected: true,
        },
        isFullyAuthenticated: !!prev.databaseUser,
      } : null);

    } catch (error) {
      console.error('Failed to update wallet address:', error);
    }
  };

  const login = async () => {
    // Login is handled automatically through Telegram and TON Connect
    await initializeAuth();
  };

  const logout = async () => {
    try {
      // Disconnect TON wallet
      await tonConnectUI?.disconnect();
      
      // Clear local state
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const connectWallet = async () => {
    try {
      await tonConnectUI?.connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError('Failed to connect wallet');
    }
  };

  const disconnectWallet = async () => {
    try {
      await tonConnectUI?.disconnect();
      
      // Update local state
      setUser(prev => prev ? {
        ...prev,
        tonWallet: {
          address: '',
          isConnected: false,
        },
        isFullyAuthenticated: false,
      } : null);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const updateUserData = async (data: Partial<NonNullable<AuthenticatedUser['databaseUser']>>) => {
    if (!user?.databaseUser?.id) return;

    try {
      await updateDbUser(data);

      // Update local state
      setUser(prev => prev ? {
        ...prev,
        databaseUser: prev.databaseUser ? {
          ...prev.databaseUser,
          ...data,
        } : null,
      } : null);
    } catch (error) {
      console.error('Failed to update user data:', error);
    }
  };

  const refreshUser = async () => {
    await initializeAuth();
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    logout,
    connectWallet,
    disconnectWallet,
    updateUserData,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 