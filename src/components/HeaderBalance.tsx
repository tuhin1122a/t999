"use client";
import React, { useState } from "react";
import Link from "next/link";
import { RiAddCircleFill } from "react-icons/ri";
import { getCurrencySymbol } from "@/lib/utils";

const UserBalance = ({
  balance: initialBalance,
  currency,
}: {
  balance: number;
  currency: string;
}) => {
  const [currentBalance, setCurrentBalance] = useState<number>(initialBalance);

  React.useEffect(() => {
    setCurrentBalance(initialBalance);
  }, [initialBalance]);

  const handleRefresh = React.useCallback(async () => {
    try {
      const res = await fetch("/api/wallet", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data?.payload?.balance !== undefined) {
          setCurrentBalance(Number(data.payload.balance));
        }
      }
    } catch (err) {
      console.error("Failed to refresh balance:", err);
    }
  }, []);

  // Auto-refresh balance silently on tab focus and every 15 seconds
  React.useEffect(() => {
    const onFocus = () => {
      handleRefresh();
    };
    window.addEventListener("focus", onFocus);
    const interval = setInterval(() => {
      handleRefresh();
    }, 15_000);

    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [handleRefresh]);

  const currencySymbol = getCurrencySymbol(currency) || "৳";
  const formattedBalance = Number(currentBalance || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <section className="flex relative items-center h-full">
      <Link
        href="/deposit"
        title="Deposit Funds"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] border border-emerald-400/40 text-white rounded-lg text-xs sm:text-sm font-black shadow-md shadow-emerald-500/25 active:scale-95 transition-all select-none"
      >
        <RiAddCircleFill size={16} className="text-white shrink-0" />
        <span className="tracking-wide whitespace-nowrap">
          {currencySymbol}
          {formattedBalance}
        </span>
      </Link>
    </section>
  );
};

export default UserBalance;
