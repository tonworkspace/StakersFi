import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import useAuth from '@/hooks/useAuth'
import { initUtils } from '@/utils/telegramUtils'
import toast from 'react-hot-toast'

// Update the interface to match your table structure
interface ReferralWithUsers {
  id: number;
  referrer_id: number;
  referred_id: number;
  status: 'active' | 'inactive';
  created_at: string;
  level: number;
  referrer: {
    username: string;
    telegram_id: number;
  };
  referred: {
    username: string;
    telegram_id: number;
    total_earned: number;
    total_deposit: number;
    rank: string;
  };
}

interface ReferralSummary {
  total_referrals: number;
  total_users: number;
  active_referrals: number;
  inactive_referrals: number;
  conversion_rate: number;
}

type ReferrerDataFromDB = {
  referrer_id: number;
  referrer: {
    username: string;
    total_earned: number;
    total_deposit: number;
    rank: string;
  } | null;
  status: string;
}

interface ReferrerStat {
  referrer_id: number;
  username: string;
  referral_count: number;
  active_referrals: number;
  total_earned: number;
  total_deposit: number;
  rank: string;
}


// // Add these new types at the top with other interfaces
// type SortField = 'active_referrals' | 'referral_count' | 'total_earned' | 'total_deposit';
// type SortDirection = 'asc' | 'desc';

// Add these constants for accumulation rates (tokens per day)
const ACCUMULATION_RATES = [
  { minReferrals: 1, tokensPerDay: 10 },
  { minReferrals: 5, tokensPerDay: 50 },
  { minReferrals: 15, tokensPerDay: 150 },
  { minReferrals: 30, tokensPerDay: 300 },
  { minReferrals: 50, tokensPerDay: 500 },
  { minReferrals: 100, tokensPerDay: 1000 },
];

// Calculate accumulation rate based on active referrals
const calculateAccumulationRate = (activeReferrals: number): number => {
  const qualifiedTier = ACCUMULATION_RATES
    .filter(tier => activeReferrals >= tier.minReferrals)
    .pop();
    
  return qualifiedTier ? qualifiedTier.tokensPerDay : 0;
};

// Calculate accumulated tokens since last claim
const calculateAccumulatedTokens = (lastClaimDate: Date | null, accumulationRate: number): number => {
  if (!lastClaimDate) return accumulationRate; // First time claim gets one day's worth
  
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastClaimDate.getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24); // Convert ms to days
  
  return Math.floor(diffDays * accumulationRate);
};

// Add these constants for level capacities
const LEVEL_CAPACITIES: {[key: number]: number} = {
  1: 50,  // Level 1 can hold max 50 referrals
  2: 40,  // Level 2 can hold max 40 referrals
  3: 30,  // You can adjust these values as needed
  4: 20,
  5: 10
};

// Add this function to determine which level a referral belongs to
const determineReferralLevel = (index: number): number => {
  if (index < LEVEL_CAPACITIES[1]) return 1;
  if (index < LEVEL_CAPACITIES[1] + LEVEL_CAPACITIES[2]) return 2;
  if (index < LEVEL_CAPACITIES[1] + LEVEL_CAPACITIES[2] + LEVEL_CAPACITIES[3]) return 3;
  if (index < LEVEL_CAPACITIES[1] + LEVEL_CAPACITIES[2] + LEVEL_CAPACITIES[3] + LEVEL_CAPACITIES[4]) return 4;
  return 5;
};

const ReferralSystem = () => {
  const [, setReferrals] = useState<ReferralWithUsers[]>([]);
  const [referralSummary, setReferralSummary] = useState<ReferralSummary>({
    total_referrals: 0,
    total_users: 0,
    active_referrals: 0,
    inactive_referrals: 0,
    conversion_rate: 0
  });
  const { user, updateUserData } = useAuth();
  const [referralLink, setReferralLink] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [, setTotalCount] = useState<number>(0);
  const [, setAllReferrerStats] = useState<ReferrerStat[]>([]);
  const [userReferralCount, setUserReferralCount] = useState<number>(0);
  const [userActiveReferrals, setUserActiveReferrals] = useState<number>(0);

  // Add pagination state
  const [pageSize,] = useState<number>(50);
  const [, setIsLoadingMore] = useState<boolean>(false);

  // Add a new state for user's referrals
  const [userReferrals, setUserReferrals] = useState<ReferralWithUsers[]>([]);
  const [isLoadingUserReferrals, setIsLoadingUserReferrals] = useState<boolean>(false);

  // Add a state to control visibility (optional)
  const [] = useState<boolean>(false);

  // Add state for active tab
  const [activeTab, setActiveTab] = useState<'my-referrals' | 'statistics'>('my-referrals');

  // Add this to your component state
  const [stakingRewardsTiers] = useState([
    { minReferrals: 1, tokens: 100 },
    { minReferrals: 5, tokens: 500 },
    { minReferrals: 15, tokens: 1500 },
    { minReferrals: 30, tokens: 3000 },
    { minReferrals: 50, tokens: 5000 },
    { minReferrals: 100, tokens: 10000 },
  ]);

  // Add these states for claiming functionality
  const [isClaiming, setIsClaiming] = useState(false);
  const [lastClaimedDate, setLastClaimedDate] = useState<Date | null>(null);
  const [claimableTokens, setClaimableTokens] = useState(0);
  const [showClaimSuccess, setShowClaimSuccess] = useState(false);

  // Add these new state variables
  const [accumulationRate, setAccumulationRate] = useState<number>(0);
  const [lastAccumulationUpdate, setLastAccumulationUpdate] = useState<Date | null>(null);

  // Add this state in your component
  const [showCopySnackbar, setShowCopySnackbar] = useState(false);

  // Add this state to track the selected level
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  // Add these new state variables
  const [levelReferrals, setLevelReferrals] = useState<ReferralWithUsers[]>([]);
  const [isLoadingLevelReferrals, setIsLoadingLevelReferrals] = useState<boolean>(false);

  // Add this helper function to calculate staking tokens
  const calculateStakingTokens = (activeReferrals: number): number => {
    // Find the highest tier the user qualifies for
    const qualifiedTier = stakingRewardsTiers
      .filter(tier => activeReferrals >= tier.minReferrals)
      .pop();
      
    return qualifiedTier ? qualifiedTier.tokens : 0;
  };

  // // Add these new state variables in the component
  // const [sortField, setSortField] = useState<SortField>('active_referrals');
  // const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  // const [searchTerm, setSearchTerm] = useState('');

  // // Add this sorting function in the component
  // const getSortedReferrers = () => {
  //   return allReferrerStats
  //     .filter(referrer => 
  //       referrer.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       referrer.referrer_id.toString().includes(searchTerm)
  //     )
  //     .sort((a, b) => {
  //       const multiplier = sortDirection === 'desc' ? -1 : 1;
  //       return multiplier * (a[sortField] - b[sortField]);
  //     })
  //     .slice(0, 10);
  // };

  useEffect(() => {
    if (user?.id) {
      console.log("User ID detected:", user.id);
      console.log("User object:", user);
      setReferralLink(`https://t.me/Tonstak3it_bot?start=${user.telegram_id}`);
    } else {
      console.log("No user ID available in first useEffect");
    }
  }, [user?.id]);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Starting loadData function");
        // First get the total count of all referrals
        const { count: totalReferralsCount, error: countError } = await supabase
          .from('referrals')
          .select('*', { count: 'exact', head: true });

        if (countError) throw countError;
        
        // Get active referrals count
        const { count: activeCount, error: activeError } = await supabase
          .from('referrals')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
          
        if (activeError) throw activeError;
        
        // Get unique referrers count
        const { data: uniqueReferrers, error: referrersError } = await supabase
          .from('referrals')
          .select('referrer_id')
          .limit(100000); // Set a high limit to get all records
          
        if (referrersError) throw referrersError;
        
        const uniqueReferrerCount = new Set(uniqueReferrers?.map(r => r.referrer_id)).size;
        
        // Calculate summary
        const totalCount = totalReferralsCount || 0;
        const activeReferrals = activeCount || 0;
        const inactiveReferrals = totalCount - activeReferrals;
        
        const summary = {
          total_referrals: totalCount,
          total_users: uniqueReferrerCount,
          active_referrals: activeReferrals,
          inactive_referrals: inactiveReferrals,
          conversion_rate: totalCount ? 
            Math.round((activeReferrals / totalCount) * 100) : 0
        };
        
        setReferralSummary(summary);
        setTotalCount(totalCount);

        // Get current user's referral count if user exists
        if (user?.id) {
          console.log("Attempting to get user referrals in loadData for user ID:", user.id);
          const { data: userReferrals, error: userRefError } = await supabase
            .from('referrals')
            .select('id, status')
            .eq('referrer_id', user.id);
            
          if (userRefError) {
            console.error("Error fetching user referrals in loadData:", userRefError);
          }
          
          if (!userRefError && userReferrals) {
            console.log("User referrals found in loadData:", userReferrals.length);
            setUserReferralCount(userReferrals.length);
            setUserActiveReferrals(userReferrals.filter(r => r.status === 'active').length);
          } else {
            console.log("No user referrals found in loadData");
          }
        } else {
          console.log("No user ID available in loadData");
        }

        // Get referrer stats with counts
        const { data: referrerStatsData } = await supabase
          .from('referrals')
          .select(`
            referrer_id,
            referrer:users!referrer_id(
              username,
              total_earned,
              total_deposit,
              rank
            ),
            status
          `) as { data: ReferrerDataFromDB[] | null, error: any };

        if (!referrerStatsData) return { data: [] };
        const counts = referrerStatsData.reduce((acc: { [key: string]: any }, curr) => {
          const id = curr.referrer_id;
          if (!acc[id]) {
            acc[id] = {
              referrer_id: id,
              username: curr.referrer?.username,
              referral_count: 0,
              active_referrals: 0,
              total_earned: curr.referrer?.total_earned || 0,
              total_deposit: curr.referrer?.total_deposit || 0,
              rank: curr.referrer?.rank || 'Novice'
            };
          }
          acc[id].referral_count++;
          if (curr.status === 'active') {
            acc[id].active_referrals++;
          }
          return acc;
        }, {});
        
        const referrerStats = Object.values(counts);
        setAllReferrerStats(referrerStats);

        // Then get the first page of data
        await loadReferralsPage(1);
      } catch (err) {
        console.error('Error in loadData:', err);
        setError(err instanceof Error ? err.message : 'Failed to load referrals');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Set up real-time subscription
    const subscription = supabase
      .channel('referrals_changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'referrals'
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id]);

  // Add a function to load a specific page of referrals
  const loadReferralsPage = async (page: number) => {
    setIsLoadingMore(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referrer:users!referrer_id(username, telegram_id),
          referred:users!referred_id(
            username,
            telegram_id,
            total_earned,
            total_deposit,
            rank
          )
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      if (page === 1) {
        setReferrals(data || []);
      } else {
        setReferrals(prev => [...prev, ...(data || [])]);
      }
          } catch (err) {
      console.error('Error loading referrals page:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };


  // Add this function to load user referrals
  const loadUserReferrals = async () => {
    if (!user?.id) {
      console.log("No user ID available in loadUserReferrals");
      return;
    }
    
    console.log("Loading referrals in loadUserReferrals for user ID:", user.id);
    setIsLoadingUserReferrals(true);
    try {
      // First check if we're using the correct ID field
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, telegram_id')
        .eq('id', user.id)
        .single();
        
      if (userError) {
        console.error("Error fetching user in loadUserReferrals:", userError);
        throw userError;
      }
      
      console.log("Found user in loadUserReferrals:", userData);
      
      // Now fetch the referrals using the confirmed user ID
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referred:users!referred_id(
            username,
            telegram_id,
            total_earned,
            total_deposit,
            rank,
            is_active
          )
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching referrals in loadUserReferrals:", error);
        throw error;
      }
      
      console.log("Fetched referrals in loadUserReferrals:", data?.length || 0);
      
      // Assign levels to referrals based on their index
      const referralsWithLevels = data?.map((referral, index) => ({
        ...referral,
        level: determineReferralLevel(index)
      })) || [];
      
      setUserReferrals(referralsWithLevels);
      
      // Update the referral counts here as well
      if (data) {
        console.log("Setting user referral count to:", data.length);
        console.log("Setting active referrals to:", data.filter(r => r.status === 'active').length);
        setUserReferralCount(data.length);
        setUserActiveReferrals(data.filter(r => r.status === 'active').length);
      } else {
        console.log("No referrals data found");
      }
    } catch (err) {
      console.error('Error in loadUserReferrals:', err);
    } finally {
      setIsLoadingUserReferrals(false);
    }
  };

  // Call this function when the component loads
  useEffect(() => {
    if (user?.id) {
      console.log("Calling loadUserReferrals from useEffect for user ID:", user.id);
      loadUserReferrals();
    } else {
      console.log("No user ID available in loadUserReferrals useEffect");
    }
  }, [user?.id]);

  // Add a useEffect to log state changes
  useEffect(() => {
    console.log("userReferralCount changed:", userReferralCount);
    console.log("userActiveReferrals changed:", userActiveReferrals);
  }, [userReferralCount, userActiveReferrals]);

  // Add the handleInviteFriend function
  const handleInviteFriend = useCallback(() => {
    const utils = initUtils();
    
    if (user && user.id) {
      const inviteLink = `https://t.me/Tonstak3it_bot?start=${user.telegram_id}`;
      const shareText = `Stake TON, earn rewards, and build your referral network with TonStake! 💎 Join me in this exciting Telegram mini app and start earning passive income now! 🚀 Click the link and let's stake together!`;
      const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`;
      utils.openTelegramLink(fullUrl);
    } else {
      console.error('User ID is missing. Cannot generate referral link.');
    }
  }, [user]);

  // Fetch accumulated tokens and last claim date
  const fetchAccumulatedTokens = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // Get user's last claim date and current referral count
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('last_sbt_claim, total_sbt')
        .eq('id', user.id)
        .single();
        
      if (userError && userError.code !== 'PGRST116') throw userError;
      
      // Set last claim date if it exists
      const lastClaim = userData?.last_sbt_claim ? new Date(userData.last_sbt_claim) : null;
      setLastClaimedDate(lastClaim);
      
      // Calculate accumulation rate based on active referrals
      const rate = calculateAccumulationRate(userActiveReferrals);
      setAccumulationRate(rate);
      
      // Calculate accumulated tokens since last claim
      const accumulated = calculateAccumulatedTokens(lastClaim, rate);
      setClaimableTokens(accumulated);
      
      // Update last accumulation check time
      setLastAccumulationUpdate(new Date());
      
    } catch (error) {
      console.error('Error fetching accumulated tokens:', error);
    }
  }, [user?.id, userActiveReferrals]);
  
  // Update accumulated tokens periodically
  useEffect(() => {
    if (!user?.id) return;
    
    // Initial fetch
    fetchAccumulatedTokens();
    
    // Set up interval to update accumulation (every minute)
    const intervalId = setInterval(() => {
      if (lastClaimedDate && accumulationRate > 0) {
        const accumulated = calculateAccumulatedTokens(lastClaimedDate, accumulationRate);
        setClaimableTokens(accumulated);
        setLastAccumulationUpdate(new Date());
      }
    }, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, [user?.id, fetchAccumulatedTokens, lastClaimedDate, accumulationRate]);
  
  // Update the claim function to handle accumulation
  const handleClaimTokens = async () => {
    if (claimableTokens <= 0) return;
    
    setIsClaiming(true);
    try {
      // Get the current user's SBT balance
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('total_sbt')
        .eq('id', user?.id)
        .single();
      
      if (userError) throw userError;
      
      // Calculate the new total SBT balance
      const currentSBT = userData.total_sbt || 0;
      const newSBTBalance = currentSBT + claimableTokens;
      
      // Update the user's SBT balance and last claim date in the database
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          total_sbt: newSBTBalance,
          last_sbt_claim: new Date().toISOString()
        })
        .eq('id', user?.id);
        
      if (updateError) throw updateError;
      
      // Log the transaction in the earning_history table
      const { error: logError } = await supabase
        .from('earning_history')
        .insert({
          user_id: user?.id,
          amount: claimableTokens,
          type: 'referral_sbt',
          created_at: new Date().toISOString()
        });
        
      if (logError) throw logError;
      
      // Update the last claimed date
      const now = new Date();
      setLastClaimedDate(now);
      
      // Reset claimable tokens
      setClaimableTokens(0);
      
      // Show success message
      setShowClaimSuccess(true);
      setTimeout(() => setShowClaimSuccess(false), 3000);
      
      // Update user data if needed
      if (updateUserData) {
        updateUserData({ total_sbt: newSBTBalance });
      }
    } catch (error) {
      console.error('Error claiming tokens:', error);
      toast.error('Failed to claim tokens. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };
  
  // Calculate claimable tokens on component mount and when active referrals change
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchClaimableTokens = async () => {
      try {
        // Get the last claim date
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('last_sbt_claim')
          .eq('id', user.id)
          .single();
          
        if (userError && userError.code !== 'PGRST116') throw userError;
        
        const lastClaim = userData?.last_sbt_claim ? new Date(userData.last_sbt_claim) : null;
        if (lastClaim) {
          setLastClaimedDate(lastClaim);
        }
        
        // Calculate tokens based on active referrals
        const tokensToAdd = calculateStakingTokens(userActiveReferrals);
        setClaimableTokens(tokensToAdd);
        
      } catch (error) {
        console.error('Error fetching claimable tokens:', error);
      }
    };
    
    fetchClaimableTokens();
  }, [user?.id, userActiveReferrals]);
  
  // Calculate claimable tokens on component mount and when active referrals change
  useEffect(() => {
    // In a real implementation, you would fetch the user's claimable tokens from your backend
    // For demo purposes, we'll just use the calculated tokens
    setClaimableTokens(calculateStakingTokens(userActiveReferrals));
  }, [userActiveReferrals]);

  // Add or update the copy link function
  const handleCopyLink = useCallback(() => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink)
        .then(() => {
          // Show snackbar notification
          setShowCopySnackbar(true);
          setTimeout(() => setShowCopySnackbar(false), 3000);
        })
        .catch(err => {
          console.error('Failed to copy link:', err);
        });
    }
  }, [referralLink]);

  // Add this useEffect to fetch referrals for the selected level
  useEffect(() => {
    const fetchLevelReferrals = async () => {
      if (!user?.id) return;
      
      setIsLoadingLevelReferrals(true);
      try {
        // Filter the userReferrals array to get only referrals for the selected level
        const filteredReferrals = userReferrals.filter(referral => referral.level === selectedLevel);
        setLevelReferrals(filteredReferrals);
      } catch (error) {
        console.error(`Error fetching level ${selectedLevel} referrals:`, error);
      } finally {
        setIsLoadingLevelReferrals(false);
      }
    };
    
    fetchLevelReferrals();
  }, [selectedLevel, user?.id, userReferrals]);

  if (isLoading) {
    return (
      <div className="bg-black/20 rounded-xl p-2.5 flex flex-col h-full">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500/10 p-1.5 rounded-lg animate-pulse">
              <div className="w-3.5 h-3.5" />
            </div>
            <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
          </div>
        </div>

        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          {[1, 2].map((i) => (
            <div key={i} className="bg-black/20 rounded-lg p-2">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-3 h-3 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
              </div>
              <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Card Skeleton */}
        <div className="bg-black/20 rounded-lg p-4 mb-2.5">
          <div className="h-5 w-32 bg-white/10 rounded animate-pulse mb-3" />
          <div className="space-y-2">
            <div className="h-10 bg-white/5 rounded animate-pulse" />
            <div className="h-10 bg-white/5 rounded animate-pulse" />
            <div className="h-10 bg-white/5 rounded animate-pulse" />
          </div>
        </div>

        {/* Referrals Skeleton */}
        <div className="bg-black/20 rounded-lg overflow-hidden flex-1 flex flex-col">
          {/* Table Header */}
          <div className="px-3 py-2 border-b border-white/5 bg-white/5">
            <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
          </div>
          
          {/* Loading Rows */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="px-3 py-3 border-b border-white/5 flex flex-col gap-2"
              >
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="bg-white/5 rounded-lg p-2">
                      <div className="h-3 w-12 bg-white/10 rounded animate-pulse mb-1" />
                      <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="referral-system-con px-4 pb-24 transition-all duration-300">
      {/* Success notification */}
      {showClaimSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Tokens claimed successfully!
        </div>
      )}
      
      {user?.id && (
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] rounded-2xl p-4 shadow-lg border border-blue-500/20 overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-blue-400/10"></div>
            <div className="absolute right-8 -bottom-6 w-12 h-12 rounded-full bg-blue-400/10"></div>
            <h3 className="text-sm text-white/80 mb-1">Active Referrals</h3>
            <p className="text-2xl font-semibold text-white">{userActiveReferrals}</p>
            <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
              <div 
                className="bg-blue-400 h-1.5 rounded-full" 
                style={{ width: `${Math.min(100, userActiveReferrals * 5)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#065f46] to-[#047857] rounded-2xl p-4 shadow-lg border border-green-500/20 overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-green-400/10"></div>
            <div className="absolute right-8 -bottom-6 w-12 h-12 rounded-full bg-green-400/10"></div>
            <h3 className="text-sm text-white/80 mb-1">Earning Rate</h3>
            <p className="text-2xl font-semibold text-white">
              {accumulationRate} STK/day
            </p>
          </div>
        </div>
      )}
      
      {/* Claim Tokens Card */}
      <div className="mt-4 bg-gradient-to-br from-[#4b2d83] to-[#6d28d9] rounded-2xl p-6 shadow-lg border border-purple-500/20 overflow-hidden relative">
        <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-purple-400/10"></div>
        <div className="absolute right-8 top-8 w-16 h-16 rounded-full bg-purple-400/10"></div>
        <h3 className="text-lg font-semibold text-white mb-3">Claim STK Tokens</h3>
        <div className="flex flex-col space-y-3">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Available to claim:</span>
              <span className="text-xl font-semibold text-white">{claimableTokens.toLocaleString()} STK</span>
            </div>
            {lastClaimedDate && (
              <div className="mt-2 text-xs text-white/50">
                Last claimed: {lastClaimedDate.toLocaleDateString()} at {lastClaimedDate.toLocaleTimeString()}
              </div>
            )}
            {lastAccumulationUpdate && (
              <div className="mt-1 text-xs text-white/50">
                Accumulating {accumulationRate} STK per day
              </div>
            )}
          </div>
          
          <button
            onClick={handleClaimTokens}
            disabled={isClaiming || claimableTokens <= 0}
            className={`w-full px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200 ${
              claimableTokens > 0 && !isClaiming
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:from-purple-500 hover:to-indigo-500'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            {isClaiming ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Claiming...
              </div>
            ) : claimableTokens > 0 ? (
              'Claim Tokens'
            ) : (
              'No Tokens to Claim'
            )}
          </button>
          
          <p className="text-sm text-white/60 text-center">
            Earn more tokens by inviting friends to join!
          </p>
        </div>
      </div>
      
      {/* Referral Link Card */}
      <div className="mt-4 bg-gradient-to-br from-[#1e1e20] to-[#27272a] rounded-2xl p-6 shadow-lg border border-white/10 overflow-hidden relative">
        <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-blue-500/5"></div>
        <div className="absolute right-8 top-8 w-16 h-16 rounded-full bg-purple-500/5"></div>
        <h3 className="text-lg font-semibold text-white mb-3">Your Referral Link</h3>
        <div className="flex flex-col space-y-3">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="w-full bg-[#1A1B1E] rounded-xl px-4 py-3 text-white/80 text-sm border border-white/10 focus:outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center px-3 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
            aria-label="Copy referral link"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Link
          </button>
          <button
            onClick={handleInviteFriend}
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-lg font-medium transition-all duration-200 hover:shadow-lg hover:from-indigo-500 hover:to-purple-500"
          >
            Invite Friend
          </button>
          <p className="text-sm text-white/60 text-center">Share this link to invite friends and earn rewards!</p>
        </div>
      </div>

      {/* Next Tier Card */}
      <div className="mt-4 bg-gradient-to-br from-[#1e1e20] to-[#27272a] rounded-2xl p-6 shadow-lg border border-white/10 overflow-hidden relative">
        <div className="absolute -left-16 -bottom-16 w-32 h-32 rounded-full bg-purple-500/5"></div>
        <div className="absolute left-8 bottom-8 w-16 h-16 rounded-full bg-blue-500/5"></div>
        <h3 className="text-lg font-semibold text-white mb-2">Next Reward Tier</h3>
        {(() => {
          const nextTier = stakingRewardsTiers.find(t => t.minReferrals > userActiveReferrals);
          const remaining = nextTier ? nextTier.minReferrals - userActiveReferrals : 0;
          return nextTier ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-gradient bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {nextTier.tokens.toLocaleString()} STK
                </p>
                <p className="text-sm text-white/60 mt-1">
                  Need {remaining} more active referrals
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-gradient bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Max Tier!</p>
                <p className="text-sm text-white/60 mt-1">
                  You've reached the highest tier
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full p-3">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Tabs */}
      <div className="mt-8">
        <div className="relative flex space-x-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('my-referrals')}
            className={`pb-2 px-1 text-lg font-medium ${
              activeTab === 'my-referrals'
                ? 'text-gradient bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent border-b-2 border-blue-500'
                : 'text-white/60'
            }`}
          >
            My Referrals
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`pb-2 px-1 text-lg font-medium ${
              activeTab === 'statistics'
                ? 'text-gradient bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent border-b-2 border-blue-500'
                : 'text-white/60'
            }`}
          >
            Statistics
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'my-referrals' && (
        <div className="relative mt-6">
          {isLoadingUserReferrals ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : userReferrals.length > 0 ? (
            <div className="space-y-6">
              {/* Referral Levels Summary */}
              <div className="bg-gradient-to-br from-[#1e1e20] to-[#27272a] rounded-2xl p-4 shadow-lg border border-white/10 overflow-hidden relative">
                <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-blue-500/5"></div>
                <h3 className="text-lg font-semibold text-white mb-3">Referral Network</h3>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map(level => {
                    // Get actual count of referrals for this level
                    const count = userReferrals.filter(r => r.level === level).length;
                    
                    // Get the maximum capacity for this level
                    const maxCapacity = LEVEL_CAPACITIES[level];
                    
                    // Check if level is unlocked (has at least one referral)
                    const isUnlocked = count > 0;
                    
                    // Calculate fill percentage for the progress bar
                    const fillPercentage = Math.min(100, (count / maxCapacity) * 100);
                    
                    return (
                      <div key={level} className="bg-white/5 rounded-lg p-3 text-center">
                        <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 ${
                          isUnlocked 
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400' 
                            : 'bg-white/10 text-white/40'
                        }`}>
                          {level}
                        </div>
                        <p className="text-xs text-white/60">Level {level}</p>
                        <p className="text-lg font-medium text-white">{count}</p>
                        <div className="mt-1 w-full bg-white/10 rounded-full h-1">
                          <div 
                            className="bg-blue-400 h-1 rounded-full" 
                            style={{ width: `${fillPercentage}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-white/40 mt-1">
                          {isUnlocked ? `${count}/${maxCapacity}` : `Max: ${maxCapacity}`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Level Tabs */}
              <div className="flex overflow-x-auto pb-2 space-x-2 no-scrollbar">
                {[1, 2, 3, 4, 5].map(level => {
                  // Count referrals for this level
                  const levelCount = userReferrals.filter(r => r.level === level).length;
                  
                  // // Define minimum requirements for each level
                  // const minRequired = level === 1 ? 1 : 
                  //                    level === 2 ? 5 : 
                  //                    level === 3 ? 15 : 
                  //                    level === 4 ? 30 : 50;
                  
                  // Check if level is unlocked
                  const isUnlocked = levelCount > 0 || (level === 1 && userReferrals.length > 0);
                  
                  return (
                    <button
                      key={level}
                      onClick={() => {
                        if (isUnlocked) {
                          setSelectedLevel(level);
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 ${
                        level === selectedLevel
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : isUnlocked 
                            ? 'bg-white/10 text-white/80 hover:bg-white/20 transition-colors' 
                            : 'bg-white/5 text-white/40 cursor-not-allowed'
                      }`}
                    >
                      Level {level}
                      <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                        {levelCount}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              {/* Referral List - Show based on selected level */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Level {selectedLevel} Referrals</h3>
                {isLoadingLevelReferrals ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : levelReferrals.length > 0 ? (
                  <div className="space-y-4">
                    {levelReferrals.map((referral, index) => (
                      <div 
                        key={referral.id} 
                        className={`bg-gradient-to-br ${
                          index % 3 === 0 ? 'from-[#1e1e20] to-[#27272a]' : 
                          index % 3 === 1 ? 'from-[#1a1c2c] to-[#222436]' : 
                          'from-[#1e2030] to-[#2a2c42]'
                        } rounded-2xl p-4 shadow-lg border border-white/10 overflow-hidden relative`}
                      >
                        <div className="absolute -right-8 -bottom-8 w-16 h-16 rounded-full bg-white/5"></div>
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-white">
                              {referral.referred?.username || `ID: ${referral.referred_id}`}
                            </h3>
                            <p className="text-sm text-white/60">
                              Joined {new Date(referral.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            referral.status === 'active' 
                              ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400' 
                              : 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400'
                          }`}>
                            {referral.status}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                          <div className="bg-white/5 rounded-lg p-2">
                            <p className="text-xs text-white/60">Earned</p>
                            <p className="text-sm font-medium text-white">{referral.referred?.total_earned?.toFixed(2) || '0'} TON</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <p className="text-xs text-white/60">Deposit</p>
                            <p className="text-sm font-medium text-white">{referral.referred?.total_deposit?.toFixed(2) || '0'} TON</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <p className="text-xs text-white/60">Rank</p>
                            <p className="text-sm font-medium text-white">{referral.referred?.rank || 'Novice'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-[#1e1e20] to-[#27272a] rounded-2xl p-6 shadow-lg border border-white/10 overflow-hidden relative">
                    <div className="absolute -right-16 -bottom-16 w-32 h-32 rounded-full bg-blue-500/5"></div>
                    <div className="absolute -left-16 -bottom-16 w-32 h-32 rounded-full bg-purple-500/5"></div>
                    <div className="flex flex-col items-center justify-center py-4">
                      <svg className="w-16 h-16 text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="text-lg text-[#8e8e93] text-center">
                        No level {selectedLevel} referrals yet
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#1e1e20] to-[#27272a] w-full rounded-2xl p-8 flex flex-col items-center mt-4 border border-white/10 overflow-hidden relative">
              <div className="absolute -right-16 -bottom-16 w-32 h-32 rounded-full bg-blue-500/5"></div>
              <div className="absolute -left-16 -bottom-16 w-32 h-32 rounded-full bg-purple-500/5"></div>
              <svg className="w-24 h-24 text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-xl text-[#8e8e93] text-center">
                There is nothing else.<br />
                Invite to get more rewards.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'statistics' && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-[#4f46e5] to-[#6366f1] rounded-2xl p-4 shadow-lg border border-indigo-500/20 overflow-hidden relative">
              <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-indigo-400/10"></div>
              <h3 className="text-sm text-white/80 mb-1">Total Network</h3>
              <p className="text-2xl font-semibold text-white">{referralSummary.total_referrals.toLocaleString()}</p>
            </div>
            
            <div className="bg-gradient-to-br from-[#0891b2] to-[#0e7490] rounded-2xl p-4 shadow-lg border border-cyan-500/20 overflow-hidden relative">
              <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-cyan-400/10"></div>
              <h3 className="text-sm text-white/80 mb-1">Conversion Rate</h3>
              <p className="text-2xl font-semibold text-white">{referralSummary.conversion_rate}%</p>
            </div>
          </div>
          
          {/* Add a reward tiers card */}
          <div className="bg-gradient-to-br from-[#1e1e20] to-[#27272a] rounded-2xl p-4 shadow-lg border border-white/10 overflow-hidden relative">
            <div className="absolute -left-16 -bottom-16 w-32 h-32 rounded-full bg-blue-500/5"></div>
            <div className="absolute right-8 top-8 w-16 h-16 rounded-full bg-purple-500/5"></div>
            <h3 className="text-lg font-semibold text-white mb-3">Reward Tiers</h3>
            <div className="space-y-3">
              {stakingRewardsTiers.map((tier, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      userActiveReferrals >= tier.minReferrals 
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400' 
                        : 'bg-white/10 text-white/40'
                    }`}>
                      {userActiveReferrals >= tier.minReferrals ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span className="text-white/80">{tier.minReferrals} Referrals</span>
                  </div>
                  <span className={`text-lg font-medium ${
                    userActiveReferrals >= tier.minReferrals 
                      ? 'text-gradient bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent' 
                      : 'text-white/60'
                  }`}>
                    {tier.tokens.toLocaleString()} STK
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Copy Link Snackbar */}
      {showCopySnackbar && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center z-50 animate-fade-in-up">
          <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Referral link copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default ReferralSystem;