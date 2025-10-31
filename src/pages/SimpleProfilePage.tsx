import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTonAddress, TonConnectButton } from '@tonconnect/ui-react';

export const SimpleProfilePage: React.FC = () => {
  const { user, isLoading, error } = useAuth();
  const userAddress = useTonAddress();

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
          <div className="mt-4 text-white">Loading profile...</div>
        </div>
      </div>
    );
  }

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
            <h2 className="text-xl font-bold text-white mb-2">Error Loading Profile</h2>
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0F1C]">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-blue-500/20 shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No Profile Found</h2>
            <p className="text-blue-400/80 mb-4">Please make sure you're logged in to view your profile.</p>
            <a 
              href="/"
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0A0F1C]">
      <div className="fixed inset-0 bg-[#0A0F1C]">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1f3c] via-[#0A0F1C] to-[#0d1424]" />
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] animate-pulse delay-1000" />
        
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">User Profile</h1>
            <p className="text-white/60">Your account information and statistics</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-gradient-to-br from-[#1a1f3c]/80 to-[#0d1424]/80 backdrop-blur-xl rounded-2xl border border-blue-500/20 shadow-2xl p-6">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <span className="text-blue-400/60">User ID</span>
                  <span className="text-white font-mono">{user.id}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <span className="text-blue-400/60">Username</span>
                  <span className="text-white">{user.username || 'Not set'}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <span className="text-blue-400/60">Rank</span>
                  <span className="text-white font-medium">{user.rank || 'Novice'}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <span className="text-blue-400/60">Status</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <span className="text-blue-400/60">Login Streak</span>
                  <span className="text-white">{user.login_streak || 0} days</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <span className="text-blue-400/60">Last Login</span>
                  <span className="text-white text-sm">
                    {user.last_login_date ? new Date(user.last_login_date).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-gradient-to-br from-[#1a1f3c]/80 to-[#0d1424]/80 backdrop-blur-xl rounded-2xl border border-green-500/20 shadow-2xl p-6">
              <h2 className="text-xl font-bold text-green-400 mb-4">Financial Information</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <span className="text-green-400/60">Balance</span>
                  <span className="text-white font-medium">{user.balance || 0} TON</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <span className="text-green-400/60">Total Earned</span>
                  <span className="text-white font-medium">{user.total_earned || 0} TON</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <span className="text-green-400/60">Total Deposits</span>
                  <span className="text-white font-medium">{user.total_deposit || 0} TON</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <span className="text-green-400/60">Total Withdrawn</span>
                  <span className="text-white font-medium">{user.total_withdrawn || 0} TON</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <span className="text-green-400/60">Team Volume</span>
                  <span className="text-white font-medium">{user.team_volume || 0} TON</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <span className="text-green-400/60">Direct Referrals</span>
                  <span className="text-white font-medium">{user.direct_referrals || 0}</span>
                </div>
              </div>
            </div>

            {/* Wallet Information */}
            <div className="bg-gradient-to-br from-[#1a1f3c]/80 to-[#0d1424]/80 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-2xl p-6">
              <h2 className="text-xl font-bold text-purple-400 mb-4">Wallet Information</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <span className="text-purple-400/60">TON Wallet</span>
                  <div className="text-right">
                    {userAddress ? (
                      <div>
                        <div className="text-green-400 text-sm">Connected</div>
                        <div className="text-purple-400/80 text-xs font-mono">
                          {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-red-400 text-sm">Not Connected</div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <span className="text-purple-400/60">Stored Wallet</span>
                  <div className="text-right">
                    {user.wallet_address ? (
                      <div className="text-purple-400/80 text-xs font-mono truncate max-w-32">
                        {user.wallet_address}
                      </div>
                    ) : (
                      <div className="text-red-400 text-sm">Not Set</div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <span className="text-purple-400/60">NFT Status</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.has_nft ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {user.has_nft ? 'Has NFT' : 'No NFT'}
                  </span>
                </div>
                
                {!userAddress && (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="text-center">
                      <div className="text-purple-400/60 mb-2">Connect your TON wallet</div>
                      <TonConnectButton />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gradient-to-br from-[#1a1f3c]/80 to-[#0d1424]/80 backdrop-blur-xl rounded-2xl border border-yellow-500/20 shadow-2xl p-6">
              <h2 className="text-xl font-bold text-yellow-400 mb-4">Additional Information</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <span className="text-yellow-400/60">Last Active</span>
                  <span className="text-white text-sm">
                    {user.last_active ? new Date(user.last_active).toLocaleString() : 'Never'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <span className="text-yellow-400/60">Account Created</span>
                  <span className="text-white text-sm">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <span className="text-yellow-400/60">Telegram ID</span>
                  <span className="text-white font-mono">{user.telegram_id}</span>
                </div>
                
                {user.first_name && (
                  <div className="flex justify-between items-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <span className="text-yellow-400/60">First Name</span>
                    <span className="text-white">{user.first_name}</span>
                  </div>
                )}
                
                {user.last_name && (
                  <div className="flex justify-between items-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <span className="text-yellow-400/60">Last Name</span>
                    <span className="text-white">{user.last_name}</span>
                  </div>
                )}
                
                {user.language_code && (
                  <div className="flex justify-between items-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <span className="text-yellow-400/60">Language</span>
                    <span className="text-white">{user.language_code}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 text-center">
            <a 
              href="/"
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors mr-4"
            >
              Back to Home
            </a>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 