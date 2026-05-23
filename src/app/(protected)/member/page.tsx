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
import { useRouter } from "next/navigation";
import { FaFileInvoiceDollar, FaGift } from "react-icons/fa";
import { FaChartLine, FaCircleUser, FaCopy, FaCreditCard, FaArrowLeftLong } from "react-icons/fa6";
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
  const router = useRouter();
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
    <div className="min-h-screen bg-[#003e3e] flex flex-col text-white pb-28">
      {/* Premium Dark Theme Header */}
      <header className="bg-[#002632] border-b border-[#006165] py-4 px-6 flex items-center justify-between sticky top-0 z-10 shadow-[rgba(0,38,49,0.3)_0px_2px_8px_0px]">
        <button
          onClick={() => router.back()}
          className="text-gray-300 hover:text-white cursor-pointer transition-colors"
        >
          <FaArrowLeftLong className="text-xl" />
        </button>
        <h3 className="text-lg font-bold text-white tracking-wide">Member Center</h3>
        <div className="w-6" /> {/* Placeholder to center the title */}
      </header>

      <main className="w-full max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Toast Notification */}
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 bg-[#002632] border border-[#23FFC8]/30 text-white px-4 py-3 rounded-xl shadow-2xl z-50 transition-all duration-300 flex flex-col items-center gap-0.5 ${
            showToast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none"
          }`}
        >
          <div className="text-sm font-bold text-[#23FFC8] flex items-center gap-1.5">
            <FiCheck className="text-lg" /> Balance updated
          </div>
          <div className="text-[10px] text-gray-400 font-medium" suppressHydrationWarning>
            {lastUpdateTime?.toLocaleTimeString() || ""}
          </div>
        </div>

        {/* Profile Card */}
        <div className="relative overflow-hidden bg-[#002632] px-5 py-6 rounded-2xl border border-[#006165] shadow-lg">
          {/* Subtle Cyber Glowing Effect */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#23FFC8]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#FFB800]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <UserAvatar imageUrl="https://images.51939393.com//TCG_PROD_IMAGES/B2C/01_PROFILE/PROFILE/0.png" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#23FFC8] border-2 border-[#002632] rounded-full shadow-md" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-extrabold text-lg text-white leading-tight truncate max-w-[150px] sm:max-w-none">{user?.name}</h2>
                  <span className="rounded-full bg-[#FFB800]/10 border border-[#FFB800]/30 px-2.5 py-0.5 text-[9px] uppercase tracking-wider text-[#FFB800] font-bold shadow-sm">
                    Premium
                  </span>
                </div>
                <div className="flex flex-wrap items-center mt-1.5 gap-2 text-xs text-gray-400">
                  <span>ID: {user?.playerId}</span>
                  <button
                    onClick={handleCopyPlayerId}
                    className="inline-flex items-center gap-1 rounded-full border border-[#006165] bg-[#003e3e]/50 px-2 py-0.5 text-[10px] text-gray-300 transition hover:border-[#23FFC8]/50 hover:bg-[#003e3e] hover:text-[#23FFC8] font-bold cursor-pointer"
                  >
                    {copied ? <FiCheck className="text-[#23FFC8]" /> : <FaCopy />}
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Balance Subcard */}
            <div className="rounded-xl p-4 bg-gradient-to-br from-[#0F727C] to-[#004E56] text-white border border-[#11867d]/40 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#23FFC8]/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between relative">
                <div>
                  <span className="text-[10px] text-[#23FFC8]/80 font-bold uppercase tracking-widest">
                    Available Balance
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span
                      className="text-3xl font-black text-white"
                      style={{
                        animation: isRefreshing ? "none" : "balancePulse 0.5s ease-out",
                      }}
                    >
                      {(walletLoading || walletRetching) && (
                        <Skeleton className="w-[120px] h-[36px] rounded-md bg-white/20" />
                      )}
                      {!walletLoading && !walletRetching && data && (
                        <>
                          <span className="text-[#FFB800] mr-1">{getCurrencySymbol("BDT")}</span>
                          {balance.toFixed(2)}
                        </>
                      )}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-300 mt-1 font-semibold" suppressHydrationWarning>
                    Updated {lastUpdateTime?.toLocaleTimeString() || ""}
                  </div>
                </div>
                
                <button
                  onClick={handleRefreshBalance}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[linear-gradient(180deg,_#FFE600,_#FFB800)] text-[#B64100] border border-[#FFB800] px-4.5 py-2 text-xs font-extrabold shadow-md hover:brightness-110 active:scale-[0.97] transition-all cursor-pointer"
                  disabled={isRefreshing}
                >
                  <FiRefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons (Deposit, Withdraw, My Card, Reward) */}
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { href: "/deposit", icon: PiHandDepositFill, label: "Deposit", color: "text-[#23FFC8] bg-[#003e3e]/40 border-[#006165]" },
            { href: "/withdraw", icon: PiHandWithdrawFill, label: "Withdraw", color: "text-[#FFB800] bg-[#003e3e]/40 border-[#FFB800]/30" },
            { href: "/my-cards", icon: FaCreditCard, label: "My Card", color: "text-[#e0c3fc] bg-[#003e3e]/40 border-[#006165]" },
            { href: "/rewardCenter", icon: FaGift, label: "Reward", color: "text-rose-400 bg-[#003e3e]/40 border-[#006165]" },
          ].map((btn) => (
            <Link href={btn.href} key={btn.label} className="block">
              <button className="w-full rounded-2xl border border-[#006165] bg-[#002632] px-2 py-4 text-center shadow-md transition hover:-translate-y-0.5 hover:bg-[#002632]/80 hover:border-[#23FFC8]/30 active:scale-[0.98] cursor-pointer">
                <div className="flex flex-col items-center gap-2.5">
                  <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${btn.color} shadow-inner`}>
                    <btn.icon className="h-5.5 w-5.5" />
                  </span>
                  <p className="text-[11px] font-bold text-gray-200 tracking-wide">{btn.label}</p>
                </div>
              </button>
            </Link>
          ))}
        </div>

        {/* Member Menu Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-base font-bold text-[#FFB800] tracking-wide uppercase">Premium Member Menu</h3>
            <span className="rounded-full bg-[#23FFC8]/10 border border-[#23FFC8]/30 px-3 py-1 text-[9px] text-[#23FFC8] font-extrabold uppercase tracking-wider shadow-sm">
              Elite Access
            </span>
          </div>
          
          <div className="grid grid-cols-4 gap-2.5 md:gap-3">
            {menuItems.map((item) => (
              <Link
                href={item.href}
                key={item.label}
                className="group flex flex-col items-center rounded-2xl border border-[#006165] bg-[#002632] p-3 text-center shadow-md transition hover:-translate-y-0.5 hover:bg-[#003840]/90 hover:border-[#23FFC8]/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#003e3e] text-[#23FFC8] border border-[#006165]/50 shadow-inner group-hover:bg-[#004e56] group-hover:text-white transition-colors">
                  <item.icon className="h-5.5 w-5.5" />
                </div>
                <span className="mt-2.5 text-[10px] font-bold text-gray-300 transition group-hover:text-[#23FFC8] leading-tight">
                  {item.label}
                </span>
              </Link>
            ))}

            {/* Poker Games (Special Golden Theme highlighted) */}
            <Link
              href="/poker"
              className="group flex flex-col items-center rounded-2xl border border-[#FFB800]/50 bg-[#002632] p-3 text-center shadow-md transition hover:-translate-y-0.5 hover:bg-[#003840]/90 hover:border-[#FFB800]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#003e3e] text-[#FFB800] border border-[#FFB800]/30 shadow-inner group-hover:bg-[#FFB800]/10 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5.5 w-5.5"
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
              <span className="mt-2.5 text-[10px] font-bold text-gray-300 transition group-hover:text-[#FFB800] leading-tight">
                Poker Games
              </span>
            </Link>
          </div>
        </div>
      </main>
      <TabNav />
      <style>{`
        @keyframes balancePulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default App;
