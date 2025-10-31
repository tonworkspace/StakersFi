-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  referrer_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_deposit NUMERIC DEFAULT 0,
  total_withdrawn NUMERIC DEFAULT 0,
  team_volume NUMERIC DEFAULT 0,
  direct_referrals INTEGER DEFAULT 0,
  rank TEXT DEFAULT 'None'
);

-- Stakes table
CREATE TABLE stakes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  amount NUMERIC NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  daily_rate NUMERIC NOT NULL,
  total_earned NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_payout TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral earnings table
CREATE TABLE referral_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  referral_id UUID REFERENCES users(id) NOT NULL,
  amount NUMERIC NOT NULL,
  level INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Global pool shares table
CREATE TABLE global_pool_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  shares INTEGER NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Airdrop registrations table
CREATE TABLE airdrop_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  wallet_address TEXT NOT NULL,
  email TEXT NOT NULL,
  telegram_username TEXT NOT NULL,
  twitter_username TEXT NOT NULL,
  stkn_amount NUMERIC NOT NULL,
  stk_amount NUMERIC NOT NULL,
  social_connections JSONB NOT NULL DEFAULT '{}',
  registration_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, wallet_address)
);

-- Create indexes for airdrop registrations
CREATE INDEX idx_airdrop_registrations_user_id ON airdrop_registrations(user_id);
CREATE INDEX idx_airdrop_registrations_wallet_address ON airdrop_registrations(wallet_address);
CREATE INDEX idx_airdrop_registrations_status ON airdrop_registrations(registration_status);
CREATE INDEX idx_airdrop_registrations_created_at ON airdrop_registrations(created_at); 