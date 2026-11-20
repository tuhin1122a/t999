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

export const UserAvatar = ({
  imageUrl = "https://images.51939393.com//TCG_PROD_IMAGES/B2C/01_PROFILE/PROFILE/0.png",
  size = "w-14 h-14",
}: {
  imageUrl?: string;
  size?: string;
}) => {
  return (
    <div
      className={`${size} rounded-full overflow-hidden border-2 border-[#23FFC8]/60 bg-[#003e3e] shadow-md flex items-center justify-center shrink-0`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt="User Avatar"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default UserBalance;
