import { useAuthContext } from '@/contexts/AuthContext';

export const useAuthentication = () => {
  const authContext = useAuthContext();

  // Authentication status checks
  const isTelegramAuthenticated = !!authContext.user?.telegramUser;
  const isWalletConnected = !!authContext.user?.tonWallet.isConnected;
  const isDatabaseUserActive = !!authContext.user?.databaseUser;
  const isFullyAuthenticated = !!authContext.user?.isFullyAuthenticated;
  const isLoading = authContext.isLoading;
  const hasError = !!authContext.error;

  // User data accessors
  const telegramUser = authContext.user?.telegramUser;
  const tonWallet = authContext.user?.tonWallet;
  const databaseUser = authContext.user?.databaseUser;

  // Authentication requirements
  const requiresTelegram = !isTelegramAuthenticated;
  const requiresWallet = !isWalletConnected;
  const requiresDatabase = !isDatabaseUserActive;

  // Status messages
  const getStatusMessage = () => {
    if (isLoading) return 'Authenticating...';
    if (hasError) return authContext.error || 'Authentication error';
    if (!isTelegramAuthenticated) return 'Please open in Telegram';
    if (!isWalletConnected) return 'Connect TON wallet';
    if (!isDatabaseUserActive) return 'Setting up account...';
    if (isFullyAuthenticated) return 'Fully authenticated';
    return 'Authentication incomplete';
  };

  const getStatusColor = () => {
    if (isLoading) return 'yellow';
    if (hasError) return 'red';
    if (isFullyAuthenticated) return 'green';
    if (isTelegramAuthenticated && isWalletConnected) return 'blue';
    if (isTelegramAuthenticated) return 'orange';
    return 'red';
  };

  // Quick actions
  const quickConnect = async () => {
    if (!isWalletConnected) {
      await authContext.connectWallet();
    }
  };

  const quickDisconnect = async () => {
    if (isWalletConnected) {
      await authContext.disconnectWallet();
    }
  };

  const refreshAuth = async () => {
    await authContext.refreshUser();
  };

  return {
    // Context
    ...authContext,
    
    // Status checks
    isTelegramAuthenticated,
    isWalletConnected,
    isDatabaseUserActive,
    isFullyAuthenticated,
    isLoading,
    hasError,
    
    // User data
    telegramUser,
    tonWallet,
    databaseUser,
    
    // Requirements
    requiresTelegram,
    requiresWallet,
    requiresDatabase,
    
    // Status helpers
    getStatusMessage,
    getStatusColor,
    
    // Quick actions
    quickConnect,
    quickDisconnect,
    refreshAuth,
  };
}; 