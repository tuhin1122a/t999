/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import { FaCalendarCheck, FaUserPlus, FaCrown, FaGift, FaArrowRight, FaCheck, FaCoins } from "react-icons/fa6";
import { HiSparkles } from "react-icons/hi2";
import { MdCelebration, MdOutlineVerified } from "react-icons/md";

const REWARD_CHANNELS = [
  {
    id: "signin",
    title: "Daily Login Streak",
    subtitle: "Claim free rewards every 24 hours. Keep your daily streak alive for massive 7-day cash drops!",
    badge: "FREE CASH",
    badgeColor: "bg-emerald-500 text-white",
    icon: <FaCalendarCheck className="text-emerald-400 text-2xl" />,
    gradient: "from-[#0a2820] to-[#081524]",
    borderColor: "border-emerald-500/40 hover:border-emerald-400",
    buttonText: "Check-in Now",
    href: "/activity/signin",
  },
  {
    id: "invite",
    title: "Invite Friends & Earn",
    subtitle: "Share your referral link. Earn 300 BDT for you and 300 BDT for your friend on their first deposit!",
    badge: "600 ৳ REWARD",
    badgeColor: "bg-gradient-to-r from-purple-500 to-indigo-600 text-white",
    icon: <FaUserPlus className="text-purple-400 text-2xl" />,
    gradient: "from-[#1e1035] to-[#081524]",
    borderColor: "border-purple-500/40 hover:border-purple-400",
    buttonText: "Invite Friends",
    href: "/invite-friends",
  },
  {
    id: "vip",
    title: "VIP Club & Cashback",
    subtitle: "Ascend through Bronze to Diamond Elite. Enjoy up to 20% weekly cashback and level-up cash gifts.",
    badge: "20% CASHBACK",
    badgeColor: "bg-gradient-to-r from-yellow-500 to-amber-500 text-black",
    icon: <FaCrown className="text-yellow-400 text-2xl" />,
    gradient: "from-[#291c06] to-[#081524]",
    borderColor: "border-yellow-500/40 hover:border-yellow-400",
    buttonText: "View VIP Status",
    href: "/vip",
  },
  {
    id: "promotions",
    title: "Promotion Hub",
    subtitle: "100% Welcome bonus, 3% instant on every deposit, and 1100% weekly slots reload promotions.",
    badge: "8 ACTIVE OFFERS",
    badgeColor: "bg-[#3888e9] text-white",
    icon: <FaGift className="text-[#3888e9] text-2xl" />,
    gradient: "from-[#0c223c] to-[#081524]",
    borderColor: "border-[#3888e9]/40 hover:border-[#3888e9]",
    buttonText: "Browse Offers",
    href: "/promotion",
  },
];

const DAILY_QUESTS = [
  {
    title: "Daily Login Check",
    reward: "+10 ৳ Free Cash",
    status: "Ready",
    progress: "1/1",
    completed: true,
  },
  {
    title: "Play 10 Rounds in Slots",
    reward: "+50 ৳ Game Credit",
    status: "In Progress",
    progress: "6/10",
    completed: false,
  },
  {
    title: "Make a 500 BDT Deposit",
    reward: "+3% Instant Bonus",
    status: "Pending",
    progress: "0/1",
    completed: false,
  },
];

const RewardCards = () => {
  return (
    <div className="space-y-6">
      {/* ── 1. Main Reward Avenues (2x2 Grid) ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REWARD_CHANNELS.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl p-5 bg-gradient-to-br ${item.gradient} border ${item.borderColor} shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 group`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#06101c] border border-[#1b385a] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                  {item.icon}
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-white group-hover:text-[#3888e9] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed font-medium mt-1">
                  {item.subtitle}
                </p>
              </div>
            </div>

            <Link
              href={item.href}
              className="py-2.5 px-4 rounded-xl bg-[#0f223a] hover:bg-[#183963] border border-[#1e426d] text-white font-extrabold text-xs flex items-center justify-between active:scale-95 transition-all shadow-sm"
            >
              <span>{item.buttonText}</span>
              <FaArrowRight size={11} className="text-[#3888e9]" />
            </Link>
          </div>
        ))}
      </div>

      {/* ── 2. Daily Rewards Missions & Challenges ──────────────────────── */}
      <div className="rounded-2xl p-5 bg-[#0a1626] border border-[#162e4a] shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#162e4a]">
          <div className="flex items-center gap-2">
            <HiSparkles className="text-yellow-400 text-lg" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Daily Missions & Quests
            </h3>
          </div>
          <span className="text-[11px] text-gray-400 font-medium">Resets Daily at 00:00</span>
        </div>

        <div className="space-y-2.5">
          {DAILY_QUESTS.map((quest, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl bg-[#06101c] border border-[#162e4a] text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    quest.completed ? "bg-emerald-500 text-white" : "bg-[#142842] text-gray-400"
                  }`}
                >
                  {quest.completed ? <FaCheck size={10} /> : i + 1}
                </div>
                <div>
                  <div className="font-extrabold text-white">{quest.title}</div>
                  <div className="text-[11px] text-emerald-400 font-bold">{quest.reward}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400 font-mono font-bold">
                  {quest.progress}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                    quest.completed
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-[#142842] text-gray-300 border border-[#1e3c66]"
                  }`}
                >
                  {quest.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RewardCards;
