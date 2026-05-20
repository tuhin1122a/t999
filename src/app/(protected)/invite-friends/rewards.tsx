import React from "react";

import Image from "next/image";

import { BiCoinStack } from "react-icons/bi";
import { ExtendedWithUserRewards } from "@/types/api/reward";
import { useClamInvitationRewardMutation } from "@/lib/features/rewardApiSlice";
import { toast } from "sonner";
import { INTERNAL_SERVER_ERROR } from "@/error";

interface RewardsProps {
  rewards: ExtendedWithUserRewards[];
}

const Rewards = ({ rewards }: RewardsProps) => {
  const [clamRewardApi, { isLoading }] = useClamInvitationRewardMutation();

  const handleClamReward = (reward: ExtendedWithUserRewards) => {
    if (reward.isClaimed) {
      toast.success("You already clamed this reward");
      return;
    }

    if (reward.targetReferral !== reward.completedReferral) {
      toast.success("Please refer more users to get it");
      return;
    }

    clamRewardApi({ id: reward.id })
      .unwrap()
      .then()
      .catch((error) => {
        if (error.data.error) {
          toast.error(error.data.error);
        } else {
          toast.error(INTERNAL_SERVER_ERROR);
        }
      });
  };
  return (
    <div>
      <div className="space-y-4">
        {rewards.map((reward, i) => (
          <div
            key={i}
            className="bg-white border border-[#e0e9f1] rounded-xl p-3 flex items-center gap-3 shadow-md hover:shadow-lg transition-all duration-300"
          >
            {/* Left side: Icon */}
            <div className="w-[18%] flex justify-center items-center shrink-0">
              <img
                src={reward.rewardImg}
                width={50}
                height={55}
                alt="reward badge"
                className="w-[45px] h-auto object-contain"
              />
            </div>

            {/* Right side: Information and Action */}
            <div className="w-[82%] flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-[#1b1b4b] leading-tight break-words">
                  Over {reward.targetReferral} valid referral{reward.targetReferral > 1 ? 's' : ''}
                </h4>
                <div className="flex items-center gap-1.5 mt-1 text-sm font-extrabold text-[#3b2987]">
                  <BiCoinStack className="w-4 h-4 text-amber-500" />
                  <span>৳ {+reward.prize} BDT</span>
                </div>
              </div>

              {/* Progress and Button */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="text-right">
                  <span className="text-sm font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {reward.completedReferral} / {reward.targetReferral}
                  </span>
                </div>

                <button
                  onClick={() => handleClamReward(reward)}
                  disabled={
                    reward.isClaimed ||
                    reward.targetReferral !== reward.completedReferral ||
                    isLoading
                  }
                  className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transition-all duration-300 cursor-pointer ${
                    reward.isClaimed
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                      : reward.targetReferral === reward.completedReferral
                      ? "bg-[linear-gradient(135deg,_#6b73ff,_#000dff)] text-white hover:brightness-110 active:scale-95"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  {reward.isClaimed
                    ? "Claimed"
                    : reward.targetReferral === reward.completedReferral
                    ? "Claim Now"
                    : "Locked"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rewards;
