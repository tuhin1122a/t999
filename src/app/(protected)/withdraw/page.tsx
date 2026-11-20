"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MdHistory, MdOutlineSupportAgent } from "react-icons/md";
import { FaArrowLeftLong } from "react-icons/fa6";
import LiveChatTrigger from "@/components/LiveChatTrigger";
import TabNav from "@/components/TabNav";
import Withdraw from "./withdraw";

const WithdrawPage = () => {
  const router = useRouter();
  const { status: authStatus } = useSession();

  useEffect(() => {
    if (typeof window !== "undefined" && authStatus === "unauthenticated") {
      router.replace("/login?redirect=/withdraw");
    }
  }, [authStatus, router]);

  return (
    <div className="min-h-screen bg-[#070e17] flex flex-col text-white pb-28">
      {/* Premium Dark Theme Header */}
      <header className="bg-[#0a1626] border-b border-[#1b3554] py-3.5 px-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#14263d] hover:bg-[#1e395b] active:scale-95 text-[#3888e9] hover:text-white border border-[#234267] transition-all cursor-pointer"
          title="Go to Home"
        >
          <FaArrowLeftLong className="text-base" />
        </button>
        <h3 className="text-base font-bold text-white tracking-wide">Withdraw</h3>
        <div className="flex items-center gap-3">
          <LiveChatTrigger
            fallbackHref="/support"
            title="Live Chat Support"
            ariaLabel="Live Chat Support"
            className="text-gray-300 hover:text-[#23FFC8] cursor-pointer transition-colors flex items-center"
          >
            <MdOutlineSupportAgent className="text-xl" />
          </LiveChatTrigger>
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

      <TabNav />
    </div>
  );
};

export default WithdrawPage;
