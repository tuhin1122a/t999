/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { promotions as fallbackPromotions, PromotionItem } from "../../../data/promotions";
import {
  FaGift,
  FaArrowRight,
  FaBolt,
  FaTag,
  FaCheckCircle,
  FaCrown,
  FaUserFriends,
  FaLock,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { MdOutlineLocalOffer, MdCelebration } from "react-icons/md";
import { RiMoneyDollarCircleFill } from "react-icons/ri";

const CATEGORIES = [
  { id: "all", label: "All Offers" },
  { id: "welcome", label: "Welcome Bonus" },
  { id: "sports", label: "Sports & Cricket" },
  { id: "slots", label: "Slots & Crash" },
  { id: "live", label: "Live Casino" },
  { id: "reload", label: "Deposit Reload" },
  { id: "cashback", label: "Cashback" },
  { id: "referral", label: "Refer & Earn" },
];

interface PromotionWithRealData extends PromotionItem {
  userStatus?: "GUEST" | "ELIGIBLE" | "AVAILABLE" | "CLAIMED";
  statusBadge?: string;
  statusBadgeColor?: string;
  actionUrl?: string;
  actionLabel?: string;
}

interface PromotionsApiResponse {
  authenticated: boolean;
  user?: {
    id: string;
    name: string;
    phone: string;
    playerId: string;
    referId: string;
  } | null;
  stats?: {
    totalBonusReceived: number;
    depositCount: number;
    totalDepositAmount: number;
    walletBalance: number;
    isFirstDepositEligible: boolean;
    referredCount: number;
    vipTierName: string;
    vipCashbackRate: string;
  };
  bonusSettings?: {
    signinBonusPercent: number;
    referralBonusPercent: number;
  };
  promotions: PromotionWithRealData[];
}

const PromotionList = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [data, setData] = useState<PromotionsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/promotions", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!isMounted || !json) return;
        setData(json);
      })
      .catch((err) => console.error("Error fetching promotions:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const promoList: PromotionWithRealData[] =
    data?.promotions && data.promotions.length > 0
      ? data.promotions
      : fallbackPromotions;

  const filteredPromotions =
    activeTab === "all"
      ? promoList
      : promoList.filter((p) => p.category === activeTab);

  const isAuthenticated = data?.authenticated === true;
  const user = data?.user;
  const stats = data?.stats;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ── Top Player Promotions Dashboard Card ──────────────────────── */}
      <div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-7 bg-gradient-to-r from-[#0c1a2d] via-[#10243d] to-[#0a1728] border border-[#1a385c] shadow-xl overflow-hidden">
        {/* Glows */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#3888e9]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                <HiSparkles className="text-xs sm:text-sm animate-pulse" />
                <span>RK444 BONUS & REWARD HUB</span>
              </div>

              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                Claim Real Casino Bonuses
              </h1>

              <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed font-medium">
                Supercharge your gameplay with live deposit matches, instant reload bonuses, and automated weekly cashback with friendly 1x turnover.
              </p>
            </div>

            {/* Quick Deposit Button on Desktop */}
            <div className="hidden sm:block">
              <Link
                href="/deposit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>Deposit & Claim Bonus</span>
                <FaArrowRight size={11} />
              </Link>
            </div>
          </div>

          {/* Real Live Stats Card */}
          {isAuthenticated && user ? (
            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-[#071322]/90 border border-[#19365a] backdrop-blur-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#142d4a]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center text-white text-base font-black shadow-md shadow-yellow-500/20">
                    👑
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Player Bonus Account
                    </div>
                    <div className="text-xs sm:text-sm font-black text-white">
                      {user.name || user.phone}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-cyan-300 font-bold text-[11px]">
                    VIP {stats?.vipTierName || "Member"} · {stats?.vipCashbackRate || "1%"} Cashback
                  </span>
                  <Link
                    href="/deposit"
                    className="sm:hidden px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs active:scale-95 transition-all"
                  >
                    Deposit Now
                  </Link>
                </div>
              </div>

              {/* 4 Real Stats Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs">
                <div className="p-2 sm:p-2.5 rounded-xl bg-[#0a182b] border border-[#163354]">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block truncate">
                    Total Bonus Earned
                  </span>
                  <span className="text-yellow-400 font-black text-sm">
                    {(stats?.totalBonusReceived || 0).toLocaleString()} ৳
                  </span>
                </div>

                <div className="p-2 sm:p-2.5 rounded-xl bg-[#0a182b] border border-[#163354]">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block truncate">
                    1st Deposit 100%
                  </span>
                  <span
                    className={`font-black text-sm ${
                      stats?.isFirstDepositEligible ? "text-emerald-400" : "text-gray-400"
                    }`}
                  >
                    {stats?.isFirstDepositEligible ? "Ready to Claim 🎁" : "Claimed ✓"}
                  </span>
                </div>

                <div className="p-2 sm:p-2.5 rounded-xl bg-[#0a182b] border border-[#163354]">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block truncate">
                    Wallet Balance
                  </span>
                  <span className="text-white font-black text-sm">
                    {(stats?.walletBalance || 0).toLocaleString()} ৳
                  </span>
                </div>

                <div className="p-2 sm:p-2.5 rounded-xl bg-[#0a182b] border border-[#163354]">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block truncate">
                    Referred Players
                  </span>
                  <span className="text-purple-400 font-black text-sm">
                    {stats?.referredCount || 0} Friends
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Guest Prompt */
            <div className="rounded-xl sm:rounded-2xl p-3.5 sm:p-4 bg-[#071322]/80 border border-[#19365a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                  <span className="text-yellow-400">🎁</span>
                  <span>New Member? Double Your First Deposit!</span>
                </div>
                <p className="text-[11px] sm:text-xs text-gray-300 font-medium">
                  Log in or register free to activate your 100% Welcome Match and track claimable rewards.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/login?redirect=/promotion"
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#3888e9] hover:bg-[#2873d1] text-white text-xs font-black text-center shadow-md active:scale-95 transition-all"
                >
                  Log In
                </Link>
                <Link
                  href="/register?redirect=/promotion"
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-xs font-black text-center shadow-md active:scale-95 transition-all whitespace-nowrap"
                >
                  Register Free
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Category Filter Tabs ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0">
        {CATEGORIES.map((tab) => {
          const isSelected = activeTab === tab.id;
          const count =
            tab.id === "all"
              ? promoList.length
              : promoList.filter((p) => p.category === tab.id).length;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? "bg-[#3888e9] text-white shadow-md shadow-[#3888e9]/30 border border-[#3888e9]"
                  : "bg-[#0a1626] text-gray-300 hover:text-white border border-[#183454] hover:bg-[#102238]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isSelected ? "bg-white/20 text-white" : "bg-[#142842] text-gray-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Promotions Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6">
        {filteredPromotions.map((promo) => (
          <PromotionCard
            key={promo.id}
            promo={promo}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>

      {filteredPromotions.length === 0 && (
        <div className="text-center py-10 bg-[#0a1626] border border-[#162e4a] rounded-2xl space-y-2">
          <p className="text-xs sm:text-sm font-bold text-gray-300">
            No promotions available in this category
          </p>
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className="text-xs text-[#3888e9] font-bold hover:underline"
          >
            Show all available promotions
          </button>
        </div>
      )}

      {/* ── Friendly Rule Strip ────────────────────────────────────────── */}
      <div className="rounded-2xl p-4 bg-[#0a1626] border border-[#162e4a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FaCheckCircle />
          </div>
          <p className="text-gray-300 font-medium">
            All RK444 bonuses feature <strong className="text-white">fair 1x turnover rules</strong>. Zero hidden traps, instant cash drops!
          </p>
        </div>

        <Link
          href="/support"
          className="text-[#3888e9] hover:underline font-bold whitespace-nowrap self-end sm:self-auto"
        >
          Have questions? Talk to 24/7 VIP Host →
        </Link>
      </div>
    </div>
  );
};

export default PromotionList;

// Individual Promotion Card with Real Eligibility State
export const PromotionCard = ({
  promo,
  isAuthenticated,
}: {
  promo: PromotionWithRealData;
  isAuthenticated?: boolean;
}) => {
  const actionHref = promo.actionUrl || "/deposit";
  const actionText = promo.actionLabel || "Claim Now";

  return (
    <div className="group rounded-2xl bg-[#0a1626] border border-[#162e4a] hover:border-[#3888e9]/60 shadow-lg overflow-hidden transition-all duration-300 flex flex-col justify-between">
      {/* Banner Image Container */}
      <div className="relative w-full aspect-[16/8] sm:aspect-[16/7] overflow-hidden bg-[#06101c]">
        <Image
          src={promo.image}
          alt={promo.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1626] via-transparent to-black/30" />

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3 sm:left-3 sm:right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
            {promo.context}
          </span>

          {promo.badge && (
            <span
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg font-black text-[9px] sm:text-[10px] uppercase tracking-wider shadow-md ${
                promo.badgeColor || "bg-yellow-500 text-black"
              }`}
            >
              {promo.badge}
            </span>
          )}
        </div>

        {/* Real User Live Status Pill on bottom left of image */}
        {promo.statusBadge && (
          <div className="absolute bottom-2 left-2.5">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md ${
                promo.statusBadgeColor || "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50"
              }`}
            >
              {promo.statusBadge}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
        <div className="space-y-1.5 sm:space-y-2">
          <h3 className="text-sm sm:text-base md:text-lg font-black text-white group-hover:text-[#3888e9] transition-colors line-clamp-1">
            {promo.title}
          </h3>

          <p className="text-[11px] sm:text-xs text-gray-400 line-clamp-2 leading-relaxed font-medium">
            {promo.description}
          </p>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-bold text-gray-300 pt-0.5">
          {promo.minDeposit && (
            <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-[#06101c] border border-[#162e4a]">
              <span className="text-gray-400">Min:</span>
              <span className="text-white font-extrabold">{promo.minDeposit}</span>
            </div>
          )}
          {promo.turnover && (
            <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-[#06101c] border border-[#162e4a]">
              <span className="text-gray-400">Turnover:</span>
              <span className="text-emerald-400 font-extrabold">{promo.turnover}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2 border-t border-[#132840]">
          <Link
            href={`/promotion/${promo.id}`}
            className="flex-1 py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl bg-[#0f223a] hover:bg-[#16355b] border border-[#1e426d] text-white font-extrabold text-[11px] sm:text-xs text-center flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <span>Terms & Rules</span>
            <FaArrowRight size={10} className="text-[#3888e9]" />
          </Link>

          <Link
            href={actionHref}
            className="py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-[11px] sm:text-xs text-center shadow-md shadow-emerald-500/20 active:scale-95 transition-all whitespace-nowrap"
          >
            {actionText}
          </Link>
        </div>
      </div>
    </div>
  );
};
