import React from "react";
import moment from "moment";
import { ReferredUserType } from "@/types/api/reward";
import { FaUserCheck, FaUserClock, FaRegCalendarAlt, FaUserFriends, FaShareAlt } from "react-icons/fa";

interface RecordsProps {
  referredUsers: ReferredUserType[];
}

const maskPhone = (phone: string) => {
  if (!phone) return "";
  if (phone.length <= 7) return phone;
  return phone.slice(0, 3) + "****" + phone.slice(-4);
};

const Records = ({ referredUsers }: RecordsProps) => {
  const validCount = (referredUsers || []).filter((u) => u.isValid).length;
  const pendingCount = (referredUsers || []).length - validCount;

  if (!referredUsers || referredUsers.length === 0) {
    return (
      <div className="rounded-2xl p-8 sm:p-12 bg-[#0a1626] border border-[#162e4a] text-center space-y-3">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#071322] border border-[#183454] flex items-center justify-center text-2xl text-gray-400">
          <FaUserFriends />
        </div>
        <h3 className="text-base font-black text-white">No Friends Invited Yet</h3>
        <p className="text-xs text-gray-400 max-w-sm mx-auto font-medium">
          Start inviting your friends to join RK444 using your referral link from the Overview tab to earn lifetime commission!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Summary Ribbon ────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5 bg-[#0a1626] border border-[#162e4a] p-3 sm:p-4 rounded-2xl shadow-sm text-center">
        <div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
            Total Invited
          </span>
          <span className="text-base sm:text-xl font-black text-white mt-0.5 block">
            {referredUsers.length}
          </span>
        </div>

        <div className="border-x border-[#142842]">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
            Valid Referrals
          </span>
          <span className="text-base sm:text-xl font-black text-emerald-400 mt-0.5 block">
            {validCount}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
            Pending Deposit
          </span>
          <span className="text-base sm:text-xl font-black text-amber-400 mt-0.5 block">
            {pendingCount}
          </span>
        </div>
      </div>

      {/* ── List of Referred Users ────────────────────────────────────── */}
      <div className="space-y-2.5">
        {referredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-[#0a1626] border border-[#162e4a] hover:border-[#3888e9]/40 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-all duration-200"
          >
            <div className="space-y-1">
              <span className="text-xs sm:text-sm font-black text-white font-mono block">
                {maskPhone(user.phone)}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400">
                <FaRegCalendarAlt className="text-[#3888e9]" />
                <span>Joined: {moment(user.createdAt).format("DD MMM YYYY, HH:mm")}</span>
              </div>
            </div>

            <div>
              {user.isValid ? (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full">
                  <FaUserCheck className="text-emerald-400" />
                  <span>Valid Referral ✓</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full">
                  <FaUserClock className="text-amber-400" />
                  <span>Pending Deposit</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Records;
