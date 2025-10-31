import { supabase } from "./supabaseClient";
import { TonApi } from "../utility/ton-api";

// Initialize TON API client
const tonApi = new TonApi();

// SBT collection address
const SBT_CONTRACT_ADDRESS = "EQBpQbkNRhzCAalWxnFtU5z28rS_RCxBlEuC010bAjsh3TjU";

export const TOKEN_CONFIG = {
  STK: {
    TOTAL_SUPPLY: 1_000_000_000, // 1 billion tokens
    DISTRIBUTION_CAP: 350_000_000, // 35% for distribution
    INITIAL_PRICE: 0.01 // $0.01 per token
  },
  GLP: {
    DISTRIBUTION_INTERVAL: 7 * 24 * 60 * 60 * 1000, // 7 days
    TOP_EARNERS_LIMIT: 100,
    MINIMUM_TEAM_VOLUME: 1000 // Minimum team volume to qualify
  }
};

// Function to get user's SBT balance from blockchain
export const getUserSBTBalance = async (userAddress: string): Promise<number> => {
  try {
    if (!userAddress) {
      console.error('User address is required');
      return 0;
    }

    // Get all NFTs owned by the user using the existing TonApi
    const nfts = await tonApi.searchItemsFromUser(userAddress);

    if (!nfts || !nfts.nft_items) {
      console.log('No NFTs found for user');
      return 0;
    }

    // Filter NFTs that belong to our SBT collection
    const sbtNfts = nfts.nft_items.filter((nft: any) => 
      nft.collection && nft.collection.address === SBT_CONTRACT_ADDRESS
    );

    // Count the SBT NFTs (each NFT represents 1 SBT)
    const sbtBalance = sbtNfts.length;

    console.log(`Found ${sbtBalance} SBT NFTs for user ${userAddress}`);
    return sbtBalance;

  } catch (error) {
    console.error('Error fetching SBT balance from blockchain:', error);
    return 0;
  }
};

// Function to update user's SBT balance in database
export const updateUserSBTBalance = async (userId: number, userAddress: string): Promise<number> => {
  try {
    // Get SBT balance from blockchain
    const blockchainSBTBalance = await getUserSBTBalance(userAddress);
    
    // Update user's SBT balance in database
    const { data, error } = await supabase
      .from('users')
      .update({ 
        total_sbt: blockchainSBTBalance,
        sbt_last_updated: new Date().toISOString()
      })
      .eq('id', userId)
      .select('total_sbt')
      .single();

    if (error) {
      console.error('Error updating SBT balance in database:', error);
      return 0;
    }

    console.log(`Updated SBT balance for user ${userId} to ${blockchainSBTBalance}`);
    return data?.total_sbt || 0;

  } catch (error) {
    console.error('Error updating user SBT balance:', error);
    return 0;
  }
};

export const stkSystem = {
  async mintTokens(userId: number, amount: number, source: 'deposit' | 'withdrawal'): Promise<boolean> {
    try {
      // Check distribution cap
      const { data: totalMinted } = await supabase
        .from('stk_stats')
        .select('total_minted')
        .single();

      if (!totalMinted || totalMinted.total_minted + amount > TOKEN_CONFIG.STK.DISTRIBUTION_CAP) {
        throw new Error('STK distribution cap reached');
      }

      // Use a transaction to ensure atomicity
      const { error } = await supabase.rpc('mint_stk_tokens', {
        p_user_id: userId,
        p_amount: amount,
        p_source: source,
        p_price: TOKEN_CONFIG.STK.INITIAL_PRICE
      });

      return !error;
    } catch (error) {
      console.error('STK minting failed:', error);
      return false;
    }
  },

  async getTokenStats(userId: number) {
    const { data } = await supabase
      .from('users')
      .select(`
        total_sbt,
        sbt_last_updated,
        stk_transactions (
          amount,
          type,
          created_at
        )
      `)
      .eq('id', userId)
      .single();

    return data;
  }
};

export const glpSystem = {
  async addToPool(amount: number): Promise<boolean> {
    try {
      await supabase.rpc('increment_total_amount', { increment_by: amount });
      return true;
    } catch (error) {
      console.error('GLP deposit failed:', error);
      return false;
    }
  },

  async distributeRewards(): Promise<boolean> {
    try {
      // Get pool amount
      const { data: pool } = await supabase
        .from('glp_pool')
        .select('total_amount')
        .single();

      if (!pool || pool.total_amount <= 0) return false;

      // Get top performers based on team volume
      const { data: leaders } = await supabase
        .from('users')
        .select('id, username, team_volume, referral_count')
        .gt('team_volume', TOKEN_CONFIG.GLP.MINIMUM_TEAM_VOLUME)
        .order('referral_count', { ascending: false })
        .limit(TOKEN_CONFIG.GLP.TOP_EARNERS_LIMIT);

      if (!leaders || leaders.length === 0) return false;

      // Calculate total shares
      const totalShares = leaders.reduce((sum, leader) => sum + leader.referral_count, 0);
      
      // Distribute rewards
      const distributions = leaders.map(leader => ({
        user_id: leader.id,
        amount: (leader.referral_count / totalShares) * pool.total_amount * 0.02, // 2% of team withdrawal volume
        share_percentage: (leader.referral_count / totalShares) * 100
      }));

      // Record distributions
      await supabase
        .from('glp_distributions')
        .insert(distributions.map(dist => ({
          user_id: dist.user_id,
          amount: dist.amount,
          share_percentage: dist.share_percentage,
          distributed_at: new Date().toISOString()
        })));

      // Reset pool
      await supabase
        .from('glp_pool')
        .update({ 
          total_amount: 0,
          last_distribution: new Date().toISOString()
        });

      return true;
    } catch (error) {
      console.error('GLP distribution failed:', error);
      return false;
    }
  },

  async getLeaderboardStats() {
    const { data } = await supabase
      .from('glp_distributions')
      .select(`
        amount,
        share_percentage,
        distributed_at,
        users (
          username,
          team_volume,
          referral_count
        )
      `)
      .order('distributed_at', { ascending: false })
      .limit(100);

    return data;
  }
}; 