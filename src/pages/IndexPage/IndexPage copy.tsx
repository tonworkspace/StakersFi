// import { useTonConnectUI } from '@tonconnect/ui-react';
// import { toUserFriendlyAddress } from '@tonconnect/sdk';
// import { FC, useState, useEffect } from 'react';
// import { FaCoins, FaUsers, FaTelegram, FaYoutube, FaFacebook, FaTwitter, FaWallet } from 'react-icons/fa';
// import { BiNetworkChart } from 'react-icons/bi';
// import { RiMessage3Line } from 'react-icons/ri';
// import { AiOutlineHome } from 'react-icons/ai';
// import { TonConnectButton, } from '@tonconnect/ui-react';
// import { useAuth } from '@/hooks/useAuth';
// import { supabase } from '@/lib/supabaseClient';
// import { BALANCE_RANKS } from '@/lib/supabaseClient';
// import { getTONPrice } from '@/lib/api';
// import { TokenLaunchpad } from '@/components/TokenLaunchpad';
// import { ReferralSystem } from '@/components/ReferralSystem';
// import GMPLeaderboard from '@/components/GMPLeaderboard';
// import { OnboardingScreen } from './OnboardingScreen';

// interface StatsCardProps {
//   title: string;
//   value: string | number;
//   subValue?: string;
//   icon: JSX.Element;
//   bgColor: string;
// }

// const StatsCard: FC<StatsCardProps> = ({ title, value, subValue, icon, bgColor }) => (
//   <div className="bg-[#1A1B1E] rounded-lg p-3 border border-white/5">
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
//       case 'Apprentice': return 'bg-green-500/20 text-green-400';
//       case 'Adept': return 'bg-blue-500/20 text-blue-400';
//       case 'Expert': return 'bg-purple-500/20 text-purple-400';
//       case 'Master': return 'bg-yellow-500/20 text-yellow-400';
//       case 'Grandmaster': return 'bg-orange-500/20 text-orange-400';
//       case 'Legend': return 'bg-red-500/20 text-red-400';
//       case 'Mythical': return 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-pink-400';
//       default: return 'bg-gray-500/20 text-gray-400';
//     }
//   };

//   return (
//     <div className={`px-3 py-1 rounded-full ${getRankColor(rank)} font-medium text-xs`}>
//       {rank}
//     </div>
//   );
// };

// // Add this new component at the top level, before IndexPage
// const CountdownTimer: FC = () => {
//   const [timeLeft, setTimeLeft] = useState({
//     hours: 24,
//     minutes: 0,
//     seconds: 0
//   });

//   useEffect(() => {
//     // Set end time to 24 hours from now
//     const endTime = new Date().getTime() + (24 * 60 * 60 * 1000);

//     const timer = setInterval(() => {
//       const now = new Date().getTime();
//       const distance = endTime - now;

//       if (distance <= 0) {
//         clearInterval(timer);
//         setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
//         return;
//       }

//       setTimeLeft({
//         hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
//         minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
//         seconds: Math.floor((distance % (1000 * 60)) / 1000)
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   return (
//     <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-white/5 mb-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h3 className="text-lg font-semibold text-white mb-1">Project Launch</h3>
//           <p className="text-sm text-white/60">Get ready for the launch!</p>
//         </div>
//         <div className="flex items-center gap-3">
//           {/* Hours */}
//           <div className="text-center">
//             <div className="bg-white/5 rounded-lg px-3 py-2 min-w-[60px]">
//               <span className="text-2xl font-bold text-blue-400">
//                 {String(timeLeft.hours).padStart(2, '0')}
//               </span>
//             </div>
//             <span className="text-xs text-white/40 mt-1">Hours</span>
//           </div>
//           <span className="text-2xl font-bold text-white/20">:</span>
//           {/* Minutes */}
//           <div className="text-center">
//             <div className="bg-white/5 rounded-lg px-3 py-2 min-w-[60px]">
//               <span className="text-2xl font-bold text-blue-400">
//                 {String(timeLeft.minutes).padStart(2, '0')}
//               </span>
//             </div>
//             <span className="text-xs text-white/40 mt-1">Minutes</span>
//           </div>
//           <span className="text-2xl font-bold text-white/20">:</span>
//           {/* Seconds */}
//           <div className="text-center">
//             <div className="bg-white/5 rounded-lg px-3 py-2 min-w-[60px]">
//               <span className="text-2xl font-bold text-blue-400">
//                 {String(timeLeft.seconds).padStart(2, '0')}
//               </span>
//             </div>
//             <span className="text-xs text-white/40 mt-1">Seconds</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export const IndexPage: FC = () => {

//   const [currentTab, setCurrentTab] = useState('home');
//   const [showDepositModal, setShowDepositModal] = useState(false);
//   const { user, isLoading, error, updateUserData } = useAuth();
//   // const userAddress = useTonAddress();
//   const [userFriendlyAddress, setUserFriendlyAddress] = useState<string | null>(null);
//   const tonConnectUI = useTonConnectUI();

//   const getUserFriendlyAddress = async () => {
//     const [tonConnect] = tonConnectUI;
//     if (tonConnect.account) {
//       const rawAddress = tonConnect.account.address;
//       const friendlyAddress = toUserFriendlyAddress(rawAddress);
//       setUserFriendlyAddress(friendlyAddress);
//     }
//   };

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

//   // Predefined deposit amounts
//   // const depositAmounts = [1, 5, 10, 50, 100, 500];

//   // Add state for activities
//   const [activities, setActivities] = useState<Activity[]>([]);
//   const [isLoadingActivities, setIsLoadingActivities] = useState(false);

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

//   // Update the handleDeposit function
//   const handleDeposit = async (amount: number) => {
//     try {
//       if (amount < 1) {
//         alert('Minimum deposit amount is 1 TON');
//         return;
//       }

//       if (!user) {
//         throw new Error('User not found');
//       }

//       const { data: currentUser } = await supabase
//         .from('users')
//         .select('balance')
//         .eq('id', user.id)
//         .single();

//       // Calculate new balance by adding to existing balance
//       const newBalance = (currentUser?.balance || 0) + amount;

//       // Update user balance
//       await updateUserData({
//         balance: newBalance,
//         total_deposit: (user.total_deposit || 0) + amount
//       });

//       // Record deposit activity
//       const { error: activityError } = await supabase
//         .from('activities')
//         .insert([{
//           user_id: user.id,
//           type: 'deposit',
//           amount: amount,
//           status: 'completed',
//           created_at: new Date().toISOString()
//         }]);

//       if (activityError) throw activityError;

//       setShowDepositModal(false);

//       // Create new stake
//       const newStake = {
//         user_id: user.id,
//         amount: amount,
//         start_date: new Date().toISOString(),
//         daily_rate: 0.01, // 1% daily
//         total_earned: 0,
//         is_active: true,
//         last_payout: new Date().toISOString(),
//         end_date: new Date(Date.now() + (100 * 24 * 60 * 60 * 1000)).toISOString() // 100 days from now
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
//             amount: amount,
//             status: 'completed',
//             created_at: new Date().toISOString()
//           }]);

//         if (stakeActivityError) throw stakeActivityError;
//       }

//     } catch (error) {
//       console.error('Deposit failed:', error);
//       alert('Deposit failed. Please try again.');
//     }
//   };

//   // Update the deposit button text based on existing stake
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
//       alert('Minimum withdrawal amount is 1 TON');
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

//       alert(`Withdrawal successful!\n\n${toWallet.toFixed(2)} TON to wallet\n${toRedeposit.toFixed(2)} TON redeposited\n${toSBT.toFixed(2)} TON to SKT`);

//     } catch (error) {
//       console.error('Withdrawal failed:', error);
//       alert('Withdrawal failed. Please try again.');
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
//         <div className="flex items-center gap-2">
//           <div className="relative group">
//             <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0066FF] via-purple-600 to-pink-500 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-1000 group-hover:duration-200 animate-gradient"></div>
//             <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-black/50 relative z-10">
//               <img 
//                 src="https://xelene.me/telegram.gif" 
//                 alt="" 
//                 className="w-full h-full object-cover"
//               />
//             </div>
//           </div>
//           <div className="flex flex-col">
//             <span className="text-sm font-medium text-white">
//               {user?.username ? `@${user.username}` : '@username'}
//             </span>
//             <div className="flex items-center gap-2">
//               <span className="text-xs text-gray-400 truncate max-w-[120px]">
//                 {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'User Name'}
//               </span>
//               {user?.rank && <RankBadge rank={user.rank} />}
//             </div>
//           </div>
//         </div>
//         <TonConnectButton className="!bg-blue-500/20 !text-blue-400 hover:!bg-blue-500/30 !rounded-full !transition-all !duration-300 !scale-90" />
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
//                   <div className="flex items-center gap-1.5">
//                     <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
//                     <span className="text-xs font-medium text-white/80">My Stake</span>
//                   </div>
//                   <div className="flex items-center gap-1.5">
//                     <div className="px-2 py-0.5 rounded-full bg-[#4BB543]/10 border border-[#4BB543]/20">
//                       <span className="text-[10px] text-[#4BB543]">+{(currentROI * 100).toFixed(1)}% Daily</span>
//                     </div>
//                     {user?.balance && user.balance > 0 && (
//                       <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
//                         <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                         </svg>
//                         <span className="text-[10px] text-yellow-400">100d</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Balance Row */}
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <div className="flex items-baseline gap-1 mb-0.5">
//                       <span className="text-2xl font-bold text-white">{user?.balance?.toFixed(2) || '0.00'}</span>
//                       <span className="text-sm font-medium text-white/60">TON</span>
//                       <span className="text-xs text-white/40">≈ ${((user?.balance ?? 0) * tonPrice).toFixed(2)}</span>
//                     </div>
//                     {user?.balance && user.balance > 0 && (
//                       <div className="flex items-center gap-1">
//                         <span className="w-1 h-1 rounded-full bg-yellow-400"></span>
//                         <span className="text-[10px] text-yellow-400">
//                           Unlocks {new Date(Date.now() + (100 * 24 * 60 * 60 * 1000)).toLocaleDateString()}
//                         </span>
//                       </div>
//                     )}
//                   </div>

//                   <button 
//                     onClick={() => setShowDepositModal(true)}
//                     className="group relative px-3 py-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-all duration-300 flex items-center gap-1.5 shadow-lg shadow-blue-500/25"
//                   >
//                     <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                     {getDepositButtonText()}
//                   </button>
//                 </div>

//                 {/* Lock Progress Bar */}
//                 {user?.balance && user.balance > 0 && (
//                   <div className="mt-3">
//                     <div className="flex items-center justify-between text-[10px] mb-1">
//                       <span className="text-white/60">Lock Progress</span>
//                       <span className="text-white/40">{stakingProgress.toFixed(1)}%</span>
//                     </div>
//                     <div className="h-1 bg-white/5 rounded-full overflow-hidden">
//                       <div 
//                         className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-1000" 
//                         style={{ width: `${stakingProgress}%` }}
//                       />
//                     </div>
//                   </div>
//                 )}
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
//                       value={`${user?.total_sbt?.toFixed(2) ?? 0} SKT`}
//                       subValue={`Level ${Math.floor((user?.total_sbt ?? 0) / 100) + 1}`}
//                       icon={<svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                       </svg>}
//                       bgColor="bg-purple-500/20"
//                     />

// <StatsCard
//   title="Wallet Address"
//   value={userFriendlyAddress || 'Not connected'}
//   icon={<FaWallet />}
//   bgColor="bg-purple-500/20"
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

//                   {/* Rank Progress */}
//                   <div className="bg-[#1A1B1E] rounded-xl p-4 border border-white/5">
//                     <div className="flex items-center justify-between mb-4">
//                       <h3 className="text-sm font-medium text-white/80">Rank Progress</h3>
//                       {user?.rank && <RankBadge rank={user.rank} />}
//                     </div>

//                     <div className="grid grid-cols-2 gap-3">
//                       {Object.entries(BALANCE_RANKS).map(([key, { min, title }]) => {
//                         const isCurrentRank = user?.rank === title;
//                         const isUnlocked = (user?.total_earned || 0) >= min;

//                         return (
//                           <div 
//                             key={key} 
//                             className={`flex items-center gap-2 p-2 rounded-lg ${
//                               isCurrentRank 
//                                 ? 'bg-blue-500/10 border border-blue-500/20' 
//                                 : isUnlocked 
//                                   ? 'bg-green-500/10 border border-green-500/20' 
//                                   : 'bg-white/5'
//                             }`}
//                           >
//                             <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
//                               isUnlocked ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
//                             }`}>
//                               {isUnlocked ? (
//                                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                 </svg>
//                               ) : (
//                                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m4-6V4" />
//                                 </svg>
//                               )}
//                             </div>

//                             <div className="min-w-0">
//                               <div className="flex items-center gap-1.5">
//                                 <p className="text-xs font-medium truncate text-white/80">{title}</p>
//                                 {isCurrentRank && (
//                                   <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
//                                 )}
//                               </div>
//                               <p className="text-[10px] text-white/40">
//                                 {min.toLocaleString()} TON
//                               </p>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>

//                     {/* Current Progress Bar */}
//                     {user?.rank && (
//                       <div className="mt-4">
//                         <div className="flex items-center justify-between text-xs mb-1.5">
//                           <span className="text-white/60">Progress to Next Rank</span>
//                           <span className="text-white/40">
//                             {user.total_earned?.toFixed(2) || '0'} TON
//                           </span>
//                         </div>
//                         <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
//                           <div 
//                             className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300"
//                             style={{ 
//                               width: `${Math.min(((user.total_earned || 0) / (Object.values(BALANCE_RANKS).find(r => r.title === user.rank)?.max || 1)) * 100, 100)}%` 
//                             }}
//                           />
//                         </div>
//                       </div>
//                     )}
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
//               {/* Coming Soon Message */}
//               <div className="flex flex-col items-center justify-center py-8 text-center">
//                 <svg className="w-12 h-12 text-blue-400/50 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                 </svg>
//                 <h3 className="text-xl font-semibold text-white mb-2">Coming Soon</h3>
//                 <p className="text-sm text-white/60 mb-6">Deposit functionality will be available in the next update</p>
//                 <button
//                   onClick={() => setShowDepositModal(false)}
//                   className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/60 transition-colors"
//                 >
//                   Close
//                 </button>
//               </div>
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
//               { id: 'gmp', text: 'GMP', Icon: FaCoins },
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
