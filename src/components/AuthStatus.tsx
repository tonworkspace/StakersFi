import React from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

export const AuthStatus: React.FC = () => {
  const { user } = useAuthContext();

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 text-xs">
      {/* Telegram Status */}
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
        <span className="text-blue-400">TG</span>
      </div>
      
      {/* Wallet Status */}
      <div className="flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full ${user.tonWallet.isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
        <span className={user.tonWallet.isConnected ? 'text-green-400' : 'text-red-400'}>TON</span>
      </div>
      
      {/* Database Status */}
      <div className="flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full ${user.databaseUser ? 'bg-purple-400' : 'bg-red-400'}`}></div>
        <span className={user.databaseUser ? 'text-purple-400' : 'text-red-400'}>DB</span>
      </div>
      
      {/* Full Auth Status */}
      {user.isFullyAuthenticated && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <span className="text-yellow-400">✓</span>
        </div>
      )}
    </div>
  );
}; 