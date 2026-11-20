"use client";

import React from "react";
import {
  useFetchWithdrawPageDataQuery,
  useFetchWithdrawWalletQuery,
} from "@/lib/features/withdrawSlice";
import WithdrawInfo from "./withdraw-info";
import WithdrawForm from "./withdraw-form";
import { FiRefreshCw } from "react-icons/fi";
import { FaExclamationTriangle } from "react-icons/fa";

const fallbackWallets = [
  {
    id: "bkash-default",
    name: "Bkash",
    image: "/wallet/bkash.png",
    label: "bKash",
    min_withdrawals: 100,
    max_withdrawals: 50000,
    instructions: "Please use your bKash account to receive the payment",
    warning: "Make sure to use an account registered under your name",
    isActive: true,
  },
  {
    id: "nagad-default",
    name: "Nagad",
    image: "/wallet/nagad.png",
    label: "Nagad",
    min_withdrawals: 100,
    max_withdrawals: 50000,
    instructions: "Please use your Nagad account to receive the payment",
    warning: "Make sure to use an account registered under your name",
    isActive: true,
  },
];

const Withdraw = () => {
  const {
    data: withdrwData,
    isLoading: withdrawLoading,
    isError: withdrawError,
    refetch: refetchPageData,
  } = useFetchWithdrawPageDataQuery();

  const {
    data: walletData,
    isLoading: walletLoading,
    isError: walletError,
    refetch: refetchWallet,
  } = useFetchWithdrawWalletQuery();

  const isInitialLoading =
    (withdrawLoading && !withdrwData) || (walletLoading && !walletData);

  const hasFatalError = (withdrawError || walletError) && !withdrwData;

  const handleRetry = () => {
    refetchPageData();
    refetchWallet();
  };

  if (isInitialLoading) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-[#23FFC8]/30 border-t-[#23FFC8] rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-semibold animate-pulse">
          উইথড্র তথ্য লোড হচ্ছে...
        </p>
      </div>
    );
  }

  if (hasFatalError) {
    return (
      <div className="w-full bg-[#002632] border border-red-500/30 rounded-2xl p-6 text-center space-y-4 shadow-xl">
        <FaExclamationTriangle className="mx-auto text-amber-400 text-3xl" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">উইথড্র ডাটা লোড করা সম্ভব হয়নি</h4>
          <p className="text-xs text-gray-400">
            অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ অথবা লগইন স্ট্যাটাস চেক করুন।
          </p>
        </div>
        <button
          type="button"
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[linear-gradient(180deg,_#FFE600,_#FFB800)] text-[#B64100] text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <FiRefreshCw className="text-sm" /> পুনরায় চেষ্টা করুন
        </button>
      </div>
    );
  }

  const wallets =
    Array.isArray(walletData?.payload?.wallets) && walletData.payload.wallets.length > 0
      ? walletData.payload.wallets
      : fallbackWallets;

  const availableBalance = Number(withdrwData?.availableBalance || 0) || 0;
  const mainBalance = Number(withdrwData?.mainBalance || 0) || 0;
  const remainingWithdrawal = Number(withdrwData?.remainingWithdrawal || 10) || 10;
  const turnOver = Number(withdrwData?.turnOver || 0) || 0;
  const totalWagered = Number(withdrwData?.totalWagered || 0) || 0;
  const turnoverProgressPercent =
    withdrwData?.turnoverProgressPercent !== undefined
      ? Number(withdrwData.turnoverProgressPercent)
      : 100;

  return (
    <>
      <WithdrawInfo
        availableBalance={availableBalance}
        mainBalance={mainBalance}
        remainingWithdrawal={remainingWithdrawal}
        turnOver={turnOver}
        totalWagered={totalWagered}
        turnoverProgressPercent={turnoverProgressPercent}
      />
      <WithdrawForm
        wallets={wallets}
        availableBalance={availableBalance}
        turnOver={turnOver}
      />
    </>
  );
};

export default Withdraw;
