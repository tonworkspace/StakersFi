-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    wallet_address TEXT UNIQUE NOT NULL,
    username TEXT,
    referrer_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    balance NUMERIC DEFAULT 0,
    total_deposit NUMERIC DEFAULT 0,
    total_withdrawn NUMERIC DEFAULT 0,
    team_volume NUMERIC DEFAULT 0,
    direct_referrals INTEGER DEFAULT 0,
    rank TEXT DEFAULT 'None',
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_name TEXT,
    last_name TEXT,
    language_code TEXT
);

-- Stakes table
CREATE TABLE stakes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    amount NUMERIC NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    daily_rate NUMERIC NOT NULL,
    total_earned NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    last_payout TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    speed_boost_active BOOLEAN DEFAULT false,
    CONSTRAINT positive_amount CHECK (amount >= 1) -- Minimum 1 TON
);

-- Deposits table
CREATE TABLE deposits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    transaction_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed')),
    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Withdrawals table
CREATE TABLE withdrawals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    amount NUMERIC NOT NULL,
    wallet_amount NUMERIC NOT NULL,
    redeposit_amount NUMERIC NOT NULL,
    sbt_amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    transaction_hash TEXT,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    CONSTRAINT positive_amounts CHECK (
        amount > 0 AND 
        wallet_amount > 0 AND 
        redeposit_amount > 0 AND 
        sbt_amount > 0
    )
);

-- Referral earnings table
CREATE TABLE referral_earnings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    referral_id INTEGER REFERENCES users(id) NOT NULL,
    amount NUMERIC NOT NULL,
    level INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'pending',
    CONSTRAINT valid_level CHECK (level BETWEEN 1 AND 5)
);

-- Global pool shares table
CREATE TABLE global_pool_shares (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    shares INTEGER NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    distributed BOOLEAN DEFAULT false,
    CONSTRAINT positive_shares CHECK (shares > 0)
);

-- Fast start bonuses table
CREATE TABLE fast_start_bonuses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed'))
);

-- Weekly rank rewards table
CREATE TABLE rank_rewards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    rank TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'processed', 'failed'))
);

-- Speed boost tracking table
CREATE TABLE speed_boosts (
    id SERIAL PRIMARY KEY,
    stake_id INTEGER REFERENCES stakes(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    multiplier NUMERIC NOT NULL DEFAULT 2,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_referrer_id ON users(referrer_id);
CREATE INDEX idx_stakes_user_id ON stakes(user_id);
CREATE INDEX idx_stakes_is_active ON stakes(is_active);
CREATE INDEX idx_deposits_user_id ON deposits(user_id);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_referral_earnings_user_id ON referral_earnings(user_id);
CREATE INDEX idx_global_pool_shares_user_id ON global_pool_shares(user_id);
CREATE INDEX idx_global_pool_shares_week ON global_pool_shares(week_start, week_end);
CREATE INDEX idx_speed_boosts_stake_id ON speed_boosts(stake_id);
CREATE INDEX idx_speed_boosts_user_id ON speed_boosts(user_id);

-- Views for common queries
CREATE VIEW active_stakes AS
SELECT s.*, u.wallet_address, u.telegram_id
FROM stakes s
JOIN users u ON s.user_id = u.id
WHERE s.is_active = true;

CREATE VIEW player_profiles AS
SELECT 
    u.id,
    u.telegram_id,
    u.wallet_address,
    u.username,
    u.balance,
    u.total_deposit,
    u.total_withdrawn,
    u.team_volume,
    u.rank,
    u.created_at as joined_at,
    u.last_active,
    COUNT(DISTINCT s.id) as total_stakes,
    COUNT(DISTINCT d.id) as total_deposits,
    COUNT(DISTINCT w.id) as total_withdrawals
FROM users u
LEFT JOIN stakes s ON u.id = s.user_id
LEFT JOIN deposits d ON u.id = d.user_id
LEFT JOIN withdrawals w ON u.id = w.user_id
GROUP BY u.id;

CREATE VIEW transaction_history AS
SELECT 
    'deposit' as type,
    d.id,
    d.user_id,
    d.amount,
    d.status,
    d.transaction_hash,
    d.created_at,
    d.processed_at
FROM deposits d
UNION ALL
SELECT 
    'withdrawal' as type,
    w.id,
    w.user_id,
    w.amount,
    w.status,
    w.transaction_hash,
    w.created_at,
    w.processed_at
FROM withdrawals w
ORDER BY created_at DESC;

CREATE VIEW referral_stats AS
SELECT 
    u.id as user_id,
    u.telegram_id,
    u.wallet_address,
    u.username,
    u.direct_referrals,
    u.team_volume,
    COUNT(DISTINCT r.id) as total_team_members,
    SUM(re.amount) as total_earnings,
    u.rank as current_rank
FROM users u
LEFT JOIN users r ON r.referrer_id = u.id
LEFT JOIN referral_earnings re ON u.id = re.user_id
GROUP BY u.id, u.wallet_address, u.username; 