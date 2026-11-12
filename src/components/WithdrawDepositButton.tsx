import { findCurrentUser } from "@/data/user";
import Link from "next/link";
import React from "react";
import {
  RiWallet3Fill,
  RiExchangeDollarFill,
  RiArrowRightUpLine,
  RiArrowLeftDownLine,
} from "react-icons/ri";

const WithdrawDepositButton = async () => {
  const user = await findCurrentUser();
  if (!user) return null;

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 my-3">
      {/* ── DEPOSIT BUTTON (Vibrant Emerald Gradient) ────────────────── */}
      <Link
        href="/deposit"
        className="group relative overflow-hidden rounded-2xl p-[1px] transition-all duration-200 active:scale-95 shadow-[0_4px_16px_rgba(16,185,129,0.2)]"
        aria-label="Deposit Funds"
      >
        <div className="relative flex items-center justify-between h-[52px] px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-[#0d3d2c] via-[#092b1e] to-[#071c14] border border-[#10b981]/50 group-hover:border-[#10b981] transition-all">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#10b981] to-[#34d399] flex items-center justify-center text-black shadow-md shadow-emerald-500/30 group-hover:scale-105 transition-transform flex-shrink-0">
              <RiWallet3Fill size={20} />
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-xs font-black text-white tracking-wide uppercase group-hover:text-emerald-300 transition-colors">
                Deposit
              </span>
              <span className="text-[10px] text-emerald-400 font-bold mt-0.5">
                Instant ৳
              </span>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-[#10b981]/20 flex items-center justify-center text-emerald-300 group-hover:translate-x-0.5 transition-transform flex-shrink-0">
            <RiArrowLeftDownLine size={15} />
          </div>
        </div>
      </Link>

      {/* ── WITHDRAW BUTTON (Luxury Navy/Gold Gradient) ──────────────── */}
      <Link
        href="/withdraw"
        className="group relative overflow-hidden rounded-2xl p-[1px] transition-all duration-200 active:scale-95 shadow-[0_4px_16px_rgba(245,158,11,0.15)]"
        aria-label="Withdraw Funds"
      >
        <div className="relative flex items-center justify-between h-[52px] px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-[#172e4a] via-[#102237] to-[#091524] border border-[#234d7d] group-hover:border-yellow-500/60 transition-all">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-500 via-amber-500 to-yellow-600 flex items-center justify-center text-black shadow-md shadow-yellow-500/30 group-hover:scale-105 transition-transform flex-shrink-0">
              <RiExchangeDollarFill size={20} />
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-xs font-black text-white tracking-wide uppercase group-hover:text-yellow-300 transition-colors">
                Withdraw
              </span>
              <span className="text-[10px] text-yellow-400 font-bold mt-0.5">
                Fast Payout
              </span>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-300 group-hover:translate-x-0.5 transition-transform flex-shrink-0">
            <RiArrowRightUpLine size={15} />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default WithdrawDepositButton;
