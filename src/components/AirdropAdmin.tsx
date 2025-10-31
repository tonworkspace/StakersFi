import React, { useState, useEffect } from 'react';
import { airdropSystem, AirdropRegistration } from '@/lib/supabaseClient';

interface AirdropAdminProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AirdropAdmin: React.FC<AirdropAdminProps> = ({ isOpen, onClose }) => {
  const [registrations, setRegistrations] = useState<AirdropRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      loadRegistrations();
    }
  }, [isOpen]);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const data = await airdropSystem.getAllRegistrations();
      setRegistrations(data);
    } catch (err) {
      setError('Failed to load registrations');
      console.error('Error loading registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (registrationId: string, status: 'pending' | 'approved' | 'rejected' | 'completed') => {
    try {
      const success = await airdropSystem.updateRegistrationStatus(registrationId, status);
      if (success) {
        // Reload registrations
        await loadRegistrations();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const filteredRegistrations = registrations.filter(reg => 
    selectedStatus === 'all' || reg.registration_status === selectedStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'approved': return 'text-green-400 bg-green-400/10';
      case 'rejected': return 'text-red-400 bg-red-400/10';
      case 'completed': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-gradient-to-br from-[#1a1f3c]/95 to-[#0d1424]/95 backdrop-blur-xl rounded-2xl border border-blue-500/20 shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Airdrop Registrations</h2>
              <p className="text-white/60">Manage user airdrop registrations</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filters */}
          <div className="mt-4 flex items-center space-x-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
            <button
              onClick={loadRegistrations}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="ml-3 text-white">Loading registrations...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400">{error}</p>
              <button
                onClick={loadRegistrations}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60">No registrations found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(registration.registration_status)}`}>
                        {registration.registration_status}
                      </span>
                      <span className="text-white/60 text-sm">
                        {new Date(registration.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={registration.registration_status}
                        onChange={(e) => updateStatus(registration.id, e.target.value as any)}
                        className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Email:</span>
                      <p className="text-white">{registration.email}</p>
                    </div>
                    <div>
                      <span className="text-white/60">Telegram:</span>
                      <p className="text-white">@{registration.telegram_username}</p>
                    </div>
                    <div>
                      <span className="text-white/60">Twitter:</span>
                      <p className="text-white">@{registration.twitter_username}</p>
                    </div>
                    <div>
                      <span className="text-white/60">Wallet:</span>
                      <p className="text-white font-mono text-xs">
                        {registration.wallet_address.slice(0, 6)}...{registration.wallet_address.slice(-4)}
                      </p>
                    </div>
                    <div>
                      <span className="text-white/60">STKN Amount:</span>
                      <p className="text-white">{registration.stkn_amount.toLocaleString()} STKN</p>
                    </div>
                    <div>
                      <span className="text-white/60">STK Amount:</span>
                      <p className="text-green-400">{registration.stk_amount.toFixed(6)} STK</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/10">
                    <span className="text-white/60 text-sm">Social Connections:</span>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`text-xs ${registration.social_connections.telegram ? 'text-green-400' : 'text-red-400'}`}>
                        Telegram {registration.social_connections.telegram ? '✓' : '✗'}
                      </span>
                      <span className={`text-xs ${registration.social_connections.twitter ? 'text-green-400' : 'text-red-400'}`}>
                        Twitter {registration.social_connections.twitter ? '✓' : '✗'}
                      </span>
                      <span className={`text-xs ${registration.social_connections.telegramChannel ? 'text-green-400' : 'text-red-400'}`}>
                        Channel {registration.social_connections.telegramChannel ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-white/60 text-sm">
              Total: {filteredRegistrations.length} registrations
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 