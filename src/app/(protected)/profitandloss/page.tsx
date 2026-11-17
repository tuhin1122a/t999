"use client";

import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { useGetBettingRecordQuery } from "@/lib/features/bettingRecord";

export default function BettingRecordsPage() {
  const { data, isLoading, isError } = useGetBettingRecordQuery({});

  const totalBet = Number(data?.totalBet ?? 0);
  const totalWin = Number(data?.totalWin ?? 0);
  const netPL = totalWin - totalBet;
  const winRate = Number(data?.winningRate ?? 0);

  return (
    <div className="min-h-screen bg-[#070e17] text-white pb-20">
      <SiteHeader title="Profit & Loss Summary" />

      <div className="px-4 py-5 max-w-3xl mx-auto space-y-4">
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-400"></div>
          </div>
        )}

        {isError && (
          <div className="bg-rose-950/60 border border-rose-500/40 text-rose-300 px-4 py-3 rounded-xl text-sm">
            Failed to load betting summary. Please try again.
          </div>
        )}

        {data && !isLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#0d1b2a] border border-[#162e4a] p-4 rounded-xl">
                <h3 className="text-gray-400 text-xs font-medium">Total Bet</h3>
                <p className="text-xl font-bold text-amber-400 font-mono mt-1">
                  ৳{totalBet.toFixed(2)}
                </p>
              </div>
              <div className="bg-[#0d1b2a] border border-[#162e4a] p-4 rounded-xl">
                <h3 className="text-gray-400 text-xs font-medium">Total Win</h3>
                <p className="text-xl font-bold text-emerald-400 font-mono mt-1">
                  ৳{totalWin.toFixed(2)}
                </p>
              </div>
              <div className="bg-[#0d1b2a] border border-[#162e4a] p-4 rounded-xl">
                <h3 className="text-gray-400 text-xs font-medium">
                  Net Profit / Loss
                </h3>
                <p
                  className={`text-xl font-bold font-mono mt-1 ${
                    netPL >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {netPL >= 0 ? "+" : ""}৳{netPL.toFixed(2)}
                </p>
              </div>
              <div className="bg-[#0d1b2a] border border-[#162e4a] p-4 rounded-xl">
                <h3 className="text-gray-400 text-xs font-medium">
                  Winning Rate
                </h3>
                <p className="text-xl font-bold text-purple-400 font-mono mt-1">
                  {winRate.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="bg-[#0d1b2a] border border-[#162e4a] p-4 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Full Round-by-Round Bet History
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  View every game round, stake, multiplier, and payout.
                </p>
              </div>
              <Link
                href="/betting-record"
                className="px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-black"
              >
                View Bet History
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
