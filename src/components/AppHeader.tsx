"use client";
import { useRouter } from "next/navigation";
import React, { useCallback } from "react";
import { IoIosArrowBack } from "react-icons/io";

interface AppHeaderProps {
  title: string;
  fallbackUrl?: string;
  rightAction?: React.ReactNode;
}

const AppHeader = ({ title, fallbackUrl = "/", rightAction }: AppHeaderProps) => {
  const router = useRouter();

  const handleBack = useCallback(() => {
    // Directly navigate to Home page (or fallbackUrl) as required
    router.push(fallbackUrl || "/");
  }, [router, fallbackUrl]);

  return (
    <div className="flex sticky z-[100] top-0 w-full px-3 py-2.5 items-center justify-between bg-[#0a1626] border-b border-[#1b3554] shadow-md">
      <button
        type="button"
        onClick={handleBack}
        className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#14263d] hover:bg-[#1e395b] active:scale-95 text-[#3888e9] hover:text-white border border-[#234267] transition-all cursor-pointer"
        title="Go to Home"
        aria-label="Go to Home"
      >
        <IoIosArrowBack className="w-5 h-5" />
      </button>

      <div className="flex-1 px-2 text-center">
        <h3 className="text-white text-base font-bold tracking-wide truncate">
          {title}
        </h3>
      </div>

      <div className="min-w-[36px] flex justify-end">
        {rightAction || <div className="w-9" />}
      </div>
    </div>
  );
};

export default AppHeader;
