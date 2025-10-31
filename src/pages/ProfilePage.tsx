import React from 'react';
import { UserProfile } from '@/components/UserProfile';
import { AuthGuard } from '@/components/AuthGuard';

export const ProfilePage: React.FC = () => {
  return (
    <AuthGuard requireTelegram={true}>
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
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">User Profile</h1>
              <p className="text-white/60">Manage your account and authentication settings</p>
            </div>
            
            <UserProfile />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}; 