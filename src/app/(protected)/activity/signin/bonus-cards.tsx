/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaCheck, FaLock, FaGift, FaCrown } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { useClaimSignRewardMutation } from "@/lib/features/rewardApiSlice";
import toast from "react-hot-toast";
import money from "@/../public/icons/rewards/money.png";
import gift_box from "@/../public/icons/rewards/gift-box.png";

interface BonusCardsProps {
  rewards: any[];
  isAuthenticated?: boolean;
}

const BonusCards = ({ rewards, isAuthenticated }: BonusCardsProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
          <HiSparkles className="text-yellow-400" />
          <span>7-Day Reward Progression Calendar</span>
        </h3>
        <span className="text-[11px] text-gray-400 font-medium">
          Check in consecutive days for higher cash drops
        </span>
      </div>

      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2.5 sm:gap-3">
        {rewards.map((reward, i) => (
          <BonusCard
            reward={reward}
            key={reward.id || i}
            isDaySeven={reward.day === "7" || i === 6}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
    </div>
  );
};

export default BonusCards;

interface BonusCardProps {
  reward: any;
  isDaySeven?: boolean;
  isAuthenticated?: boolean;
}

const BonusCard = ({ reward, isDaySeven, isAuthenticated }: BonusCardProps) => {
  const [claimApi, { isLoading }] = useClaimSignRewardMutation();

  const handleClaimReward = (id: string) => {
    claimApi({ id })
      .unwrap()
      .then((res: any) => {
        toast.success(res?.message || `Day ${reward.day} bonus claimed!`);
      })
      .catch((error: any) => {
        if (error?.data?.error) {
          toast.error(error.data.error);
        } else {
          toast.error("Deposit required to unlock this day's reward.");
        }
      });
  };

  const isClaimed = reward.status === "CLAIMED";
  const isReadyToClaim = reward.status === "CLAIM";

  return (
    <div
      className={`relative rounded-2xl p-3 flex flex-col justify-between transition-all duration-300 ${
        isDaySeven
          ? "bg-gradient-to-b from-[#1b2b42] to-[#0a1626] border-2 border-yellow-500/70 shadow-lg shadow-yellow-500/10 -translate-y-0.5"
          : isReadyToClaim
          ? "bg-gradient-to-b from-[#10243d] to-[#081324] border-2 border-emerald-500/60 shadow-lg shadow-emerald-500/10"
          : isClaimed
          ? "bg-[#071322] border border-[#142944] opacity-80"
          : "bg-[#091524] border border-[#152e4c] hover:border-[#3888e9]/50"
      }`}
    >
      {/* Day Tag */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[#142b47]">
        <span
          className={`text-[10px] font-black uppercase tracking-wider ${
            isDaySeven
              ? "text-yellow-400 flex items-center gap-1"
              : isReadyToClaim
              ? "text-emerald-400 font-extrabold"
              : "text-gray-400"
          }`}
        >
          {isDaySeven && <FaCrown size={10} />}
          Day {reward.day}
        </span>

        {isClaimed && (
          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
            <FaCheck size={8} />
          </span>
        )}
      </div>

      {/* Reward Icon & Prize */}
      <div className="py-2.5 flex flex-col items-center justify-center text-center space-y-1">
        <div className="w-10 h-10 rounded-xl bg-[#06101c] border border-[#1b385a] flex items-center justify-center shadow-inner">
          <Image
            src={isDaySeven ? gift_box : money}
            alt="Reward"
            className="w-7 h-7 object-contain"
          />
        </div>

        <div>
          <span className="text-[10px] text-gray-400 block font-medium">Reward</span>
          <span
            className={`text-sm sm:text-base font-black ${
              isDaySeven
                ? "text-yellow-400"
                : isReadyToClaim
                ? "text-emerald-400"
                : "text-white"
            }`}
          >
            ৳ {reward.prize}
          </span>
        </div>

        <span className="text-[9px] text-gray-400 font-mono block">
          Min Dep: ৳ {reward.deposit}
        </span>
      </div>

      {/* Button */}
      <div className="pt-1">
        {isClaimed ? (
          <div className="w-full py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-black text-center">
            Claimed ✓
          </div>
        ) : isReadyToClaim ? (
          <button
            type="button"
            onClick={() => handleClaimReward(reward.id)}
            disabled={isLoading}
            className="w-full py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 text-white text-[10px] font-black shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer animate-pulse"
          >
            {isLoading ? "..." : `Claim ৳ ${reward.prize}`}
          </button>
        ) : isAuthenticated ? (
          <Link
            href="/deposit"
            className="w-full py-1.5 rounded-xl bg-[#0a182b] hover:bg-[#122842] border border-[#183454] text-gray-300 hover:text-white text-[10px] font-bold text-center block transition-all"
          >
            Deposit
          </Link>
        ) : (
          <Link
            href="/login?redirect=/activity/signin"
            className="w-full py-1.5 rounded-xl bg-[#0a182b] hover:bg-[#122842] border border-[#183454] text-gray-300 hover:text-white text-[10px] font-bold text-center block transition-all"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
};
