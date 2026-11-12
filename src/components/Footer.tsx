/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import LiveChatTrigger from "./LiveChatTrigger";
import { RiShieldCheckFill, RiCustomerService2Line, RiLockPasswordLine } from "react-icons/ri";
import { MdVerifiedUser } from "react-icons/md";
import { SiTether } from "react-icons/si";

const Footer = async () => {
  const siteSettings = await db.siteSetting.findFirst().catch(() => null);
  const promotionsLogo = siteSettings?.promotionsLogo;

  return (
    <footer className="w-full bg-[#050b13] border-t border-[#132840] pt-8 pb-28 md:pb-12 text-gray-400 font-sans select-none">
      <div className="max-w-6xl mx-auto px-4 space-y-8">

        {/* ══════════════════════════════════════════════════════════════════
            1. ACCEPTED PAYMENT METHODS STRIP
        ══════════════════════════════════════════════════════════════════ */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0a1626]/90 border border-[#183454] shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Accepted Payment Methods
              </h4>
              <p className="text-[11px] text-gray-400 font-medium">
                Instant Automatic Deposit & 10-Minute Fast Withdrawals
              </p>
            </div>
            <span className="self-start sm:self-auto text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
              0% Transaction Fee
            </span>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2.5">
            {/* bKash */}
            <div className="flex items-center justify-center h-12 bg-[#06101c] border border-[#1b3656] rounded-xl p-2 hover:border-[#df146e]/60 transition-all shadow-inner group">
              <img
                src="/wallet/bkash.png"
                alt="bKash"
                className="max-h-7 max-w-[85px] object-contain group-hover:scale-105 transition-transform"
              />
            </div>

            {/* Nagad */}
            <div className="flex items-center justify-center h-12 bg-[#06101c] border border-[#1b3656] rounded-xl p-2 hover:border-[#f7941d]/60 transition-all shadow-inner group">
              <img
                src="/wallet/nagad.png"
                alt="Nagad"
                className="max-h-7 max-w-[85px] object-contain group-hover:scale-105 transition-transform"
              />
            </div>

            {/* Rocket */}
            <div className="flex items-center justify-center h-12 bg-[#06101c] border border-[#1b3656] rounded-xl p-2 hover:border-[#8c3494]/60 transition-all shadow-inner group">
              <img
                src="/wallet/rocket.png"
                alt="Rocket"
                className="max-h-7 max-w-[85px] object-contain group-hover:scale-105 transition-transform"
              />
            </div>

            {/* Upay */}
            <div className="flex items-center justify-center h-12 bg-[#06101c] border border-[#1b3656] rounded-xl p-2 hover:border-[#ffca08]/60 transition-all shadow-inner group">
              <img
                src="/wallet/upay.png"
                alt="Upay"
                className="max-h-7 max-w-[85px] object-contain group-hover:scale-105 transition-transform"
              />
            </div>

            {/* USDT Crypto */}
            <div className="col-span-2 xs:col-span-1 flex items-center justify-center gap-1.5 h-12 bg-[#06101c] border border-[#1b3656] rounded-xl p-2 hover:border-[#26a17b]/60 transition-all shadow-inner group">
              <SiTether className="text-[#26a17b] text-xl group-hover:scale-110 transition-transform" />
              <div className="flex flex-col text-left leading-none">
                <span className="text-xs font-black text-white">USDT</span>
                <span className="text-[9px] text-gray-400 font-bold">TRC20 / BEP20</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            2. BRAND & QUICK LINKS GRID
        ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
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

          {/* Quick Col 1: Casino */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-extrabold text-white uppercase tracking-wider border-l-2 border-[#3888e9] pl-2">
              Casino Games
            </h5>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/slots" className="hover:text-white transition-colors">
                  Online Slots
                </Link>
              </li>
              <li>
                <Link href="/live-casino" className="hover:text-white transition-colors">
                  Live Dealer Casino
                </Link>
              </li>
              <li>
                <Link href="/hot" className="hover:text-white transition-colors">
                  Hot Popular Games
                </Link>
              </li>
              <li>
                <Link href="/sports" className="hover:text-white transition-colors">
                  Cricket & Sportsbook
                </Link>
              </li>
              <li>
                <Link href="/fish" className="hover:text-white transition-colors">
                  Fish Hunter Games
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Col 2: Promos & VIP */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-extrabold text-white uppercase tracking-wider border-l-2 border-yellow-400 pl-2">
              Rewards & Offers
            </h5>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/vip" className="hover:text-white transition-colors">
                  VIP Club Lounge
                </Link>
              </li>
              <li>
                <Link href="/promotion" className="hover:text-white transition-colors">
                  Promotions & Bonuses
                </Link>
              </li>
              <li>
                <Link href="/invite-friends" className="hover:text-white transition-colors">
                  Invite Friends & Earn
                </Link>
              </li>
              <li>
                <Link href="/rewardCenter" className="hover:text-white transition-colors">
                  Daily Reward Center
                </Link>
              </li>
              <li>
                <Link href="/affiliate" className="hover:text-white transition-colors">
                  Affiliate Program
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Col 3: Legal & Security */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-extrabold text-white uppercase tracking-wider border-l-2 border-emerald-400 pl-2">
              Security & Fair Play
            </h5>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/support" className="hover:text-white transition-colors">
                  Customer Support Helpdesk
                </Link>
              </li>
              <li>
                <Link href="/manual" className="hover:text-white transition-colors">
                  How to Deposit & Withdraw
                </Link>
              </li>
              <li>
                <Link href="/appp" className="hover:text-white transition-colors">
                  Download Mobile APK
                </Link>
              </li>
              <li className="text-[11px] text-gray-500 pt-1">
                SSL Certificate: 256-bit AES-GCM
              </li>
            </ul>
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
