"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HiSparkles } from "react-icons/hi2";
import { FaCrown, FaGift, FaArrowRight, FaTimes, FaTrophy, FaRedo } from "react-icons/fa";
import { RiCloseLine } from "react-icons/ri";

export interface WheelSlice {
  id: number;
  label: string;
  value: number;
  type: string; // "BLAST" | "CASH" | "RESPIN" | "FREE_SPINS"
  color: string;
  probability: number;
}

const DEFAULT_SLICES: WheelSlice[] = [
  { id: 1, label: "💥 Blast", value: 0, type: "BLAST", color: "#DC2626", probability: 25 },
  { id: 2, label: "৳50 Cash", value: 50, type: "CASH", color: "#10B981", probability: 35 },
  { id: 3, label: "🔄 Respin", value: 1, type: "RESPIN", color: "#06B6D4", probability: 15 },
  { id: 4, label: "৳100 Cash", value: 100, type: "CASH", color: "#3B82F6", probability: 15 },
  { id: 5, label: "💥 Blast", value: 0, type: "BLAST", color: "#EF4444", probability: 12 },
  { id: 6, label: "20 Free Spins", value: 20, type: "FREE_SPINS", color: "#8B5CF6", probability: 8 },
  { id: 7, label: "👑 ৳500 JACKPOT", value: 500, type: "CASH", color: "#EAB308", probability: 0.001 },
  { id: 8, label: "🔄 Respin", value: 1, type: "RESPIN", color: "#EC4899", probability: 10 },
];

export default function LuckyWheel({
  isAuthenticated,
  onBalanceUpdate,
}: {
  isAuthenticated?: boolean;
  onBalanceUpdate?: (newBalance: number) => void;
}) {
  const [slices, setSlices] = useState<WheelSlice[]>(DEFAULT_SLICES);
  const [canSpin, setCanSpin] = useState<boolean>(false);
  const [remainingSpins, setRemainingSpins] = useState<number>(0);
  const [nextSpinAt, setNextSpinAt] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [recentWinners, setRecentWinners] = useState<any[]>([]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [wonPrize, setWonPrize] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live countdown ticker for 24-hour cooldown
  useEffect(() => {
    if (!nextSpinAt) {
      setCooldownSeconds(0);
      return;
    }

    const updateCooldown = () => {
      const diffMs = new Date(nextSpinAt).getTime() - Date.now();
      if (diffMs <= 0) {
        setCooldownSeconds(0);
        setCanSpin(true);
        setRemainingSpins(1);
        setNextSpinAt(null);
      } else {
        setCooldownSeconds(Math.ceil(diffMs / 1000));
      }
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [nextSpinAt]);

  const formatCountdown = (totalSeconds: number) => {
    if (totalSeconds <= 0) return "00:00:00";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const formatCountdownText = (totalSeconds: number) => {
    if (totalSeconds <= 0) return "Ready";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  // Fetch wheel info
  const fetchWheelInfo = async () => {
    try {
      const res = await fetch("/api/lucky-wheel");
      if (res.ok) {
        const data = await res.json();
        if (data.slices && data.slices.length > 0) {
          setSlices(data.slices);
        }
        setCanSpin(Boolean(data.canSpin));
        setRemainingSpins(data.remainingSpins ?? 0);
        setNextSpinAt(data.nextSpinAt || null);
        setCooldownSeconds(data.cooldownSeconds ?? 0);
        setRecentWinners(data.recentWinners || []);
      }
    } catch (e) {
      console.error("Error loading wheel:", e);
    }
  };

  useEffect(() => {
    fetchWheelInfo();
  }, []);

  const handleSpin = async () => {
    if (isSpinning) return;
    if (!isAuthenticated) {
      setErrorMessage("Please log in to spin the Lucky Wheel and claim real cash prizes!");
      return;
    }
    if (!canSpin && remainingSpins <= 0) {
      setErrorMessage(
        cooldownSeconds > 0
          ? `24-hour cooldown active. Please wait ${formatCountdownText(cooldownSeconds)} for your next spin.`
          : "You have already used your spin! Please wait for the cooldown."
      );
      return;
    }

    setErrorMessage(null);
    setIsSpinning(true);

    try {
      const res = await fetch("/api/lucky-wheel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) {
        setIsSpinning(false);
        setErrorMessage(data.error || "Failed to spin the wheel.");
        if (data.nextSpinAt) {
          setNextSpinAt(data.nextSpinAt);
          setCooldownSeconds(data.cooldownSeconds ?? 0);
          setCanSpin(false);
        }
        return;
      }

      const winningIndex = data.winningSliceIndex ?? 0;
      const numSlices = slices.length || 8;
      const sliceAngle = 360 / numSlices;

      const extraSpins = 360 * 6; // 6 full rotations
      const targetAngle = 360 - winningIndex * sliceAngle - sliceAngle / 2;
      const finalRotation = rotation + extraSpins + (targetAngle - (rotation % 360));

      setRotation(finalRotation);

      // Animation duration: 5 seconds
      setTimeout(() => {
        setIsSpinning(false);
        setWonPrize(data.prize);

        // If prize is RESPIN, user can spin again immediately!
        if (data.isRespin) {
          setCanSpin(true);
          setRemainingSpins(1);
          setNextSpinAt(null);
          setCooldownSeconds(0);
        } else {
          setCanSpin(Boolean(data.canSpin));
          setRemainingSpins(data.remainingSpins ?? 0);
          setNextSpinAt(data.nextSpinAt || null);
          setCooldownSeconds(data.cooldownSeconds ?? 0);
        }

        if (data.newBalance !== undefined && onBalanceUpdate) {
          onBalanceUpdate(data.newBalance);
        }
        fetchWheelInfo();
      }, 5200);
    } catch (err: any) {
      setIsSpinning(false);
      setErrorMessage(err.message || "Network error. Please try again.");
    }
  };

  const numSlices = slices.length || 8;
  const sliceAngle = 360 / numSlices;

  const isBlastPrize = wonPrize?.type === "BLAST" || wonPrize?.label?.includes("Blast");
  const isRespinPrize = wonPrize?.type === "RESPIN" || wonPrize?.label?.includes("Respin");
  const isJackpotPrize = Number(wonPrize?.value) >= 500;

  return (
    <div className="relative rounded-3xl p-4 sm:p-7 bg-gradient-to-b from-[#0e1f38] via-[#091526] to-[#060e1a] border border-[#21426e] shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#3888e9]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
        {/* Left Side: Header & Info */}
        <div className="flex-1 space-y-4 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/40 text-yellow-400 text-xs font-black uppercase tracking-wider shadow-sm">
            <HiSparkles className="animate-spin text-sm" style={{ animationDuration: "4s" }} />
            <span>RK444 DAILY LUCKY WHEEL</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Spin To Win Instant Cash & Free Bonuses!
          </h2>

          <p className="text-xs sm:text-sm text-gray-300 max-w-lg leading-relaxed font-medium mx-auto lg:mx-0">
            Every registered member gets a <strong className="text-yellow-400">Free Spin Every 24 Hours</strong>! Win ৳50 & ৳100 real cash credited straight to your Main Balance with friendly 1x turnover, or the rare ৳500 Jackpot.
          </p>

          {/* Fair Play 90-Day & Rules Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-[10px] font-bold">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              💵 ৳50 & ৳100 Drops with 1x Turnover
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              🔄 Free Respins Active
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300">
              👑 ৳500 Jackpot (1x Every 90 Days)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
              💣 Watch out for the Blast!
            </span>
          </div>

          {/* Daily Spin Status Card with Live 24H Countdown */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-[#061221]/90 border border-[#193b66] backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-black font-black text-base shadow-md shadow-yellow-500/30">
                🎡
              </div>
              <div className="text-left">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  24H Spin Status
                </div>
                <div className="text-xs sm:text-sm font-black text-white">
                  {!isAuthenticated ? (
                    <span className="text-blue-400">Log In to Spin Free</span>
                  ) : canSpin || remainingSpins > 0 ? (
                    <span className="text-emerald-400">
                      🎁 1 Free Spin Available Now!
                    </span>
                  ) : (
                    <span className="text-yellow-400 font-mono flex items-center gap-1.5">
                      <span className="animate-pulse">⏳</span>
                      <span>Next Spin in: {formatCountdownText(cooldownSeconds)}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!isAuthenticated ? (
              <Link
                href="/login?redirect=/promotion"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-xs shadow-md active:scale-95 transition-all"
              >
                Log In Now
              </Link>
            ) : null}
          </div>

          {/* Live Recent Winners Ticker */}
          {recentWinners.length > 0 && (
            <div className="pt-1">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-center lg:justify-start gap-1.5 mb-1.5">
                <FaTrophy className="text-yellow-400" />
                <span>Live Recent Wheel Winners</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                {recentWinners.slice(0, 4).map((w, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0a1626] border border-[#1b3452] text-[10px] whitespace-nowrap shadow-sm"
                  >
                    <span className="text-gray-300 font-bold">{w.phone}</span>
                    <span className="text-yellow-400 font-black">won {w.prize}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold animate-shake">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Right Side: The Wheel */}
        <div className="flex flex-col items-center">
          <div className="relative p-3 rounded-full bg-gradient-to-b from-[#21426e] via-[#10243e] to-[#081321] border-4 border-[#33639e] shadow-[0_0_40px_rgba(56,136,233,0.3)]">
            {/* Top Pointer Indicator */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] pointer-events-none">
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-yellow-400 filter drop-shadow" />
            </div>

            {/* Wheel Canvas Container */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden flex items-center justify-center border-4 border-yellow-500/40 shadow-inner">
              <div
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? "transform 5s cubic-bezier(0.12, 0.8, 0.2, 1)" : "none",
                }}
                className="w-full h-full relative"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {slices.map((slice, i) => {
                    const startAngle = i * sliceAngle;
                    const endAngle = startAngle + sliceAngle;

                    const startRad = (Math.PI * (startAngle - 90)) / 180;
                    const endRad = (Math.PI * (endAngle - 90)) / 180;

                    const x1 = 50 + 50 * Math.cos(startRad);
                    const y1 = 50 + 50 * Math.sin(startRad);
                    const x2 = 50 + 50 * Math.cos(endRad);
                    const y2 = 50 + 50 * Math.sin(endRad);

                    const largeArcFlag = sliceAngle > 180 ? 1 : 0;
                    const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                    const midAngle = startAngle + sliceAngle / 2;
                    const textRad = (Math.PI * midAngle) / 180;
                    const textX = 50 + 32 * Math.cos(textRad);
                    const textY = 50 + 32 * Math.sin(textRad);

                    return (
                      <g key={slice.id || i}>
                        <path
                          d={pathData}
                          fill={slice.color}
                          stroke="#1E293B"
                          strokeWidth="0.8"
                        />
                        <text
                          x={textX}
                          y={textY}
                          fill="#FFFFFF"
                          fontSize="3.8"
                          fontWeight="900"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                          style={{
                            textShadow: "0 1px 2px rgba(0,0,0,0.9)",
                            letterSpacing: "0.2px",
                          }}
                        >
                          {slice.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Central Golden Spin Button Hub */}
              <div className="absolute z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700 shadow-[0_0_20px_rgba(245,158,11,0.8),inset_0_0_10px_rgba(0,0,0,0.8)] flex items-center justify-center">
                <button
                  type="button"
                  disabled={isSpinning || (!canSpin && isAuthenticated)}
                  onClick={handleSpin}
                  className={`w-full h-full rounded-full bg-gradient-to-b from-[#1b3457] to-[#071322] border-2 border-yellow-400 flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-inner ${
                    isSpinning || (!canSpin && isAuthenticated)
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:border-yellow-200"
                  }`}
                >
                  <span className="text-[11px] sm:text-xs font-black text-yellow-400 tracking-wider uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    {isSpinning
                      ? "SPIN..."
                      : canSpin || !isAuthenticated
                      ? "SPIN"
                      : "WAIT"}
                  </span>
                  <span className="text-[7px] sm:text-[8px] font-bold text-gray-300 uppercase">
                    {canSpin || !isAuthenticated ? "NOW" : "24H"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              disabled={isSpinning || (!canSpin && isAuthenticated)}
              onClick={handleSpin}
              className={`px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 ${
                isSpinning
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : canSpin
                  ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black shadow-yellow-500/30 animate-bounce"
                  : !isAuthenticated
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-500/30"
                  : "bg-[#0b1a2c] text-yellow-400/90 border border-[#234872] cursor-not-allowed shadow-inner"
              }`}
            >
              {isSpinning
                ? "Spinning The Wheel..."
                : canSpin
                ? "🎁 SPIN FREE NOW"
                : !isAuthenticated
                ? "Log In to Spin Free"
                : `⏳ NEXT SPIN IN ${formatCountdown(cooldownSeconds)}`}
            </button>
          </div>
        </div>
      </div>

      {/* ── WIN / BLAST / RESPIN CELEBRATION MODAL ───────────────────────── */}
      {wonPrize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            className={`relative w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl space-y-4 border ${
              isBlastPrize
                ? "bg-gradient-to-b from-[#2a0d0d] via-[#1a0808] to-[#0a0404] border-red-500/80 shadow-[0_0_50px_rgba(239,68,68,0.5)]"
                : isRespinPrize
                ? "bg-gradient-to-b from-[#0a2538] via-[#061826] to-[#030d17] border-cyan-400/80 shadow-[0_0_50px_rgba(6,182,212,0.5)]"
                : isJackpotPrize
                ? "bg-gradient-to-b from-[#332205] via-[#1a1102] to-[#0c0801] border-yellow-400 shadow-[0_0_60px_rgba(245,158,11,0.8)]"
                : "bg-gradient-to-b from-[#0c1f38] via-[#091526] to-[#07111e] border-emerald-400/60 shadow-[0_0_50px_rgba(16,185,129,0.5)]"
            }`}
          >
            <button
              onClick={() => setWonPrize(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            >
              <RiCloseLine size={20} />
            </button>

            {/* Glowing Icon */}
            <div
              className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl shadow-lg ${
                isBlastPrize
                  ? "bg-red-500/20 border border-red-500 text-red-400 animate-pulse"
                  : isRespinPrize
                  ? "bg-cyan-500/20 border border-cyan-400 text-cyan-300 animate-spin"
                  : isJackpotPrize
                  ? "bg-amber-500/30 border border-yellow-400 text-yellow-300 animate-bounce"
                  : "bg-emerald-500/20 border border-emerald-400 text-emerald-300 animate-bounce"
              }`}
              style={isRespinPrize ? { animationDuration: "3s" } : undefined}
            >
              {isBlastPrize ? "💣" : isRespinPrize ? "🔄" : isJackpotPrize ? "👑" : "🎉"}
            </div>

            <div className="space-y-1">
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${
                  isBlastPrize
                    ? "text-red-400"
                    : isRespinPrize
                    ? "text-cyan-400"
                    : isJackpotPrize
                    ? "text-yellow-400"
                    : "text-emerald-400"
                }`}
              >
                {isBlastPrize
                  ? "RK444 WHEEL BLAST!"
                  : isRespinPrize
                  ? "FREE RESPIN UNLOCKED!"
                  : isJackpotPrize
                  ? "90-DAY MEGA JACKPOT WINNER!"
                  : "CONGRATULATIONS!"}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {isBlastPrize
                  ? "💥 BOOM! Blast!"
                  : isRespinPrize
                  ? "Free Respin Won!"
                  : isJackpotPrize
                  ? "৳500 MEGA JACKPOT!"
                  : "Cash Prize Won!"}
              </h3>
            </div>

            <div
              className={`p-4 rounded-2xl border space-y-1 shadow-inner ${
                isBlastPrize
                  ? "bg-black/50 border-red-500/40 text-red-300"
                  : isRespinPrize
                  ? "bg-black/50 border-cyan-500/40 text-cyan-300"
                  : isJackpotPrize
                  ? "bg-black/50 border-yellow-500/50 text-yellow-400"
                  : "bg-black/50 border-emerald-500/40 text-emerald-300"
              }`}
            >
              <div className="text-2xl font-black">{wonPrize.label}</div>
              <p className="text-[11px] font-bold">
                {isBlastPrize
                  ? "The bomb detonated! Better luck on your next 24-hour spin."
                  : isRespinPrize
                  ? "You get a free bonus spin right now! Click below to spin again!"
                  : wonPrize.type === "CASH"
                  ? `✓ ৳${wonPrize.value} added to your Main Balance (1x Turnover Requirement)`
                  : "✓ Bonus offer unlocked ready on your account!"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setWonPrize(null);
                if (isRespinPrize) {
                  setTimeout(() => handleSpin(), 300);
                }
              }}
              className={`w-full py-3 rounded-xl text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 ${
                isBlastPrize
                  ? "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600"
                  : isRespinPrize
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black"
                  : isJackpotPrize
                  ? "bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-black font-black shadow-yellow-500/40"
                  : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500"
              }`}
            >
              {isRespinPrize ? (
                <>
                  <FaRedo size={12} />
                  <span>Spin Again Right Now!</span>
                </>
              ) : (
                <span>Claim & Continue</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
