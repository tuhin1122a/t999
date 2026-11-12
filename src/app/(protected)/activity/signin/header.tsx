/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Link from "next/link";
import { FaCrown, FaGift, FaWallet, FaCheckCircle } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

interface HeaderProps {
  playerId?: string;
  userName?: string;
  balance: number;
  lastSigninBonus: number;
  totalSigninBonus: number;
  isAuthenticated: boolean;
}

const Header = ({
  playerId,
  userName,
  balance,
  lastSigninBonus,
  totalSigninBonus,
  isAuthenticated,
}: HeaderProps) => {
  return (
    <div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-7 bg-gradient-to-r from-[#0c1a2d] via-[#10243d] to-[#0a1728] border border-[#1a385c] shadow-xl overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#3888e9]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Top Header Badge & Title */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] sm:text-xs font-black uppercase tracking-wider">
            <HiSparkles className="text-xs sm:text-sm animate-pulse" />
            <span>DAILY STREAK REWARDS</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            7-Day Check-in Challenge
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed font-medium">
            Sign in and complete your daily deposit mission to unlock cash drops every day. Keep your streak alive to reach the Day 7 Mega Reward!
          </p>
        </div>

        {/* Real Live Player Stats Ribbon */}
        {isAuthenticated ? (
          <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-[#071322]/90 border border-[#19365a] backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#142d4a]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center text-white text-base font-black shadow-md shadow-yellow-500/20">
                  👑
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Member Streak Account
                  </div>
                  <div className="text-xs sm:text-sm font-black text-white">
                    {userName || playerId || "VIP Member"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/deposit"
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  Deposit to Unlock
                </Link>
              </div>
            </div>

            {/* 3 Real Stats Pills */}
            <div className="grid grid-cols-3 gap-2 pt-3 text-xs">
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#0a182b] border border-[#163354]">
                <span className="text-gray-400 text-[9px] sm:text-[10px] uppercase font-bold block truncate">
                  Wallet Balance
                </span>
                <span className="text-white font-black text-xs sm:text-sm">
                  ৳ {balance.toLocaleString()}
                </span>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-[#0a182b] border border-[#163354]">
                <span className="text-gray-400 text-[9px] sm:text-[10px] uppercase font-bold block truncate">
                  Last Check-in
                </span>
                <span className="text-emerald-400 font-black text-xs sm:text-sm">
                  ৳ {lastSigninBonus}
                </span>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-[#0a182b] border border-[#163354]">
                <span className="text-gray-400 text-[9px] sm:text-[10px] uppercase font-bold block truncate">
                  Total Earned
                </span>
                <span className="text-yellow-400 font-black text-xs sm:text-sm">
                  ৳ {totalSigninBonus}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Guest CTA Banner */
          <div className="rounded-xl sm:rounded-2xl p-3.5 sm:p-4 bg-[#071322]/80 border border-[#19365a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                <span className="text-yellow-400">🎁</span>
                <span>Log In to Start Your 7-Day Cash Streak</span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-300 font-medium">
                New players can claim up to 7 consecutive daily bonuses with low 1x turnover rules.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/login?redirect=/activity/signin"
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#3888e9] hover:bg-[#2873d1] text-white text-xs font-black text-center shadow-md active:scale-95 transition-all"
              >
                Log In
              </Link>
              <Link
                href="/register?redirect=/activity/signin"
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-xs font-black text-center shadow-md active:scale-95 transition-all whitespace-nowrap"
              >
                Register Free
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
