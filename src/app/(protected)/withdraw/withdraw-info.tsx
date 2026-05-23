import React from "react";
import { FaClock, FaCalendarCheck, FaWallet, FaCheck } from "react-icons/fa";
import { GiFastArrow } from "react-icons/gi";

const WithdrawInfo = ({
  mainBalance,
  availableBalance,
  remainingWithdrawal,
  turnOver,
}: {
  mainBalance: number;
  availableBalance: number;
  remainingWithdrawal: number;
  turnOver: number;
}) => {
  return (
    <div className="bg-[#002632] rounded-2xl border border-[#006165] p-5 shadow-lg relative overflow-hidden">
      {/* Subtle Glows */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#23FFC8]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative space-y-4">
        {/* Info Rows */}
        <div className="flex items-start gap-3 text-sm">
          <FaClock className="text-[#23FFC8] mt-1 shrink-0 text-base" />
          <div>
            <p className="font-bold text-white">Withdrawal Time</p>
            <p className="text-xs text-gray-300 font-semibold mt-0.5">
              Tips：উত্তোলনের সময়সীমা: ২৪ ঘন্টা (যেকোনো সময়)
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 text-sm">
          <FaCalendarCheck className="text-[#FFB800] mt-1 shrink-0 text-base" />
          <div>
            <p className="font-bold text-white">Daily Limits</p>
            <p className="text-xs text-gray-300 font-semibold mt-0.5">
              Daily Limit: 10 times | Remaining Today: <span className="text-[#FFB800] font-bold">{remainingWithdrawal}</span> times
            </p>
          </div>
        </div>

        {/* Balance Panel */}
        <div className="rounded-xl p-4 bg-gradient-to-br from-[#0F727C] to-[#004E56] text-white border border-[#11867d]/40 shadow-inner space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-gray-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <FaWallet className="text-[#FFB800]" /> Main Wallet Balance
            </span>
            <span className="font-mono font-black text-white text-lg">
              {Number(mainBalance).toFixed(2)} ৳
            </span>
          </div>
          
          <div className="flex justify-between items-center border-t border-[#11867d]/40 pt-2">
            <span className="text-[11px] text-[#23FFC8] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <FaCheck /> Available to Withdraw
            </span>
            <span className="font-mono font-black text-[#23FFC8] text-xl">
              {Number(availableBalance).toFixed(2)} ৳
            </span>
          </div>
        </div>

        {/* Turnover Requirement Notification */}
        {turnOver !== 0 && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-xs uppercase tracking-wider">
              <GiFastArrow className="animate-pulse" /> Turnover Requirement
            </div>
            <p className="text-sm font-black text-red-400">
              Required: {turnOver} BDT
            </p>
            <span className="text-xs block text-gray-400 font-semibold leading-relaxed">
              উত্তোলন সম্পূর্ণ করতে আপনাকে আরও <span className="text-red-400 font-bold">{turnOver} BDT</span> বেটিং বা গেমপ্লে করতে হবে।
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawInfo;
