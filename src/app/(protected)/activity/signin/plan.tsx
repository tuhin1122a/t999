/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import gift_box from "@/../public/icons/rewards/gift-box.png";
import { useClaimSignRewardMutation } from "@/lib/features/rewardApiSlice";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { FaArrowRight, FaCheckCircle, FaLock } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

interface SigninBonusPlanProps {
  nextClaimAvailable?: any;
  isAuthenticated?: boolean;
}

const SigninBonusPlan = ({
  nextClaimAvailable,
  isAuthenticated,
}: SigninBonusPlanProps) => {
  const [claimApi, { isLoading }] = useClaimSignRewardMutation();

  const handleClaim = (id: string) => {
    claimApi({ id })
      .unwrap()
      .then((res: any) => {
        toast.success(res?.message || "Daily reward successfully credited!");
      })
      .catch((err: any) => {
        toast.error(err?.data?.error || "Could not claim reward. Please make sure you completed the deposit mission.");
      });
  };

  if (!nextClaimAvailable) {
    return (
      <div className="rounded-2xl p-5 bg-gradient-to-r from-emerald-950/60 to-[#0a182b] border border-emerald-500/40 text-center space-y-2">
        <h4 className="text-base font-black text-white flex items-center justify-center gap-2">
          <span>🏆</span>
          <span>Congratulations! You completed the 7-Day Streak!</span>
        </h4>
        <p className="text-xs text-gray-300 font-medium">
          Check back for the next streak cycle or explore our VIP cashback rewards.
        </p>
      </div>
    );
  }

  const isReadyToClaim = nextClaimAvailable.status === "CLAIM";
  const isAlreadyClaimed = nextClaimAvailable.status === "CLAIMED";

  return (
    <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-[#0d1e36] via-[#10243d] to-[#0a172a] border border-[#1d3d66] shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Icon & Mission Info */}
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#122845] to-[#071322] border border-yellow-500/40 flex items-center justify-center shadow-lg shadow-yellow-500/10 flex-shrink-0">
            <Image
              src={gift_box}
              alt="Gift box"
              className="w-10 h-10 object-contain drop-shadow"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-[10px] font-black uppercase tracking-wider">
                Day {nextClaimAvailable.day} Mission
              </span>
              {isReadyToClaim ? (
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                  <FaCheckCircle size={11} /> Ready to Claim
                </span>
              ) : isAlreadyClaimed ? (
                <span className="text-gray-400 text-xs font-bold">
                  Claimed Today ✓
                </span>
              ) : (
                <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
                  <FaLock size={10} /> Deposit Required
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-black text-white">
              Unlock Day {nextClaimAvailable.day} Reward:{" "}
              <span className="text-yellow-400 font-extrabold">
                ৳ {nextClaimAvailable.prize} Cash
              </span>
            </h3>

            <p className="text-[11px] sm:text-xs text-gray-300 font-medium">
              Deposit <strong className="text-white">৳ {nextClaimAvailable.deposit}</strong> or more to unlock and claim today&apos;s free cash reward.
            </p>
          </div>
        </div>

        {/* Right: Action Button */}
        <div className="self-stretch sm:self-auto flex items-center justify-end">
          {isReadyToClaim ? (
            <button
              type="button"
              onClick={() => handleClaim(nextClaimAvailable.id)}
              disabled={isLoading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs shadow-lg shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
            >
              <span>Claim ৳ {nextClaimAvailable.prize} Now</span>
              <HiSparkles size={14} />
            </button>
          ) : isAlreadyClaimed ? (
            <div className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#091524] border border-[#162e4a] text-gray-400 text-xs font-bold text-center">
              Claimed for Today ✓
            </div>
          ) : isAuthenticated ? (
            <Link
              href="/deposit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <span>Deposit ৳ {nextClaimAvailable.deposit}</span>
              <FaArrowRight size={11} />
            </Link>
          ) : (
            <Link
              href="/login?redirect=/activity/signin"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#3888e9] hover:bg-[#2873d1] text-white font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <span>Log In to Check-in</span>
              <FaArrowRight size={11} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default SigninBonusPlan;
