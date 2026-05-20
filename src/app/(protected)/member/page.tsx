/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { UserAvatar } from "@/components/HeaderBalance";
import TabNav from "@/components/TabNav";
import { Skeleton } from "@/components/ui/skeleton";
import useCurrentUser from "@/hook/useCurrentUser";
import { useFetchWalletQuery } from "@/lib/features/walletApiSlice";
import { getCurrencySymbol } from "@/lib/utils";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaFileInvoiceDollar, FaGift } from "react-icons/fa";
import { FaChartLine, FaCircleUser, FaCopy, FaCreditCard } from "react-icons/fa6";
import { FiCheck, FiDownload, FiRefreshCw } from "react-icons/fi";
import { GiFishMonster } from "react-icons/gi";
import { LuNotebookText } from "react-icons/lu";
import { MdOutlineSupportAgent, MdSecurity } from "react-icons/md";
import { PiHandDepositFill, PiHandWithdrawFill } from "react-icons/pi";
import { TiUserAdd } from "react-icons/ti";

const menuItems = [
  { href: "/rewardCenter", icon: FaGift, label: "Reward" },
  { href: "/profitandloss", icon: FaChartLine, label: "Profit/Loss" },
  { href: "/history?type=deposit", icon: FaFileInvoiceDollar, label: "Deposit Record" },
  { href: "/history?type=withdraw", icon: LuNotebookText, label: "Withdraw Record" },
  { href: "/my-account", icon: FaCircleUser, label: "My Account" },
  { href: "/security", icon: MdSecurity, label: "Security Center" },
  { href: "/invite-friends", icon: TiUserAdd, label: "Invite Friend" },
  { href: "#", icon: FiDownload, label: "Download App" },
  { href: "/support", icon: MdOutlineSupportAgent, label: "Customer Center" },
  { href: "/fish", icon: GiFishMonster, label: "Fish Games" },
];

const App: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  useEffect(() => {
    setLastUpdateTime(new Date());
  }, []);

  const user: any = useCurrentUser();
  const {
    data,
    isLoading: walletLoading,
    refetch,
    isFetching: walletRetching,
  } = useFetchWalletQuery();

  const balance = data?.payload ? Number(data.payload.balance) : 0;

  const handleCopyPlayerId = () => {
    if (user?.playerId) {
      navigator.clipboard.writeText(user.playerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefreshBalance = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await refetch();
    setLastUpdateTime(new Date());
    setShowToast(true);
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="relative overflow-hidden w-full min-h-screen px-3 py-3 text-white pb-20 md:pb-4 md:flex md:flex-col md:items-center bg-[#02080f]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.12),_transparent_20%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0a1820] to-transparent" />
      <div className="relative md:max-w-4xl md:w-full">

        {/* Toast */}
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 bg-[#002632] border border-teal-700/50 text-white px-4 py-2 rounded-xl shadow-lg z-50 transition-all duration-300 ${
            showToast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none"
          }`}
        >
          <div className="text-sm font-medium text-[#23FFC8] flex items-center gap-1.5">
            <FiCheck /> Balance updated
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5" suppressHydrationWarning>
            {lastUpdateTime?.toLocaleTimeString() || ""}
          </div>
        </div>

        {/* Profile Section */}
        <div className="relative overflow-hidden text-white px-5 py-6 rounded-[28px] border border-white/10 bg-gradient-to-br from-[#06222c] via-[#03111a] to-[#0c1f2f] shadow-[0_30px_80px_rgba(0,0,0,0.35)] md:rounded-[32px] md:mt-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.14),_transparent_20%)]" />
          <div className="relative">
            {/* User row */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <UserAvatar imageUrl="https://images.51939393.com//TCG_PROD_IMAGES/B2C/01_PROFILE/PROFILE/0.png" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22d3ee] border-2 border-[#06222c] rounded-full" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-xl md:text-2xl leading-tight">{user?.name}</h2>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#f9d66b] font-semibold shadow-sm shadow-[#f9d66b]/10">
                    Premium Member
                  </span>
                </div>
                <div className="flex flex-wrap items-center mt-2 gap-2 text-sm text-slate-300 md:text-base">
                  <span>ID: {user?.playerId}</span>
                  <button
                    onClick={handleCopyPlayerId}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-100 transition hover:border-[#22d3ee]/50 hover:bg-[#22d3ee]/10"
                  >
                    {copied ? <FiCheck className="text-[#22d3ee]" /> : <FaCopy className="text-slate-100" />}
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="rounded-[20px] p-3 bg-white/5 border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.14)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="text-[10px] text-[#fcd34d]/80 font-semibold uppercase tracking-[0.24em]">
                  Available Balance
                </span>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className="text-2xl font-bold text-white md:text-3xl"
                    style={{
                      animation: isRefreshing ? "none" : "balancePulse 0.5s ease-out",
                    }}
                  >
                    {(walletLoading || walletRetching) && (
                      <Skeleton className="w-[120px] h-[36px] rounded-md bg-slate-800" />
                    )}
                    {!walletLoading && !walletRetching && data && (
                      <>
                        {getCurrencySymbol("BDT")}
                        {balance.toFixed(2)}
                      </>
                    )}
                  </span>
                  <div className="text-xs text-slate-300">
                    <div>Updated {lastUpdateTime?.toLocaleTimeString() || ""}</div>
                    <div className="text-[10px] text-slate-500">Live premium balance</div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleRefreshBalance}
                className="inline-flex items-center gap-2 rounded-full bg-[#22d3ee]/10 px-4 py-3 text-sm font-semibold text-[#c7f9ff] shadow-[0_15px_40px_rgba(34,211,238,0.18)] transition hover:bg-[#22d3ee]/20"
                disabled={isRefreshing}
              >
                <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
            <style>{`
              @keyframes balancePulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.04); }
                100% { transform: scale(1); }
              }
            `}</style>
          </div>
        </div>
      </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2 px-4 py-3 md:gap-3 md:py-4">
          {[
            { href: "/deposit", icon: PiHandDepositFill, label: "Deposit" },
            { href: "/withdraw", icon: PiHandWithdrawFill, label: "Withdraw" },
            { href: "/my-cards", icon: FaCreditCard, label: "My Card" },
            { href: "/rewardCenter", icon: FaGift, label: "Reward" },
          ].map((btn) => (
            <Link href={btn.href} key={btn.label}>
              <button className="w-full rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0f172a] via-[#07121f] to-[#082334] px-3 py-3 text-center shadow-[0_18px_40px_rgba(0,0,0,0.20)] transition hover:-translate-y-0.5 hover:border-[#22d3ee]/30 active:scale-[0.98]">
                <div className="flex flex-col items-center gap-2">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-[24px] bg-[#22d3ee]/10 text-[#22d3ee] shadow-[0_10px_24px_rgba(34,211,238,0.14)]">
                    <btn.icon className="h-5 w-5" />
                  </span>
                  <p className="text-[11px] font-semibold text-white">{btn.label}</p>
                </div>
              </button>
            </Link>
          ))}
        </div>

        {/* Member Menu Grid */}
        <div className="px-4 py-3 pb-10 md:py-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <h3 className="text-xl font-semibold text-white">Premium Member Menu</h3>
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200 uppercase tracking-[0.18em] shadow-sm shadow-slate-900/20">
              Elite Access
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 md:grid-cols-4 md:gap-3">
            {menuItems.map((item) => (
              <Link
                href={item.href}
                key={item.label}
                className="group flex flex-col items-center rounded-[24px] border border-white/10 bg-[#07151f]/80 p-4 text-center shadow-[0_14px_60px_rgba(0,0,0,0.20)] transition hover:-translate-y-0.5 hover:bg-[#0b1b2a]/90"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-[#22d3ee]/20 to-[#facc15]/10 text-[#38bdf8] shadow-[0_10px_30px_rgba(34,211,238,0.14)] group-hover:from-[#22d3ee]/30 group-hover:to-[#facc15]/20">
                  <item.icon className="h-6 w-6 md:h-7 md:w-7" />
                </div>
                <span className="mt-3 text-sm font-medium text-slate-200 transition group-hover:text-white leading-tight">
                  {item.label}
                </span>
              </Link>
            ))}

            <Link
              href="/poker"
              className="group flex flex-col items-center rounded-[24px] border border-white/10 bg-[#07151f]/80 p-4 text-center shadow-[0_14px_60px_rgba(0,0,0,0.20)] transition hover:-translate-y-0.5 hover:bg-[#0b1b2a]/90"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-[#fbbf24]/20 to-[#ec4899]/10 text-[#fbbf24] shadow-[0_10px_30px_rgba(251,191,36,0.14)] group-hover:from-[#fbbf24]/30 group-hover:to-[#ec4899]/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 md:h-7 md:w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 12c3-2 6-2 6 2s-3 2-6 2-6-2-6-2 3-2 6-2z" />
                  <path d="M4 12h16" />
                  <path d="M12 4v16" />
                </svg>
              </div>
              <span className="mt-3 text-sm font-medium text-slate-200 transition group-hover:text-white leading-tight">
                Poker Games
              </span>
            </Link>
          </div>
        </div>
      </div>
      <TabNav />
    </div>
  );
};

export default App;
