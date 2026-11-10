"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiAward } from "react-icons/bi";
import { GiCutDiamond } from "react-icons/gi";
import { IoGameController } from "react-icons/io5";
import { FaGift } from "react-icons/fa";
import { TfiHome } from "react-icons/tfi";

const TabNav = () => {
  const path = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-[999] flex justify-center pb-[env(safe-area-inset-bottom,0px)]">
      <div className="w-full md:w-[500px] px-2">
        <div
          className="flex items-center justify-between h-[56px] py-1 px-3 bg-[#0a1626]/95 border border-[#1b3554] rounded-2xl shadow-2xl backdrop-blur-md"
        >
          <div className="flex-1">
            <Link
              href="/"
              className={`flex flex-col items-center justify-center w-full transition-colors ${
                path === "/" ? "text-[#3888e9]" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <TfiHome style={{ width: 20, height: 20 }} className="mx-auto mb-0.5" />
              <p className="text-[11px] font-bold">Home</p>
            </Link>
          </div>
          <div className="flex-1">
            <Link
              href="/slots"
              className={`flex flex-col items-center justify-center w-full transition-colors ${
                path === "/slots" || path.startsWith("/play") || path.startsWith("/sportss")
                  ? "text-[#3888e9]"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <IoGameController style={{ width: 20, height: 20 }} className="mx-auto mb-0.5" />
              <p className="text-[11px] font-bold">Games</p>
            </Link>
          </div>
          {/* Middle VIP Invite */}
          <div className="flex-1">
            <Link
              href="/invite-friends"
              className="flex flex-col items-center justify-center w-full -mt-4"
            >
              <div
                className={`flex rounded-full items-center justify-center shadow-lg transition-transform active:scale-95 ${
                  path.startsWith("/invite-friends")
                    ? "bg-[#3888e9] text-white"
                    : "bg-gradient-to-tr from-[#10b981] to-[#059669] text-white"
                }`}
                style={{ width: 42, height: 42 }}
              >
                <FaGift style={{ width: 20, height: 20 }} />
              </div>
              <p className="text-[10px] font-bold text-gray-300 mt-1">Invite</p>
            </Link>
          </div>
          <div className="flex-1">
            <Link
              href="/rewardCenter"
              className={`flex flex-col items-center justify-center w-full transition-colors ${
                path.startsWith("/rewardCenter") || path.startsWith("/reward")
                  ? "text-[#3888e9]"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <BiAward style={{ width: 20, height: 20 }} className="mx-auto mb-0.5" />
              <p className="text-[11px] font-bold">Reward</p>
            </Link>
          </div>
          <div className="flex-1">
            <Link
              href="/member"
              className={`flex flex-col items-center justify-center w-full transition-colors ${
                path.startsWith("/member") ? "text-[#3888e9]" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <GiCutDiamond style={{ width: 20, height: 20 }} className="mx-auto mb-0.5" />
              <p className="text-[11px] font-bold">Profile</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabNav;
