import NoData from "@/components/no-data";
import React from "react";
import moment from "moment";
import { ReferredUserType } from "@/types/api/reward";
import { FaUserCheck, FaUserClock, FaRegCalendarAlt } from "react-icons/fa";

interface RecordsProps {
  referredUsers: ReferredUserType[];
}

const maskPhone = (phone: string) => {
  if (!phone) return "";
  if (phone.length <= 7) return phone;
  return phone.slice(0, 3) + "****" + phone.slice(-4);
};

const Records = ({ referredUsers }: RecordsProps) => {
  if (!referredUsers || referredUsers.length === 0) {
    return <NoData />;
  }

  const validCount = referredUsers.filter((u) => u.isValid).length;

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="bg-[linear-gradient(135deg,_#f3f7fb_0,_#e0e9f1_100%)] p-4 rounded-xl border border-[#d2dbe5] flex items-center justify-around shadow-sm">
        <div className="text-center">
          <span className="text-xs text-[#566073] font-bold uppercase tracking-wider block">Total Invited</span>
          <span className="text-2xl font-black text-[#1b1b4b] mt-0.5 block">{referredUsers.length}</span>
        </div>
        <div className="h-8 w-[1px] bg-[#c3cedb]" />
        <div className="text-center">
          <span className="text-xs text-[#566073] font-bold uppercase tracking-wider block">Valid Referrals</span>
          <span className="text-2xl font-black text-green-600 mt-0.5 block">{validCount}</span>
        </div>
      </div>

      {/* List of Referred Users */}
      <div className="space-y-3">
        {referredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white border border-[#e0e9f1] rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="space-y-1">
              <span className="text-base font-bold text-[#1b1b4b] block">
                {maskPhone(user.phone)}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#8a96a3]">
                <FaRegCalendarAlt className="w-3.5 h-3.5 text-indigo-400" />
                <span>Joined: {moment(user.createdAt).format("YYYY-MM-DD HH:mm")}</span>
              </div>
            </div>

            <div>
              {user.isValid ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
                  <FaUserCheck className="w-3 h-3 text-green-600" />
                  Valid Referral
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                  <FaUserClock className="w-3 h-3 text-amber-500 animate-pulse" />
                  Registered
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
