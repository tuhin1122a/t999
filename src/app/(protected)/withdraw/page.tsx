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
      <header className="bg-[#002632] border-b border-[#006165] py-4 px-6 flex items-center justify-between sticky top-0 z-10 shadow-[rgba(0,38,49,0.3)_0px_2px_8px_0px]">
        <button
          onClick={() => router.back()}
          className="text-gray-300 hover:text-white cursor-pointer transition-colors"
        >
          <FaArrowLeftLong className="text-xl" />
        </button>
        <h3 className="text-lg font-bold text-white tracking-wide">Withdraw</h3>
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
