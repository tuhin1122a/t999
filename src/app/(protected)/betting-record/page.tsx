/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import {
  FaCoins,
  FaGamepad,
  FaSyncAlt,
  FaTrophy,
  FaChartLine,
} from "react-icons/fa";

interface BetRecordItem {
  id: string;
  serialNumber: string;
  gameUid: string;
  gameName: string;
  provider?: string | null;
  gameRound?: string | null;
  betAmount: number;
  winAmount: number;
  multiplier: number;
  creditAmount: number;
  status: string;
  freeSpinBonus?: string | null;
  createdAt: string;
}

interface BettingRecordResponse {
  totalBet: number;
  totalWin: number;
  netProfitLoss: number;
  winningRate: number;
  totalRounds: number;
  records: BetRecordItem[];
  total: number;
  page: number;
  limit: number;
}

const STATUS_TABS = [
  { value: "ALL", label: "All Bets" },
  { value: "WIN", label: "Won" },
  { value: "LOSS", label: "Lost" },
  { value: "REFUND", label: "Refund" },
];

export default function BettingRecordsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);
  const [data, setData] = useState<BettingRecordResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [brokenImgs, setBrokenImgs] = useState<Record<string, boolean>>({});

  const fetchRecords = useCallback(
    async (pageNum = page, statusVal = statusFilter) => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/betting-records?status=${encodeURIComponent(
            statusVal
          )}&page=${pageNum}&limit=20`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load betting history:", err);
      } finally {
        setLoading(false);
      }
    },
    [page, statusFilter]
  );

  useEffect(() => {
    fetchRecords(page, statusFilter);
  }, [page, statusFilter, fetchRecords]);

  const totalPages = data?.total ? Math.ceil(data.total / (data.limit || 20)) : 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#070e17] text-white pb-20">
      <SiteHeader title="Betting Record">
        <button
          onClick={() => fetchRecords(page, statusFilter)}
          className="text-teal-400 hover:text-teal-300 p-1.5"
          title="Refresh"
        >
          <FaSyncAlt className={loading ? "animate-spin" : ""} />
        </button>
      </SiteHeader>

      <div className="px-4 py-4 space-y-4 max-w-3xl mx-auto">
        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-xl bg-[#0d1b2a] border border-[#162e4a] p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <FaCoins className="text-amber-400" />
              <span>Total Bet</span>
            </div>
            <p className="text-lg font-bold text-amber-400 mt-1 font-mono">
              ৳{Number(data?.totalBet || 0).toFixed(2)}
            </p>
          </div>

          <div className="rounded-xl bg-[#0d1b2a] border border-[#162e4a] p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <FaTrophy className="text-emerald-400" />
              <span>Total Win</span>
            </div>
            <p className="text-lg font-bold text-emerald-400 mt-1 font-mono">
              ৳{Number(data?.totalWin || 0).toFixed(2)}
            </p>
          </div>

          <div className="rounded-xl bg-[#0d1b2a] border border-[#162e4a] p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <FaChartLine className="text-sky-400" />
              <span>Net P/L</span>
            </div>
            {(() => {
              const net = Number(data?.netProfitLoss || 0);
              return (
                <p
                  className={`text-lg font-bold mt-1 font-mono ${
                    net >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {net >= 0 ? "+" : ""}৳{net.toFixed(2)}
                </p>
              );
            })()}
          </div>

          <div className="rounded-xl bg-[#0d1b2a] border border-[#162e4a] p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <FaGamepad className="text-purple-400" />
              <span>Total Rounds</span>
            </div>
            <p className="text-lg font-bold text-purple-400 mt-1 font-mono">
              {data?.totalRounds || 0}
            </p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 bg-[#0d1b2a] border border-[#162e4a] rounded-xl p-1.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                statusFilter === tab.value
                  ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bet History List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-[#0d1b2a] border border-[#162e4a] p-4 animate-pulse h-24"
              />
            ))}
          </div>
        ) : data?.records && data.records.length > 0 ? (
          <div className="space-y-3">
            {data.records.map((bet) => {
              const imgUrl = `https://igamingapis.com/img/${bet.gameUid}.png`;
              const imgFailed = brokenImgs[bet.id];
              const isWin = bet.status === "WIN";
              const isRefund = bet.status === "REFUND";

              return (
                <div
                  key={bet.id}
                  className="rounded-xl bg-[#0d1b2a] border border-[#162e4a] p-3.5 shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {!imgFailed && bet.gameUid && bet.gameUid !== "unknown" ? (
                        <img
                          src={imgUrl}
                          alt={bet.gameName}
                          className="w-12 h-12 rounded-lg object-cover bg-[#070e17] border border-[#162e4a] shrink-0"
                          onError={() =>
                            setBrokenImgs((prev) => ({
                              ...prev,
                              [bet.id]: true,
                            }))
                          }
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#070e17] border border-[#162e4a] flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                          <FaGamepad className="text-lg" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-white truncate">
                          {bet.gameName}
                        </h4>
                        <p className="text-[11px] text-gray-400 font-mono truncate">
                          Round: #{bet.gameRound || bet.serialNumber.slice(0, 14)}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {formatDate(bet.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isWin
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                            : isRefund
                            ? "bg-sky-500/15 text-sky-400 border-sky-500/40"
                            : "bg-rose-500/15 text-rose-400 border-rose-500/40"
                        }`}
                      >
                        {bet.status} ({bet.multiplier.toFixed(2)}x)
                      </span>
                      <p
                        className={`text-sm font-bold font-mono mt-1 ${
                          bet.winAmount > 0 ? "text-emerald-400" : "text-gray-400"
                        }`}
                      >
                        Win: ৳{bet.winAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#162e4a]/80 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Bet Stake: </span>
                      <span className="font-mono font-semibold text-amber-400">
                        ৳{bet.betAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-400">Net: </span>
                      <span
                        className={`font-mono font-semibold ${
                          bet.winAmount - bet.betAmount >= 0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {bet.winAmount - bet.betAmount >= 0 ? "+" : ""}৳
                        {(bet.winAmount - bet.betAmount).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400">Balance: </span>
                      <span className="font-mono font-semibold text-gray-200">
                        ৳{bet.creditAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0d1b2a] border border-[#162e4a] disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0d1b2a] border border-[#162e4a] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl bg-[#0d1b2a] border border-[#162e4a] p-10 text-center">
            <FaGamepad className="text-4xl text-gray-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-300">
              No betting history found yet
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Every game round you play will automatically appear here with bet,
              win, and balance details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
