import React from "react";
import Link from "next/link";
import { FaClock, FaCalendarCheck, FaWallet, FaCheck, FaGamepad } from "react-icons/fa";
import { GiFastArrow } from "react-icons/gi";

const WithdrawInfo = ({
  mainBalance,
  availableBalance,
  remainingWithdrawal,
  turnOver,
  totalWagered = 0,
  turnoverProgressPercent = 100,
}: {
  mainBalance: number;
  availableBalance: number;
  remainingWithdrawal: number;
  turnOver: number;
  totalWagered?: number;
  turnoverProgressPercent?: number;
}) => {
  const remainingTurnover = Number(turnOver || 0);
  const isTurnoverComplete = remainingTurnover <= 0;
  const progressPercent = isTurnoverComplete
    ? 100
    : Math.max(5, Math.min(99, Number(turnoverProgressPercent || 0)));

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
              Tips：উত্তোলনের সময়সীমা: ২৪ ঘন্টা (যেকোনো সময়) • বোনাস ও ডিপোজিট টার্নওভার মাত্র 1x
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 text-sm">
          <FaCalendarCheck className="text-[#FFB800] mt-1 shrink-0 text-base" />
          <div>
            <p className="font-bold text-white">Daily Limits</p>
            <p className="text-xs text-gray-300 font-semibold mt-0.5">
              Daily Limit: 10 times | Remaining Today:{" "}
              <span className="text-[#FFB800] font-bold">{remainingWithdrawal}</span> times
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

        {/* Live 1x Turnover Progress Tracker */}
        {isTurnoverComplete ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <FaCheck size={12} />
              </div>
              <div>
                <p className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                  1x Turnover Completed (উইথড্রয়ের জন্য প্রস্তুত)
                </p>
                <p className="text-[11px] text-gray-300 font-medium">
                  আপনার বকেয়া টার্নওভার ০.০০ ৳। এখন যেকোনো সময় উইথড্র করতে পারবেন।
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-black text-emerald-400 shrink-0">
              100%
            </span>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-500/40 bg-[#1a1305]/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                <GiFastArrow className="animate-pulse" /> 1x Turnover Progress
              </div>
              <span className="text-xs font-mono font-black text-amber-400">
                {progressPercent}% Completed
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2.5 rounded-full bg-[#071322] border border-[#183454] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] font-semibold">
                <span className="text-gray-400">
                  Total Wagered: <strong className="text-white">৳ {Number(totalWagered).toFixed(2)}</strong>
                </span>
                <span className="text-amber-400 font-bold">
                  Remaining: ৳ {remainingTurnover.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-300 font-medium leading-relaxed">
              উইথড্র আনলক করতে যেকোনো স্লট, লাইভ ক্যাসিনো বা স্পোর্টস গেমে আরও{" "}
              <span className="text-amber-400 font-black">৳ {remainingTurnover.toFixed(2)}</span>{" "}
              বেট (1x Turnover) সম্পন্ন করুন।
            </p>

            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <FaGamepad size={14} />
              <span>গেম খেলুন ও 1x টার্নওভার সম্পন্ন করুন</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawInfo;
