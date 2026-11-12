/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { BiCoinStack } from "react-icons/bi";
import { FaCheck, FaLock, FaTrophy } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { ExtendedWithUserRewards } from "@/types/api/reward";
import { useClamInvitationRewardMutation } from "@/lib/features/rewardApiSlice";
import toast from "react-hot-toast";

interface RewardsProps {
  rewards: ExtendedWithUserRewards[];
}

const Rewards = ({ rewards }: RewardsProps) => {
  const [clamRewardApi, { isLoading }] = useClamInvitationRewardMutation();

  const handleClaimReward = (reward: ExtendedWithUserRewards) => {
    if (reward.isClaimed) {
      toast.success("You already claimed this milestone reward!");
      return;
    }

    if (reward.completedReferral < reward.targetReferral) {
      toast.error(
        `Invite ${reward.targetReferral - reward.completedReferral} more active friend(s) to unlock this reward!`
      );
      return;
    }

    clamRewardApi({ id: reward.id })
      .unwrap()
      .then((res: any) => {
        toast.success(res?.message || "Milestone reward successfully claimed!");
      })
      .catch((error: any) => {
        if (error?.data?.error) {
          toast.error(error.data.error);
        } else {
          toast.error("Could not claim reward. Please try again.");
        }
      });
  };

  if (!rewards || rewards.length === 0) {
    return (
      <div className="rounded-2xl p-8 bg-[#0a1626] border border-[#162e4a] text-center space-y-2">
        <FaTrophy className="text-yellow-400 text-3xl mx-auto" />
        <h4 className="text-sm font-black text-white">No Milestone Rewards Configured</h4>
        <p className="text-xs text-gray-400">Milestone tiers will appear here once active.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1">
        <div>
          <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <FaTrophy className="text-yellow-400" />
            <span>Referral Milestone Progression</span>
          </h3>
          <p className="text-[11px] text-gray-400 font-medium">
            Reach target active referrals to unlock instant cash rewards directly into your wallet.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {rewards.map((reward, i) => {
          const isCompleted = reward.completedReferral >= reward.targetReferral;
          const isClaimed = reward.isClaimed;
          const progressPercent = Math.min(
            100,
            Math.round((reward.completedReferral / reward.targetReferral) * 100)
          );

          return (
            <div
              key={reward.id || i}
              className={`rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
                isClaimed
                  ? "bg-[#071322] border border-[#142944] opacity-80"
                  : isCompleted
                  ? "bg-gradient-to-r from-[#0e2746] to-[#09182a] border-2 border-emerald-500/60 shadow-lg shadow-emerald-500/10"
                  : "bg-[#0a1626] border border-[#162e4a] hover:border-[#3888e9]/40"
              }`}
            >
              {/* Left Info */}
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-[#06101c] border border-[#1b385a] flex items-center justify-center shrink-0 shadow-inner">
                  {reward.rewardImg ? (
                    <img
                      src={reward.rewardImg}
                      alt="Badge"
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <span className="text-xl">🏆</span>
                  )}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-black text-white truncate">
                      Invite {reward.targetReferral} Active Player{reward.targetReferral > 1 ? "s" : ""}
                    </h4>
                    {isClaimed && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <FaCheck size={8} /> Claimed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-black text-yellow-400">
                    <BiCoinStack className="text-sm" />
                    <span>Reward: ৳ {Number(reward.prize).toLocaleString()} Cash</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1 max-w-xs">
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                      <span>Progress</span>
                      <span className="font-bold text-gray-300">
                        {reward.completedReferral} / {reward.targetReferral} Referrals
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#06101c] overflow-hidden border border-[#162e4a]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Action Button */}
              <div className="self-end sm:self-center shrink-0">
                {isClaimed ? (
                  <div className="px-4 py-2 rounded-xl bg-[#071322] border border-[#152e4c] text-gray-400 text-xs font-bold text-center">
                    Claimed ✓
                  </div>
                ) : isCompleted ? (
                  <button
                    type="button"
                    onClick={() => handleClaimReward(reward)}
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 text-white font-black text-xs shadow-lg shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer animate-pulse flex items-center gap-1.5"
                  >
                    <span>Claim ৳ {Number(reward.prize).toLocaleString()}</span>
                    <HiSparkles size={13} />
                  </button>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-[#06101c] border border-[#162e4a] text-gray-400 text-xs font-bold text-center flex items-center gap-1.5">
                    <FaLock size={10} />
                    <span>Locked ({reward.targetReferral - reward.completedReferral} more needed)</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Rewards;
