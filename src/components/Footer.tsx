/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import LiveChatTrigger from "./LiveChatTrigger";
import { RiShieldCheckFill, RiCustomerService2Line, RiLockPasswordLine } from "react-icons/ri";
import { MdVerifiedUser } from "react-icons/md";
import { SiTether } from "react-icons/si";

const Footer = async ({
  showPaymentMethods = true,
}: {
  showPaymentMethods?: boolean;
} = {}) => {
  const siteSettings = await db.siteSetting.findFirst().catch(() => null);
  const promotionsLogo = siteSettings?.promotionsLogo;

  return (
    <footer className="w-full bg-[#050b13] border-t border-[#132840] pt-8 pb-28 md:pb-12 text-gray-400 font-sans select-none">
      <div className="max-w-6xl mx-auto px-4 space-y-8">

        {/* ══════════════════════════════════════════════════════════════════
            1. ACCEPTED PAYMENT METHODS
        ══════════════════════════════════════════════════════════════════ */}
        {showPaymentMethods && (
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#091524] border border-[#162e4a] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Accepted Payment Methods
                </h4>
                <p className="text-[11px] text-gray-400 font-medium">
                  Instant Automatic Deposit & 10-Minute Fast Withdrawals · 100% Safe
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                  0% Fee
                </span>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/25 px-2.5 py-0.5 rounded-full">
                  24/7 Live
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-2.5">
              {/* bKash */}
              <div className="flex items-center justify-center h-11 sm:h-12 bg-white rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md transition-all duration-200 group">
                <img
                  src="/wallet/bkash.png"
                  alt="bKash"
                  className="max-h-7 max-w-[85px] w-auto h-auto object-contain group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Nagad */}
              <div className="flex items-center justify-center h-11 sm:h-12 bg-white rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md transition-all duration-200 group">
                <img
                  src="/wallet/nagad.png"
                  alt="Nagad"
                  className="max-h-7 max-w-[85px] w-auto h-auto object-contain group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Rocket */}
              <div className="flex items-center justify-center h-11 sm:h-12 bg-white rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md transition-all duration-200 group">
                <img
                  src="/wallet/rocket.png"
                  alt="Rocket"
                  className="max-h-7 max-w-[85px] w-auto h-auto object-contain group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Upay */}
              <div className="flex items-center justify-center h-11 sm:h-12 bg-white rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md transition-all duration-200 group">
                <img
                  src="/wallet/upay.png"
                  alt="Upay"
                  className="max-h-7 max-w-[85px] w-auto h-auto object-contain group-hover:scale-105 transition-transform"
                />
              </div>

              {/* USDT Crypto */}
              <div className="col-span-2 xs:col-span-1 flex items-center justify-center gap-1.5 h-11 sm:h-12 bg-white rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md transition-all duration-200 group">
                <SiTether className="text-[#26a17b] text-xl group-hover:scale-110 transition-transform flex-shrink-0" />
                <div className="flex flex-col text-left leading-none">
                  <span className="text-xs font-black text-gray-900 tracking-tight">USDT</span>
                  <span className="text-[9px] text-[#26a17b] font-bold">TRC20 / BEP20</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            2. BRAND & QUICK LINKS GRID
        ══════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col md:grid md:grid-cols-4 gap-6 pt-2">
          
          {/* Brand Col */}
          <div className="w-full md:col-span-1 space-y-3">
            <Link href="/" className="inline-block">
              <img
                src={typeof promotionsLogo === "string" && promotionsLogo ? promotionsLogo : "/logo.png"}
                alt="RK444"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              RK444 is the leading online sports betting and live casino entertainment platform in Bangladesh. Licensed, secure and certified fair play.
            </p>
            <div className="pt-1">
              <LiveChatTrigger
                fallbackHref="/support"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#142842] hover:bg-[#1a385f] text-xs font-bold text-white border border-[#23456e] transition-all active:scale-95 shadow-sm"
              >
                <RiCustomerService2Line className="text-[#3888e9] text-base" />
                <span>24/7 Live Agent Chat</span>
              </LiveChatTrigger>
            </div>
          </div>

          {/* Quick Links Grid: 3 columns on mobile screen (grid-cols-3) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 md:col-span-3">
            
            {/* Quick Col 1: Casino */}
            <div className="space-y-2 sm:space-y-2.5">
              <h5 className="text-[11px] sm:text-xs font-extrabold text-white uppercase tracking-wider border-l-2 border-[#3888e9] pl-1.5 sm:pl-2">
                Casino
              </h5>
              <ul className="space-y-1.5 text-[11px] sm:text-xs">
                <li>
                  <Link href="/slots" className="hover:text-white transition-colors block truncate">
                    Slots
                  </Link>
                </li>
                <li>
                  <Link href="/live-casino" className="hover:text-white transition-colors block truncate">
                    Live Casino
                  </Link>
                </li>
                <li>
                  <Link href="/hot" className="hover:text-white transition-colors block truncate">
                    Hot Games
                  </Link>
                </li>
                <li>
                  <Link href="/sports" className="hover:text-white transition-colors block truncate">
                    Sports
                  </Link>
                </li>
                <li>
                  <Link href="/fish" className="hover:text-white transition-colors block truncate">
                    Fishing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Quick Col 2: Promos & VIP */}
            <div className="space-y-2 sm:space-y-2.5">
              <h5 className="text-[11px] sm:text-xs font-extrabold text-white uppercase tracking-wider border-l-2 border-yellow-400 pl-1.5 sm:pl-2">
                Rewards
              </h5>
              <ul className="space-y-1.5 text-[11px] sm:text-xs">
                <li>
                  <Link href="/vip" className="hover:text-white transition-colors block truncate">
                    VIP Club
                  </Link>
                </li>
                <li>
                  <Link href="/promotion" className="hover:text-white transition-colors block truncate">
                    Promotions
                  </Link>
                </li>
                <li>
                  <Link href="/invite-friends" className="hover:text-white transition-colors block truncate">
                    Invite & Earn
                  </Link>
                </li>
                <li>
                  <Link href="/rewardCenter" className="hover:text-white transition-colors block truncate">
                    Reward Center
                  </Link>
                </li>
                <li>
                  <Link href="/affiliate" className="hover:text-white transition-colors block truncate">
                    Affiliate
                  </Link>
                </li>
              </ul>
            </div>

            {/* Quick Col 3: Legal & Security */}
            <div className="space-y-2 sm:space-y-2.5">
              <h5 className="text-[11px] sm:text-xs font-extrabold text-white uppercase tracking-wider border-l-2 border-emerald-400 pl-1.5 sm:pl-2">
                Support
              </h5>
              <ul className="space-y-1.5 text-[11px] sm:text-xs">
                <li>
                  <Link href="/support" className="hover:text-white transition-colors block truncate">
                    Helpdesk
                  </Link>
                </li>
                <li>
                  <Link href="/manual" className="hover:text-white transition-colors block truncate">
                    How to Deposit
                  </Link>
                </li>
                <li>
                  <Link href="/appp" className="hover:text-white transition-colors block truncate">
                    Mobile APK
                  </Link>
                </li>
                <li>
                  <span className="text-gray-500 block truncate">
                    Fair Gaming
                  </span>
                </li>
                <li>
                  <span className="text-[10px] text-gray-500 block truncate">
                    256-Bit SSL
                  </span>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════════════
            3. REGULATORY SEALS & RESPONSIBLE GAMING CERTIFICATION
        ══════════════════════════════════════════════════════════════════ */}
        <div className="pt-4 border-t border-[#132840]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            {/* Curacao License Seal */}
            <div className="p-3 rounded-xl bg-[#081322] border border-[#1a385c] flex items-center gap-3 shadow-inner">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center text-black font-black text-xs shadow-md shadow-yellow-500/20 flex-shrink-0">
                GC
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  Curacao eGaming <MdVerifiedUser className="text-[#3888e9] text-sm" />
                </span>
                <span className="text-[10px] text-gray-400">
                  Authorized & Regulated · License 8048/JAZ
                </span>
              </div>
            </div>

            {/* 18+ Responsible Gaming Seal */}
            <div className="p-3 rounded-xl bg-[#081322] border border-[#1a385c] flex items-center gap-3 shadow-inner">
              <div className="w-10 h-10 rounded-full border-2 border-red-500 bg-red-500/10 flex items-center justify-center text-red-400 font-black text-sm shadow-md flex-shrink-0">
                18+
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white">
                  Responsible Gaming
                </span>
                <span className="text-[10px] text-gray-400">
                  Strictly 18+ · Gambling Can Be Addictive
                </span>
              </div>
            </div>

            {/* 256-bit SSL Security */}
            <div className="p-3 rounded-xl bg-[#081322] border border-[#1a385c] flex items-center gap-3 shadow-inner">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg shadow-md flex-shrink-0">
                <RiShieldCheckFill />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white">
                  256-Bit SSL Secured
                </span>
                <span className="text-[10px] text-gray-400">
                  End-to-End Encrypted Financial Data
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            4. COPYRIGHT NOTICE
        ══════════════════════════════════════════════════════════════════ */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            © 2026 RK444 (rk444.site). All rights reserved. Registered under Gaming Services Provider N.V. Please play responsibly.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
