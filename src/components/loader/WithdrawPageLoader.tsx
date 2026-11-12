"use client";
import React from "react";
import { RiExchangeDollarFill, RiShieldCheckFill } from "react-icons/ri";

const WithdrawPageLoader = () => {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-gradient-to-b from-[#070e17] via-[#0a1626] to-[#050b12] text-white select-none font-sans">
      
      {/* ── Center Animated Spinner & Icon ─────────────────────────── */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer glowing halo */}
        <div className="absolute w-28 h-28 rounded-full bg-yellow-500/15 blur-xl animate-pulse" />

        {/* Dual spinning rings */}
        <div className="w-20 h-20 rounded-full border-[3px] border-[#143254] border-t-yellow-400 border-r-amber-400/60 animate-spin" />
        <div className="absolute w-14 h-14 rounded-full border-2 border-[#1c3f68] border-b-[#3888e9] animate-spin [animation-duration:1.5s] [animation-direction:reverse]" />

        {/* Center Golden Exchange Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <RiExchangeDollarFill size={20} className="text-black" />
          </div>
        </div>
      </div>

      {/* ── Title ──────────────────────────────────────────────────── */}
      <div className="text-center space-y-1.5 px-4 max-w-xs">
        <h3 className="text-sm sm:text-base font-black tracking-widest text-white uppercase">
          CASHOUT PORTAL
        </h3>
        <p className="text-xs text-gray-400 font-medium animate-pulse">
          Connecting to secure payout network...
        </p>

        {/* Smooth Glowing Progress Bar */}
        <div className="w-48 h-1 mx-auto mt-4 rounded-full bg-[#132840] overflow-hidden p-[1px]">
          <div className="w-full h-full rounded-full bg-gradient-to-r from-yellow-400 via-amber-400 to-[#3888e9] animate-pulse" />
        </div>
      </div>

      {/* ── Bottom Security Badge ──────────────────────────────────── */}
      <div className="absolute bottom-8 flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
        <RiShieldCheckFill className="text-emerald-400 text-sm" />
        <span>256-Bit SSL Encrypted Banking</span>
      </div>

    </div>
  );
};

export default WithdrawPageLoader;
