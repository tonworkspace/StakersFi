// import { useTonConnectUI } from '@tonconnect/ui-react';
// import { toUserFriendlyAddress } from '@tonconnect/sdk';
// import { FC, useState, useEffect, useRef } from 'react';
// import { FaCoins, FaUsers, FaTelegram, FaYoutube, FaFacebook, FaTwitter, FaWallet, FaExclamationTriangle } from 'react-icons/fa';
// import { BiNetworkChart } from 'react-icons/bi';
// import { RiMessage3Line } from 'react-icons/ri';
// import { AiOutlineHome } from 'react-icons/ai';
// import { TonConnectButton, } from '@tonconnect/ui-react';
// import { useAuth } from '@/hooks/useAuth';
// import { supabase } from '@/lib/supabaseClient';
// import { RANK_REQUIREMENTS } from '@/lib/supabaseClient';
// import { getTONPrice } from '@/lib/api';
// import GMPLeaderboard from '@/components/GMPLeaderboard';
// import { OnboardingScreen } from './OnboardingScreen';
// import { formatUSD } from '@/lib/supabaseClient';
// import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
// import { toNano, fromNano } from "ton";
// import TonWeb from 'tonweb';
// import { Button } from '@telegram-apps/telegram-ui';
// import { Snackbar } from '@telegram-apps/telegram-ui';
// import { processEarnings } from '@/lib/supabaseClient';
// import ReferralSystem from '@/components/ReferralSystem';
// import { TokenLaunchpad } from '@/components/TokenLaunchpad';


// interface StatsCardProps {
//   title: string;
//   value: string | number;
//   subValue?: string;
//   icon: JSX.Element;
//   bgColor: string;
//   className?: string;
// }

// const StatsCard: FC<StatsCardProps> = ({ title, value, subValue, icon, bgColor, className }) => (
//   <div className={`bg-[#1A1B1E] rounded-lg p-3 border border-white/5 ${className}`}>
//     <div className="flex items-center gap-3">
//       <div className={`${bgColor} p-2 rounded-lg flex-shrink-0`}>
//         {icon}
//       </div>
//       <div className="min-w-0">
//         <p className="text-xs text-white/60">{title}</p>
//         <p className="text-sm font-semibold text-white mt-0.5 truncate">{value}</p>
//         {subValue && <p className="text-[10px] text-white/40">{subValue}</p>}
//       </div>
//     </div>
//   </div>
// );

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

// const CountdownTimer: FC = () => {
//   const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let intervalId: NodeJS.Timeout;

//     const fetchServerTime = async () => {
//       try {
//         // Get server timestamp using now() and target date from Supabase
//         const { data, error } = await supabase
//           .rpc('get_server_time_and_target')
//           .single<ServerTimeResponse>();

//         if (error) throw error;

//         const serverTime = new Date(data.server_time).getTime();
//         const targetDate = new Date(data.target_date).getTime();
//         const localOffset = Date.now() - serverTime;

//         // Update countdown every second, accounting for local time offset
//         intervalId = setInterval(() => {
//           const now = Date.now() - localOffset;
//           const distance = targetDate - now;

//           if (distance <= 0) {
//             clearInterval(intervalId);
//             setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//             return;
//           }

//           setTimeLeft({
//             days: Math.floor(distance / (1000 * 60 * 60 * 24)),
//             hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
//             minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
//             seconds: Math.floor((distance % (1000 * 60)) / 1000)
//           });
//         }, 1000);

//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching server time:', error);
//         setLoading(false);
//       }
//     };

//     fetchServerTime();

//     return () => {
//       if (intervalId) clearInterval(intervalId);
//     };
//   }, []);

//   if (loading) {
//     return (
//       <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-white/5 mb-6">
//         <div className="flex items-center justify-center h-[100px]">
//           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-3 sm:p-4 border border-white/5 mb-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div className="text-center sm:text-left">
//           <div className="flex items-center gap-2 text-yellow-400 mb-2">
//             <FaExclamationTriangle className="w-5 h-5 animate-pulse" />
//             <h3 className="text-base sm:text-lg font-semibold text-center">Scheduled Maintenance Alert</h3>
//           </div>
          
//           {/* Additional Info Section */}
//           <div className="mt-3 text-xs text-white/60 max-w-md space-y-2 bg-black/20 p-3 rounded-lg border border-yellow-400/20">
//             <p className="leading-relaxed">
//               To ensure optimal performance and security of the TON Staking Protocol, we will be conducting essential system maintenance.
//             </p>
//             <div className="border-t border-yellow-400/10 pt-2 mt-2">
//               <p className="font-medium text-yellow-400/80 mb-1">During maintenance:</p>
//               <ul className="space-y-1 list-disc list-inside text-white/60">
//                 <li>Deposits will be temporarily paused</li>
//                 <li>Withdrawals will be temporarily disabled</li>
//                 <li>Staking rewards will continue to accumulate</li>
//               </ul>
//             </div>
//             <p className="text-xs text-white/40 mt-2">
//               Estimated duration: 3 days. We appreciate your patience.
//             </p>
//           </div>

//         </div>
        
//         <div className="grid grid-cols-4 gap-2 sm:gap-3 hidden">
//           {[
//             { label: 'D', value: timeLeft.days },
//             { label: 'H', value: timeLeft.hours },
//             { label: 'M', value: timeLeft.minutes },
//             { label: 'S', value: timeLeft.seconds }
//           ].map((unit) => (
//             <div key={unit.label} className="text-center">
//               <div className="bg-white/5 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
//                 <span className="text-lg sm:text-2xl font-bold text-blue-400 tabular-nums">
//                   {String(unit.value).padStart(2, '0')}
//                 </span>
//               </div>
//               <span className="text-[10px] sm:text-xs text-white/40 mt-0.5 block">
//                 {unit.label}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// interface ServerTimeResponse {
//   server_time: string;
//   target_date: string;
// }

// // Add these constants for both networks
// const MAINNET_DEPOSIT_ADDRESS = 'UQAB-NIadqfsk3tsKy2L6rc0bLWY8zXeMWi5w5yM9RgaDgVo';
// const TESTNET_DEPOSIT_ADDRESS = '0QAZlU7pjDmpvg3PI7GIhRipA3AHfdSrzetnfIfM1djch1Gn';

// const isMainnet = true; // You can toggle this for testing

// // Use the appropriate address based on network
// const DEPOSIT_ADDRESS = isMainnet ? MAINNET_DEPOSIT_ADDRESS : TESTNET_DEPOSIT_ADDRESS;

// // Constants for both networks
// const MAINNET_API_KEY = '509fc324e5a26df719b2e637cad9f34fd7c3576455b707522ce8319d8b450441';
// const TESTNET_API_KEY = 'bb31868e5cf6529efb16bcf547beb3c534a28d1e139bd63356fd936c168fe662';

// // Use toncenter.com as HTTP API endpoint to interact with TON blockchain
// const tonweb = isMainnet ?
//     new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', {apiKey: MAINNET_API_KEY})) :
//     new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC', {apiKey: TESTNET_API_KEY}));



// // Add this near the top with other constants
// const NETWORK_NAME = isMainnet ? 'Mainnet' : 'Testnet';

// // Helper function to generate unique ID
// const generateUniqueId = async () => {
//   let attempts = 0;
//   const maxAttempts = 5;
  
//   while (attempts < maxAttempts) {
//     // Generate a random ID between 1 and 999999
//     const id = Math.floor(Math.random() * 999999) + 1;
    
//     // Check if ID exists
//     const { error } = await supabase
//       .from('deposits')
//       .select('id')
//       .eq('id', id)
//       .single();
      
//     if (error && error.code === 'PGRST116') {  // No rows returned
//       return id;  // Return as number, not string
//     }
    
//     attempts++;
//   }
  
//   throw new Error('Could not generate unique deposit ID');
// };

// // Add these types and interfaces near other interfaces
// interface SnackbarConfig {
//   message: string;
//   description?: string;
//   duration?: number;
// }

// // Add these constants near other constants
// const SNACKBAR_DURATION = 5000; // 5 seconds

// export const IndexPage: FC = () => {

//   const [currentTab, setCurrentTab] = useState('home');
//   const [showDepositModal, setShowDepositModal] = useState(false);
//   const { user, isLoading, error, updateUserData } = useAuth();
//   // const userAddress = useTonAddress();
//   const [userFriendlyAddress, setUserFriendlyAddress] = useState<string | null>(null);
//   const tonConnectUI = useTonConnectUI();

//   useEffect(() => {
//     const [tonConnect] = tonConnectUI;
//     if (tonConnect.account) {
//       const rawAddress = tonConnect.account.address;
//       const friendlyAddress = toUserFriendlyAddress(rawAddress);
//       setUserFriendlyAddress(friendlyAddress);
//     }
//   }, [tonConnectUI]);

//   const [currentEarnings, setCurrentEarnings] = useState(0);
//   const [perSecondRate, setPerSecondRate] = useState(0);
//   const [stakingProgress, setStakingProgress] = useState(0);
//   const [isWithdrawing, setIsWithdrawing] = useState(false);
//   const [activeCard, setActiveCard] = useState<CardType>('stats');
//   const [currentROI, setCurrentROI] = useState<number>(0.01); // 1% daily default
//   const [tonPrice, setTonPrice] = useState<number>(2.5);
//   const [, setLastPayout] = useState<string | null>(null);
//   const [showOnboarding, setShowOnboarding] = useState(false);

//   // Add state for activities
//   const [activities, setActivities] = useState<Activity[]>([]);
//   const [isLoadingActivities, setIsLoadingActivities] = useState(false);

//   const [depositStatus, setDepositStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

//   // Add these state variables near the top with other state declarations
//   const [walletBalance, setWalletBalance] = useState<string>('0');
//   const [isLoadingBalance, setIsLoadingBalance] = useState(true);

//   // Add these state variables
//   const [isSnackbarVisible, setSnackbarVisible] = useState(false);
//   const [snackbarMessage, setSnackbarMessage] = useState('');
//   const [snackbarDescription, setSnackbarDescription] = useState('');
//   const snackbarTimeoutRef = useRef<NodeJS.Timeout>();

//   // Add this state for custom amount
//   const [customAmount, setCustomAmount] = useState<string>('');

//   // Add this utility function
//   const showSnackbar = ({ message, description = '', duration = SNACKBAR_DURATION }: SnackbarConfig) => {
//     if (snackbarTimeoutRef.current) {
//       clearTimeout(snackbarTimeoutRef.current);
//     }

//     setSnackbarMessage(message);
//     setSnackbarDescription(description);
//     setSnackbarVisible(true);

//     snackbarTimeoutRef.current = setTimeout(() => {
//       setSnackbarVisible(false);
//     }, duration);
//   };

//   // Add this effect to fetch and update the wallet balance
//   useEffect(() => {
//     const fetchWalletBalance = async () => {
//       const [tonConnect] = tonConnectUI;
//       if (!tonConnect.account) {
//         setWalletBalance('0');
//         setIsLoadingBalance(false);
//         return;
//       }

//       try {
//         const balance = await tonweb.getBalance(tonConnect.account.address);
//         const balanceInTON = fromNano(balance);
//         setWalletBalance(balanceInTON);
//       } catch (error) {
//         console.error('Error fetching wallet balance:', error);
//         setWalletBalance('0');
//       } finally {
//         setIsLoadingBalance(false);
//       }
//     };

//     fetchWalletBalance();
//     // Update balance every 30 seconds
//     const intervalId = setInterval(fetchWalletBalance, 30000);

//     return () => clearInterval(intervalId);
//   }, [tonConnectUI]);

//   // Add this cleanup function
//   const cleanupMultipleStakes = async (userId: number) => {
//     try {
//       const { data: activeStakes, error } = await supabase
//         .from('stakes')
//         .select('*')
//         .eq('user_id', userId)
//         .eq('is_active', true)
//         .order('amount', { ascending: false });

//       if (error) throw error;

//       if (activeStakes && activeStakes.length > 1) {
//         console.log(`Found ${activeStakes.length} active stakes, cleaning up...`);

//         // Keep the stake with highest amount, deactivate others
//         const [highestStake, ...otherStakes] = activeStakes;

//         // Deactivate all other stakes
//         const { error: updateError } = await supabase
//           .from('stakes')
//           .update({ is_active: false })
//           .in('id', otherStakes.map(stake => stake.id));

//         if (updateError) throw updateError;

//         return highestStake;
//       }

//       return activeStakes?.[0] || null;
//     } catch (error) {
//       console.error('Error cleaning up stakes:', error);
//       return null;
//     }
//   };

// // Updated handleDeposit function
// const handleDeposit = async (amount: number) => {
//   try {
//     if (amount < 1) {
//       showSnackbar({ 
//         message: 'Invalid Amount', 
//         description: 'Minimum deposit amount is 1 TON' 
//       });
//       return;
//     }
//     if (!user?.id || !userFriendlyAddress) {
//       showSnackbar({ 
//         message: 'Wallet Not Connected', 
//         description: 'Please connect your wallet first' 
//       });
//       return;
//     }

//     setDepositStatus('pending');
//     const amountInNano = toNano(amount.toString());
    
//     // Generate unique ID with collision checking
//     const depositId = await generateUniqueId();
    
//     // Record pending deposit
//     const { error: pendingError } = await supabase
//       .from('deposits')
//       .insert([{
//         id: depositId,
//         user_id: user.id,
//         amount: amount,
//         amount_nano: amountInNano.toString(),
//         status: 'pending',
//         created_at: new Date().toISOString()
//       }]);

//     if (pendingError) throw pendingError;

//     // Send transaction
//     const transaction = {
//       validUntil: Math.floor(Date.now() / 1000) + 60 * 20,
//       messages: [
//         {
//           address: DEPOSIT_ADDRESS,
//           amount: amountInNano.toString(),
//         },
//       ],
//     };

//     const [tonConnect] = tonConnectUI;
//     const result = await tonConnect.sendTransaction(transaction);

//     if (result) {
//       // Mark deposit as successful immediately after user confirms transaction
//       const { error: updateError } = await supabase
//         .from('deposits')
//         .update({ 
//           status: 'confirmed',
//           tx_hash: result.boc
//         })
//         .eq('id', depositId);

//       if (updateError) throw updateError;

//       // Update user balance
//       const { error: balanceError } = await supabase.rpc('process_deposit_v2', {
//         p_user_id: user.id,
//         p_amount: amount,
//         p_deposit_id: depositId
//       });

//       if (balanceError) throw balanceError;

//       setDepositStatus('success');
//       showSnackbar({ 
//         message: 'Deposit Successful', 
//         description: `Successfully deposited ${amount} TON` 
//       });
//       setShowDepositModal(false);
      
//       // Add this line to refresh the page
//       window.location.reload();
//     }
//   } catch (error) {
//     console.error('Deposit failed:', error);
//     setDepositStatus('error');
//     showSnackbar({ 
//       message: 'Deposit Failed', 
//       description: 'Please try again later' 
//     });
//   }
// };

//   // Update the deposit button text based on status
//   const getDepositButtonText = () => {
//     if (user?.balance && user.balance > 0) {
//       return (
//         <div className="flex items-center gap-1.5">
//           <svg className="w-3.5 h-3.5 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//           </svg>
//           <span className="relative">Top Up</span>
//         </div>
//       );
//     }
    
//     return (
//       <div className="flex items-center gap-1.5">
//         <svg className="w-3.5 h-3.5 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//         </svg>
//         <span className="relative">Deposit</span>
//       </div>
//     );
//   };

//   // Update the useEffect for stake data
//   useEffect(() => {
//     if (!user?.id) return;

//     const fetchStakeData = async () => {
//       try {
//         // First, cleanup any multiple active stakes
//         const activeStake = await cleanupMultipleStakes(user.id);

//         if (!activeStake) {
//           setCurrentEarnings(0);
//           setPerSecondRate(0);
//           setStakingProgress(0);
//           setCurrentROI(0.01); // Reset to default
//           setLastPayout(null);  // Now this will work
//           return;
//         }

//         // Get the daily ROI rate from the active stake
//         const dailyRateDecimal = activeStake.daily_rate;
//         setCurrentROI(dailyRateDecimal);

//         // Calculate time-based progress
//         const startDate = new Date(activeStake.start_date).getTime();
//         const endDate = new Date(activeStake.end_date).getTime();
//         const now = Date.now();

//         // Calculate progress percentage
//         const totalDuration = endDate - startDate;
//         const elapsed = now - startDate;
//         const progress = Math.min((elapsed / totalDuration) * 100, 100);

//         setStakingProgress(progress);

//         // Calculate accumulated earnings since last payout
//         const lastPayoutTime = new Date(activeStake.last_payout).getTime();
//         const elapsedSeconds = (now - lastPayoutTime) / 1000;

//         // Calculate daily earnings based on current ROI
//         const dailyEarnings = activeStake.amount * dailyRateDecimal;
//         const newPerSecondRate = dailyEarnings / 86400;

//         // Calculate accumulated earnings
//         const accumulatedEarnings = newPerSecondRate * elapsedSeconds;

//         setCurrentEarnings(accumulatedEarnings);
//         setPerSecondRate(newPerSecondRate);

//       } catch (error) {
//         console.error('Error fetching stake data:', error);
//         setCurrentEarnings(0);
//         setPerSecondRate(0);
//         setStakingProgress(0);
//         setCurrentROI(0.01); // Reset to default on error
//       }
//     };

//     fetchStakeData();

//     // Update data every minute
//     const updateInterval = setInterval(fetchStakeData, 60000);

//     return () => {
//       clearInterval(updateInterval);
//     };
//   }, [user?.id]);

//   // Add a helper function to calculate APY from daily rate
//   const calculateAPY = (dailyRate: number): number => {
//     return (Math.pow(1 + dailyRate, 365) - 1) * 100;
//   };

//   // Add this function to format earnings display
//   const formatEarnings = (amount: number): string => {
//     if (amount >= 1) {
//       return amount.toFixed(2);
//     } else {
//       return amount.toFixed(8);
//     }
//   };

//   // Update the earnings display in your JSX
//   const renderEarningsSection = () => (
//     <div className="mt-2 flex items-center gap-2">
//       <div className="flex items-center gap-1.5">
//         <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
//         <span className="text-xs text-green-500">+{formatEarnings(perSecondRate)} TON/sec</span>
//       </div>
//       <span className="text-xs text-white/40">
//         ({(perSecondRate * 86400).toFixed(2)} TON/day)
//       </span>
//     </div>
//   );

//   // Handle withdrawal
//   const handleWithdraw = async () => {
//     if (!user?.id || currentEarnings < 1) {
//       showSnackbar({ 
//         message: 'Invalid Amount', 
//         description: 'Minimum withdrawal amount is 1 TON' 
//       });
//       return;
//     }


//     try {
//       setIsWithdrawing(true);

//       const totalAmount = currentEarnings;
//       const toWallet = totalAmount * 0.6;
//       const toRedeposit = totalAmount * 0.2;
//       const toSBT = totalAmount * 0.1;

//       // Record withdrawal activity
//       const { error: withdrawalActivityError } = await supabase
//         .from('activities')
//         .insert([{
//           user_id: user.id,
//           type: 'withdrawal' as ActivityType,
//           amount: toWallet,
//           status: 'completed',
//           created_at: new Date().toISOString()
//         }]);

//       if (withdrawalActivityError) throw withdrawalActivityError;

//       // Record redeposit activity
//       const { error: redepositActivityError } = await supabase
//         .from('activities')
//         .insert([{
//           user_id: user.id,
//           type: 'redeposit' as ActivityType,
//           amount: toRedeposit,
//           status: 'completed',
//           created_at: new Date().toISOString()
//         }]);

//       if (redepositActivityError) throw redepositActivityError;

//       // Create new stake for redeposit amount
//       const newStake = {
//         user_id: user.id,
//         amount: toRedeposit,
//         start_date: new Date().toISOString(),
//         daily_rate: 0.01,
//         total_earned: 0,
//         is_active: true,
//         last_payout: new Date().toISOString(),
//         end_date: new Date(Date.now() + (100 * 24 * 60 * 60 * 1000)).toISOString()
//       };

//       // Insert new stake and record stake activity
//       const { data: stakeData, error: stakeError } = await supabase
//         .from('stakes')
//         .insert([newStake])
//         .select()
//         .single();

//       if (stakeError) throw stakeError;

//       if (stakeData) {
//         const { error: stakeActivityError } = await supabase
//           .from('activities')
//           .insert([{
//             user_id: user.id,
//             type: 'stake' as ActivityType,
//             amount: toRedeposit,
//             status: 'completed',
//             created_at: new Date().toISOString()
//           }]);

//         if (stakeActivityError) throw stakeActivityError;
//       }

//       // Update user data
//       await updateUserData({
//         balance: (user.balance ?? 0) + toRedeposit,
//         total_withdrawn: (user.total_withdrawn ?? 0) + toWallet,
//         total_sbt: (user.total_sbt ?? 0) + toSBT,
//         total_deposit: (user.total_deposit ?? 0) - toRedeposit
//       });

//       // Reset current earnings
//       setCurrentEarnings(0);

//       showSnackbar({ 
//         message: 'Withdrawal Successful',
//         description: `${toWallet.toFixed(2)} TON to wallet\n${toRedeposit.toFixed(2)} TON redeposited\n${toSBT.toFixed(2)} TON to STK`
//       });

//     } catch (error) {
//       console.error('Withdrawal failed:', error);
//       showSnackbar({ 
//         message: 'Withdrawal Failed', 
//         description: 'Please try again later' 
//       });
//     } finally {
//       setIsWithdrawing(false);
//     }
//   };

//   // Add effect to fetch and subscribe to activities
//   useEffect(() => {
//     const fetchActivities = async () => {
//       if (!user?.id) return;

//       setIsLoadingActivities(true);
//       try {
//         const { data, error } = await supabase
//           .from('activities')
//           .select('*')
//           .eq('user_id', user.id)
//           .order('created_at', { ascending: false })
//           .limit(10);

//         if (error) throw error;
//         setActivities(data || []);
//       } catch (error) {
//         console.error('Error fetching activities:', error);
//       } finally {
//         setIsLoadingActivities(false);
//       }
//     };

//     // Only fetch if activities tab is active
//     if (activeCard === 'activity') {
//       fetchActivities();

//       // Set up real-time subscription
//       const subscription = supabase
//         .channel('activities-channel')
//         .on(
//           'postgres_changes',
//           {
//             event: '*',
//             schema: 'public',
//             table: 'activities',
//             filter: `user_id=eq.${user?.id}`
//           },
//           (payload) => {
//             // Handle different types of changes
//             if (payload.eventType === 'INSERT') {
//               setActivities(prev => [payload.new as Activity, ...prev].slice(0, 10));
//             } else if (payload.eventType === 'UPDATE') {
//               setActivities(prev => 
//                 prev.map(activity => 
//                   activity.id === payload.new.id ? payload.new as Activity : activity
//                 )
//               );
//             } else if (payload.eventType === 'DELETE') {
//               setActivities(prev => 
//                 prev.filter(activity => activity.id !== payload.old.id)
//               );
//             }
//           }
//         )
//         .subscribe();

//         // Cleanup subscription
//         return () => {
//           supabase.removeChannel(subscription);
//         };
//       }
//     }, [user?.id, activeCard]);

//   // Helper function to format date
//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return new Intl.DateTimeFormat('en-US', {
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     }).format(date);
//   };

//   // Update the activity card content to show more details
//   const renderActivityCard = () => (
//     <div className="bg-[#1A1B1E] rounded-xl p-4 border border-white/5">
//       <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>

//       {isLoadingActivities ? (
//         <div className="flex items-center justify-center py-8">
//           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       ) : activities.length === 0 ? (
//         <div className="text-center py-8">
//           <p className="text-white/40">No activities yet</p>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {activities.map((activity) => (
//             <div 
//               key={activity.id}
//               className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
//             >
//               <div className="flex items-center gap-3">
//                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                   activity.type === 'deposit' ? 'bg-blue-500/20' :
//                   activity.type === 'withdrawal' ? 'bg-green-500/20' :
//                   activity.type === 'stake' ? 'bg-purple-500/20' :
//                   'bg-yellow-500/20'
//                 }`}>
//                   {getActivityIcon(activity.type)}
//                 </div>
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <p className="text-sm font-medium text-white">
//                       {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
//                     </p>
//                     <span className={`text-xs px-2 py-0.5 rounded-full ${
//                       activity.status === 'completed' ? 'bg-green-500/20 text-green-400' :
//                       activity.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
//                       'bg-red-500/20 text-red-400'
//                     }`}>
//                       {activity.status}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2 mt-0.5">
//                     <p className="text-sm text-white/60">
//                       {activity.amount.toFixed(2)} TON
//                     </p>
//                     <span className="text-xs text-white/40">
//                       • {formatDate(activity.created_at)}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );

//   // Activity card content
//   const getActivityIcon = (type: Activity['type']) => {
//     switch (type) {
//       case 'deposit':
//         return <FaCoins className="w-4 h-4 text-blue-400" />;
//       case 'withdrawal':
//         return <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//         </svg>;
//       case 'stake':
//         return <BiNetworkChart className="w-4 h-4 text-purple-400" />;
//       case 'redeposit':
//         return <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//         </svg>;
//       default:
//         return null;
//     }
//   };

//   // Add useEffect to fetch price
//   useEffect(() => {
//     const fetchPrice = async () => {
//       const price = await getTONPrice();
//       setTonPrice(price);
//     };

//     fetchPrice();

//     // Update price every 60 seconds
//     const interval = setInterval(fetchPrice, 60000);

//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     if (user && !isLoading) {
//       const hasSeenOnboarding = localStorage.getItem(`onboarding_${user.telegram_id}`);
//       const isNewUser = user.total_deposit === 0;

//       if (!hasSeenOnboarding || isNewUser) {
//         setShowOnboarding(true);
//         const timer = setTimeout(() => {
//           setShowOnboarding(false);
//           localStorage.setItem(`onboarding_${user.telegram_id}`, 'true');
//         }, 14000); // 2s loading + (4 steps × 3s)
//         return () => clearTimeout(timer);
//       }
//     }
//   }, [user, isLoading]);

//   const [currentRankIndex, setCurrentRankIndex] = useState(0);

//   const rankEntries = Object.entries(RANK_REQUIREMENTS);
//   const nextRank = () => setCurrentRankIndex((prev) => (prev + 1) % rankEntries.length);
//   const prevRank = () => setCurrentRankIndex((prev) => (prev - 1 + rankEntries.length) % rankEntries.length);

//   // Add this near your other useEffects
//   useEffect(() => {
//     if (!user?.id) return;
    
//     const earningInterval = setInterval(async (): Promise<void> => {
//       const { data: stake } = await supabase
//         .from('stakes')
//         .select('id, amount')
//         .eq('user_id', user.id)
//         .eq('is_active', true)
//         .single();
      
//         if (stake) {
//           const earnedAmount = stake.amount * currentROI / 86400;
//           const success = await processEarnings(user.id, stake.id, earnedAmount);
//           if (success) {
//             setCurrentEarnings(prev => prev + earnedAmount);
//           }
//         }
//       }, 10000);

//     // Backup sync every minute
//     const syncInterval = setInterval(async () => {
//       const { data } = await supabase
//         .from('stakes')
//         .select('total_earned')
//         .eq('user_id', user.id)
//         .eq('is_active', true)
//         .single();
      
//       if (data) {
//         setCurrentEarnings(data.total_earned);
//       }
//     }, 60000);

//     return () => {
//       clearInterval(earningInterval);
//       clearInterval(syncInterval);
//     };
//   }, [user?.id, currentROI]);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-[#0A0A0F]">
//         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-[#0A0A0F] text-white">
//         <div className="text-center p-4">
//           <p className="text-red-500">{error}</p>
//           <p className="mt-2">Please open this app in Telegram</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col min-h-screen bg-[#0A0A0F] text-white antialiased p-custom">
//       {!isLoading && user && showOnboarding && <OnboardingScreen />}
//       {/* Header */}
//       <div className="px-3 py-2 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-lg z-50 border-b border-white/5">
//         <div className="flex items-center gap-4">
//           {/* User Info - existing code */}
//           <div className="flex items-center gap-2">
//             <div className="relative group">
//               <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0066FF] via-purple-600 to-pink-500 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-1000 group-hover:duration-200 animate-gradient"></div>
//               <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-black/50 relative z-10">
//                 <img 
//                   src="https://xelene.me/telegram.gif" 
//                   alt="" 
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-sm font-medium text-white">
//                 {user?.username ? `@${user.username}` : '@username'}
//               </span>
//               <div className="flex items-center gap-2">
//                 <span className="text-xs text-gray-400 truncate max-w-[120px]">
//                   {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'User Name'}
//                 </span>
//                 {user?.rank && <RankBadge rank={user.rank} />}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Connect Button */}
//         <TonConnectButton className="!bg-blue-500/20 !text-blue-400 hover:!bg-blue-500/30 !rounded-full !transition-all !duration-300 !scale-90" />
//       </div>

//       {/* Network Status Bar */}
//       <div className="flex items-center justify-between gap-2 px-4 py-2 bg-[#1A1B1E]/50 border-b border-white/5">
//         {/* Wallet Balance */}
//         <div className="flex items-center gap-2">
//           <div className="px-2 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
//             <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//             </svg>
//             {isLoadingBalance ? (
//               <div className="w-3 h-3 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
//             ) : (
//               <span className="text-xs font-medium text-white/80">
//                 {Number(walletBalance).toFixed(2)} TON
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Network Info - Existing Code */}
//         <div className="flex items-center gap-2 text-xs text-white/60">
//           <span className="hidden sm:inline">Connected to:</span>
//           {/* Blockchain Badge */}
//           <div className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center gap-1.5">
//             <svg className="w-3 h-3 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
//               <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
//             </svg>
//             <span className="text-xs font-medium text-blue-400">
//               <span className="hidden sm:inline">TON Blockchain</span>
//               <span className="sm:hidden">TON</span>
//             </span>
//           </div>
          
//           {/* Network Badge */}
//           <div className={`px-2 py-1 rounded-full flex items-center gap-1.5 ${
//             isMainnet 
//               ? 'bg-green-500/10 border border-green-500/20' 
//               : 'bg-yellow-500/10 border border-yellow-500/20'
//           }`}>
//             <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
//               isMainnet ? 'bg-green-400' : 'bg-yellow-400'
//             }`} />
//             <span className={`text-xs font-medium ${
//               isMainnet ? 'text-green-400' : 'text-yellow-400'
//             }`}>
//               {NETWORK_NAME}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Main Content Area */}
//       <div className="flex-1">
//         {currentTab === 'home' && (
//           <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
//             {/* Add CountdownTimer here */}
//             <CountdownTimer />

//             {/* TON Price Card */}
//             <div className="flex items-center justify-between p-3 mb-3 bg-[#1A1B1E] rounded-xl border border-white/5">
//               <div className="flex items-center gap-3">
//                 <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
//                   <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-sm font-medium text-white">TON Price</span>
//                     <div className="flex items-center gap-1">
//                       <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
//                       <span className="text-[10px] text-green-500">Live</span>
//                     </div>
//                   </div>
//                   <span className="text-xs text-white/60">The Open Network</span>
//                 </div>
//               </div>
//               <div className="flex flex-col items-end">
//                 <div className="text-lg font-bold text-white">${tonPrice.toFixed(2)}</div>
//                 <div className="flex items-center gap-1">
//                   <span className={`text-xs ${tonPrice > 2.5 ? 'text-green-500' : 'text-red-500'}`}>
//                     {tonPrice > 2.5 ? '↑' : '↓'} {Math.abs(((tonPrice - 2.5) / 2.5) * 100).toFixed(2)}%
//                   </span>
//                   <span className="text-xs text-white/40">24h</span>
//                 </div>
//               </div>
//             </div>

//             {/* Stake Card */}
//             <div className="bg-gradient-to-b from-[#1A1B1E] to-[#141517] rounded-xl p-4 border border-white/5 shadow-xl relative overflow-visible">
//               <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]" />
//               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

//               <div className="relative">
//                 {/* Header Row */}
//                 <div className="flex items-center justify-between mb-3">
//     <div className="flex items-center gap-1.5">
//       <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
//       <span className="text-xs font-medium text-white/80">My Stake</span>
//     </div>
//     {user?.balance && user.balance > 0 ? (
//       <div className="flex items-center gap-1.5">
//         <div className="px-2 py-0.5 rounded-full bg-[#4BB543]/10 border border-[#4BB543]/20">
//           <span className="text-[10px] text-[#4BB543]">+{(currentROI * 100).toFixed(1)}% Daily</span>
//         </div>
//         <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
//           <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//           </svg>
//           <span className="text-[10px] text-yellow-400">100d</span>
//         </div>
//       </div>
//     ) : (
//       <div className="text-xs text-white/40">Start staking to earn rewards</div>
//     )}
//   </div>


//                 {/* Balance Row */}
//                 <div className="flex items-center justify-between">
//     <div>
//       <div className="flex items-baseline gap-1 mb-0.5">
//         <span className="text-2xl font-bold text-white">{user?.balance?.toFixed(2) || '0.00'}</span>
//         <span className="text-sm font-medium text-white/60">TON</span>
//         <span className="text-xs text-white/40">≈ ${((user?.balance ?? 0) * tonPrice).toFixed(2)}</span>
//       </div>
//       {user?.balance && user.balance > 0 ? (
//         <div className="flex items-center gap-1">
//           <span className="w-1 h-1 rounded-full bg-yellow-400"></span>
//           <span className="text-[10px] text-yellow-400">
//             Unlocks {new Date(Date.now() + (100 * 24 * 60 * 60 * 1000)).toLocaleDateString()}
//           </span>
//         </div>
//       ) : (
//         <div className="text-xs text-white/40">No active stake</div>
//       )}
//     </div>

//     <button 
//       onClick={() => setShowDepositModal(true)}
//       className="group relative px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 shadow-lg bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/25"
//     >
//       <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//       {getDepositButtonText()}
//     </button>
//   </div>

//                 {/* Lock Progress Bar */}
//   {user?.balance && user.balance > 0 ? (
//     <div className="mt-3">
//       <div className="flex items-center justify-between text-[10px] mb-1">
//         <span className="text-white/60">Lock Progress</span>
//         <span className="text-white/40">{stakingProgress.toFixed(1)}%</span>
//       </div>
//       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
//         <div 
//           className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-1000" 
//           style={{ width: `${stakingProgress}%` }}
//         />
//       </div>
//     </div>
//   ) : (
//     <div className="mt-3 text-center text-xs text-white/40">
//       Stake TON to see your lock progress and earn rewards
//     </div>
//   )}
//               </div>
//             </div>

//             {/* Earnings Card */}
//             <div className="bg-gradient-to-b from-[#1A1B1E] to-[#141517] rounded-xl p-4 border border-white/5 mt-4">
//               <div className="flex justify-between items-center mb-3">
//                 <div className="flex items-center gap-2">
//                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
//                   <span className="text-sm font-medium text-white/80">Available Earnings</span>
//                 </div>
//                 <button 
//                   onClick={handleWithdraw}
//                   disabled={isWithdrawing || currentEarnings < 1}
//                   className={`bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 
//                     text-white rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 
//                     flex items-center gap-1.5 shadow-lg shadow-green-500/20
//                     ${(isWithdrawing || currentEarnings < 1) ? 'opacity-50 cursor-not-allowed' : ''}`}
//                 >
//                   {isWithdrawing ? (
//                     <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
//                   ) : (
//                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                   )}
//                   {isWithdrawing ? 'Processing...' : 'Withdraw'}
//                 </button>
//               </div>

//               <div className="flex items-baseline gap-2">
//                 <span className="text-2xl font-bold text-white">{formatEarnings(currentEarnings)}</span>
//                 <span className="text-sm font-medium text-white/60">TON</span>
//                 <span className="text-xs text-white/40">≈ ${(currentEarnings * tonPrice).toFixed(2)}</span>
//               </div>

//               {renderEarningsSection()}

//               <div className="mt-3">
//                 <div className="flex items-center justify-between text-xs mb-1.5">
//                   <span className="text-white/60">Staking Progress</span>
//                   <span className="text-white/40">{stakingProgress.toFixed(1)}%</span>
//                 </div>
//                 <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
//                   <div 
//                     className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000" 
//                     style={{ width: `${stakingProgress}%` }}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Card Navigation */}
//             <div className="flex items-center gap-2 px-1">
//               <button
//                 onClick={() => setActiveCard('stats')}
//                 className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
//                   ${activeCard === 'stats' 
//                     ? 'bg-blue-500/20 text-blue-400' 
//                     : 'text-white/40 hover:text-white/60'}`}
//               >
//                 Statistics
//               </button>
//               <button
//                 onClick={() => setActiveCard('activity')}
//                 className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
//                   ${activeCard === 'activity' 
//                     ? 'bg-green-500/20 text-green-400' 
//                     : 'text-white/40 hover:text-white/60'}`}
//               >
//                 Activity
//               </button>
//               <button
//                 onClick={() => setActiveCard('community')}
//                 className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
//                   ${activeCard === 'community' 
//                     ? 'bg-purple-500/20 text-purple-400' 
//                     : 'text-white/40 hover:text-white/60'}`}
//               >
//                 Community
//               </button>
//             </div>

//             {/* Card Content */}
//             <div className="space-y-6">
//               {activeCard === 'stats' && (
//                 <>
//                   {/* Stats Grid */}
//                   <div className="grid grid-cols-2 gap-3">
//                     {/* Total Deposited */}
//                     <StatsCard
//                       title="Total Deposited"
//                       value={`${user?.total_deposit?.toFixed(2) ?? 0} TON`}
//                       subValue={`≈ $${((user?.total_deposit ?? 0) * tonPrice).toFixed(2)}`}
//                       icon={<FaCoins className="w-4 h-4 text-blue-300" />}
//                       bgColor="bg-blue-500/20"
//                     />

//                     {/* Total Withdrawn */}
//                     <StatsCard
//                       title="Total Withdrawn"
//                       value={`${user?.total_withdrawn?.toFixed(2) ?? 0} TON`}
//                       subValue={`≈ $${((user?.total_withdrawn ?? 0) * tonPrice).toFixed(2)}`}
//                       icon={<svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                       </svg>}
//                       bgColor="bg-green-500/20"
//                     />

//                     {/* Total Earned */}
//                     <StatsCard
//                       title="Total Earned"
//                       value={`${user?.total_earned?.toFixed(2) ?? 0} TON`}
//                       subValue={`≈ $${((user?.total_earned ?? 0) * tonPrice).toFixed(2)}`}
//                       icon={<svg className="w-4 h-4 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>}
//                       bgColor="bg-yellow-500/20"
//                     />

//                     {/* Reputation Points */}
//                     <StatsCard
//                       title="Reputation Points"
//                       value={`${user?.total_sbt?.toFixed(2) ?? 0} STK`}
//                       subValue={`Level ${Math.floor((user?.total_sbt ?? 0) / 100) + 1}`}
//                       icon={<svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                       </svg>}
//                       bgColor="bg-purple-500/20"
//                     />

//     <StatsCard
//   title="Wallet Address"
//   value={userFriendlyAddress || 'Not connected'}
//   icon={<FaWallet />}
//   bgColor="bg-purple-500/20"
//   className="hidden" // Add this line
// />
//                   </div>

                  

//                   {/* Staking Details */}
//                   <div className="bg-[#1A1B1E] rounded-xl p-4 border border-white/5">
//                     <div className="flex items-center gap-2 mb-4">
//                       <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
//                       <h3 className="text-sm font-medium bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
//                         Staking Analytics
//                       </h3>
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       {/* ROI Card */}
//                       {renderROIStats(currentROI, calculateAPY)}

//                       {/* Earning Rate Card */}
//                       <div className="bg-white/5 rounded-lg p-3">
//                         <div className="flex items-center gap-1.5 mb-1">
//                           <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                           </svg>
//                           <span className="text-xs text-white/40">Earning Rate</span>
//                         </div>
//                         <span className="text-lg font-semibold text-blue-400">{(perSecondRate * 86400).toFixed(2)}</span>
//                         <span className="text-xs text-white/40 ml-1">TON/day</span>
//                       </div>

//                       {/* Progress Card */}
//                       <div className="bg-white/5 rounded-lg p-3 col-span-2">
//                         <div className="flex items-center justify-between mb-2">
//                           <div className="flex items-center gap-1.5">
//                             <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                             </svg>
//                             <span className="text-xs text-white/40">Staking Progress</span>
//                           </div>
//                           <span className="text-sm font-medium text-purple-400">{stakingProgress.toFixed(1)}%</span>
//                         </div>
//                         <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
//                           <div 
//                             className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-1000" 
//                             style={{ width: `${stakingProgress}%` }}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Rank Progress Carousel */}
//                   <div className="relative bg-[#1A1B1E] rounded-xl p-4 border border-white/5">
//                     {/* Navigation Buttons */}
//                     <button 
//                       onClick={prevRank}
//                       className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/60 transition-all z-10"
//                     >
//                       <FiChevronLeft className="w-5 h-5" />
//                     </button>
//                     <button 
//                       onClick={nextRank}
//                       className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/60 transition-all z-10"
//                     >
//                       <FiChevronRight className="w-5 h-5" />
//                     </button>

//                     {/* Rank Content */}
//                     <div className="overflow-hidden">
//                       <div className="transition-transform duration-300 ease-in-out">
//                         {rankEntries.map(([key, requirements], index) => {
//                           const { deposit, depositUSD, teamVolume, teamVolumeUSD, title, directs, weeklyBonusUSD } = requirements;
//                           const isCurrentRank = user?.rank === title;
//                           const tonRequirement = deposit;
//                           const teamTonRequirement = teamVolume;
//                           const hasMetDeposit = (user?.total_deposit || 0) >= tonRequirement;
//                           const hasMetTeamVolume = (user?.team_volume || 0) >= teamTonRequirement;
//                           const hasMetDirects = (user?.direct_referrals || 0) >= directs;

//                           return (
//                             <div 
//                               key={key}
//                               className="w-full"
//                               style={{ display: currentRankIndex === index ? 'block' : 'none' }}
//                             >
//                               {/* Rank Header */}
//                               <div className="flex items-center justify-between mb-4">
//                                 <div className="flex items-center gap-2">
//                                   <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
//                                   <h3 className="text-lg font-medium text-white">{title}</h3>
//                                 </div>
//                                 {isCurrentRank && (
//                                   <span className="px-2 py-1 rounded-full bg-blue-500/20 text-xs text-blue-400">
//                                     Current Rank
//                                   </span>
//                                 )}
//                               </div>

//                               {/* Requirements Grid */}
//                               <div className="grid grid-cols-3 gap-2 mb-4">
//                                 {/* Deposit Requirement */}
//                                 <div className="bg-black/20 rounded-lg p-2">
//                                   <div className="flex items-center gap-1 mb-1">
//                                     <div className={`w-1 h-1 rounded-full ${hasMetDeposit ? 'bg-green-400' : 'bg-white/20'}`} />
//                                     <span className="text-[10px] text-white/40">Personal Deposit</span>
//                                   </div>
//                                   <p className="text-xs font-medium text-white">
//                                     {(user?.total_deposit || 0).toFixed(1)}/{tonRequirement} TON
//                                   </p>
//                                   <p className="text-[10px] text-white/40">
//                                     ({formatUSD((user?.total_deposit ?? 0) * tonPrice)}/{depositUSD})
//                                   </p>
//                                 </div>

//                                 {/* Team Volume Requirement */}
//                                 <div className="bg-black/20 rounded-lg p-2">
//                                   <div className="flex items-center gap-1 mb-1">
//                                     <div className={`w-1 h-1 rounded-full ${hasMetTeamVolume ? 'bg-green-400' : 'bg-white/20'}`} />
//                                     <span className="text-[10px] text-white/40">Team Volume</span>
//                                   </div>
//                                   <p className="text-xs font-medium text-white">
//                                     {(user?.team_volume || 0).toFixed(1)}/{teamTonRequirement} TON
//                                   </p>
//                                   <p className="text-[10px] text-white/40">
//                                     ({formatUSD((user?.team_volume ?? 0) * tonPrice)}/{teamVolumeUSD})
//                                   </p>
//                                 </div>

//                                 {/* Direct Referrals */}
//                                 <div className="bg-black/20 rounded-lg p-2">
//                                   <div className="flex items-center gap-1 mb-1">
//                                     <div className={`w-1 h-1 rounded-full ${hasMetDirects ? 'bg-green-400' : 'bg-white/20'}`} />
//                                     <span className="text-[10px] text-white/40">Direct Referrals</span>
//                                   </div>
//                                   <p className="text-xs font-medium text-white">
//                                     {user?.direct_referrals || 0}/{directs} Users
//                                   </p>
//                                 </div>
//                               </div>

//                               {/* Weekly Bonus */}
//                               <div className="bg-black/20 rounded-lg p-3 mb-4">
//                                 <div className="flex items-center justify-between">
//                                   <div className="flex items-center gap-2">
//                                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
//                                     <span className="text-sm text-white/60">Weekly Bonus</span>
//                                   </div>
//                                   <span className="text-sm font-medium text-green-400">
//                                     {weeklyBonusUSD}/week
//                                   </span>
//                                 </div>
//                                 <p className="text-xs text-white/40 mt-1">
//                                   Complete all requirements to unlock this bonus
//                                 </p>
//                               </div>

//                               {/* Progress Bars */}
//                               <div className="space-y-2">
//                                 {/* Deposit Progress */}
//                                 <div>
//                                   <div className="flex justify-between text-[10px] text-white/40 mb-1">
//                                     <span>Deposit Progress</span>
//                                     <span>{Math.min(((user?.total_deposit || 0) / tonRequirement) * 100, 100).toFixed(1)}%</span>
//                                   </div>
//                                   <div className="h-1 bg-white/5 rounded-full overflow-hidden">
//                                     <div 
//                                       className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300"
//                                       style={{ width: `${Math.min(((user?.total_deposit || 0) / tonRequirement) * 100, 100)}%` }}
//                                     />
//                                   </div>
//                                 </div>

//                                 {/* Team Volume Progress */}
//                                 <div>
//                                   <div className="flex justify-between text-[10px] text-white/40 mb-1">
//                                     <span>Team Volume Progress</span>
//                                     <span>{Math.min(((user?.team_volume || 0) / teamTonRequirement) * 100, 100).toFixed(1)}%</span>
//                                   </div>
//                                   <div className="h-1 bg-white/5 rounded-full overflow-hidden">
//                                     <div 
//                                       className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-300"
//                                       style={{ width: `${Math.min(((user?.team_volume || 0) / teamTonRequirement) * 100, 100)}%` }}
//                                     />
//                                   </div>
//                                 </div>

//                                 {/* Direct Referrals Progress */}
//                                 <div>
//                                   <div className="flex justify-between text-[10px] text-white/40 mb-1">
//                                     <span>Direct Referrals Progress</span>
//                                     <span>{Math.min(((user?.direct_referrals || 0) / directs) * 100, 100).toFixed(1)}%</span>
//                                   </div>
//                                   <div className="h-1 bg-white/5 rounded-full overflow-hidden">
//                                     <div 
//                                       className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-300"
//                                       style={{ width: `${Math.min(((user?.direct_referrals || 0) / directs) * 100, 100)}%` }}
//                                     />
//                                   </div>
//                                 </div>
//                               </div>

//                               {/* Pagination Dots */}
//                               <div className="flex justify-center gap-1 mt-4">
//                                 {rankEntries.map((_, i) => (
//                                   <button
//                                     key={i}
//                                     onClick={() => setCurrentRankIndex(i)}
//                                     className={`w-1.5 h-1.5 rounded-full transition-all ${
//                                       currentRankIndex === i 
//                                         ? 'bg-blue-500 w-3' 
//                                         : 'bg-white/20 hover:bg-white/40'
//                                     }`}
//                                   />
//                                 ))}
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   </div>
//                 </>
//               )}

//               {activeCard === 'activity' && renderActivityCard()}

//               {activeCard === 'community' && (
//                 <div className="bg-[#1A1B1E] rounded-xl p-4 border border-white/5">
//                   <h3 className="text-lg font-semibold text-white mb-4">Community</h3>
//                   <div className="space-y-3">
//                     {/* Telegram Group */}
//                     <a 
//                       href="https://t.me/tonstak3"
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
//                     >
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
//                           <FaTelegram className="w-5 h-5 text-blue-400" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium text-white">Telegram Group</p>
//                           <p className="text-xs text-white/40">Join our official community</p>
//                         </div>
//                       </div>
//                       <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                       </svg>
//                     </a>

//                     {/* Telegram Channel */}
//                     <a 
//                       href="https://t.me/Tonstak3it"
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
//                     >
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
//                           <FaTelegram className="w-5 h-5 text-blue-400" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium text-white">Announcement Channel</p>
//                           <p className="text-xs text-white/40">Get latest updates</p>
//                         </div>
//                       </div>
//                       <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                       </svg>
//                     </a>

//                     {/* YouTube */}
//                     <a 
//                       href="https://youtube.com/@tonstakeit?si=7mOIiUEQs8Lu4Oku"
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
//                     >
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
//                           <FaYoutube className="w-5 h-5 text-red-400" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium text-white">YouTube Channel</p>
//                           <p className="text-xs text-white/40">Watch tutorials & updates</p>
//                         </div>
//                       </div>
//                       <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                       </svg>
//                     </a>

//                     {/* Facebook */}
//                     <a 
//                       href="https://web.facebook.com/people/TON-STAKE-It/61572709349026/"
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
//                     >
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
//                           <FaFacebook className="w-5 h-5 text-blue-400" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium text-white">Facebook Page</p>
//                           <p className="text-xs text-white/40">Follow us on Facebook</p>
//                         </div>
//                       </div>
//                       <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                       </svg>
//                     </a>

//                     {/* Twitter/X */}
//                     <a 
//                       href="https://x.com/TonStakeit?t=1CdcWBxIYsKnV2YzVQmhcA&s=09"
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
//                     >
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
//                           <FaTwitter className="w-5 h-5 text-white" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium text-white">Twitter/X</p>
//                           <p className="text-xs text-white/40">Follow for quick updates</p>
//                         </div>
//                       </div>
//                       <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                       </svg>
//                     </a>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {currentTab === 'network' && (
//           <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
//             <ReferralSystem />
//           </div>
//         )}

//         {currentTab === 'gmp' && (
//           <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
//             <GMPLeaderboard />
//           </div>
//         )}

//         {currentTab === 'tasks' && (
//           <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
//             <div className="bg-[#1A1B1E] rounded-xl p-4 border border-white/5">
//               <h3 className="text-lg font-semibold text-white mb-4">Daily Tasks</h3>

//               {/* Coming Soon Message */}
//               <div className="flex flex-col items-center justify-center py-8 text-center">
//                 <svg className="w-12 h-12 text-blue-400/50 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                 </svg>
//                 <p className="text-white/60 font-medium">Coming Soon</p>
//                 <p className="text-sm text-white/40 mt-1">Daily tasks will be available in the next update</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {currentTab === 'token' && (
//           <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
//             <TokenLaunchpad />
//           </div>
//         )}
//       </div>

//       {/* Deposit Modal */}
//       {showDepositModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
//           <div className="bg-[#1A1B1E] rounded-xl w-full max-w-md border border-white/5">
//             <div className="p-6">
//               <div className="flex justify-between items-center mb-6">
//                 <h3 className="text-xl font-semibold text-white">Deposit TON</h3>
//                 <button 
//                   onClick={() => {
//                     setShowDepositModal(false);
//                     setDepositStatus('idle');
//                     setCustomAmount(''); // Reset custom amount
//                   }}
//                   className="text-white/60 hover:text-white"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>

//               {depositStatus === 'pending' ? (
//                 <div className="text-center py-8">
//                   <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
//                   <p className="text-white font-medium">Verifying Transaction...</p>
//                   <p className="text-sm text-white/60 mt-2">Please wait while we confirm your deposit</p>
//                 </div>
//               ) : (
//                 <>
//                   {/* Quick Select Text */}
//                   <div className="text-sm text-white/60 mb-3">
//                     Quick Select:
//                   </div>

//                   {/* Predefined Amounts */}
//                   <div className="grid grid-cols-3 gap-2 mb-6">
//                     {[1, 5, 10, 50, 100, 500].map((amount) => (
//                       <button
//                         key={amount}
//                         onClick={() => {
//                           setCustomAmount(amount.toString());
//                           handleDeposit(amount);
//                         }}
//                         className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
//                       >
//                         {amount} TON
//                       </button>
//                     ))}
//                   </div>

//                   {/* Custom Amount Section */}
//                   <div className="relative mb-6">
//                     <div className="flex items-center gap-2 mb-3">
//                       <span className="text-sm text-white/60">Or enter custom amount:</span>
//                     </div>
                    
//                     {/* Custom Amount Input with Deposit Button */}
//                     <div className="space-y-3">
//                       <div className="relative">
//                         <input
//                           type="number"
//                           placeholder="Enter amount"
//                           min="1"
//                           step="0.1"
//                           value={customAmount}
//                           onChange={(e) => setCustomAmount(e.target.value)}
//                           className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50"
//                         />
//                         <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
//                           TON
//                         </div>
//                       </div>
                      
//                       {/* Deposit Button */}
//                       <button
//                         onClick={() => {
//                           const amount = parseFloat(customAmount);
//                           if (!isNaN(amount) && amount >= 1) {
//                             handleDeposit(amount);
//                           } else {
//                             showSnackbar({
//                               message: 'Invalid Amount',
//                               description: 'Please enter an amount greater than or equal to 1 TON'
//                             });
//                           }
//                         }}
//                         disabled={!customAmount || parseFloat(customAmount) < 1}
//                         className={`w-full py-3 rounded-lg font-medium transition-all duration-200 
//                           ${!customAmount || parseFloat(customAmount) < 1
//                             ? 'bg-blue-500/50 text-white/50 cursor-not-allowed'
//                             : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25'
//                           }`}
//                       >
//                         Deposit {customAmount ? `${customAmount} TON` : 'TON'}
//                       </button>
//                     </div>
//                   </div>

//                   {/* Info Section */}
//                   <div className="bg-white/5 rounded-lg p-4 space-y-2">
//                     <div className="flex items-center gap-2 text-sm text-white/60">
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                       <span>Minimum deposit: 1 TON</span>
//                     </div>
//                     <div className="flex items-center gap-2 text-sm text-white/60">
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                       <span>Lock period: 100 days</span>
//                     </div>
//                     <div className="flex items-center gap-2 text-sm text-white/60">
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                       </svg>
//                       <span>Daily ROI: 1%</span>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Bottom Navigation */}
//       <div className="fixed bottom-0 left-0 right-0 bg-[#1A1B1E]/90 backdrop-blur-xl border-t border-white/5 safe-area-pb">
//         <div className="max-w-lg mx-auto px-2 md:px-4">
//           <div className="grid grid-cols-5 items-center">
//             {[
//               { id: 'home', text: 'Home', Icon: AiOutlineHome },
//               { id: 'network', text: 'Network', Icon: BiNetworkChart },
//               { id: 'gmp', text: 'GLP', Icon: FaCoins },
//               { id: 'tasks', text: 'Tasks', Icon: RiMessage3Line },
//               { id: 'token', text: 'Token', Icon: FaUsers }
//             ].map(({ id, text, Icon }) => (
//               <button 
//                 key={id} 
//                 onClick={() => setCurrentTab(id)}
//                 className={`flex flex-col items-center py-3 md:py-4 w-full transition-all duration-300 ${
//                   currentTab === id ? 'text-blue-400' : 'text-gray-500'
//                 }`}
//               >
//                 <Icon size={18} className="mb-1" />
//                 <span className="text-[10px] md:text-xs font-medium tracking-wide truncate max-w-[64px] text-center">
//                   {text}
//                 </span>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Add Snackbar component before closing div */}
//       {isSnackbarVisible && (
//         <Snackbar
//           onClose={() => {
//             setSnackbarVisible(false);
//             if (snackbarTimeoutRef.current) {
//               clearTimeout(snackbarTimeoutRef.current);
//             }
//           }}
//           duration={SNACKBAR_DURATION}
//           description={snackbarDescription}
//           after={
//             <Button 
//               size="s" 
//               onClick={() => {
//                 setSnackbarVisible(false);
//                 if (snackbarTimeoutRef.current) {
//                   clearTimeout(snackbarTimeoutRef.current);
//                 }
//               }}
//             >
//               Close
//             </Button>
//           }
//           className="snackbar-top"
//         >
//           {snackbarMessage}
//         </Snackbar>
//       )}
//     </div>
//   );
// };

// // Update the ROI display in your stats or earnings section
// const renderROIStats = (currentROI: number, calculateAPY: (rate: number) => number) => (
//   <div className="bg-white/5 rounded-lg p-3">
//     <div className="flex items-center gap-1.5 mb-1">
//       <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//       </svg>
//       <span className="text-xs text-white/40">ROI Rates</span>
//     </div>
//     <div className="space-y-1">
//       <div className="flex items-center justify-between">
//         <span className="text-sm text-white/60">Daily</span>
//         <span className="text-sm font-semibold text-green-400">
//           +{(currentROI * 100).toFixed(2)}%
//         </span>
//       </div>
//       <div className="flex items-center justify-between">
//         <span className="text-sm text-white/60">Monthly</span>
//         <span className="text-sm font-semibold text-green-400">
//           +{(currentROI * 100 * 30).toFixed(2)}%
//         </span>
//       </div>
//       <div className="flex items-center justify-between">
//         <span className="text-sm text-white/60">APY</span>
//         <span className="text-sm font-semibold text-green-400">
//           +{calculateAPY(currentROI).toFixed(2)}%
//         </span>
//       </div>
//     </div>
//   </div>
// );
