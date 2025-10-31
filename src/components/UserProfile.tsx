import React from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { TonConnectButton } from '@tonconnect/ui-react';

export const UserProfile: React.FC = () => {
  const { user, disconnectWallet, logout } = useAuthContext();

  if (!user) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-[#1a1f3c]/80 to-[#0d1424]/80 backdrop-blur-xl rounded-2xl border border-blue-500/20 shadow-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">User Profile</h2>
        <div className="flex space-x-2">
          <button
            onClick={disconnectWallet}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-colors"
          >
            Disconnect Wallet
          </button>
          <button
            onClick={logout}
            className="px-3 py-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 text-sm rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Telegram Profile */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-400 mb-3">Telegram Profile</h3>
        <div className="flex items-center space-x-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          {user.telegramUser.photoUrl && (
            <img 
              src={user.telegramUser.photoUrl} 
              alt="Profile" 
              className="w-12 h-12 rounded-full"
            />
          )}
          <div>
            <div className="text-white font-medium">
              {user.telegramUser.firstName} {user.telegramUser.lastName}
            </div>
            <div className="text-blue-400/60 text-sm">
              @{user.telegramUser.username || 'user'}
            </div>
            <div className="text-blue-400/40 text-xs">
              ID: {user.telegramUser.id}
            </div>
          </div>
        </div>
      </div>

      {/* TON Wallet */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-green-400 mb-3">TON Wallet</h3>
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          {user.tonWallet.isConnected ? (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">Connected</span>
              </div>
              <div className="text-green-400/80 text-sm font-mono">
                {user.tonWallet.address}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-green-400/60 mb-2">Wallet not connected</div>
              <TonConnectButton />
            </div>
          )}
        </div>
      </div>

      {/* Database User Info */}
      {user.databaseUser && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-purple-400 mb-3">Account Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="text-purple-400/60 text-xs">Rank</div>
              <div className="text-white font-medium">{user.databaseUser.rank}</div>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="text-purple-400/60 text-xs">Balance</div>
              <div className="text-white font-medium">{user.databaseUser.balance} TON</div>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="text-purple-400/60 text-xs">Total Earned</div>
              <div className="text-white font-medium">{user.databaseUser.total_earned} TON</div>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="text-purple-400/60 text-xs">Team Volume</div>
              <div className="text-white font-medium">{user.databaseUser.team_volume} TON</div>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="text-purple-400/60 text-xs">Login Streak</div>
              <div className="text-white font-medium">{user.databaseUser.login_streak} days</div>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="text-purple-400/60 text-xs">NFT Status</div>
              <div className="text-white font-medium">
                {user.databaseUser.has_nft ? '✅ Has NFT' : '❌ No NFT'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-yellow-400 mb-3">Authentication Status</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <span className="text-yellow-400">Telegram Authentication</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-400 text-sm">✓ Connected</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <span className="text-yellow-400">TON Wallet</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${user.tonWallet.isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className={`text-sm ${user.tonWallet.isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {user.tonWallet.isConnected ? '✓ Connected' : '✗ Disconnected'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <span className="text-yellow-400">Database Account</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${user.databaseUser ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className={`text-sm ${user.databaseUser ? 'text-green-400' : 'text-red-400'}`}>
                {user.databaseUser ? '✓ Active' : '✗ Not Found'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <span className="text-yellow-400">Full Authentication</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${user.isFullyAuthenticated ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className={`text-sm ${user.isFullyAuthenticated ? 'text-green-400' : 'text-red-400'}`}>
                {user.isFullyAuthenticated ? '✓ Complete' : '✗ Incomplete'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Last Login Info */}
      {user.databaseUser && (
        <div className="text-center">
          <div className="text-gray-400/60 text-sm">
            Last login: {new Date(user.databaseUser.last_login_date).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}; 