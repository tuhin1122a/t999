"use client";
import { useRouter } from "next/navigation";
import React, { useCallback } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";

const SiteHeader = ({
  children,
  title,
  fallbackUrl = "/",
}: {
  children?: React.ReactNode;
  title: string;
  fallbackUrl?: string;
}) => {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  }, [router, fallbackUrl]);

  return (
    <header className="bg-[#0a1626] border-b border-[#1b3554] py-3.5 px-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
      <button
        type="button"
        onClick={handleBack}
        className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#14263d] hover:bg-[#1e395b] active:scale-95 text-[#3888e9] hover:text-white border border-[#234267] transition-all cursor-pointer"
        title="Go Back"
        aria-label="Go Back"
      >
        <FaArrowLeftLong className="text-base" />
      </button>
      <h3 className="text-base font-bold text-white tracking-wide">{title}</h3>
      <div className="relative flex items-center gap-2">{children}</div>
    </header>
  );
};

export default SiteHeader;
