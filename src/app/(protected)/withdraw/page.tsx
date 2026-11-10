"use client";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { MdHistory, MdOutlineSupportAgent } from "react-icons/md";
import { FaArrowLeftLong } from "react-icons/fa6";
import Withdraw from "./withdraw";

const WithdrawPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#003e3e] flex flex-col text-white pb-28">
      {/* Premium Dark Theme Header */}
      <header className="bg-[#0a1626] border-b border-[#1b3554] py-3.5 px-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 2) {
              router.back();
            } else {
              router.push("/member");
            }
          }}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#14263d] hover:bg-[#1e395b] active:scale-95 text-[#3888e9] hover:text-white border border-[#234267] transition-all cursor-pointer"
          title="Go Back"
        >
          <FaArrowLeftLong className="text-base" />
        </button>
        <h3 className="text-base font-bold text-white tracking-wide">Withdraw</h3>
        <div className="flex items-center gap-3">
          <Link
            href="/support"
            className="text-gray-300 hover:text-[#23FFC8] cursor-pointer transition-colors"
          >
            <MdOutlineSupportAgent className="text-xl" />
          </Link>
          <Link
            href="/history?type=withdraw"
            className="text-gray-300 hover:text-[#23FFC8] cursor-pointer transition-colors"
          >
            <MdHistory className="text-xl" />
          </Link>
        </div>
      </header>

      <main className="w-full max-w-md mx-auto px-4 py-6 space-y-5">
        <Withdraw />
      </main>
    </div>
  );
};

export default WithdrawPage;
