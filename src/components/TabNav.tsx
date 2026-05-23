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
          className="flex items-center justify-between h-[52px] py-1 px-2"
          style={{
            background:
              "linear-gradient(180deg, var(--color-cyan-18, #005A5A) 0%, var(--color-cyan-12, #003E3E) 50%, var(--color-cyan-9, #002C2C) 100%)",
            boxShadow:
              "0px -3.12px 10.4px rgba(8, 186, 183, 0.40)",
            borderRadius: 36.4,
            borderTop: "1px solid var(--color-cyan-53, #26E7E4)",
          }}
        >
          <div className="flex-1">
            <Link
              href="/"
              className={`flex flex-col items-center justify-center  w-full ${
                path === "/" ? "text-[#FFBC00]" : "text-[#23FFC8]"
              }`}
            >
              <TfiHome style={{ width: 23, height: 23 }} className="mx-auto" />
              <p
                style={{
                  fontSize: 11.04,
                  fontFamily: "Segoe UI",
                  fontWeight: "700",
                }}
              >
                Home
              </p>
            </Link>
          </div>
          <div className="flex-1">
            <Link
              href="/slots"
              className={`flex flex-col items-center justify-center  w-full ${
                path === "/slots" || path.startsWith("/play") || path.startsWith("/sportss") || path.startsWith("/slots")
                  ? "text-[#FFBC00]"
                  : "text-[#23FFC8]"
              }`}
            >
              <IoGameController
                style={{ width: 23, height: 23 }}
                className="mx-auto"
              />
              <p
                style={{
                  fontSize: 11.04,
                  fontFamily: "Segoe UI",
                  fontWeight: "700",
                }}
              >
                Games
              </p>
            </Link>
          </div>
          {/* middle */}
          <div className="flex-1">
            <Link
              href="/invite-friends"
              className={`flex flex-col items-center justify-start w-full ${
                path.startsWith("/invite-friends") ? "text-[#FFBC00]" : "text-[#23FFC8]"
              }`}
            >
              <div
                className={`flex rounded-full relative left-0 top-0 items-center justify-center ${
                  path.startsWith("/invite-friends") ? "bg-[#FFBC00]" : "bg-[#23FFC8]"
                }`}
                style={{ width: 35, height: 35 }}
              >
                <FaGift
                  style={{ width: 20, height: 20 }}
                  className="mx-auto !text-slate-950"
                />
              </div>
              <p
                style={{
                  fontSize: 11.04,
                  fontFamily: "Segoe UI",
                  fontWeight: "700",
                }}
              >
                Invite
              </p>
            </Link>
          </div>
          <div className="flex-1">
            <Link
              href="/rewardCenter"
              className={`flex flex-col items-center justify-center  w-full ${
                path.startsWith("/rewardCenter") || path.startsWith("/reward")
                  ? "text-[#FFBC00]"
                  : "text-[#23FFC8]"
              }`}
            >
              <BiAward style={{ width: 23, height: 23 }} className="mx-auto" />

              <p
                style={{
                  fontSize: 11.04,
                  fontFamily: "Segoe UI",
                  fontWeight: "700",
                }}
              >
                Reward
              </p>
            </Link>
          </div>
          <div className="flex-1">
            <Link
              href="/member"
              className={`flex flex-col items-center justify-center  w-full ${
                path.startsWith("/member") ? "text-[#FFBC00]" : "text-[#23FFC8]"
              }`}
            >
              <GiCutDiamond
                style={{ width: 23, height: 23 }}
                className="mx-auto"
              />
              <p
                style={{
                  fontSize: 11.04,
                  fontFamily: "Segoe UI",
                  fontWeight: "700",
                }}
              >
                Member
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabNav;
