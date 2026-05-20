/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useGetHistoryQuery } from "@/lib/features/historyApiSlice";
import SiteHeader from "@/components/SiteHeader";
import Link from "next/link";
import {
  FaWallet,
  FaArrowDown,
  FaArrowUp,
  FaChevronDown,
  FaChevronUp,
  FaCopy,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { MdHistory } from "react-icons/md";

export default function HistoryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const type = searchParams.get("type") || "all";
  const status = searchParams.get("status") || "all";
  const page = parseInt(searchParams.get("page") || "1");

  const { data, isLoading, isFetching } = useGetHistoryQuery({
    type,
    status,
    page,
  });

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setExpandedItems({});
  }, [type, status, page]);

  const handleTypeChange = (newType: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("type", newType);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleStatusChange = (newStatus: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("status", newStatus);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          icon: <FaClock className="text-amber-400" />,
          label: "Pending",
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          dot: "bg-amber-400",
        };
      case "APPROVED":
        return {
          icon: <FaCheckCircle className="text-emerald-500" />,
          label: "Approved",
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          dot: "bg-emerald-500",
        };
      case "REJECTED":
        return {
          icon: <FaTimesCircle className="text-red-500" />,
          label: "Rejected",
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          dot: "bg-red-500",
        };
      default:
        return {
          icon: <FaClock className="text-gray-400" />,
          label: status,
          bg: "bg-gray-50",
          text: "text-gray-600",
          border: "border-gray-200",
          dot: "bg-gray-400",
        };
    }
  };

  const totalPages = data?.total ? Math.ceil(data.total / 10) : 0;
  const tabs = [
    { value: "all", label: "All" },
    { value: "deposit", label: "Deposit" },
    { value: "withdraw", label: "Withdraw" },
  ];
  const statusFilters = [
    { value: "all", label: "All Status" },
    { value: "Pending", label: "Pending" },
    { value: "Success", label: "Approved" },
    { value: "Rejected", label: "Rejected" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader title="Transaction History">
        <Link href="/deposit" className="text-gray-700 hover:text-gray-900">
          <FaWallet className="text-lg" />
        </Link>
      </SiteHeader>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
        {/* Type Tabs */}
        <div className="flex gap-1 mb-3 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTypeChange(tab.value)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-all ${
                type === tab.value
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statusFilters.map((sf) => (
            <button
              key={sf.value}
              onClick={() => handleStatusChange(sf.value)}
              className={`flex-shrink-0 py-1.5 px-3 rounded-full text-xs font-semibold border transition-all ${
                status === sf.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="px-4 py-4 space-y-3">
        {isLoading || isFetching ? (
          // Skeleton Loader
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 shadow-sm animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-100 rounded w-24" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MdHistory className="text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium text-lg">No transactions found</p>
            <p className="text-gray-400 text-sm mt-1">
              Your deposit and withdrawal history will appear here
            </p>
            <Link
              href="/deposit"
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all"
            >
              Make a Deposit
            </Link>
          </div>
        ) : (
          // Transaction Cards
          data.data.map((item: any) => {
            const statusCfg = getStatusConfig(item.status);
            const isDeposit = item.type === "deposit";
            const isExpanded = expandedItems[item.id];

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
              >
                {/* Main Row */}
                <div
                  className="p-4 flex items-center gap-3 cursor-pointer"
                  onClick={() => toggleExpand(item.id)}
                >
                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isDeposit ? "bg-emerald-50" : "bg-red-50"
                    }`}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.paymentMethod}
                        className="w-7 h-7 object-contain rounded-full"
                        onError={(e) => {
                          const t = e.target as HTMLImageElement;
                          t.style.display = "none";
                        }}
                      />
                    ) : isDeposit ? (
                      <FaArrowDown className="text-emerald-500 text-lg" />
                    ) : (
                      <FaArrowUp className="text-red-500 text-lg" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-sm">
                        {isDeposit ? "Deposit" : "Withdraw"}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        •
                      </span>
                      <span className="text-xs text-gray-500 font-medium truncate">
                        {item.paymentMethod || "Manual"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(item.createdAt)}
                    </p>
                    {/* TrxID preview */}
                    {item.trxID && (
                      <p className="text-xs text-blue-500 font-mono mt-0.5 truncate">
                        TRX: {item.trxID}
                      </p>
                    )}
                  </div>

                  {/* Amount + Status */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span
                      className={`font-bold text-base ${
                        isDeposit ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {isDeposit ? "+" : "-"}
                      {parseFloat(item.amount).toLocaleString()} ৳
                    </span>
                    <span
                      className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                    >
                      {statusCfg.icon}
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Expand Arrow */}
                  <div className="text-gray-400 ml-1">
                    {isExpanded ? (
                      <FaChevronUp className="text-xs" />
                    ) : (
                      <FaChevronDown className="text-xs" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-3">
                    {isDeposit ? (
                      // Deposit Details
                      <>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Deposit Details
                        </h4>
                        <div className="space-y-2.5">
                          {/* Tracking Number */}
                          {item.trackingNumber && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Tracking No.</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono font-semibold text-gray-700">
                                  {item.trackingNumber}
                                </span>
                                <button
                                  onClick={() =>
                                    copyToClipboard(item.trackingNumber, `track-${item.id}`)
                                  }
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <FaCopy className="text-xs" />
                                </button>
                                {copiedId === `track-${item.id}` && (
                                  <span className="text-xs text-emerald-600 font-medium">Copied!</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Transaction ID */}
                          {item.trxID && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Transaction ID</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono font-semibold text-gray-700">
                                  {item.trxID}
                                </span>
                                <button
                                  onClick={() =>
                                    copyToClipboard(item.trxID, `trx-${item.id}`)
                                  }
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <FaCopy className="text-xs" />
                                </button>
                                {copiedId === `trx-${item.id}` && (
                                  <span className="text-xs text-emerald-600 font-medium">Copied!</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Sender Number */}
                          {item.senderNumber && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Sender Number</span>
                              <span className="text-sm font-mono font-semibold text-gray-700">
                                {item.senderNumber}
                              </span>
                            </div>
                          )}

                          {/* Agent Number */}
                          {item.agentNumber && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Agent Number</span>
                              <span className="text-sm font-mono font-semibold text-gray-700">
                                {item.agentNumber}
                              </span>
                            </div>
                          )}

                          {/* Payment Method */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Method</span>
                            <span className="text-sm font-semibold text-gray-700 capitalize">
                              {item.paymentMethod}
                            </span>
                          </div>

                          {/* Amount */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Amount</span>
                            <span className="text-sm font-bold text-gray-800">
                              {parseFloat(item.amount).toLocaleString()} BDT
                            </span>
                          </div>

                          {/* Bonus */}
                          {item.bonus > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Bonus</span>
                              <span className="text-sm font-bold text-emerald-600">
                                +{parseFloat(item.bonus).toLocaleString()} BDT
                              </span>
                            </div>
                          )}

                          {/* Total */}
                          {item.bonus > 0 && (
                            <div className="flex items-center justify-between border-t border-gray-200 pt-2 mt-1">
                              <span className="text-sm font-bold text-gray-700">Total</span>
                              <span className="text-sm font-bold text-blue-600">
                                {(parseFloat(item.amount) + parseFloat(item.bonus)).toLocaleString()} BDT
                              </span>
                            </div>
                          )}

                          {/* Status Message */}
                          <div className={`mt-2 px-3 py-2 rounded-lg flex items-center gap-2 ${statusCfg.bg} border ${statusCfg.border}`}>
                            {statusCfg.icon}
                            <span className={`text-xs font-medium ${statusCfg.text}`}>
                              {item.status === "PENDING" &&
                                "Your deposit request is under review by admin."}
                              {item.status === "APPROVED" &&
                                "Deposit approved! Funds have been added to your wallet."}
                              {item.status === "REJECTED" &&
                                "Deposit was rejected. Please contact support."}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Withdraw Details
                      <>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Withdrawal Details
                        </h4>
                        <div className="space-y-2.5">
                          {item.walletNumber && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Wallet Number</span>
                              <span className="text-sm font-mono font-semibold text-gray-700">
                                {item.walletNumber}
                              </span>
                            </div>
                          )}
                          {item.cardNumber && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Card Number</span>
                              <span className="text-sm font-mono font-semibold text-gray-700">
                                {item.cardNumber}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Method</span>
                            <span className="text-sm font-semibold text-gray-700 capitalize">
                              {item.paymentMethod}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Amount</span>
                            <span className="text-sm font-bold text-gray-800">
                              {parseFloat(item.amount).toLocaleString()} BDT
                            </span>
                          </div>
                          <div className={`mt-2 px-3 py-2 rounded-lg flex items-center gap-2 ${statusCfg.bg} border ${statusCfg.border}`}>
                            {statusCfg.icon}
                            <span className={`text-xs font-medium ${statusCfg.text}`}>
                              {item.status === "PENDING" &&
                                "Your withdrawal request is under review."}
                              {item.status === "APPROVED" &&
                                "Withdrawal approved! Funds have been sent."}
                              {item.status === "REJECTED" &&
                                "Withdrawal was rejected. Please contact support."}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-6 px-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
              page <= 1
                ? "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            ← Prev
          </button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                    page === pageNum
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
              page >= totalPages
                ? "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
