import { useTonConnectUI } from '@tonconnect/ui-react';
import { toUserFriendlyAddress } from '@tonconnect/sdk';
import { FC, useState, useEffect, useRef } from 'react';
import { FaMagento, FaWallet, } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { getTONPrice } from '@/lib/api';
import GMPLeaderboard from '@/components/GMPLeaderboard';
import { OnboardingScreen } from './OnboardingScreen';
import { toNano, fromNano } from "ton";
import TonWeb from 'tonweb';
import { Button } from '@telegram-apps/telegram-ui';
import { Snackbar } from '@telegram-apps/telegram-ui';
import ReferralSystem from '@/components/ReferralSystem';
import { WithdrawalInfoModal } from '@/components/WithdrawalInfoModal';
// import { BsNewspaper } from 'react-icons/bs';
import TonWallet from '@/components/TonWallet';
// import { MiningSection } from '@/components/MiningSection/MiningSection';
// import { ShoutboxHeader } from '@/components/ShoutboxHeader/ShoutboxHeader';
import { LotteryCard } from '@/components/LotteryCard/LotteryCard';
import MiningEarningsCard from '@/components/MiningEarningsCard';


// interface StatsCardProps {
//   title: string;
//   value: string | number;
//   subValue?: string;
//   icon: JSX.Element;
//   bgColor: string;
//   className?: string;
// }

// const StatsCard: FC<StatsCardProps> = ({ title, value, subValue, icon, bgColor, className }) => (
//   <div className={`bg-gradient-to-br from-[#0A0A0F] to-[#11131A] rounded-xl p-4 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)] ${className}`}>
//     <div className="flex items-center gap-4">
//       <div className={`${bgColor} p-2.5 rounded-lg flex-shrink-0 bg-opacity-20`}>
//         {icon}
//       </div>
//       <div className="min-w-0">
//         <p className="text-xs text-blue-300/60">{title}</p>
//         <p className="text-sm font-semibold text-white mt-1 truncate">{value}</p>
//         {subValue && <p className="text-[10px] text-blue-300/40 mt-0.5">{subValue}</p>}
//       </div>
//     </div>
//   </div>
// );

// Update the renderROIStats function
// const renderROIStats = (currentROI: number) => {
//   const dailyRate = currentROI * 100;

//   return (
//     <div className="bg-white/5 rounded-lg p-3">
//       <div className="space-y-1">
//         <div className="flex items-center justify-between">
//           <span className="text-sm text-white/60">Daily</span>
//           <span className="text-sm font-semibold text-green-400">
//             +{dailyRate.toFixed(2)}%
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };


// type CardType = 'stats' | 'activity' | 'community';

// // Add this type definition at the top of the file
// type ActivityType = 'deposit' | 'withdrawal' | 'stake' | 'redeposit';

// // Add these interfaces
// interface Activity {
//   id: string;
//   user_id: string;
//   type: ActivityType;
//   amount: number;
//   created_at: string;
//   status: 'completed' | 'pending' | 'failed';
// }

// // Add this new component
// const RankBadge: FC<{ rank: string }> = ({ rank }) => {
//   const getRankColor = (rank: string): string => {
//     switch (rank) {
//       case 'Novice': return 'bg-gray-500/20 text-gray-400';
//       case 'Ambassador': return 'bg-green-500/20 text-green-400';
//       case 'Warrior': return 'bg-blue-500/20 text-blue-400';
//       case 'Master': return 'bg-purple-500/20 text-purple-400';
//       case 'Cryptomogul': return 'bg-yellow-500/20 text-yellow-400';
//       case 'TON Baron': return 'bg-orange-500/20 text-orange-400';
//       case 'Tycoon': return 'bg-red-500/20 text-red-400';
//       case 'TON Elite': return 'bg-pink-500/20 text-pink-400';
//       case 'Final Boss': return 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-pink-400';
//       default: return 'bg-gray-500/20 text-gray-400';
//     }
//   };

//   return (
//     <div className={`px-3 py-1 rounded-full ${getRankColor(rank)} font-medium text-xs`}>
//       {rank}
//     </div>
//   );
// };




// Add these constants for both networks
const MAINNET_DEPOSIT_ADDRESS = 'UQDd4ENxNBVIFNoi1t1FQPrLhLM1rMbxIFoI1sWIS4vuhjs-';
const TESTNET_DEPOSIT_ADDRESS = 'UQDd4ENxNBVIFNoi1t1FQPrLhLM1rMbxIFoI1sWIS4vuhjs-';

const isMainnet = false; // You can toggle this for testing

// Use the appropriate address based on network
const DEPOSIT_ADDRESS = isMainnet ? MAINNET_DEPOSIT_ADDRESS : TESTNET_DEPOSIT_ADDRESS;

// Constants for both networks
const MAINNET_API_KEY = 'ba0e3b7f5080add7ba9bc310b2652ce4d33654575152d5ab90fde863309f6118';
const TESTNET_API_KEY = 'bb31868e5cf6529efb16bcf547beb3c534a28d1e139bd63356fd936c168fe662';

// Use toncenter.com as HTTP API endpoint to interact with TON blockchain
const tonweb = isMainnet ?
    new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', {apiKey: MAINNET_API_KEY})) :
    new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC', {apiKey: TESTNET_API_KEY}));

// // Add this near the top with other constants
// const NETWORK_NAME = isMainnet ? 'Mainnet' : 'Testnet';

// Helper function to generate unique ID
const generateUniqueId = async () => {
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    // Generate a random ID between 1 and 999999
    const id = Math.floor(Math.random() * 999999) + 1;
    
    // Check if ID exists
    const { error } = await supabase
      .from('deposits')
      .select('id')
      .eq('id', id)
      .single();
      
    if (error && error.code === 'PGRST116') {  // No rows returned
      return id;  // Return as number, not string
    }
    
    attempts++;
  }
  
  throw new Error('Could not generate unique deposit ID');
};

// Add these types and interfaces near other interfaces
interface SnackbarConfig {
  message: string;
  description?: string;
  duration?: number;
}

// Add these constants near other constants
const SNACKBAR_DURATION = 5000; // 5 seconds

// Add these new interfaces
interface LocalEarningState {
  lastUpdate: number;
  currentEarnings: number;
  baseEarningRate: number;
  isActive: boolean;
}

// Add these constants
const EARNINGS_SYNC_INTERVAL = 60000; // Sync with server every 60 seconds
const EARNINGS_STORAGE_KEY = 'user_earnings_state';
const EARNINGS_UPDATE_INTERVAL = 1000; // Update UI every second

// Add these constants for accuracy checks
const EARNINGS_ACCURACY_CHECK_KEY = 'earnings_accuracy_check';

// Mining system constants
const MAX_DAILY_EARNINGS = 100; // Maximum STARFI per day
const CLAIM_COOLDOWN_MINUTES = 30; // 30 minutes cooldown between claims
const MINING_STARTED_KEY = 'mining_started';
const LAST_CLAIM_KEY = 'last_claim_timestamp';
const DAILY_EARNINGS_KEY = 'daily_earnings_timestamp';
const DAILY_EARNINGS_AMOUNT_KEY = 'daily_earnings_amount';

// Add this interface for accuracy tracking
interface AccuracyCheckpoint {
  timestamp: number;
  earnings: number;
  lastServerSync: number;
}

// Add this interface near other interfaces
interface OfflineEarnings {
  lastActiveTimestamp: number;
  baseEarningRate: number;
}

// Add this constant near other constants
const OFFLINE_EARNINGS_KEY = 'offline_earnings_state';

// Add this constant near other constants
const TOTAL_EARNED_KEY = 'total_earned_state';

// Add these helper functions
const saveAccuracyCheckpoint = (checkpoint: AccuracyCheckpoint) => {
  localStorage.setItem(EARNINGS_ACCURACY_CHECK_KEY, JSON.stringify(checkpoint));
};

// Update the calculateStakingProgress function
const calculateStakingProgress = (depositDate: Date | string | null): number => {
  if (!depositDate) return 0;
  
  // Convert string to Date if necessary
  const startDate = typeof depositDate === 'string' ? new Date(depositDate) : depositDate;
  
  // Validate the date
  if (isNaN(startDate.getTime())) return 0;

  const now = Date.now();
  const startTime = startDate.getTime();
  const endTime = startTime + (100 * 24 * 60 * 60 * 1000); // 100 days
  
  // Handle edge cases
  if (now >= endTime) return 100;
  if (now <= startTime) return 0;
  
  // Calculate progress
  const progress = ((now - startTime) / (endTime - startTime)) * 100;
  return Math.min(Math.max(progress, 0), 100); // Ensure between 0 and 100
};

// Add these helper functions
const saveOfflineEarnings = (state: OfflineEarnings) => {
  localStorage.setItem(OFFLINE_EARNINGS_KEY, JSON.stringify(state));
};

const loadOfflineEarnings = (): OfflineEarnings | null => {
  const stored = localStorage.getItem(OFFLINE_EARNINGS_KEY);
  return stored ? JSON.parse(stored) : null;
};

const loadTotalEarned = (): number => {
  const stored = localStorage.getItem(TOTAL_EARNED_KEY);
  return stored ? parseFloat(stored) : 0;
};

export const IndexPage: FC = () => {

  const [currentTab, setCurrentTab] = useState('home');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const { user, isLoading, error, updateUserData } = useAuth();
  // const userAddress = useTonAddress();
  const [userFriendlyAddress, setUserFriendlyAddress] = useState<string | null>(null);
  const tonConnectUI = useTonConnectUI();
  
  useEffect(() => {
    const [tonConnect] = tonConnectUI;
    if (tonConnect.account) {
      const rawAddress = tonConnect.account.address;
      const friendlyAddress = toUserFriendlyAddress(rawAddress);
      setUserFriendlyAddress(friendlyAddress);
    }
  }, [tonConnectUI]);

  const [isWithdrawing,] = useState(false);
  const [currentROI, ] = useState<number>(0.1); // 10% daily default
  const [tonPrice, setTonPrice] = useState<number>(2.5);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // // Add state for activities
  // const [activities, setActivities] = useState<Activity[]>([]);
  // const [isLoadingActivities, setIsLoadingActivities] = useState(false);

   const [depositStatus, setDepositStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  // Add these state variables near the top with other state declarations
   const [walletBalance, setWalletBalance] = useState<string>('0');
   const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  // Add these state variables
   const [isSnackbarVisible, setSnackbarVisible] = useState(false);
   const [snackbarMessage, setSnackbarMessage] = useState('');
   const [snackbarDescription, setSnackbarDescription] = useState('');
   const snackbarTimeoutRef = useRef<NodeJS.Timeout>();

  // Claimed TON balance (local tracking)
  const CLAIMED_BALANCE_KEY = 'claimed_ton_balance';
  const [claimedTonBalance, setClaimedTonBalance] = useState<number>(() => {
    const stored = localStorage.getItem(CLAIMED_BALANCE_KEY);
    return stored ? parseFloat(stored) || 0 : 0;
  });
  const saveClaimedBalance = (value: number) => {
    setClaimedTonBalance(value);
    localStorage.setItem(CLAIMED_BALANCE_KEY, value.toString());
  };

  // Add this state for custom amount
  const [customAmount, setCustomAmount] = useState<string>('');



  // Update the earning system in the IndexPage component
  const [earningState, setEarningState] = useState<LocalEarningState>({
    lastUpdate: Date.now(),
    currentEarnings: 0,
    baseEarningRate: 0,
    isActive: false,
  });

  // Mining control state
  const [isMiningStarted, setIsMiningStarted] = useState<boolean>(() => {
    const stored = localStorage.getItem(MINING_STARTED_KEY);
    return stored === 'true';
  });

  const [lastClaimTime, setLastClaimTime] = useState<number | null>(() => {
    const stored = localStorage.getItem(LAST_CLAIM_KEY);
    return stored ? parseInt(stored) : null;
  });

  const [dailyEarningsTimestamp, setDailyEarningsTimestamp] = useState<number>(() => {
    const stored = localStorage.getItem(DAILY_EARNINGS_KEY);
    return stored ? parseInt(stored) : Date.now();
  });

  const [dailyEarningsAmount, setDailyEarningsAmount] = useState<number>(() => {
    const stored = localStorage.getItem(DAILY_EARNINGS_AMOUNT_KEY);
    return stored ? parseFloat(stored) : 0;
  });

  // Check if we need to reset daily earnings (new day)
  useEffect(() => {
    const now = Date.now();
    const lastDailyReset = dailyEarningsTimestamp;
    const oneDay = 24 * 60 * 60 * 1000;

    if (now - lastDailyReset >= oneDay) {
      // New day, reset daily earnings
      setDailyEarningsAmount(0);
      setDailyEarningsTimestamp(now);
      localStorage.setItem(DAILY_EARNINGS_KEY, now.toString());
      localStorage.setItem(DAILY_EARNINGS_AMOUNT_KEY, '0');
    }
  }, [dailyEarningsTimestamp]);

  // Calculate earning rate: 100 STARFI per day
  const calculateMiningRate = (): number => {
    // 100 STARFI per day = 100 / 86400 seconds per second
    return MAX_DAILY_EARNINGS / 86400;
  };

  // Add function to save earning state to localStorage
  const saveEarningState = (state: LocalEarningState) => {
    try {
      localStorage.setItem(EARNINGS_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving earning state:', error);
    }
  };

  // Add function to load earning state from localStorage
  const loadEarningState = (): LocalEarningState | null => {
    try {
      const stored = localStorage.getItem(EARNINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate the loaded state
        if (parsed && typeof parsed === 'object' && 
            'lastUpdate' in parsed && 'currentEarnings' in parsed && 
            'baseEarningRate' in parsed && 'isActive' in parsed) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading earning state:', error);
    }
    return null;
  };

  // Update syncEarningsWithServer to include accuracy reconciliation
  const syncEarningsWithServer = async (earnings: number) => {
    if (!user?.id) return;

    try {
      const now = Date.now();
      const totalEarned = loadTotalEarned() + earnings;

      // Use upsert to ensure earnings are always saved
      const { error } = await supabase
        .from('user_earnings')
        .upsert({
          user_id: user.id,
          current_earnings: earnings,
          total_earned: totalEarned, // Add total earned to track lifetime earnings
          last_update: new Date(now).toISOString(),
          earning_rate: earningState.baseEarningRate
        });

      if (error) throw error;

      // Save total earned locally
      localStorage.setItem(TOTAL_EARNED_KEY, totalEarned.toString());

      // Update local state
      setEarningState(prevState => ({
        ...prevState,
        currentEarnings: earnings,
        lastUpdate: now
      }));

      // Save accuracy checkpoint
      saveAccuracyCheckpoint({
        timestamp: now,
        earnings: earnings,
        lastServerSync: now
      });

    } catch (error) {
      console.error('Error syncing earnings:', error);
    }
  };


  // Update the earnings effect to include accuracy checks
  useEffect(() => {
    if (!user?.id || !user.balance) return;

    // Load saved state and total earned
    const savedState = loadEarningState();
    const totalEarned = loadTotalEarned();
    const now = Date.now();

    const initializeEarningState = async () => {
      try {
        // Fetch current earnings from server
        const { data: serverData } = await supabase
          .from('user_earnings')
          .select('current_earnings, total_earned, last_update')
          .eq('user_id', user.id)
          .single();

        const newRate = calculateEarningRate(user.balance, currentROI);
        
        if (serverData) {
          // Calculate accumulated earnings since last update
          const lastUpdateTime = new Date(serverData.last_update).getTime();
          const secondsElapsed = (now - lastUpdateTime) / 1000;
          const accumulatedEarnings = (newRate * secondsElapsed) + serverData.current_earnings;

          const newState = {
            lastUpdate: now,
            currentEarnings: accumulatedEarnings,
            baseEarningRate: newRate,
            isActive: user.balance > 0
          };
          
          setEarningState(newState);
          saveEarningState(newState);
          saveAccuracyCheckpoint({
            timestamp: now,
            earnings: accumulatedEarnings,
            lastServerSync: now
          });

          // Update total earned
          localStorage.setItem(TOTAL_EARNED_KEY, serverData.total_earned.toString());
        } else {
          // Initialize new earning state
          const newState = {
            lastUpdate: now,
            currentEarnings: savedState?.currentEarnings || 0,
            baseEarningRate: newRate,
            isActive: user.balance > 0
          };

          setEarningState(newState);
          saveEarningState(newState);
          saveAccuracyCheckpoint({
            timestamp: now,
            earnings: savedState?.currentEarnings || 0,
            lastServerSync: now
          });

          // Initialize total earned
          localStorage.setItem(TOTAL_EARNED_KEY, totalEarned.toString());
        }
      } catch (error) {
        console.error('Error initializing earning state:', error);
      }
    };

    initializeEarningState();

    // Set up earnings calculation interval
    const earningsInterval = setInterval(() => {
      setEarningState(prevState => {
        const now = Date.now();
        const secondsElapsed = (now - prevState.lastUpdate) / 1000;
        const newEarnings = prevState.currentEarnings + (prevState.baseEarningRate * secondsElapsed);
        
        const newState = {
          ...prevState,
          lastUpdate: now,
          currentEarnings: newEarnings
        };
        
        saveEarningState(newState);
        return newState;
      });
    }, EARNINGS_UPDATE_INTERVAL);

    // Set up server sync interval
    const syncInterval = setInterval(() => {
      syncEarningsWithServer(earningState.currentEarnings);
    }, EARNINGS_SYNC_INTERVAL);

    return () => {
      clearInterval(earningsInterval);
      clearInterval(syncInterval);
      // Save final state before unmounting
      saveEarningState(earningState);
    };
  }, [user?.id, user?.balance, currentROI]);

  // Add this utility function
  const showSnackbar = ({ message, description = '', duration = SNACKBAR_DURATION }: SnackbarConfig) => {
    if (snackbarTimeoutRef.current) {
      clearTimeout(snackbarTimeoutRef.current);
    }

    setSnackbarMessage(message);
    setSnackbarDescription(description);
    setSnackbarVisible(true);

    snackbarTimeoutRef.current = setTimeout(() => {
      setSnackbarVisible(false);
    }, duration);
  };

  // Add this effect to fetch and update the wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      const [tonConnect] = tonConnectUI;
      if (!tonConnect.account) {
        setWalletBalance('0');
        setIsLoadingBalance(false);
        return;
      }

      try {
        const balance = await tonweb.getBalance(tonConnect.account.address);
        const balanceInTON = fromNano(balance);
        setWalletBalance(balanceInTON);
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
        setWalletBalance('0');
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchWalletBalance();
    // Update balance every 30 seconds
    const intervalId = setInterval(fetchWalletBalance, 30000);

    return () => clearInterval(intervalId);
  }, [tonConnectUI]);

// Legacy function - keeping for backward compatibility but not used for mining
const calculateEarningRate = (balance: number, roi: number) => {
  // Convert daily ROI to per-second rate
  // ROI is in decimal form (e.g., 0.01 for 1%)
  return (balance * roi) / 86400; // 86400 seconds in a day
};

// Update handleDeposit to initialize earning state
const handleDeposit = async (amount: number) => {
  try {
    // Validate amount
    if (amount < 1) {
      showSnackbar({ 
        message: 'Invalid Amount', 
        description: 'Minimum deposit amount is 1 TON' 
      });
      return;
    }

    // Validate user and wallet connection
    if (!user?.id || !userFriendlyAddress) {
      showSnackbar({ 
        message: 'Wallet Not Connected', 
        description: 'Please connect your wallet first' 
      });
      return;
    }

    // Check wallet balance
    const walletBalanceNum = Number(walletBalance);
    if (walletBalanceNum < amount) {
      showSnackbar({
        message: 'Insufficient Balance',
        description: `Your wallet balance is ${walletBalanceNum.toFixed(2)} STARFI`
      });
      return;
    }

    setDepositStatus('pending');
    const amountInNano = toNano(amount.toString());
    
    // Generate unique ID
    const depositId = await generateUniqueId();
    
    // Record pending deposit
    const { error: pendingError } = await supabase
      .from('deposits')
      .insert([{
        id: depositId,
        user_id: user.id,
        amount: amount,
        amount_nano: amountInNano.toString(),
        status: 'pending',
        created_at: new Date().toISOString()
      }]);

    if (pendingError) throw pendingError;

    // Create transaction
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes
      messages: [
        {
          address: DEPOSIT_ADDRESS, // Use string address
          amount: amountInNano.toString(),
        },
      ],
    };

    const [tonConnect] = tonConnectUI;
    const result = await tonConnect.sendTransaction(transaction);

    if (result) {
      // Update deposit status
      const { error: updateError } = await supabase
        .from('deposits')
        .update({ 
          status: 'confirmed',
          tx_hash: result.boc
        })
        .eq('id', depositId);

      if (updateError) throw updateError;

      // Process deposit
      const { error: balanceError } = await supabase.rpc('process_deposit_v2', {
        p_user_id: user.id,
        p_amount: amount,
        p_deposit_id: depositId
      });

      if (balanceError) throw balanceError;

      // Update UI state
      setDepositStatus('success');
      showSnackbar({ 
        message: 'Deposit Successful', 
        description: `Successfully deposited ${amount} TON` 
      });
      
      // Refresh user data
      await updateUserData({ id: user.id }); // Pass object with id property
      setShowDepositModal(false);

      // After successful deposit, initialize or update earnings state
      const totalBalance = (user?.balance || 0) + amount;
      const newRate = calculateEarningRate(totalBalance, currentROI);
      const newState = {
        lastUpdate: Date.now(),
        currentEarnings: earningState.currentEarnings,
        baseEarningRate: newRate,
        isActive: true
      };
      
      setEarningState(newState);
      saveEarningState(newState);
    }
  } catch (error) {
    console.error('Deposit failed:', error);
    setDepositStatus('error');
    showSnackbar({ 
      message: 'Deposit Failed', 
      description: 'Please try again later' 
    });
  }
};


  // Add these state variables
  const [showSTKBuyModal, setShowSTKBuyModal] = useState(false);
  const [stkAmount, setStkAmount] = useState(0);
  const [tonCost, setTonCost] = useState(0);
  // const [isProcessing, setIsProcessing] = useState(false);
  
  // Add this effect to handle wallet balance
  useEffect(() => {
    if (!showSTKBuyModal) return;

    const fetchWalletBalance = async () => {
      const [tonConnect] = tonConnectUI;
      if (!tonConnect.account?.address) {
        setWalletBalance('0');
        setIsLoadingBalance(false);
        return;
      }

      try {
        setIsLoadingBalance(true);
        const balance = await tonweb.getBalance(tonConnect.account.address);
        const balanceInTON = fromNano(balance);
        setWalletBalance(balanceInTON);
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
        setWalletBalance('0');
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchWalletBalance();
    const intervalId = setInterval(fetchWalletBalance, 3000);
    return () => clearInterval(intervalId);
  }, [showSTKBuyModal, tonConnectUI]);

  // Add this function to format earnings display
  // const formatEarnings = (amount: number): string => {
  //   if (amount >= 1) {
  //     return amount.toFixed(7);
  //   } else {
  //     return amount.toFixed(7);
  //   }
  // };

  // Claim handler: start mining or claim earnings (with 30-minute cooldown)
  const handleClaimToClaimedBalance = async () => {
    // If mining hasn't started, start it
    if (!isMiningStarted) {
      setIsMiningStarted(true);
      localStorage.setItem(MINING_STARTED_KEY, 'true');
      
      // Initialize earning state
      const miningRate = calculateMiningRate();
      const newState = {
        lastUpdate: Date.now(),
        currentEarnings: 0,
        baseEarningRate: miningRate,
        isActive: true
      };
      
      setEarningState(newState);
      saveEarningState(newState);

      showSnackbar({
        message: 'Mining Started',
        description: 'Mining has been activated! You can claim every 30 minutes.'
      });
      return;
    }

    // Check cooldown (30 minutes)
    const now = Date.now();
    if (lastClaimTime) {
      const cooldownMs = CLAIM_COOLDOWN_MINUTES * 60 * 1000;
      const timeSinceLastClaim = now - lastClaimTime;
      
      if (timeSinceLastClaim < cooldownMs) {
        const remainingMinutes = Math.ceil((cooldownMs - timeSinceLastClaim) / 60000);
        showSnackbar({
          message: 'Cooldown Active',
          description: `Please wait ${remainingMinutes} minute(s) before claiming again.`
        });
        return;
      }
    }

    // Check daily limit
    const amount = earningState.currentEarnings;
    if (amount <= 0) {
      showSnackbar({
        message: 'No Earnings',
        description: 'You have no earnings to claim yet. Keep mining!'
      });
      return;
    }

    // Check if claiming would exceed daily limit
    const potentialDailyTotal = dailyEarningsAmount + amount;
    if (potentialDailyTotal > MAX_DAILY_EARNINGS) {
      const claimableAmount = MAX_DAILY_EARNINGS - dailyEarningsAmount;
      if (claimableAmount <= 0) {
        showSnackbar({
          message: 'Daily Limit Reached',
          description: `You've reached the daily limit of ${MAX_DAILY_EARNINGS} STARFI. Try again tomorrow!`
        });
        return;
      }
      
      // Only claim the remaining amount within daily limit
      const newClaimed = claimedTonBalance + claimableAmount;
      saveClaimedBalance(newClaimed);

      setEarningState(prev => ({
        ...prev,
        currentEarnings: prev.currentEarnings - claimableAmount,
        lastUpdate: Date.now()
      }));

      const newDailyAmount = dailyEarningsAmount + claimableAmount;
      setDailyEarningsAmount(newDailyAmount);
      localStorage.setItem(DAILY_EARNINGS_AMOUNT_KEY, newDailyAmount.toString());

      setLastClaimTime(now);
      localStorage.setItem(LAST_CLAIM_KEY, now.toString());

      showSnackbar({
        message: 'Partial Claim',
        description: `Claimed ${claimableAmount.toFixed(8)} STARFI (daily limit reached)`
      });
      return;
    }

    try {
      // Update local claimed balance and reset earnings
      const newClaimed = claimedTonBalance + amount;
      saveClaimedBalance(newClaimed);

      setEarningState(prev => ({
        ...prev,
        currentEarnings: 0,
        lastUpdate: Date.now()
      }));

      // Update daily earnings tracking
      const newDailyAmount = dailyEarningsAmount + amount;
      setDailyEarningsAmount(newDailyAmount);
      localStorage.setItem(DAILY_EARNINGS_AMOUNT_KEY, newDailyAmount.toString());

      // Update last claim time
      setLastClaimTime(now);
      localStorage.setItem(LAST_CLAIM_KEY, now.toString());

      // Persist reset to server for accrual continuity
      if (user?.id) {
        await supabase
          .from('user_earnings')
          .upsert({
            user_id: user.id,
            current_earnings: 0,
            last_update: new Date(now).toISOString(),
            earning_rate: earningState.baseEarningRate
          });
      }

      showSnackbar({
        message: 'Claimed',
        description: `Moved ${amount.toFixed(8)} STARFI to Claimed Balance (${newDailyAmount.toFixed(2)}/${MAX_DAILY_EARNINGS} today)`
      });
    } catch (e) {
      console.error('Claim failed:', e);
      showSnackbar({ message: 'Claim Failed', description: 'Please try again' });
    }
  };

  // // Update handleWithdraw to handle zero earnings
  // const handleWithdraw = async () => {
  //   if (!user?.id) {
  //     showSnackbar({ 
  //       message: 'Not Connected', 
  //       description: 'Please connect your wallet first' 
  //     });
  //     return;
  //   }

  //   // Check if there are any earnings to withdraw
  //   if (earningState.currentEarnings <= 0) {
  //     showSnackbar({ 
  //       message: 'No Earnings', 
  //       description: 'You have no earnings to withdraw' 
  //     });
  //     return;
  //   }

  //   try {
  //     setIsWithdrawing(true);

  //     const totalAmount = earningState.currentEarnings;
  //     const toWallet = totalAmount * 0.6;
  //     const toRedeposit = totalAmount * 0.2;
  //     const toSBT = totalAmount * 0.1;

  //     // Process withdrawal
  //     const { error } = await supabase.rpc('process_withdrawal', {
  //       user_id: user.id,
  //       amount: totalAmount,
  //       to_wallet: toWallet,
  //       to_redeposit: toRedeposit,
  //       to_sbt: toSBT
  //     });

  //     if (error) throw error;

  //     // Update UI state
  //     const newState = {
  //       lastUpdate: Date.now(),
  //       currentEarnings: 0,
  //       baseEarningRate: earningState.baseEarningRate,
  //       isActive: earningState.isActive
  //     };
      
  //     setEarningState(newState);
  //     saveEarningState(newState);
  //     showSnackbar({ 
  //       message: 'Withdrawal Successful',
  //       description: `${toWallet.toFixed(2)} TON to wallet\n${toRedeposit.toFixed(2)} TON redeposited\n${toSBT.toFixed(2)} TON to STK`
  //     });

  //     // Refresh user data
  //     await updateUserData({ id: user.id }); // Pass object with id property

  //   } catch (error) {
  //     console.error('Withdrawal failed:', error);
  //     showSnackbar({ 
  //       message: 'Withdrawal Failed', 
  //       description: 'Please try again later' 
  //     });
  //   } finally {
  //     setIsWithdrawing(false);
  //   }
  // };

  // Add effect to fetch and subscribe to activities
  // useEffect(() => {
  //   const fetchActivities = async () => {
  //     if (!user?.id) return;

  //     setIsLoadingActivities(true);
  //     try {
  //       const { data, error } = await supabase
  //         .from('activities')
  //         .select('*')
  //         .eq('user_id', user.id)
  //         .order('created_at', { ascending: false })
  //         .limit(10);

  //       if (error) throw error;
  //       setActivities(data || []);
  //     } catch (error) {
  //       console.error('Error fetching activities:', error);
  //     } finally {
  //       setIsLoadingActivities(false);
  //     }
  //   };

  //   // Only fetch if activities tab is active
  //   if (activeCard === 'activity') {
  //     fetchActivities();

  //     // Set up real-time subscription
  //     const subscription = supabase
  //       .channel('activities-channel')
  //       .on(
  //         'postgres_changes',
  //         {
  //           event: '*',
  //           schema: 'public',
  //           table: 'activities',
  //           filter: `user_id=eq.${user?.id}`
  //         },
  //         (payload) => {
  //           // Handle different types of changes
  //           if (payload.eventType === 'INSERT') {
  //             setActivities(prev => [payload.new as Activity, ...prev].slice(0, 10));
  //           } else if (payload.eventType === 'UPDATE') {
  //             setActivities(prev => 
  //               prev.map(activity => 
  //                 activity.id === payload.new.id ? payload.new as Activity : activity
  //               )
  //             );
  //           } else if (payload.eventType === 'DELETE') {
  //             setActivities(prev => 
  //               prev.filter(activity => activity.id !== payload.old.id)
  //             );
  //           }
  //         }
  //       )
  //       .subscribe();

  //       // Cleanup subscription
  //       return () => {
  //         supabase.removeChannel(subscription);
  //       };
  //     }
  //   }, [user?.id, activeCard]);

  // // Helper function to format date
  // const formatDate = (dateString: string) => {
  //   const date = new Date(dateString);
  //   return new Intl.DateTimeFormat('en-US', {
  //     month: 'short',
  //     day: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit'
  //   }).format(date);
  // };

  // // Update the activity card content to show more details
  // const renderActivityCard = () => (
  //   <div className="relative overflow-hidden rounded-xl p-4 border border-blue-500/30 shadow-xl mt-5 mb-3 bg-gradient-to-br from-black/80 via-[#0A0A1A] to-[#0A0A1F]">
  //     <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>

  //     {isLoadingActivities ? (
  //       <div className="relative flex items-center justify-center py-8">
  //         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  //       </div>
  //     ) : activities.length === 0 ? (
  //       <div className="text-center py-8">
  //         <p className="text-white/40">No activities yet</p>
  //       </div>
  //     ) : (
  //       <div className="space-y-4">
  //         {activities.map((activity) => (
  //           <div 
  //             key={activity.id}
  //             className="relative flex items-center justify-between py-3 border-b border-white/5 last:border-0"
  //           >
  //             <div className="flex items-center gap-3">
  //               <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
  //                 activity.type === 'deposit' ? 'bg-blue-500/20' :
  //                 activity.type === 'withdrawal' ? 'bg-green-500/20' :
  //                 activity.type === 'stake' ? 'bg-purple-500/20' :
  //                 'bg-yellow-500/20'
  //               }`}>
  //                 {getActivityIcon(activity.type)}
  //               </div>
  //               <div>
  //                 <div className="flex items-center gap-2">
  //                   <p className="text-sm font-medium text-white">
  //                     {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
  //                   </p>
  //                   <span className={`text-xs px-2 py-0.5 rounded-full ${
  //                     activity.status === 'completed' ? 'bg-green-500/20 text-green-400' :
  //                     activity.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
  //                     'bg-red-500/20 text-red-400'
  //                   }`}>
  //                     {activity.status}
  //                   </span>
  //                 </div>
  //                 <div className="flex items-center gap-2 mt-0.5">
  //                   <p className="text-sm text-white/60">
  //                     {activity.amount.toFixed(2)} TON
  //                   </p>
  //                   <span className="text-xs text-white/40">
  //                     • {formatDate(activity.created_at)}
  //                   </span>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     )}
  //   </div>
  // );

  // // Activity card content
  // const getActivityIcon = (type: Activity['type']) => {
  //   switch (type) {
  //     case 'deposit':
  //       return <FaCoins className="w-4 h-4 text-blue-400" />;
  //     case 'withdrawal':
  //       return <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  //       </svg>;
  //     case 'stake':
  //       return <BiNetworkChart className="w-4 h-4 text-purple-400" />;
  //     case 'redeposit':
  //       return <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  //       </svg>;
  //     default:
  //       return null;
  //   }
  // };

  // Add useEffect to fetch price
  useEffect(() => {
    const fetchPrice = async () => {
      const price = await getTONPrice();
      setTonPrice(price);
    };

    fetchPrice();

    // Update price every 60 seconds
    const interval = setInterval(fetchPrice, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user && !isLoading) {
      const hasSeenOnboarding = localStorage.getItem(`onboarding_${user.telegram_id}`);
      const isNewUser = user.total_deposit === 0;

      if (!hasSeenOnboarding || isNewUser) {
        setShowOnboarding(true);
        const timer = setTimeout(() => {
          setShowOnboarding(false);
          localStorage.setItem(`onboarding_${user.telegram_id}`, 'true');
        }, 14000); // 2s loading + (4 steps × 3s)
        return () => clearTimeout(timer);
      }
    }
  }, [user, isLoading]);

  // Add this effect to handle offline earnings
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // App became visible, calculate offline earnings
        const offlineState = loadOfflineEarnings();
        if (offlineState && earningState.isActive) {
          const now = Date.now();
          const secondsElapsed = (now - offlineState.lastActiveTimestamp) / 1000;
          const offlineEarnings = offlineState.baseEarningRate * secondsElapsed;

          if (offlineEarnings > 0) {
            setEarningState(prev => ({
              ...prev,
              currentEarnings: prev.currentEarnings + offlineEarnings,
              lastUpdate: now
            }));

            showSnackbar({
              message: 'Offline Earnings Added',
              description: `You earned ${offlineEarnings.toFixed(8)} TON while offline`
            });
          }
        }
      } else {
        // App is going to background, save current state
        if (earningState.isActive) {
          saveOfflineEarnings({
            lastActiveTimestamp: Date.now(),
            baseEarningRate: earningState.baseEarningRate
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [earningState]);

  // Update the earning effect to include offline earnings
  useEffect(() => {
    if (!user?.id || !user.balance) return;

    // Load saved state and accuracy checkpoint
    const savedState = loadEarningState();
    const now = Date.now();

    const initializeEarningState = async () => {
      try {
        // Fetch current earnings from server
        const { data: serverData } = await supabase
          .from('user_earnings')
          .select('current_earnings, last_update')
          .eq('user_id', user.id)
          .single();

        const newRate = calculateEarningRate(user.balance, currentROI);
        
        if (serverData) {
          // Calculate accumulated earnings since last update
          const lastUpdateTime = new Date(serverData.last_update).getTime();
          const secondsElapsed = (now - lastUpdateTime) / 1000;
          const accumulatedEarnings = (newRate * secondsElapsed) + serverData.current_earnings;

          const newState = {
            lastUpdate: now,
            currentEarnings: accumulatedEarnings,
            baseEarningRate: newRate,
            isActive: user.balance > 0
          };
          
          setEarningState(newState);
          saveEarningState(newState);
          saveAccuracyCheckpoint({
            timestamp: now,
            earnings: accumulatedEarnings,
            lastServerSync: now
          });
        } else {
          // Initialize new earning state
          const newState = {
            lastUpdate: now,
            currentEarnings: savedState?.currentEarnings || 0,
            baseEarningRate: newRate,
            isActive: user.balance > 0
          };

          setEarningState(newState);
          saveEarningState(newState);
          saveAccuracyCheckpoint({
            timestamp: now,
            earnings: savedState?.currentEarnings || 0,
            lastServerSync: now
          });
        }
      } catch (error) {
        console.error('Error initializing earning state:', error);
      }
    };

    initializeEarningState();

    // Set up earnings calculation interval
    const earningsInterval = setInterval(() => {
      setEarningState(prevState => {
        const now = Date.now();
        const secondsElapsed = (now - prevState.lastUpdate) / 1000;
        const newEarnings = prevState.currentEarnings + (prevState.baseEarningRate * secondsElapsed);
        
        const newState = {
          ...prevState,
          lastUpdate: now,
          currentEarnings: newEarnings
        };
        
        saveEarningState(newState);
        return newState;
      });
    }, EARNINGS_UPDATE_INTERVAL);

    // Set up server sync interval
    const syncInterval = setInterval(() => {
      syncEarningsWithServer(earningState.currentEarnings);
    }, EARNINGS_SYNC_INTERVAL);

    return () => {
      clearInterval(earningsInterval);
      clearInterval(syncInterval);
      // Save final state before unmounting
      saveEarningState(earningState);
    };
  }, [user?.id, user?.balance, currentROI]);

  // Add this state
  const [showOfflineRewardsModal, setShowOfflineRewardsModal] = useState(false);
  const [offlineRewardsAmount, setOfflineRewardsAmount] = useState(0);
 
  // Update the offline earnings handling
  useEffect(() => {
    if (!user?.id || !user.balance) return;

    // Load offline earnings on mount
    const offlineState = loadOfflineEarnings();
    if (offlineState && earningState.isActive) {
      const now = Date.now();
      const secondsElapsed = (now - offlineState.lastActiveTimestamp) / 1000;
      const offlineEarnings = offlineState.baseEarningRate * secondsElapsed;

      if (offlineEarnings > 0) {
        setOfflineRewardsAmount(offlineEarnings);
        setShowOfflineRewardsModal(true);
      }
    }

    // Clear offline earnings state
    localStorage.removeItem(OFFLINE_EARNINGS_KEY);
  }, [user?.id, user?.balance, currentROI]);

  // Add the claim handler
  const handleClaimOfflineRewards = async () => {
    try {
      setEarningState(prev => ({
        ...prev,
        currentEarnings: prev.currentEarnings + offlineRewardsAmount,
        lastUpdate: Date.now()
      }));

      showSnackbar({
        message: 'Offline Rewards Claimed',
        description: `Successfully claimed ${offlineRewardsAmount.toFixed(8)} TON`
      });

      setShowOfflineRewardsModal(false);
      setOfflineRewardsAmount(0);
    } catch (error) {
      console.error('Error claiming offline rewards:', error);
      showSnackbar({
        message: 'Claim Failed',
        description: 'Please try again later'
      });
    }
  };

  // Add this state for live progress
  const [, setStakingProgress] = useState(0);

  // Add this effect for live progress updates
  useEffect(() => {
    if (user?.last_deposit_date) {
      setStakingProgress(calculateStakingProgress(user.last_deposit_date));
    }
  }, [user?.last_deposit_date]);

  // // Add this calculation for earnings progress
  // const earningsProgress = user?.balance && user.balance > 0 
  //   ? (earningState.currentEarnings / user.balance) * 100
  //   : 0;

  // // Add this helper function to calculate potential earnings
  // const calculatePotentialEarnings = (balance: number): number => {
  //   let totalEarnings = 0;
  //   let currentROI = 0.01; // Starting at 1%
    
  //   // Calculate for 100 days with ROI increasing every 5 days
  //   for (let day = 1; day <= 100; day++) {
  //     // Increase ROI by 0.5% every 5 days
  //     if (day % 5 === 0) {
  //       currentROI += 0.005; // Add 0.5%
  //     }
      
  //     // Add daily earnings
  //     totalEarnings += balance * currentROI;
  //   }
    
  //   return totalEarnings;
  // };

  // // Add this state near your other state declarations
  // const [showWhitelistModal, setShowWhitelistModal] = useState(false);

  // // Add this handler
  // const handleWhitelistSuccess = () => {
  //   showSnackbar({
  //     message: 'Wallet Whitelisted',
  //     description: 'Your wallet has been successfully whitelisted'
  //   });
  //   // Refresh user data
  //   updateUserData({ id: user?.id });
  // };

  // Add state
  const [showWithdrawalInfo, setShowWithdrawalInfo] = useState(false);

  const [showRoiBreakdown, setShowRoiBreakdown] = useState<boolean>(false);

  // // Add these state variables near your other state declarations
  // const [taskVerifications, setTaskVerifications] = useState<Record<TaskType, { verified: boolean; loading: boolean; cooldown: boolean; joined: boolean }>>({
  //   telegram: { verified: false, loading: false, cooldown: false, joined: false },
  //   twitter: { verified: false, loading: false, cooldown: false, joined: false },
  //   referral: { verified: false, loading: false, cooldown: false, joined: false },
  //   telegram_channel: { verified: false, loading: false, cooldown: false, joined: false }
  // });

  // Add this type definition
  // type TaskType = 'telegram' | 'twitter' | 'referral' | 'telegram_channel';

  // // Then use it in your function
  // const verifyTask = async (taskType: TaskType) => {
  //   // Ensure the task exists in our state
  //   if (!taskVerifications[taskType]) {
  //     console.error(`Task type ${taskType} not found in taskVerifications`);
  //     return;
  //   }
    
  //   // Don't proceed if already verified or in loading state
  //   if (taskVerifications[taskType].verified || taskVerifications[taskType].loading) {
  //     return;
  //   }
    
  //   // Set loading state
  //   setTaskVerifications(prev => ({
  //     ...prev,
  //     [taskType]: { ...prev[taskType], loading: true }
  //   }));
    
  //   try {
  //     // Get reward amount based on task type
  //     const rewardAmount = 
  //       taskType === 'telegram' ? 25 : 
  //       taskType === 'twitter' ? 50 : 
  //       taskType === 'telegram_channel' ? 25 :
  //       250; // referral
      
  //     // For referral task, check if the user has any actual referrals
  //     if (taskType === 'referral') {
  //       // Check if user has at least one referral
  //       const { data, error } = await supabase
  //         .from('referrals')
  //         .select('count')
  //         .eq('referrer_id', user?.id)
  //         .single();
        
  //       if (error) throw error;
        
  //       // If no referrals yet, show a message but still mark as verified
  //       if (!data || data.count === 0) {
  //         showSnackbar({
  //           message: 'No Referrals Yet',
  //           description: 'Share your link to earn more STK tokens when friends join!'
  //         });
  //       }
  //     }
      
  //     // Update user's STK balance in the database
  //     if (user?.id) {
  //       const { error } = await supabase
  //         .from('users')
  //         .update({ 
  //           total_sbt: (user.total_sbt || 0) + rewardAmount 
  //         })
  //         .eq('id', user.id);
        
  //       if (error) throw error;
        
  //       // Update local user state with new STK balance
  //       if (user?.id) {
  //         updateUserData({ id: user.id });
  //       }
  //     }
      
  //     // Update local verification status
  //     setTaskVerifications(prev => {
  //       const newState = {
  //         ...prev,
  //         [taskType]: { ...prev[taskType], verified: true, loading: false }
  //       };
  //       if (user?.id) {
  //         localStorage.setItem(`task_status_${user.id}`, JSON.stringify(newState));
  //       }
  //       return newState;
  //     });
      
  //     // Show success message
  //     showSnackbar({
  //       message: 'Task Completed',
  //       description: `You earned ${rewardAmount} STK for this task!`
  //     });
  //   } catch (error) {
  //     console.error('Error verifying task:', error);
      
  //     // Reset loading state
  //     setTaskVerifications(prev => ({
  //       ...prev,
  //       [taskType]: { ...prev[taskType], loading: false }
  //     }));
      
  //     // Show error message
  //     showSnackbar({
  //       message: 'Verification Failed',
  //       description: 'Please try again later.'
  //     });
  //   }
  // };

  // Add this effect to load saved verification status
  // useEffect(() => {
  //   if (user?.id) {
  //     // Load saved verification status from localStorage
  //     const savedStatus = localStorage.getItem(`task_status_${user.id}`);
  //     if (savedStatus) {
  //       try {
  //         const parsed = JSON.parse(savedStatus);
  //         // Ensure all required properties exist
  //         const safeStatus = {
  //           telegram: { verified: false, loading: false, cooldown: false, joined: false, ...parsed.telegram },
  //           twitter: { verified: false, loading: false, cooldown: false, joined: false, ...parsed.twitter },
  //           referral: { verified: false, loading: false, cooldown: false, joined: false, ...parsed.referral },
  //           telegram_channel: { verified: false, loading: false, cooldown: false, joined: false, ...parsed.telegram_channel }
  //         };
  //         setTaskVerifications(safeStatus);
  //       } catch (e) {
  //         console.error('Error parsing saved task status:', e);
  //       }
  //     }
      
  //     // For now, let's just rely on localStorage and not query the database
  //     // This avoids the error with the missing table
  //   }
  // }, [user?.id]);

  // Update the join handlers
  // const handleJoinTelegram = () => {
  //   window.open('https://t.me/Tonstak3it', '_blank');
  //   setTaskVerifications(prev => {
  //     const newState = {
  //       ...prev,
  //       telegram: { ...prev.telegram, joined: true }
  //     };
  //     if (user?.id) {
  //       localStorage.setItem(`task_status_${user.id}`, JSON.stringify(newState));
  //     }
  //     return newState;
  //   });
  // };

  // const handleJoinTwitter = () => {
  //   window.open('https://x.com/tonstakeit', '_blank');
  //   setTaskVerifications(prev => {
  //     const newState = {
  //       ...prev,
  //       twitter: { ...prev.twitter, joined: true }
  //     };
  //     if (user?.id) {
  //       localStorage.setItem(`task_status_${user.id}`, JSON.stringify(newState));
  //     }
  //     return newState;
  //   });
  // };

  // const handleReferralAction = () => {
  //   if (user?.telegram_id) {
  //     const referralLink = `https://t.me/Tonstak3it_bot?start=${user.telegram_id}`;
  //     navigator.clipboard.writeText(referralLink);
      
  //     showSnackbar({
  //       message: 'Referral Link Copied',
  //       description: 'Share this link with your friends to earn STK tokens!'
  //     });
      
  //     setTaskVerifications(prev => {
  //       const newState = {
  //         ...prev,
  //         referral: { ...prev.referral, joined: true }
  //       };
  //       if (user?.id) {
  //         localStorage.setItem(`task_status_${user.id}`, JSON.stringify(newState));
  //       }
  //       return newState;
  //     });
  //   } else {
  //     showSnackbar({
  //       message: 'Telegram ID Not Found',
  //       description: 'Please connect your Telegram account first.'
  //     });
  //   }
  // };

  // Add a new handler for joining the Telegram channel
  // const handleJoinTelegramChannel = () => {
  //   window.open('https://t.me/tonstakeit', '_blank');
  //   setTaskVerifications(prev => {
  //     const newState = {
  //       ...prev,
  //       telegram_channel: { ...prev.telegram_channel || { verified: false, loading: false, cooldown: false }, joined: true }
  //     };
  //     if (user?.id) {
  //       localStorage.setItem(`task_status_${user.id}`, JSON.stringify(newState));
  //     }
  //     return newState;
  //   });
  // };

  // Add these state variables near your other state declarations
  // const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'info' | 'success' | 'warning' | 'error';
  }>>([
    {
      id: '1',
      title: 'Getting Started with TON Stake',
      message: 'To activate your account and start earning:\n\n1. Click the "Stake" button at the top of the screen\n2. Connect your TON wallet if not already connected\n3. Enter the amount you want to stake (minimum 10 TON recommended)\n4. Confirm the transaction in your wallet\n\nOnce staked, you\'ll start earning passive income immediately!',
      time: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      type: 'info'
    },
    {
      id: '2',
      title: 'Join Our Community',
      message: 'Connect with fellow TON Stake users in our community forum! Share strategies, get help, and stay updated on the latest developments. Your participation makes our community stronger.\n\nJoin our Telegram: https://t.me/tonstakeit',
      time: new Date(Date.now() - 86400000).toISOString(),
      read: false,
      type: 'success'
    },
    {
      id: '3',
      title: 'TON Fortune Stakers NFT Launch',
      message: 'Mint your TON Fortune Stakers NFT to join the whitelist for weekly TON distributions.',
      time: new Date(Date.now() - 86400000).toISOString(),
      read: false,
      type: 'warning'
    }
  ]);

  // Add this state variable near your other state declarations
  const [selectedNotification, setSelectedNotification] = useState<{
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'info' | 'success' | 'warning' | 'error';
  } | null>(null);

  // Add this effect to load notifications on component mount
  useEffect(() => {
    // Load saved notifications from localStorage
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        const parsedNotifications = JSON.parse(savedNotifications);
        setNotifications(parsedNotifications);
        console.log('Loaded notifications from localStorage:', parsedNotifications);
      } catch (e) {
        console.error('Error parsing saved notifications:', e);
      }
    }
  }, []);


  // Save notifications whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Add this function to handle marking a notification as read
  // const markNotificationAsRead = (notificationId: string) => {
  //   // Create updated notifications array with the specific notification marked as read
  //   const updatedNotifications = notifications.map(notification => 
  //     notification.id === notificationId ? {...notification, read: true} : notification
  //   );
    
  //   // Update state
  //   setNotifications(updatedNotifications);
    
  //   // Save to localStorage to persist the change
  //   localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  // };

  // Add this function to handle marking all notifications as read
  // const markAllNotificationsAsRead = () => {
  //   // Create updated notifications array with all items marked as read
  //   const updatedNotifications = notifications.map(notification => ({...notification, read: true}));
    
  //   // Update state
  //   setNotifications(updatedNotifications);
    
  //   // Save to localStorage to persist the change
  //   localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  // };

  // Add a state variable to track if the user has minted
  // const [userHasMinted, setUserHasMinted] = useState(false);

  // // Add these state variables for theme management
  // const [theme, setTheme] = useState<'light' | 'dark'>(() => {
  //   // Check for saved theme preference or use system preference
  //   const savedTheme = localStorage.getItem('theme');
  //   if (savedTheme === 'light' || savedTheme === 'dark') {
  //     return savedTheme;
  //   }
  //   // Check system preference
  //   return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  // });

  // // Add this effect to apply theme changes
  // useEffect(() => {
  //   // Apply theme to document element
  //   if (theme === 'dark') {
  //     document.documentElement.classList.add('dark');
  //   } else {
  //     document.documentElement.classList.remove('dark');
  //   }
  //   // Save preference to localStorage
  //   localStorage.setItem('theme', theme);
  // }, [theme]);

  // // Add this function to toggle theme
  // const toggleTheme = () => {
  //   setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  // };

  // const [activeSection, setActiveSection] = useState<'stake' | 'token'>('stake');

  // // Add shoutbox messages state
  // const [shoutboxMessages] = useState([
  //   "The lottery has begun – be sure to participate by purchasing tickets! 🎟️",
  //   "New mining hardware available in the store! ⚡",
  //   "Double mining rewards this weekend! 💎",
  //   "Join the mining pool for consistent rewards! 🌊"
  // ]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0A0A0F]">
        <div className="relative flex flex-col items-center">
          {/* Fan/Turbine Loading Animation */}
          <div className="relative w-16 h-16">
            {/* Center circle with glow effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-md animate-pulse"></div>
                <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            {/* Enhanced Fan blades with better gradients and effects */}
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute w-16 h-2 rounded-full"
                style={{
                  transform: `rotate(${i * 90}deg) translateY(-50%)`,
                  top: '50%',
                  left: '0',
                  transformOrigin: 'center',
                  animation: `fan-spin 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
                  background: `
                    linear-gradient(
                      90deg,
                      rgba(59,130,246,0.1) 0%,
                      rgba(59,130,246,0.8) 30%,
                      rgba(59,130,246,1) 50%,
                      rgba(59,130,246,0.8) 70%,
                      rgba(59,130,246,0.1) 100%
                    )
                  `,
                  boxShadow: `
                    0 0 8px rgba(59,130,246,0.3),
                    0 0 12px rgba(59,130,246,0.2),
                    inset 0 0 4px rgba(59,130,246,0.4)
                  `,
                  filter: 'blur(0.5px)',
                  opacity: 0.9
                }}
              />
            ))}
            
            {/* Secondary fan blades for depth effect */}
            {[...Array(4)].map((_, i) => (
              <div
                key={`secondary-${i}`}
                className="absolute w-12 h-1.5 rounded-full"
                style={{
                  transform: `rotate(${i * 90 + 45}deg) translateY(-50%)`,
                  top: '50%',
                  left: '0',
                  transformOrigin: 'center',
                  animation: `fan-spin 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite reverse`,
                  background: `
                    linear-gradient(
                      90deg,
                      rgba(59,130,246,0.05) 0%,
                      rgba(59,130,246,0.4) 50%,
                      rgba(59,130,246,0.05) 100%
                    )
                  `,
                  boxShadow: '0 0 4px rgba(59,130,246,0.2)',
                  filter: 'blur(0.5px)',
                  opacity: 0.6
                }}
              />
            ))}
            
            {/* Outer ring with gradient border */}
            <div className="absolute inset-0 rounded-full">
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/10 animate-ping"></div>
            </div>
            
            {/* Particle effects */}
            {[...Array(8)].map((_, i) => (
              <div
                key={`particle-${i}`}
                className="absolute w-1 h-1 bg-blue-400 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 45}deg) translateX(30px)`,
                  animation: `particle-pulse ${1 + i * 0.2}s ease-in-out infinite`
                }}
              />
            ))}
          </div>
          
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0F] text-white">
        <div className="text-center p-4">
          <p className="text-red-500">{error}</p>
          <p className="mt-2">Please open this app in Telegram</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative overflow-hidden font-mono">
         <div className="fixed inset-0 bg-black">
          {/* Retro scanline background */}
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '100% 3px'}} />
          {/* Neon orbs */}
          <div className="absolute top-8 left-1/5 w-72 h-72 bg-lime-400/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-16 right-1/4 w-80 h-80 bg-emerald-400/10 rounded-full blur-[96px]" />
          {/* Subtle grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:48px_48px] opacity-10" />
        </div>
      {!isLoading && user && showOnboarding && <OnboardingScreen />}
      {/* Main Content Area */}
      <div className="flex-1">
        {currentTab === 'home' && (
          <div className="flex-1 p-4 sm:p-6 space-y-2 overflow-y-auto">
            {/* Centered Retro Mining Card */}
            <div className="w-full flex items-center justify-center py-4">
              <div className="w-full max-w-sm">
                <MiningEarningsCard
                  tokenLabel={"STARFI"}
                  currentEarnings={earningState.currentEarnings}
                  fiatPrice={tonPrice}
                  onClaim={handleClaimToClaimedBalance}
                  isClaimDisabled={isWithdrawing}
                  hasBalance={!!user?.balance && user.balance > 0}
                  claimedBalance={claimedTonBalance}
                />
               
                      </div>
                    </div>
                    </div>
                  )}
        
        {/* {currentTab === 'mine' && (
  <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto">
  <MiningSection />
  </div>
        )} */}

        {currentTab === 'network' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <ReferralSystem 
            />
          </div>
        )}

        {currentTab === 'gmp' && (
          <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
            <GMPLeaderboard />
          </div>
        )}

        {currentTab === 'tasks' && (
        <>
        <div className="relative flex-1 p-custom space-y-4 overflow-y-auto">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <svg className="w-6 h-6 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-lg font-medium text-white">Get Whitelisted</h2>
      </div>
      <a 
                  href="https://getgems.io/tonstakeit" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-200 text-sm flex items-center gap-2"
                >
                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 14l-4-4 1.41-1.41L11 12.17l6.59-6.59L19 7l-8 8z"/>
                  </svg>
                  Whitelist
                </a>
    </div>

    <LotteryCard 
      price={100}
      title="Daily Lottery"
      description="Try your luck in our daily lottery draw"
      onPurchase={() => {
        // Handle purchase logic
        console.log('Lottery ticket purchased');
      }}
    />

<div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <svg className="w-6 h-6 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-lg font-medium text-white">Latest Updates</h2>
      </div>
      <a 
                  href="https://t.me/tonstakeit" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-200 text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.12.098.153.228.166.331.032.259.019.599-.077 1.466z"/>
                  </svg>
                  Open Forum
                </a>
    </div>

    <div className="space-y-4">
              {/* New Update Card - Season 1 Launch */}
              <div className="bg-gradient-to-br from-black to-purple-900/30 rounded-xl p-6 border border-purple-500/30 relative overflow-hidden">
                <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-purple-500/10 blur-2xl"></div>
                <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full bg-blue-500/10 blur-2xl"></div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a4 4 0 00-4-4H8.8a4 4 0 00-4 4v12h8zm0 0V5.5A2.5 2.5 0 0114.5 3h1A2.5 2.5 0 0118 5.5V8m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">STK Private Sale Price Officially Set — Backed by NFT Demand.</h3>
                    <p className="text-sm text-purple-300/80">June 7, 2025</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-white/90">🔥 173 NFTs Already Minted — Reveal Coming at 250!</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-white/90">💎 The TONers Foundation has officially determined the STK Private Sale Price based on on-chain performance and NFT value.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-white/90">🚀 TGE (Token Generation Event) will be officially announced soon.... secure your spot in TON staking history!</span>
                    </li>
                  </ul>

                  <div className="mt-6">
<a 
  href="https://getgems.io/collection/EQBpQbkNRhzCAalWxnFtU5z28rS_RCxBlEuC010bAjsh3TjU" 
  target="_blank" 
  rel="noopener noreferrer"
  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg inline-flex items-center gap-2 transition-all duration-200 shadow-lg shadow-purple-500/20"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
  EXPLORE MINTED NFTs
</a>
          </div>
                  
                  {/* <NFTMinter 
              onStatusChange={(status, hasMinted) => {
                // Update the parent component's state when minting status changes
                setUserHasMinted(hasMinted);
                console.log("NFT status:", status, "Has minted:", hasMinted);
              }}
              onMintSuccess={async () => {
                // Update state when mint is successful
                setUserHasMinted(true);
                console.log("Mint successful!");
              }}
            /> */}
                </div>
              </div>

             
              {/* Community Resources */}
              <div className="bg-gradient-to-br from-black to-purple-900/30 rounded-xl p-6 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">Community Resources</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a 
                    href="https://t.me/tonstakeit" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white/5 hover:bg-white/10 rounded-lg p-4 border border-white/10 transition-colors flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.12.098.153.228.166.331.032.259.019.599-.077 1.466z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Telegram Channel</h4>
                      <p className="text-sm text-white/60">Official announcements and updates</p>
                    </div>
                  </a>
                  
                  <a 
                    href="https://x.com/TonStakeit" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white/5 hover:bg-white/10 rounded-lg p-4 border border-white/10 transition-colors flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">X (Twitter)</h4>
                      <p className="text-sm text-white/60">Follow for the latest news</p>
                    </div>
                  </a>
                  
                  <a 
                    href="https://getgems.io/collection/EQBpQbkNRhzCAalWxnFtU5z28rS_RCxBlEuC010bAjsh3TjU" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white/5 hover:bg-white/10 rounded-lg p-4 border border-white/10 transition-colors flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a4 4 0 00-4-4H8.8a4 4 0 00-4 4v12h8zm0 0V5.5A2.5 2.5 0 0114.5 3h1A2.5 2.5 0 0118 5.5V8m-6 0h6" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">TONERS Community Pass</h4>
                      <p className="text-sm text-white/60">Get your TON Fortune Stakers NFT</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
   
  </div>
        </>
        )}

        {currentTab === 'token' && (
          <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
            <TonWallet/>
            {/* <TokenLaunchpad /> */}
          </div>
        )}

      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-black rounded-xl w-full max-w-md border border-blue-500/20 shadow-xl shadow-blue-500/10">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Deposit TON</h3>
                <button 
                  onClick={() => {
                    setShowDepositModal(false);
                    setDepositStatus('idle');
                    setCustomAmount(''); // Reset custom amount
                  }}
                  className="text-white/60 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {depositStatus === 'pending' ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-white font-medium">Verifying Transaction...</p>
                  <p className="text-sm text-white/60 mt-2">Please wait while we confirm your deposit</p>
                </div>
              ) : (
                <>
                  {/* Quick Select Text */}
                  <div className="text-sm text-white/60 mb-3">
                    Quick Select:
                  </div>

                  {/* Predefined Amounts */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {[1, 5, 10, 50, 100, 500].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => {
                          setCustomAmount(amount.toString());
                          handleDeposit(amount);
                        }}
                        className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {amount} TON
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount Section */}
                  <div className="relative mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-white/60">Or enter custom amount:</span>
                    </div>
                    
                    {/* Custom Amount Input with Deposit Button */}
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Enter amount"
                          min="1"
                          step="0.1"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="w-full px-4 py-3 bg-blue-900/10 border border-blue-500/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm">
                          TON
                        </div>
                      </div>
                      
                      {/* Deposit Button */}
                      <button
                        onClick={() => {
                          const amount = parseFloat(customAmount);
                          if (!isNaN(amount) && amount >= 1) {
                            handleDeposit(amount);
                          } else {
                            showSnackbar({
                              message: 'Invalid Amount',
                              description: 'Please enter an amount greater than or equal to 1 TON'
                            });
                          }
                        }}
                        disabled={!customAmount || parseFloat(customAmount) < 1}
                        className={`w-full py-3 rounded-lg font-medium transition-all duration-200 
                          ${!customAmount || parseFloat(customAmount) < 1
                            ? 'bg-blue-500/50 text-white/50 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25'
                          }`}
                      >
                        Deposit {customAmount ? `${customAmount} TON` : 'TON'}
                      </button>
                    </div>
                  </div>

                  {/* Info Section with Calculator */}
                  <div className="bg-blue-900/10 rounded-lg p-4 space-y-4 border border-blue-500/10">
                    {/* Basic Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Minimum deposit: 1 TON</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Lock period: 100 days</span>
                      </div>
                    </div>

                    {/* ROI Calculator */}
                    <div className="pt-3 border-t border-blue-500/10">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium text-white">Earnings Calculator</span>
                      </div>

                      {/* ROI Breakdown with Toggle */}
                      <div className="mb-3">
                        <button 
                          onClick={() => setShowRoiBreakdown(!showRoiBreakdown)}
                          className="flex items-center justify-between w-full bg-blue-500/5 rounded-lg p-2 mb-2 hover:bg-blue-500/10 transition-colors"
                        >
                          <span className="text-sm font-medium text-white">ROI Breakdown</span>
                          <svg 
                            className={`w-4 h-4 text-blue-400 transition-transform duration-200 ${showRoiBreakdown ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {showRoiBreakdown && (
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { days: '1-5', roi: '1.0%' },
                              { days: '6-10', roi: '1.5%' },
                              { days: '11-15', roi: '2.0%' },
                              { days: '16-20', roi: '2.5%' },
                              { days: '21-25', roi: '3.0%' },
                              { days: '26+', roi: '+0.5% per 5 days' }
                            ].map((period) => (
                              <div key={period.days} className="bg-blue-500/5 rounded-lg p-2">
                                <div className="text-xs text-white/40">Days {period.days}</div>
                                <div className="text-sm font-medium text-blue-400">{period.roi}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Calculator Results */}
                      {customAmount && parseFloat(customAmount) >= 1 && (
                        <div className="space-y-3">
                          <div className="bg-blue-500/5 rounded-lg p-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs text-white/40 mb-1">Daily Earnings (Start)</div>
                                <div className="text-sm font-medium text-white">
                                  {(parseFloat(customAmount) * 0.01).toFixed(4)} TON
                                </div>
                                <div className="text-xs text-white/40">
                                  ≈ ${((parseFloat(customAmount) * 0.01) * tonPrice).toFixed(2)}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-white/40 mb-1">Daily Earnings (Max)</div>
                                <div className="text-sm font-medium text-white">
                                  {(parseFloat(customAmount) * 0.11).toFixed(4)} TON
                                </div>
                                <div className="text-xs text-white/40">
                                  ≈ ${((parseFloat(customAmount) * 0.11) * tonPrice).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-blue-500/5 rounded-lg p-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs text-white/40 mb-1">Total Potential Earnings</div>
                                <div className="text-sm font-medium text-white">
                                  {calculateTotalEarnings(parseFloat(customAmount)).toFixed(4)} TON
                                </div>
                                <div className="text-xs text-white/40">
                                  ≈ ${(calculateTotalEarnings(parseFloat(customAmount)) * tonPrice).toFixed(2)}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-white/40 mb-1">Total Return</div>
                                <div className="text-sm font-medium text-blue-400">
                                  {(parseFloat(customAmount) + calculateTotalEarnings(parseFloat(customAmount))).toFixed(4)} TON
                                </div>
                                <div className="text-xs text-white/40">
                                  Initial + Earnings
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

{/* STK Buy Modal */}
      {showSTKBuyModal && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-gradient-to-br from-[#0A0A1A] to-[#0A0A1F] rounded-2xl border border-blue-500/30 shadow-xl w-full max-w-lg overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]"></div>
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-purple-500/20 blur-3xl"></div>
      
      {/* Modal Header */}
      <div className="relative p-4 border-b border-blue-500/30">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Buy STK Tokens</h3>
          <button 
            onClick={() => setShowSTKBuyModal(false)}
            className="text-white/60 hover:text-white/80 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal Content */}
      <div className="relative p-4">
        {/* Input Amount Section */}
        <div className="space-y-4">
          <div className="bg-black/40 rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Amount to Buy</span>
              <span className="text-sm text-white/60">Balance: {isLoadingBalance ? '...' : `${Number(walletBalance).toFixed(2)} TON`}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={stkAmount}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setStkAmount(value);
                  // Calculate TON cost (1 STK = 0.1 TON)
                  setTonCost(value * 0.1);
                }}
                placeholder="0.00"
                className="bg-transparent text-2xl font-medium text-white outline-none flex-1"
              />
              <span className="text-xl font-medium text-white/80">STK</span>
            </div>
          </div>

          {/* Cost Display */}
          <div className="bg-black/40 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Cost in TON</span>
              <span className="text-sm text-white/60">≈ ${(tonCost * tonPrice).toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-medium text-white">{tonCost.toFixed(2)}</span>
              <span className="text-xl font-medium text-white/80">TON</span>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[1000, 2500, 5000, 10000].map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setStkAmount(amount);
                  setTonCost(amount * 0.001);
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 transition-all duration-200"
              >
                {amount} STK
              </button>
            ))}
          </div>

          {/* Buy Button */}
          {/* <button
            onClick={handleBuySTK}
            disabled={isProcessing || tonCost <= 0 || tonCost > Number(walletBalance)}
            className={`w-full py-3 rounded-xl font-medium text-white relative overflow-hidden ${
              isProcessing || tonCost <= 0 || tonCost > Number(walletBalance)
                ? 'bg-gray-500/40 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Processing...
              </div>
            ) : tonCost <= 0 ? (
              'Enter amount'
            ) : tonCost > Number(walletBalance) ? (
              'Insufficient balance'
            ) : (
              `Buy ${stkAmount} STK for ${tonCost.toFixed(2)} TON`
            )}
          </button> */}
        </div>

        {/* Info Section */}
        <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-white/70">STK tokens are governance tokens that provide voting rights and special privileges in the TON Stakers ecosystem.</p>
              <p className="text-sm text-white/70 mt-2">1 STK = 0.1 TON</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
      )}

 {/* Withdrawal Info Modal */}
      <WithdrawalInfoModal
        isOpen={showWithdrawalInfo}
        onClose={() => setShowWithdrawalInfo(false)}
      />

         {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-blue-500/30 rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl animate-fade-in">
            <div className="p-4 border-b border-blue-500/20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedNotification.type === 'info' ? 'bg-blue-500/20' :
                  selectedNotification.type === 'success' ? 'bg-green-500/20' :
                  selectedNotification.type === 'warning' ? 'bg-yellow-500/20' : 'bg-red-500/20'
                }`}>
                  {selectedNotification.type === 'info' && (
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {selectedNotification.type === 'success' && (
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {selectedNotification.type === 'warning' && (
                    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  {selectedNotification.type === 'error' && (
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <h3 className="font-medium text-white">{selectedNotification.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedNotification(null)}
                className="text-white/60 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {/* Format message with line breaks and links */}
              <div className="text-white/80 space-y-3">
                {selectedNotification.message.split('\n').map((paragraph, index) => {
                  // Check if paragraph contains a URL
                  const urlRegex = /(https?:\/\/[^\s]+)/g;
                  const hasUrl = urlRegex.test(paragraph);
                  
                  if (hasUrl) {
                    // Split by URLs and create elements with clickable links
                    const parts = paragraph.split(urlRegex);
                    const matches = paragraph.match(urlRegex) || [];
                    
                    return (
                      <p key={index} className="leading-relaxed">
                        {parts.map((part, i) => {
                          // If this is an even-indexed part, it's text
                          if (i % 2 === 0) {
                            return part;
                          } 
                          // If this is an odd-indexed part, it's a URL
                          const url = matches[(i-1)/2];
                          return (
                            <a 
                              key={i} 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              {url}
                            </a>
                          );
                        })}
                      </p>
                    );
                  }
                  
                  return <p key={index} className="leading-relaxed">{paragraph}</p>;
                })}
              </div>
              
              <div className="mt-4 text-xs text-white/40 flex justify-between items-center">
                <span>
                  {new Date(selectedNotification.time).toLocaleString([], {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  </span>
                <span>Notification ID: {selectedNotification.id}</span>
              </div>
                </div>

            <div className="p-3 border-t border-blue-500/20 flex justify-end">
              {/* Add action buttons based on notification type */}
              {selectedNotification.type === 'info' && (
                <button 
                  onClick={() => setSelectedNotification(null)}
                  className="px-4 py-2 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-sm transition-colors"
                >
                  Got it
                </button>
              )}
              
              {selectedNotification.type === 'success' && (
                <button 
                  onClick={() => setSelectedNotification(null)}
                  className="px-4 py-2 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm transition-colors"
                >
                  Awesome
                </button>
              )}
              
              {selectedNotification.type === 'warning' && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedNotification(null)}
                    className="px-4 py-2 rounded-full bg-white/5 text-white/70 hover:bg-white/10 text-sm transition-colors"
                  >
                    Dismiss
                  </button>
                  <button 
                    onClick={() => {
                      // Handle warning action - for example, open a link
                      if (selectedNotification.id === '3') {
                        window.open('https://t.me/tonstakeit', '_blank');
                      }
                      setSelectedNotification(null);
                    }}
                    className="px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 text-sm transition-colors"
                  >
                    Learn More
                  </button>
                </div>
              )}
              
              {selectedNotification.type === 'error' && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedNotification(null)}
                    className="px-4 py-2 rounded-full bg-white/5 text-white/70 hover:bg-white/10 text-sm transition-colors"
                  >
                    Dismiss
                  </button>
                  <button 
                    onClick={() => {
                      // Handle error action
                      setSelectedNotification(null);
                    }}
                    className="px-4 py-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Offline Rewards Modal */}
      {showOfflineRewardsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/50">
          <div className="bg-black rounded-xl w-full max-w-md border border-lime-500/20">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Offline Rewards</h3>
                <button 
                  onClick={() => setShowOfflineRewardsModal(false)}
                  className="text-white/60 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <div className="text-sm text-lime/60 mb-1">Offline Rewards</div>
                  <div className="text-2xl font-bold text-lime-400">
                    +{offlineRewardsAmount.toFixed(8)} STARFI
                  </div>
                </div>

                <button
                  onClick={handleClaimOfflineRewards}
                  className="w-full py-3 rounded-lg bg-lime-500 hover:bg-green-600 text-white font-medium transition-all duration-200 shadow-lg shadow-green-500/25"
                >
                  Claim Your Rewards
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/70 border-t-2 border-lime-400/30 backdrop-blur-sm safe-area-pb">
        <div className="max-w-md mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 items-center py-2">
            {[
              { id: 'home', text: 'Mining', Icon: FaMagento, gradient: 'from-lime-400 to-emerald-400' },
              { id: 'token', text: 'Wallet', Icon: FaWallet, gradient: 'from-sky-400 to-blue-400' },
              // { id: 'task', text: 'Task', Icon: FaTasks, gradient: 'from-amber-400 to-orange-400' },
              // { id: 'whale', text: 'Settings', Icon: FaCogs, gradient: 'from-fuchsia-400 to-pink-400' },
            ].map(({ id, text, Icon }) => (
              <button 
                key={id} 
                onClick={() => setCurrentTab(id)}
                className={`group flex flex-col items-center w-full transition-all duration-300 relative ${
                  currentTab === id ? 'text-lime-300' : 'text-gray-500 hover:text-lime-300'
                }`}
              >
                {/* {currentTab === id && (
                  <div className={`absolute inset-x-4 -top-1 h-1 bg-gradient-to-r ${gradient} rounded-full shadow-[0_0_12px_rgba(163,230,53,0.35)]`}></div>
                )} */}
                <div className={`relative p-2.5 rounded-2xl border transition-all duration-300 ${
                  currentTab === id
                    ? 'border-lime-400/40 bg-black/50 shadow-[0_0_16px_rgba(163,230,53,0.25)] scale-105'
                    : 'border-white/10 bg-black/30 group-hover:border-lime-400/30 group-hover:scale-105'
                }`}>
                  <Icon size={22} className="transition-all duration-300" />
                {currentTab === id && (
                    <div className="absolute inset-0 rounded-2xl pointer-events-none">
                      <div className="absolute inset-0 rounded-2xl border border-lime-400/30 animate-pulse opacity-30"></div>
                    </div>
                  )}
                </div>
                <span className={`mt-1 text-[10px] font-semibold tracking-wider transition-all duration-300 ${
                  currentTab === id ? 'text-lime-300' : 'text-gray-500 group-hover:text-lime-300'
                }`}>
                  {text}
                  </span>
              </button>
            ))}
          </div>
        </div>
      </div>


        {/* Add Snackbar component before closing div */}
        {isSnackbarVisible && (
          <Snackbar
            onClose={() => {
              setSnackbarVisible(false);
              if (snackbarTimeoutRef.current) {
                clearTimeout(snackbarTimeoutRef.current);
              }
            }}
            duration={SNACKBAR_DURATION}
            description={snackbarDescription}
            after={
              <Button 
                size="s" 
                onClick={() => {
                  setSnackbarVisible(false);
                  if (snackbarTimeoutRef.current) {
                    clearTimeout(snackbarTimeoutRef.current);
                  }
                }}
              >
                Close
              </Button>
            }
            className="snackbar-top"
          >
            {snackbarMessage}
          </Snackbar>
        )}
      </div>
  );
};

  // // Update the ReStakeCountdown component
  // const ReStakeCountdown: FC<{ depositDate: string | Date }> = ({ depositDate }) => {
  //   const [timeLeft, setTimeLeft] = useState(() => {
  //     const start = new Date(depositDate);
  //     const now = new Date();
  //     const totalDays = 100;
  //     const daysElapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  //     const daysLeft = Math.max(0, totalDays - daysElapsed);
  //     return daysLeft;
  //   });
  
  //   useEffect(() => {
  //     // Update daily
  //     const timer = setInterval(() => {
  //       const start = new Date(depositDate);
  //       const now = new Date();
  //       const totalDays = 100;
  //       const daysElapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  //       const daysLeft = Math.max(0, totalDays - daysElapsed);
  //       setTimeLeft(daysLeft);
  //     }, 86400000); // Update every 24 hours
  
  //     return () => clearInterval(timer);
  //   }, [depositDate]);
  
  //   // If fully unlocked
  //   if (timeLeft === 0) {
  //     return (
  //       <div className="flex items-center gap-1">
  //         <span className="w-1 h-1 rounded-full bg-green-400"></span>
  //         <span className="text-[10px] text-green-400">Unlocked</span>
  //       </div>
  //     );
  //   }
  
  //   // If still locked
  //   return (
  //     <div className="flex items-center gap-1">
  //       <span className="w-1 h-1 rounded-full bg-yellow-400"></span>
  //       <span className="text-[10px] text-yellow-400">
  //         Locked: {timeLeft}d
  //       </span>
  //     </div>
  //   );
  // };

const calculateTotalEarnings = (amount: number): number => {
  let totalEarnings = 0;
  let currentROI = 0.1; // Start at 10%
  
  // Calculate earnings for each day up to 100 days
  for (let day = 1; day <= 100; day++) {
    // Update ROI every 5 days
    if (day > 1 && day % 5 === 1) {
      currentROI = Math.min(currentROI + 0.005, 0.11); // Increase by 0.5%, max 11%
    }
    
    // Add daily earnings
    totalEarnings += amount * currentROI;
  }
  
  return totalEarnings;
};

// // Define level thresholds and names
// const LEVEL_TIERS = [
//   { threshold: 0, name: 'Novice', color: 'text-gray-400' },
//   { threshold: 100, name: 'Bronze', color: 'text-amber-600' },
//   { threshold: 500, name: 'Silver', color: 'text-gray-300' },
//   { threshold: 1000, name: 'Gold', color: 'text-yellow-400' },
//   { threshold: 2500, name: 'Platinum', color: 'text-cyan-300' },
//   { threshold: 5000, name: 'Diamond', color: 'text-blue-300' },
//   { threshold: 10000, name: 'Master', color: 'text-purple-400' },
//   { threshold: 25000, name: 'Elite', color: 'text-red-400' },
// ] as const;

// // Helper function to get user level info
// const getUserLevel = (stkBalance: number) => {
//   const currentTier = [...LEVEL_TIERS]
//     .reverse()
//     .find(tier => stkBalance >= tier.threshold);
    
//   const currentIndex = LEVEL_TIERS.indexOf(currentTier!);
//   const nextTier = LEVEL_TIERS[currentIndex + 1];
  
//   const progress = nextTier 
//     ? ((stkBalance - currentTier!.threshold) / (nextTier.threshold - currentTier!.threshold)) * 100
//     : 100;

//   return {
//     ...currentTier!,
//     progress,
//     nextTier,
//     stkNeeded: nextTier ? nextTier.threshold - stkBalance : 0
//   };
// };
