-- Airdrop Registration System Setup
-- Run this in your Supabase SQL Editor

-- Create airdrop_registrations table
CREATE TABLE IF NOT EXISTS airdrop_registrations (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) NOT NULL,
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_airdrop_registrations_user_id ON airdrop_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_airdrop_registrations_wallet_address ON airdrop_registrations(wallet_address);
CREATE INDEX IF NOT EXISTS idx_airdrop_registrations_status ON airdrop_registrations(registration_status);
CREATE INDEX IF NOT EXISTS idx_airdrop_registrations_created_at ON airdrop_registrations(created_at);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_airdrop_registrations_updated_at 
    BEFORE UPDATE ON airdrop_registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE airdrop_registrations ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own registrations
CREATE POLICY "Users can view own airdrop registrations" ON airdrop_registrations
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = users.id::text));

-- Policy for users to insert their own registrations
CREATE POLICY "Users can insert own airdrop registrations" ON airdrop_registrations
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = users.id::text));

-- Policy for users to update their own registrations
CREATE POLICY "Users can update own airdrop registrations" ON airdrop_registrations
    FOR UPDATE USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = users.id::text));

-- Policy for admins to view all registrations (you may need to adjust this based on your admin role system)
CREATE POLICY "Admins can view all airdrop registrations" ON airdrop_registrations
    FOR ALL USING (true); -- This is a simple policy - you may want to restrict this based on user roles

-- Create a view for easy querying of registration statistics
CREATE OR REPLACE VIEW airdrop_registration_stats AS
SELECT 
    registration_status,
    COUNT(*) as count,
    AVG(stkn_amount) as avg_stkn_amount,
    SUM(stkn_amount) as total_stkn_amount,
    AVG(stk_amount) as avg_stk_amount,
    SUM(stk_amount) as total_stk_amount,
    COUNT(CASE WHEN social_connections->>'telegram' = 'true' THEN 1 END) as telegram_connected,
    COUNT(CASE WHEN social_connections->>'twitter' = 'true' THEN 1 END) as twitter_connected,
    COUNT(CASE WHEN social_connections->>'telegramChannel' = 'true' THEN 1 END) as channel_connected
FROM airdrop_registrations
GROUP BY registration_status;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON airdrop_registrations TO authenticated;
GRANT SELECT ON airdrop_registration_stats TO authenticated;

-- Insert some sample data for testing (optional)
-- INSERT INTO airdrop_registrations (user_id, wallet_address, email, telegram_username, twitter_username, stkn_amount, stk_amount, social_connections) VALUES
-- (1, 'EQD...', 'test@example.com', 'testuser', 'testuser', 100000, 1.0, '{"telegram": true, "twitter": true, "telegramChannel": false}');

-- Verify the setup
SELECT 'Airdrop registration system setup complete!' as status; 