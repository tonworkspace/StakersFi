import React, { ReactNode } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
  requireWallet?: boolean;
  requireTelegram?: boolean;
  fallback?: ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireWallet = false, 
  requireTelegram = true,
  fallback 
}) => {
  const { user, isLoading, error } = useAuthContext();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0F1C]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full animate-spin">
              <div 
                className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full animate-pulse" 
                style={{ animationDelay: '-0.5s' }} 
              />
            </div>
          </div>
          <div className="mt-4 text-white">Authenticating...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0F1C]">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-xl rounded-2xl border border-red-500/20 shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Authentication Error</h2>
            <p className="text-red-400/80 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check Telegram authentication
  if (requireTelegram && !user?.telegramUser) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0F1C]">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-blue-500/20 shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Telegram Required</h2>
            <p className="text-blue-400/80 mb-4">Please open this app in Telegram to continue.</p>
          </div>
        </div>
      </div>
    );
  }

  // Check wallet authentication
  if (requireWallet && !user?.tonWallet.isConnected) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0F1C]">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl border border-green-500/20 shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Wallet Connection Required</h2>
            <p className="text-green-400/80 mb-4">Please connect your TON wallet to access this feature.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check database user
  if (requireTelegram && !user?.databaseUser) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0F1C]">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl rounded-2xl border border-yellow-500/20 shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Setting Up Account</h2>
            <p className="text-yellow-400/80 mb-4">Please wait while we set up your account...</p>
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
}; 