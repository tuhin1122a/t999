"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  RiGamepadFill,
  RiGamepadLine,
  RiHome5Fill,
  RiHome5Line,
  RiTrophyFill,
  RiTrophyLine,
  RiUser3Fill,
  RiUser3Line,
  RiVipCrownFill,
} from "react-icons/ri";

const TabNav = () => {
  const pathname = usePathname();

  // Active route checks
  const isHome = pathname === "/";
  const isGames =
    pathname === "/slots" ||
    pathname === "/slot" ||
    pathname.startsWith("/games") ||
    pathname.startsWith("/hot") ||
    pathname.startsWith("/play") ||
    pathname.startsWith("/sportss");
  const isCenter = pathname.startsWith("/invite-friends");
  const isRewards =
    pathname.startsWith("/rewardCenter") ||
    pathname.startsWith("/reward") ||
    pathname.startsWith("/promotion");
  const isProfile =
    pathname.startsWith("/member") ||
    pathname.startsWith("/vip") ||
    pathname.startsWith("/deposit") ||
    pathname.startsWith("/withdraw");

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed inset-x-0 bottom-0 z-[999] pointer-events-none flex justify-center pb-[env(safe-area-inset-bottom,6px)] mb-1 px-3 select-none"
    >
      <div className="w-full max-w-[460px] pointer-events-auto">
        <div className="relative flex items-center justify-between h-[60px] px-2 bg-[#0a1626]/95 border border-[#1c3656] rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.85)] backdrop-blur-xl">

          {/* ── 1. HOME ────────────────────────────────────────────────────── */}
          <Link
            href="/"
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-200 active:scale-90 ${
              isHome ? "text-[#3888e9]" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <div className="relative flex items-center justify-center">
              {isHome ? (
                <RiHome5Fill size={21} className="transition-transform scale-110 drop-shadow-[0_0_8px_rgba(56,136,233,0.5)]" />
              ) : (
                <RiHome5Line size={21} />
              )}
            </div>
            <span className={`text-[10px] font-bold tracking-tight mt-0.5 ${isHome ? "text-white" : ""}`}>
              Home
            </span>
            {isHome && (
              <span className="w-1 h-1 rounded-full bg-[#3888e9] shadow-[0_0_6px_#3888e9] mt-0.5" />
            )}
          </Link>

          {/* ── 2. CASINO & GAMES ──────────────────────────────────────────── */}
          <Link
            href="/slots"
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-200 active:scale-90 ${
              isGames ? "text-[#3888e9]" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <div className="relative flex items-center justify-center">
              {isGames ? (
                <RiGamepadFill size={21} className="transition-transform scale-110 drop-shadow-[0_0_8px_rgba(56,136,233,0.5)]" />
              ) : (
                <RiGamepadLine size={21} />
              )}
            </div>
            <span className={`text-[10px] font-bold tracking-tight mt-0.5 ${isGames ? "text-white" : ""}`}>
              Casino
            </span>
            {isGames && (
              <span className="w-1 h-1 rounded-full bg-[#3888e9] shadow-[0_0_6px_#3888e9] mt-0.5" />
            )}
          </Link>

          {/* ── 3. CENTER HERO (VIP BONUS / INVITE) ────────────────────────── */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <Link
              href="/invite-friends"
              className="relative -top-4 flex flex-col items-center group active:scale-90 transition-transform"
              title="VIP Bonus & Referrals"
            >
              <div
                className={`w-12 h-12 rounded-full p-[2px] transition-all shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center ${
                  isCenter
                    ? "bg-gradient-to-tr from-[#3888e9] to-[#10b981]"
                    : "bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-600"
                }`}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-b from-[#142842] to-[#07111e] flex items-center justify-center text-yellow-400 group-hover:text-yellow-300">
                  <RiVipCrownFill size={22} className="animate-pulse" />
                </div>
              </div>
              <span className="text-[10px] font-black text-yellow-400 tracking-tight mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                Bonus
              </span>
            </Link>
          </div>

          {/* ── 4. REWARDS & PROMO ─────────────────────────────────────────── */}
          <Link
            href="/promotion"
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-200 active:scale-90 ${
              isRewards ? "text-[#3888e9]" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <div className="relative flex items-center justify-center">
              {isRewards ? (
                <RiTrophyFill size={21} className="transition-transform scale-110 drop-shadow-[0_0_8px_rgba(56,136,233,0.5)]" />
              ) : (
                <RiTrophyLine size={21} />
              )}
            </div>
            <span className={`text-[10px] font-bold tracking-tight mt-0.5 ${isRewards ? "text-white" : ""}`}>
              Promo
            </span>
            {isRewards && (
              <span className="w-1 h-1 rounded-full bg-[#3888e9] shadow-[0_0_6px_#3888e9] mt-0.5" />
            )}
          </Link>

          {/* ── 5. PROFILE & MEMBER ────────────────────────────────────────── */}
          <Link
            href="/member"
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-200 active:scale-90 ${
              isProfile ? "text-[#3888e9]" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <div className="relative flex items-center justify-center">
              {isProfile ? (
                <RiUser3Fill size={21} className="transition-transform scale-110 drop-shadow-[0_0_8px_rgba(56,136,233,0.5)]" />
              ) : (
                <RiUser3Line size={21} />
              )}
            </div>
            <span className={`text-[10px] font-bold tracking-tight mt-0.5 ${isProfile ? "text-white" : ""}`}>
              Profile
            </span>
            {isProfile && (
              <span className="w-1 h-1 rounded-full bg-[#3888e9] shadow-[0_0_6px_#3888e9] mt-0.5" />
            )}
          </Link>

        </div>
      </div>
    </nav>
  );
};

export default TabNav;
