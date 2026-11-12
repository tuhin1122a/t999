/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SideNavLayout from "@/components/SideNavLayout";
import TabLayout from "@/components/TabLayout";
import Footer from "@/components/Footer";
import { useGames } from "@/lib/store.zustond";
import { Categories, NetEnt } from "@/types/game";
import { GameCardWithProvider } from "@/components/GameCards";
import GameLoader from "@/components/loader/GameLoader";
import LiveChatTrigger from "@/components/LiveChatTrigger";

import {
  FaCrown,
  FaGem,
  FaTrophy,
  FaGift,
  FaBolt,
  FaShieldHalved,
  FaChevronDown,
  FaChevronUp,
  FaArrowRight,
  FaLock,
  FaCheck,
} from "react-icons/fa6";
import {
  RiCustomerService2Fill,
  RiMoneyDollarCircleFill,
  RiVipCrown2Fill,
} from "react-icons/ri";
import { MdCelebration, MdOutlineSupportAgent } from "react-icons/md";
import { HiSparkles } from "react-icons/hi2";

// VIP Tiers Definition
const VIP_TIERS = [
  {
    level: 1,
    name: "Bronze",
    tag: "Level 1",
    wagerNumber: 10000,
    wager: "10,000",
    cashback: "2%",
    levelBonus: "500 ৳",
    weeklyBonus: "200 ৳",
    gradient: "from-[#8C4A26] via-[#B86B3E] to-[#6E3516]",
    borderColor: "border-[#B86B3E]/50",
    textColor: "text-[#E69B6C]",
    icon: "🥉",
    perks: [
      "2% Weekly Net Cashback",
      "500 BDT Level-Up Bonus",
      "Priority 24/7 Live Support",
      "Ultra-Low 1x Turnover Rules",
    ],
  },
  {
    level: 2,
    name: "Silver",
    tag: "Level 2",
    wagerNumber: 50000,
    wager: "50,000",
    cashback: "5%",
    levelBonus: "2,500 ৳",
    weeklyBonus: "1,000 ৳",
    gradient: "from-[#4B5563] via-[#9CA3AF] to-[#374151]",
    borderColor: "border-[#9CA3AF]/50",
    textColor: "text-[#E5E7EB]",
    icon: "🥈",
    perks: [
      "5% Weekly Net Cashback",
      "2,500 BDT Level-Up Bonus",
      "Express 5-Minute Withdrawals",
      "Special Birthday Cash Drop",
    ],
  },
  {
    level: 3,
    name: "Gold",
    tag: "Level 3",
    wagerNumber: 250000,
    wager: "250,000",
    cashback: "8%",
    levelBonus: "10,000 ৳",
    weeklyBonus: "5,000 ৳",
    gradient: "from-[#B45309] via-[#F59E0B] to-[#78350F]",
    borderColor: "border-[#F59E0B]/60",
    textColor: "text-[#FDE68A]",
    icon: "🥇",
    popular: true,
    perks: [
      "8% Weekly Net Cashback",
      "10,000 BDT Level-Up Bonus",
      "Higher Daily Cashout Cap",
      "Private WhatsApp VIP Agent",
    ],
  },
  {
    level: 4,
    name: "Platinum",
    tag: "Level 4",
    wagerNumber: 1000000,
    wager: "1,000,000",
    cashback: "14%",
    levelBonus: "50,000 ৳",
    weeklyBonus: "25,000 ৳",
    gradient: "from-[#0E7490] via-[#06B6D4] to-[#155E75]",
    borderColor: "border-[#06B6D4]/60",
    textColor: "text-[#A5F3FC]",
    icon: "💎",
    perks: [
      "14% Weekly Net Cashback",
      "50,000 BDT Level-Up Cash",
      "Personal VIP Host 24/7",
      "High-Roller Tournaments Access",
    ],
  },
  {
    level: 5,
    name: "Diamond Elite",
    tag: "Supreme VIP",
    wagerNumber: 5000000,
    wager: "5,000,000",
    cashback: "20%",
    levelBonus: "200,000 ৳",
    weeklyBonus: "100,000 ৳",
    gradient: "from-[#7C3AED] via-[#EC4899] to-[#D97706]",
    borderColor: "border-[#EC4899]/70",
    textColor: "text-[#FBCFE8]",
    icon: "👑",
    elite: true,
    perks: [
      "20% Maximum Weekly Cashback",
      "200,000 BDT Royal Level Bonus",
      "Unlimited Instant Withdrawals",
      "Custom Luxury Gifts & Offline Events",
    ],
  },
];

// VIP Core Privileges
const VIP_PERKS = [
  {
    icon: <RiMoneyDollarCircleFill className="text-emerald-400 text-3xl" />,
    title: "Weekly Cashback up to 20%",
    desc: "Recover your weekly gaming activity with up to 20% automatic cashback credited every Monday at 12:00 PM.",
  },
  {
    icon: <FaGift className="text-yellow-400 text-2xl" />,
    title: "Instant Level-Up Cash Drops",
    desc: "Unlock guaranteed real cash rewards directly into your account every time you level up into a higher VIP tier.",
  },
  {
    icon: <FaBolt className="text-[#3888e9] text-2xl" />,
    title: "Lightning Priority Cashouts",
    desc: "VIP players enjoy express queue withdrawals processed in under 5 minutes with expanded daily transaction caps.",
  },
  {
    icon: <MdCelebration className="text-pink-400 text-3xl" />,
    title: "Birthday & Festive Surprises",
    desc: "Celebrate your birthday and national festivals with exclusive customized bonus vouchers and free spins.",
  },
  {
    icon: <RiCustomerService2Fill className="text-cyan-400 text-3xl" />,
    title: "Personal VIP Concierge",
    desc: "High-tier members receive a private 1-on-1 VIP account manager on WhatsApp & Telegram 24/7.",
  },
  {
    icon: <FaTrophy className="text-amber-400 text-2xl" />,
    title: "Exclusive VIP Tournaments",
    desc: "Compete against fellow high-rollers in exclusive slots and live casino leaderboards with huge prize pools.",
  },
];

// FAQ Items
const VIP_FAQS = [
  {
    q: "How do I become a member of the RK444 VIP Club?",
    a: "Membership is 100% automatic! The moment you register and place your first real-money wager on any game, you are enrolled as a VIP Member. Every bet you place contributes directly to your next VIP tier.",
  },
  {
    q: "When is the Weekly Cashback credited to my account?",
    a: "Weekly cashback is calculated based on your net activity from Monday 00:00 to Sunday 23:59. Your cashback is automatically deposited into your wallet every Monday before 12:00 PM (noon).",
  },
  {
    q: "What is the turnover requirement for VIP Cashback and Level-Up Bonuses?",
    a: "RK444 VIP rewards have an ultra-friendly 1x turnover only! You can withdraw your reward as soon as you have placed wagers equal to the bonus amount.",
  },
  {
    q: "Do I ever lose my VIP level?",
    a: "Once you achieve Bronze, Silver, or Gold status, your level is locked in for life. Higher tiers (Platinum and Diamond) require maintaining active monthly gaming to preserve exclusive concierge benefits.",
  },
];

interface VipApiResponse {
  authenticated: boolean;
  user?: {
    id: string;
    name: string;
    phone: string;
    playerId: string;
  } | null;
  stats?: {
    walletBalance: number;
    totalWagered: number;
    totalWon: number;
    totalDepositAmount: number;
    totalDepositCount: number;
    estimatedCashback: number;
  };
  tier?: {
    level: number;
    name: string;
    tag: string;
    icon: string;
    cashbackRate: string;
    levelBonus: string;
    minWager: number;
    targetWager: number;
    remainingWager: number;
    progressPercent: number;
    nextTierName: string;
  };
}

const VipPage = () => {
  const [vipData, setVipData] = useState<VipApiResponse | null>(null);
  const [loadingVip, setLoadingVip] = useState(true);
  const [selectedTier, setSelectedTier] = useState<number>(3); // Default Gold preview
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchGame, setSearchGame] = useState("");
  const [hotGamesFallback, setHotGamesFallback] = useState<NetEnt[]>([]);

  // Fetch real VIP status from backend
  useEffect(() => {
    let isMounted = true;
    fetch("/api/vip/status", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        setVipData(data);
        if (data.tier?.level && data.tier.level > 0) {
          setSelectedTier(data.tier.level);
        }
      })
      .catch((err) => console.error("Error fetching VIP status:", err))
      .finally(() => {
        if (isMounted) setLoadingVip(false);
      });

    // Fallback games
    fetch("/api/games/hot", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        if (Array.isArray(data.games)) {
          setHotGamesFallback(data.games);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Load VIP / High Roller games from Zustand store
  const { getGames } = useGames((state) => state);
  const videoPokerGames = getGames(Categories.VideoPoker, searchGame, 12) || [];
  const slotGames = getGames(Categories.Slots, searchGame, 12) || [];

  // Combine or fallback to real games
  const displayGames: NetEnt[] =
    videoPokerGames.length > 0
      ? videoPokerGames
      : hotGamesFallback.length > 0
      ? hotGamesFallback.filter((g) =>
          searchGame ? (g.title || (g as any).game_name || "").toLowerCase().includes(searchGame.toLowerCase()) : true
        ).slice(0, 12)
      : slotGames;

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const handleSelectTier = (lvl: number) => {
    setSelectedTier(lvl);
    if (typeof document !== "undefined") {
      const el = document.getElementById(`tier-card-${lvl}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  };

  const user = vipData?.user;
  const stats = vipData?.stats;
  const userTier = vipData?.tier;
  const isAuthenticated = vipData?.authenticated === true;

  return (
    <SideNavLayout>
      <TabLayout>
        <SiteHeader title="VIP Club Lounge" fallbackUrl="/">
          <LiveChatTrigger
            fallbackHref="/support"
            title="VIP Host & Support"
            ariaLabel="VIP Host & Support"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#14263d] hover:bg-[#1e395b] active:scale-95 text-[#3888e9] hover:text-white border border-[#234267] transition-all cursor-pointer relative"
          >
            <MdOutlineSupportAgent className="text-xl" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-[#0a1626]" />
          </LiveChatTrigger>
        </SiteHeader>

        <main className="min-h-screen bg-[#070e17] text-white px-2.5 sm:px-4 py-3 sm:py-6 space-y-6 sm:space-y-8 pb-28 md:pb-14 max-w-6xl mx-auto">
          {/* ══════════════════════════════════════════════════════════════════
              1. HERO BANNER & REAL PLAYER VIP CARD
          ══════════════════════════════════════════════════════════════════ */}
          <div className="relative rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-8 bg-gradient-to-br from-[#0c1b30] via-[#10243d] to-[#081324] border border-[#1d3d66] shadow-xl overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#3888e9]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 items-stretch lg:items-center">
              {/* Top on Mobile (Right on Desktop): Real Player VIP Status Card */}
              <div className="w-full lg:col-span-5 lg:order-2">
                <div className="rounded-xl sm:rounded-2xl p-3.5 sm:p-5 bg-gradient-to-b from-[#132845] to-[#0a172a] border border-yellow-500/40 shadow-xl space-y-3 sm:space-y-4">
                  {isAuthenticated && user ? (
                    <>
                      {/* Authenticated Player Header */}
                      <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-[#1b3558]">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center text-white text-base sm:text-lg font-black shadow-md shadow-yellow-500/20 flex-shrink-0">
                            {userTier?.icon || "👑"}
                          </div>
                          <div>
                            <div className="text-[11px] sm:text-xs text-gray-400 font-medium">VIP Member</div>
                            <div className="text-xs sm:text-sm font-black text-white truncate max-w-[140px] xs:max-w-[180px] sm:max-w-[200px]">
                              {user.name || user.phone}
                            </div>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-[10px] sm:text-[11px] font-black uppercase tracking-wider whitespace-nowrap">
                          {userTier ? `${userTier.name} ${userTier.icon}` : "Bronze VIP"}
                        </span>
                      </div>

                      {/* Real Progress to Next Tier */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-gray-300">Level Progress</span>
                          <span className="text-yellow-400 font-mono text-[11px] sm:text-xs">
                            {userTier ? `${userTier.progressPercent}% to ${userTier.nextTierName}` : "0% Progress"}
                          </span>
                        </div>
                        <div className="w-full h-2 sm:h-2.5 rounded-full bg-[#081220] overflow-hidden border border-[#183454]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 transition-all duration-700"
                            style={{ width: `${userTier?.progressPercent || 0}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] sm:text-[11px] text-gray-400 pt-0.5 font-mono">
                          <span>Wagered: {(stats?.totalWagered || 0).toLocaleString()} ৳</span>
                          <span>Next: {(userTier?.targetWager || 10000).toLocaleString()} ৳</span>
                        </div>
                      </div>

                      {/* Real Live Stats Grid */}
                      <div className="grid grid-cols-2 gap-2 pt-0.5 text-xs">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-[#071322] border border-[#183454]">
                          <span className="text-gray-400 text-[9px] sm:text-[10px] uppercase font-bold block">Wallet Balance</span>
                          <span className="text-white font-black text-xs sm:text-sm">
                            {(stats?.walletBalance || 0).toLocaleString()} ৳
                          </span>
                        </div>
                        <div className="p-2 sm:p-2.5 rounded-xl bg-[#071322] border border-[#183454]">
                          <span className="text-gray-400 text-[9px] sm:text-[10px] uppercase font-bold block">Cashback Rate</span>
                          <span className="text-emerald-400 font-black text-xs sm:text-sm">
                            {userTier?.cashbackRate || "2%"} Weekly
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-0.5 flex items-center gap-2">
                        <Link
                          href="/deposit"
                          className="flex-1 py-2 sm:py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs text-center shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                          Deposit & Boost
                        </Link>
                        <LiveChatTrigger
                          fallbackHref="/support"
                          className="flex-1 py-2 sm:py-2.5 px-3 rounded-xl bg-[#091524] hover:bg-[#122842] border border-[#1c385c] text-gray-200 text-xs font-bold text-center active:scale-95 transition-all cursor-pointer"
                        >
                          Claim VIP Perk
                        </LiveChatTrigger>
                      </div>
                    </>
                  ) : (
                    /* Guest View */
                    <div className="space-y-3 text-center py-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center text-xl shadow-lg shadow-yellow-500/20">
                        👑
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm sm:text-base font-black text-white">Join the Elite VIP Club</h3>
                        <p className="text-[11px] sm:text-xs text-gray-300 font-medium">
                          Log in to view your real wagering progress, weekly cashback rate, and unlocked tier rewards.
                        </p>
                      </div>

                      <div className="pt-1 flex items-center gap-2">
                        <Link
                          href="/login?redirect=/vip"
                          className="flex-1 py-2 sm:py-2.5 px-3 rounded-xl bg-[#3888e9] hover:bg-[#2b78d6] text-white font-black text-xs text-center shadow-md active:scale-95 transition-all"
                        >
                          Log In
                        </Link>
                        <Link
                          href="/register?redirect=/vip"
                          className="flex-1 py-2 sm:py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs text-center shadow-md active:scale-95 transition-all"
                        >
                          Register Free
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom on Mobile (Left on Desktop): Headline & Club Overview */}
              <div className="w-full lg:col-span-7 lg:order-1 space-y-2.5 sm:space-y-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] sm:text-xs font-extrabold uppercase tracking-widest shadow-sm">
                  <FaCrown className="text-yellow-400 text-xs sm:text-sm animate-pulse" />
                  <span>RK444 ROYAL VIP CLUB</span>
                </div>

                <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                  Play Like Royalty.{" "}
                  <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                    Earn Infinite Rewards.
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                  Step inside Bangladesh’s most prestigious VIP lounge. Enjoy up to{" "}
                  <strong className="text-white">20% Weekly Cashback</strong>, instant level cash drops, priority 5-min withdrawals, and a personal 24/7 VIP concierge.
                </p>

                {/* Quick stats pills (Clean 3-col on Mobile) */}
                <div className="grid grid-cols-3 gap-1.5 pt-0.5 sm:flex sm:flex-wrap sm:gap-2 text-[10px] sm:text-xs">
                  <div className="flex items-center justify-center sm:justify-start gap-1 py-1.5 px-2 rounded-xl bg-[#091524] border border-[#1b385c]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                    <span className="text-gray-300 font-bold truncate">20% Cashback</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1 py-1.5 px-2 rounded-xl bg-[#091524] border border-[#1b385c]">
                    <HiSparkles className="text-yellow-400 text-xs flex-shrink-0" />
                    <span className="text-gray-300 font-bold truncate">200K Bonus</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1 py-1.5 px-2 rounded-xl bg-[#091524] border border-[#1b385c]">
                    <FaBolt className="text-[#3888e9] text-[10px] flex-shrink-0" />
                    <span className="text-gray-300 font-bold truncate">5m Fast Pay</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              2. VIP TIERS & REWARDS PROGRESSION (WITH REAL USER UNLOCK STATE)
          ══════════════════════════════════════════════════════════════════ */}
          <section className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FaTrophy className="text-yellow-400 text-base sm:text-lg" />
                  VIP Tier Progression & Criteria
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-400 font-medium">
                  {isAuthenticated
                    ? `Your current wagered volume: ${(stats?.totalWagered || 0).toLocaleString()} ৳. Inspect each level's perks below.`
                    : "Automatic promotion based on your total real-money betting volume."}
                </p>
              </div>

              {/* Tier selector chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto -mx-1 px-1 sm:mx-0 sm:px-0">
                {VIP_TIERS.map((t) => (
                  <button
                    key={t.level}
                    type="button"
                    onClick={() => handleSelectTier(t.level)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black whitespace-nowrap transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1 ${
                      selectedTier === t.level
                        ? "bg-[#3888e9] text-white shadow-md shadow-[#3888e9]/30 border border-[#3888e9]"
                        : "bg-[#0a1626] text-gray-300 hover:text-white border border-[#183454] hover:bg-[#11243d]"
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span>{t.name}</span>
                    {userTier && userTier.level >= t.level && (
                      <span className="text-[9px] text-emerald-400 font-bold ml-0.5">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile swipe hint */}
            <div className="flex sm:hidden items-center justify-between text-[11px] text-gray-400 px-0.5">
              <span className="text-yellow-400/90 font-bold">👆 Swipe cards sideways</span>
              <span className="text-gray-400 text-[10px]">5 VIP Tiers</span>
            </div>

            {/* 5 Tiers: Smooth Horizontal Swipeable Carousel on Mobile, Grid on Tablet/Desktop */}
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-3.5 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 snap-x snap-mandatory scroll-smooth no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
              {VIP_TIERS.map((tier) => {
                const isSelected = selectedTier === tier.level;
                const isUnlocked = userTier ? userTier.level >= tier.level : false;
                const isNextTier = userTier ? userTier.level === tier.level - 1 : false;

                return (
                  <div
                    key={tier.level}
                    id={`tier-card-${tier.level}`}
                    onClick={() => handleSelectTier(tier.level)}
                    className={`relative rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 active:scale-98 w-[78vw] max-w-[280px] flex-shrink-0 snap-center sm:w-auto ${
                      isSelected
                        ? "bg-gradient-to-b from-[#112845] to-[#091729] border-2 border-[#3888e9] shadow-xl shadow-[#3888e9]/20 -translate-y-0.5"
                        : "bg-[#091524] border border-[#152e4c] hover:border-[#3888e9]/50 hover:bg-[#0d1e34]"
                    }`}
                  >
                    {/* Badge */}
                    {isUnlocked && (
                      <span className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <FaCheck size={8} /> Unlocked
                      </span>
                    )}
                    {tier.popular && !isUnlocked && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-[9px] font-black uppercase tracking-wider shadow-sm">
                        Most Popular
                      </span>
                    )}
                    {tier.elite && !isUnlocked && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                        Royal Elite
                      </span>
                    )}

                    <div>
                      {/* Tier Icon & Title */}
                      <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#06101c] border border-[#1a385c] flex items-center justify-center text-lg sm:text-xl shadow-inner">
                          {tier.icon}
                        </div>
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                          {tier.tag}
                        </span>
                      </div>

                      <h3 className={`text-base font-black ${tier.textColor} tracking-tight`}>
                        {tier.name} VIP
                      </h3>

                      <div className="mt-2 space-y-1.5 py-2 sm:py-2.5 border-y border-[#162e4a] text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium">Weekly Cashback:</span>
                          <span className="font-black text-emerald-400">{tier.cashback}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium">Level-Up Bonus:</span>
                          <span className="font-black text-yellow-400">{tier.levelBonus}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium">Required Wager:</span>
                          <span className="font-extrabold text-white">{tier.wager} ৳</span>
                        </div>
                      </div>

                      {/* Key Perks */}
                      <ul className="mt-2.5 space-y-1 text-[11px] text-gray-300">
                        {tier.perks.map((p, pIdx) => (
                          <li key={pIdx} className="flex items-center gap-1.5">
                            <span className="text-emerald-400 text-xs flex-shrink-0">✓</span>
                            <span className="truncate">{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 mt-1.5">
                      <div
                        className={`w-full py-1.5 sm:py-2 rounded-xl text-center text-[10px] sm:text-[11px] font-black transition-all ${
                          isUnlocked
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : isNextTier
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                            : isSelected
                            ? "bg-[#3888e9] text-white shadow-sm"
                            : "bg-[#06101c] text-gray-400 border border-[#162e4a]"
                        }`}
                      >
                        {isUnlocked
                          ? "Current Status ✓"
                          : isNextTier
                          ? "Next Target 🎯"
                          : isSelected
                          ? "Active Preview"
                          : "View Tier"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════
              3. VIP CORE PRIVILEGES & BENEFITS GRID
          ══════════════════════════════════════════════════════════════════ */}
          <section className="space-y-3 sm:space-y-4">
            <div>
              <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FaGem className="text-[#3888e9] text-base sm:text-lg" />
                Exclusive VIP Privileges
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-400 font-medium">
                Standard players gamble. RK444 VIP members get rewarded on every move.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3.5">
              {VIP_PERKS.map((perk, idx) => (
                <div
                  key={idx}
                  className="rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-[#091524] border border-[#162e4a] hover:border-[#3888e9]/50 transition-all duration-200 group shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2 sm:space-y-2.5">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[#06101c] border border-[#1b385a] flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                      {perk.icon}
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-white tracking-wide group-hover:text-[#3888e9] transition-colors leading-snug">
                      {perk.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed font-medium line-clamp-2 sm:line-clamp-none">
                      {perk.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════
              4. REAL VIP HIGH-ROLLER GAMES SHOWCASE
          ══════════════════════════════════════════════════════════════════ */}
          <section className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
              <div>
                <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <RiVipCrown2Fill className="text-yellow-400 text-lg sm:text-xl" />
                  VIP High-Roller Games & Tables
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-400 font-medium">
                  High-stakes certified slots, live VIP blackjack, and private tables.
                </p>
              </div>

              {/* Game search input */}
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search VIP Games..."
                  value={searchGame}
                  onChange={(e) => setSearchGame(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#0a1626] border border-[#193558] text-white placeholder-gray-500 focus:outline-none focus:border-[#3888e9] transition-all"
                />
              </div>
            </div>

            {/* Games Grid with real playable games */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-2.5">
              {displayGames && displayGames.length > 0 ? (
                displayGames.map((game, i) => (
                  <GameCardWithProvider game={game} key={game.id || i} index={i} />
                ))
              ) : (
                <GameLoader length={6} loading={true} category="slots" />
              )}
            </div>

            {displayGames && displayGames.length === 0 && (
              <div className="text-center py-8 sm:py-10 bg-[#091524] border border-[#162e4a] rounded-2xl space-y-2">
                <p className="text-xs sm:text-sm font-bold text-gray-300">No VIP games match your search</p>
                <button
                  type="button"
                  onClick={() => setSearchGame("")}
                  className="text-xs text-[#3888e9] font-bold hover:underline"
                >
                  Clear search and show all VIP games
                </button>
              </div>
            )}
          </section>

          {/* ══════════════════════════════════════════════════════════════════
              5. VIP FAQ ACCORDION
          ══════════════════════════════════════════════════════════════════ */}
          <section className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
            <div>
              <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FaShieldHalved className="text-emerald-400 text-base sm:text-lg" />
                VIP Club Rules & Questions
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-400 font-medium">
                Everything you need to know about level-ups, cashback calculations, and rewards.
              </p>
            </div>

            <div className="space-y-2">
              {VIP_FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#162e4a] bg-[#091524] overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-white hover:text-[#3888e9] transition-colors"
                    >
                      <span>{faq.q}</span>
                      <span className="text-gray-400 text-xs">
                        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-1 text-xs text-gray-300 leading-relaxed border-t border-[#12263d] font-medium bg-[#06101c]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════
              6. ROYAL CTA BANNER
          ══════════════════════════════════════════════════════════════════ */}
          <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-8 bg-gradient-to-r from-emerald-950/60 via-[#0a1e36] to-[#0c182b] border border-emerald-500/40 text-center space-y-3 sm:space-y-4 shadow-xl">
            <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              Ready to Claim Your VIP Throne?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-lg mx-auto font-medium">
              Start playing with real money now. Your bets automatically count towards your next level-up cash drop and weekly cashback!
            </p>
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3">
              <Link
                href="/deposit"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
              >
                <span>Deposit & Boost VIP Level</span>
                <FaArrowRight size={13} />
              </Link>
              <LiveChatTrigger
                fallbackHref="/support"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl bg-[#0e2238] hover:bg-[#153456] border border-[#23456c] text-gray-200 font-bold text-xs sm:text-sm active:scale-95 transition-all cursor-pointer"
              >
                <RiCustomerService2Fill className="text-[#3888e9] text-base" />
                <span>Talk with VIP Host</span>
              </LiveChatTrigger>
            </div>
          </div>
        </main>

        <Footer showPaymentMethods={false} />
      </TabLayout>
    </SideNavLayout>
  );
};

export default VipPage;
