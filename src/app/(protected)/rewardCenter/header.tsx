/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaCopy, FaCheck, FaCrown, FaArrowUp, FaArrowDown } from "react-icons/fa6";
import { FiRefreshCw } from "react-icons/fi";
import useCurrentUser from "@/hook/useCurrentUser";
import { useFetchWalletQuery } from "@/lib/features/walletApiSlice";
import { getCurrencySymbol } from "@/lib/utils";
import toast from "react-hot-toast";

const RewardHeader = () => {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data, refetch } = useFetchWalletQuery();
  const user: any = useCurrentUser();

  const balance = data?.payload ? Number(data.payload.balance) : 0;
  const currency = data?.payload?.currency || "BDT";

  const handleCopyPlayerId = () => {
    if (!user?.playerId) return;
    navigator.clipboard.writeText(user.playerId);
    setCopied(true);
    toast.success("Player ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshBalance = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Balance updated!");
    } catch {
      // ignore
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#0c1b30] via-[#10243d] to-[#081324] border border-[#1d3d66] shadow-2xl overflow-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#3888e9]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Top Profile Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* User Info */}
          <div className="flex items-center gap-3.5">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-600 p-0.5 shadow-lg shadow-yellow-500/20 flex-shrink-0">
              <div className="w-full h-full rounded-[14px] overflow-hidden bg-[#070e17] flex items-center justify-center">
                <img
                  src="https://images.51939393.com//TCG_PROD_IMAGES/B2C/01_PROFILE/PROFILE/0.png"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#070e17] flex items-center justify-center text-[10px] text-white">
                ✓
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white truncate max-w-[180px]">
                  {user?.name || user?.phone || "Player"}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <FaCrown size={10} /> VIP Member
                </span>
              </div>

              {/* Player ID with copy */}
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <span>ID: {user?.playerId || "10293847"}</span>
                <button
                  type="button"
                  onClick={handleCopyPlayerId}
                  className="p-1 rounded-md bg-[#142842] hover:bg-[#1e3c66] text-gray-300 hover:text-white transition-colors cursor-pointer"
                  title="Copy ID"
                >
                  {copied ? <FaCheck size={10} className="text-emerald-400" /> : <FaCopy size={10} />}
                </button>
              </div>
            </div>
          </div>

          {/* Balance Block */}
          <div className="flex items-center justify-between sm:justify-end gap-3 p-3 sm:p-3.5 rounded-2xl bg-[#071322] border border-[#183454] shadow-inner">
            <div className="flex flex-col text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Total Balance
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {getCurrencySymbol(currency)} {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefreshBalance}
              disabled={isRefreshing}
              className={`w-9 h-9 rounded-xl bg-[#0f223a] hover:bg-[#16355c] border border-[#1d416b] text-[#3888e9] hover:text-white flex items-center justify-center transition-all cursor-pointer ${
                isRefreshing ? "animate-spin text-white" : "active:scale-95"
              }`}
              title="Refresh Balance"
            >
              <FiRefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 border-t border-[#162f4e]">
          <Link
            href="/deposit"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all text-center"
          >
            <FaArrowDown size={11} />
            <span>Deposit</span>
          </Link>

          <Link
            href="/withdraw"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0f233b] hover:bg-[#16375e] border border-[#1e4470] text-gray-200 hover:text-white font-extrabold text-xs active:scale-95 transition-all text-center"
          >
            <FaArrowUp size={11} className="text-[#3888e9]" />
            <span>Withdraw</span>
          </Link>

          <Link
            href="/vip"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-yellow-500/40 hover:bg-yellow-500/30 text-yellow-300 font-black text-xs active:scale-95 transition-all text-center"
          >
            <FaCrown size={11} />
            <span>VIP Lounge</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RewardHeader;
