import React, { useEffect, useMemo, useState } from 'react';

type MiningEarningsCardProps = {
  tokenLabel?: string;
  currentEarnings: number;
  fiatPrice?: number;
  onClaim: () => void;
  isClaimDisabled?: boolean;
  hasBalance: boolean;
  potentialTotalEarnings?: number;
  extraSection?: React.ReactNode;
  claimedBalance?: number;
  showSimulator?: boolean;
};

const formatEarningsLocal = (amount: number): string => {
  if (!isFinite(amount)) return '0.0000000';
  return amount >= 1 ? amount.toFixed(7) : amount.toFixed(7);
};

export const MiningEarningsCard: React.FC<MiningEarningsCardProps> = ({
  tokenLabel = 'TON',
  currentEarnings,
  fiatPrice,
  // onClaim,
  // isClaimDisabled = false,
  hasBalance,
  // potentialTotalEarnings,
  // extraSection,
  claimedBalance,
  showSimulator = true
}) => {
  const [isMining] = useState(true);
  const [hashRate, setHashRate] = useState(1250);
  const [efficiency, setEfficiency] = useState(86);
  const [blocks, setBlocks] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!showSimulator) return;
    const interval = setInterval(() => {
      setTick(t => t + 1);
      if (!isMining) return;
      setHashRate(prev => prev + (Math.random() * 14 - 7));
      setEfficiency(prev => Math.max(60, Math.min(100, prev + (Math.random() * 3 - 1.5))));
      if (Math.random() > 0.96) setBlocks(prev => prev + 1);
    }, 1200);
    return () => clearInterval(interval);
  }, [isMining, showSimulator]);

  const formattedEarnings = useMemo(() => formatEarningsLocal(currentEarnings), [currentEarnings]);
  return (
    <div className="relative overflow-hidden rounded-lg p-4 sm:p-6 font-mono">
      {/* scanline overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '100% 3px'}}></div>
      {/* corner accents */}
      <div className="pointer-events-none absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-lime-400/60"></div>
      <div className="pointer-events-none absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-lime-400/60"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-lime-400 animate-pulse"></div>
            <span className="text-xs sm:text-sm text-lime-300 tracking-wider">STAKERFI MINING NODE</span>
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            {typeof claimedBalance === 'number' && (
              <div className="px-2 py-0.5 rounded-full bg-black/60 border border-lime-400/30 flex items-center gap-1.5">
                <svg className="w-3 h-3 text-lime-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
                </svg>
                <span className="text-[10px] font-medium text-lime-200">
                  {claimedBalance.toFixed(2)} {tokenLabel}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Simulator toolbar */}
        {showSimulator && (
          <div className="flex flex-wrap items-center justify-between mb-4 text-xs">
            <div className="flex items-center gap-2 sm:gap-4 text-lime-300/80">
              <div className="flex items-center gap-1">
                <span>HASH</span>
                <span className="text-lime-200 font-semibold">{Math.max(800, Math.min(2200, hashRate)).toFixed(0)} H/s</span>
              </div>
              <span className="opacity-40 hidden sm:inline">|</span>
              <div className="flex items-center gap-1">
                <span>EFF</span>
                <span className="text-lime-200 font-semibold">{efficiency.toFixed(0)}%</span>
              </div>
              <span className="opacity-40 hidden sm:inline">|</span>
              <div className="flex items-center gap-1">
                <span>BLK</span>
                <span className="text-lime-200 font-semibold">{blocks}</span>
              </div>
            </div>
            {/* <button
              onClick={() => setIsMining(s => !s)}
              className={`px-2 py-1 text-[10px] rounded border transition-colors ${isMining ? 'border-lime-400/60 text-lime-200 hover:bg-lime-400/10' : 'border-white/20 text-white/70 hover:bg-white/10'}`}
            >
              {isMining ? 'PAUSE' : 'RESUME'}
            </button> */}
          </div>
        )}

        {/* Earnings */}
        <div className="text-center my-8 sm:my-12 md:my-16 lg:my-20">
          <div className="text-xs sm:text-sm text-lime-300/80 mb-2">STAKERSFI MINING BALANCE</div>
          <div className="relative inline-flex items-center justify-center my-4">
            <div className={`absolute -left-10 sm:-left-12 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-lime-400/40 ${isMining ? 'animate-spin' : ''}`} style={{borderTopColor: 'transparent'}}></div>
            <div className="text-4xl sm:text-5xl md:text-6xl text-lime-200 tabular-nums">{formattedEarnings}</div>
            <div className={`absolute -right-10 sm:-right-12 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-lime-400/40 ${isMining ? 'animate-spin' : ''}`} style={{borderTopColor: 'transparent', animationDirection: 'reverse'}}></div>
          </div>
          <div className="text-sm sm:text-base text-lime-300/80">{tokenLabel}{fiatPrice !== undefined ? '' : ''} POINTS</div>

          {/* <button
              onClick={onClaim}
              className={`mt-6 sm:mt-8 px-4 py-2 text-sm rounded border border-lime-400/60 text-lime-200 hover:bg-lime-400/10 transition-colors ${isClaimDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isClaimDisabled}
            >
              CLAIM {tokenLabel}
            </button> */}
        </div>

        {/* Progress/info block (minimal) */}
        {hasBalance ? (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs sm:text-sm text-lime-300/70 mb-2">
              <span>STATUS</span>
              <span className="flex items-center gap-2">{isMining ? 'ACTIVE' : 'PAUSED'}<span className={`w-2 h-2 rounded-full ${isMining ? 'bg-lime-400' : 'bg-white/40'}`}></span></span>
            </div>
            <div className="w-full h-2 bg-lime-900/40 rounded overflow-hidden">
              <div className="h-full bg-lime-400/70 transition-all" style={{ width: `${60 + (tick % 40)}%` }}></div>
            </div>
          </div>
        ) : (
          <div className="mt-4 text-sm text-center text-lime-300/70">Mining will start when balance is detected</div>
        )}
      </div>
    </div>
  );
};

export default MiningEarningsCard;