/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { formatBDT } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaLink, FaCopy, FaCheck, FaShareAlt, FaCoins, FaUserPlus, FaShieldAlt } from "react-icons/fa";
import { FaWhatsapp, FaTelegram, FaFacebook } from "react-icons/fa6";
import { HiSparkles, HiUsers } from "react-icons/hi2";
import { StatisticType } from "@/types/api/reward";
import useCurrentUser from "@/hook/useCurrentUser";
import toast from "react-hot-toast";

interface OverviewProps {
  statictic: StatisticType;
}

const Overview = ({ statictic }: OverviewProps) => {
  const user: any = useCurrentUser();
  const { registersCount, todayIncome, validReferral, totalIncome } = statictic;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── Top Hero Banner ─────────────────────────────────────────── */}
      <div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-7 bg-gradient-to-r from-[#0c1a2d] via-[#10243d] to-[#0a1728] border border-[#1a385c] shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#3888e9]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] sm:text-xs font-black uppercase tracking-wider">
            <HiSparkles className="text-xs sm:text-sm animate-pulse" />
            <span>RK444 AFFILIATE & REFERRAL PROGRAM</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Invite Friends & Earn Real Cash
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed font-medium">
            Share your personal referral link. When your friends register and make their first deposit, both of you earn instant cash bonuses plus lifetime deposit commissions!
          </p>
        </div>
      </div>

      {/* ── 4 Real Income & Referral Stats Cards ─────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gradient-to-b from-[#102744] to-[#081525] border border-[#1c3e66] shadow-md space-y-1">
          <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider block">
            Today&apos;s Income
          </span>
          <span className="text-base sm:text-xl font-black text-emerald-400 block truncate">
            {formatBDT(todayIncome)}
          </span>
        </div>

        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gradient-to-b from-[#102744] to-[#081525] border border-[#1c3e66] shadow-md space-y-1">
          <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider block">
            Total Income
          </span>
          <span className="text-base sm:text-xl font-black text-yellow-400 block truncate">
            {formatBDT(totalIncome)}
          </span>
        </div>

        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gradient-to-b from-[#102744] to-[#081525] border border-[#1c3e66] shadow-md space-y-1">
          <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider block">
            Total Registered
          </span>
          <span className="text-base sm:text-xl font-black text-white block">
            {registersCount} <span className="text-xs text-gray-400 font-medium">Friends</span>
          </span>
        </div>

        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gradient-to-b from-[#102744] to-[#081525] border border-[#1c3e66] shadow-md space-y-1">
          <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider block">
            Valid Referrals
          </span>
          <span className="text-base sm:text-xl font-black text-cyan-400 block">
            {validReferral} <span className="text-xs text-gray-400 font-medium">Active</span>
          </span>
        </div>
      </div>

      {/* ── Personal Invite Link & Real 1-Click Social Sharing ──────── */}
      {user ? (
        <InviteLinkCard
          invitationCode={user.referId || ""}
          phone={user.phone || ""}
        />
      ) : (
        <div className="rounded-2xl p-5 bg-[#0a1626] border border-[#162e4a] text-center space-y-3">
          <h3 className="text-base font-black text-white">Log in to Get Your Referral Link</h3>
          <p className="text-xs text-gray-300 max-w-md mx-auto font-medium">
            Join the RK444 referral club. Earn up to 15% recurring deposit commission on every active player you introduce!
          </p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <Link
              href="/login?redirect=/invite-friends"
              className="px-5 py-2.5 rounded-xl bg-[#3888e9] hover:bg-[#2873d1] text-white font-black text-xs shadow-md active:scale-95 transition-all"
            >
              Log In
            </Link>
            <Link
              href="/register?redirect=/invite-friends"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs shadow-md active:scale-95 transition-all"
            >
              Register Free
            </Link>
          </div>
        </div>
      )}

      {/* ── 3-Step "How it Works" Guide ─────────────────────────────── */}
      <div className="rounded-2xl p-4 sm:p-6 bg-[#0a1626] border border-[#162e4a] space-y-4">
        <div>
          <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <FaCoins className="text-yellow-400" />
            <span>How to Earn from Referrals</span>
          </h3>
          <p className="text-[11px] text-gray-400 font-medium">
            Earning money on RK444 by inviting friends is 100% automated and simple:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#071322] border border-[#132842] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#3888e9]/20 text-[#3888e9] font-black text-sm flex items-center justify-center">
              1
            </div>
            <h4 className="font-black text-white text-xs sm:text-sm">Share Your Link</h4>
            <p className="text-gray-400 leading-relaxed font-medium text-[11px]">
              Copy your unique link or share it directly to WhatsApp, Telegram, and Facebook with one tap.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#071322] border border-[#132842] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-400 font-black text-sm flex items-center justify-center">
              2
            </div>
            <h4 className="font-black text-white text-xs sm:text-sm">Friends Deposit</h4>
            <p className="text-gray-400 leading-relaxed font-medium text-[11px]">
              Your friend signs up and makes their first qualifying deposit (min ৳ 200). They get a 100% welcome match!
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#071322] border border-[#132842] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center">
              3
            </div>
            <h4 className="font-black text-white text-xs sm:text-sm">Instant Cash Drops</h4>
            <p className="text-gray-400 leading-relaxed font-medium text-[11px]">
              You unlock progressive milestone rewards (৳ 100, ৳ 300, ৳ 500...) plus deposit commissions with 1x turnover!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;

// Personal Referral Link & Sharing Card
const InviteLinkCard = ({
  invitationCode,
  phone,
}: {
  invitationCode: string;
  phone: string;
}) => {
  const [origin, setOrigin] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const invitationLink = `${origin}/register?r=${invitationCode}`;

  const shareMessage = `Join RK444 with my referral link to get 100% First Deposit Match + Daily Cash Drops! Sign up here: ${invitationLink}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invitationLink);
    setCopiedLink(true);
    toast.success("Invitation link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(invitationCode);
    setCopiedCode(true);
    toast.success("Referral Code copied!");
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(invitationLink)}&text=${encodeURIComponent("Join RK444 and claim 100% Welcome Bonus!")}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(invitationLink)}`;

  return (
    <div className="rounded-2xl p-4 sm:p-6 bg-[#0a1626] border border-[#162e4a] shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#142844]">
        <div>
          <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
            <FaShareAlt className="text-[#3888e9]" />
            <span>Share Your Referral Invitation</span>
          </h3>
          <p className="text-[11px] text-gray-400 font-medium">
            Invite players through your link or invite code to activate rewards.
          </p>
        </div>

        {/* Quick Referral Code Pill */}
        {invitationCode && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3 py-1 rounded-xl bg-[#071322] border border-[#1b385c] flex items-center gap-2">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Code:</span>
              <span className="text-xs sm:text-sm font-black text-yellow-400 font-mono tracking-wider">
                {invitationCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer text-xs"
                title="Copy Code"
              >
                {copiedCode ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Copyable Link Input Bar */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">
          Your Personal Invitation Link:
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#06101c] border border-[#162e4a] text-white text-xs font-mono truncate select-all">
            {invitationLink}
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer whitespace-nowrap shadow-md ${
              copiedLink
                ? "bg-emerald-500 text-white"
                : "bg-[#3888e9] hover:bg-[#2873d1] text-white"
            }`}
          >
            {copiedLink ? <FaCheck size={12} /> : <FaCopy size={12} />}
            <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
          </button>
        </div>
      </div>

      {/* Real 1-Click Social Media Share Buttons */}
      <div className="pt-1 space-y-2">
        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">
          1-Click Social Media Share:
        </span>
        <div className="grid grid-cols-3 gap-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-[#128C7E]/20 hover:bg-[#128C7E]/30 border border-[#128C7E]/50 text-[#25D366] text-xs font-black flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <FaWhatsapp size={16} />
            <span className="hidden xs:inline">WhatsApp</span>
          </a>

          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-[#0088cc]/20 hover:bg-[#0088cc]/30 border border-[#0088cc]/50 text-[#0088cc] text-xs font-black flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <FaTelegram size={16} />
            <span className="hidden xs:inline">Telegram</span>
          </a>

          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border border-[#1877F2]/50 text-[#1877F2] text-xs font-black flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <FaFacebook size={16} />
            <span className="hidden xs:inline">Facebook</span>
          </a>
        </div>
      </div>
    </div>
  );
};
