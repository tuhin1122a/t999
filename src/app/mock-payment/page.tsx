"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle, FaMobileAlt, FaArrowLeft } from "react-icons/fa";
import { BiCoinStack } from "react-icons/bi";
import { toast, Toaster } from "sonner";

const MockPaymentPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const invoiceNo = searchParams.get("invoice_no") || "";
  const amount = searchParams.get("amount") || "0";
  const ps = searchParams.get("ps") || "bkash";

  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending");
  const [mockTxId, setMockTxId] = useState("");

  useEffect(() => {
    setMockTxId(`MOCK_TX_${Date.now()}_${Math.floor(Math.random() * 1000)}`);
  }, []);

  const handleSimulatePayment = async (status: "success" | "failed") => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/durontopay/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dp_transaction_id: mockTxId,
          invoice_no: invoiceNo,
          amount: amount,
          status: status,
          paymentType: ps,
          transaction_time: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPaymentStatus(status);
        if (status === "success") {
          toast.success("Payment simulated successfully! Balance credited.");
        } else {
          toast.error("Payment failed simulation recorded.");
        }
        
        // Redirect back home after 3 seconds
        setTimeout(() => {
          router.push("/member");
        }, 3000);
      } else {
        toast.error(`Callback error: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Payment simulation error:", err);
      toast.error("Failed to connect to callback server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#002626] text-white flex flex-col items-center justify-center p-4">
      <Toaster position="top-center" richColors />
      
      {/* Main card */}
      <div className="w-full max-w-md bg-[#003e3e]/85 backdrop-blur-md border border-[#006165] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Decorative ambient light */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#23ffc8]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#006165]/50 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[linear-gradient(135deg,_#23ffc8,_#008080)] flex items-center justify-center text-[#002626] font-bold shadow-md">
              <FaMobileAlt />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">DurantoPay</h2>
              <span className="text-[10px] text-[#23ffc8] font-semibold tracking-wider uppercase">Sandbox Simulator</span>
            </div>
          </div>
          <div className="bg-[#124A46] text-[#23ffc8] border border-[#23ffc8]/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            {ps}
          </div>
        </div>

        {/* Payment details */}
        {paymentStatus === "pending" && (
          <>
            <div className="bg-black/20 border border-[#006165]/30 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-400">Invoice Number</span>
                <span className="text-xs font-mono font-bold text-[#23ffc8]">{invoiceNo}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-400">Mock TXID</span>
                <span className="text-xs font-mono font-bold text-gray-300">{mockTxId}</span>
              </div>
              <hr className="border-[#006165]/20 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-300">Amount to Pay</span>
                <div className="flex items-center gap-1.5 text-xl font-extrabold text-[#23ffc8]">
                  <BiCoinStack className="w-5 h-5 text-amber-400 animate-bounce" />
                  <span>৳ {amount} BDT</span>
                </div>
              </div>
            </div>

            {/* Simulated instructions */}
            <div className="text-xs text-gray-300 leading-relaxed mb-8 bg-[#124A46]/30 border border-[#006165]/20 rounded-xl p-3 text-center">
              ⚠️ You are in <strong className="text-[#23ffc8]">Development Mode</strong>. Live merchant keys are not set in your <code>.env</code> file. Select an action below to simulate a payment response.
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSimulatePayment("success")}
                disabled={isLoading}
                className="w-full bg-[linear-gradient(135deg,_#23ffc8,_#00bebe)] hover:brightness-110 text-[#002626] font-extrabold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-[#23ffc8]/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-[#002626] border-t-transparent"></span>
                ) : (
                  <>
                    <FaCheckCircle className="text-lg" />
                    Simulate Payment Success
                  </>
                )}
              </button>

              <button
                onClick={() => handleSimulatePayment("failed")}
                disabled={isLoading}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 font-bold py-3.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                <FaTimesCircle className="text-lg" />
                Simulate Payment Failure
              </button>
            </div>
          </>
        )}

        {/* Success screen */}
        {paymentStatus === "success" && (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 text-3xl mb-4 shadow-lg shadow-emerald-500/10 animate-bounce">
              <FaCheckCircle />
            </div>
            <h3 className="text-xl font-bold text-emerald-400">Payment Successful</h3>
            <p className="text-sm text-gray-300 mt-2 px-4">
              Your mock payment has been credited. ৳ {amount} BDT has been added to your balance.
            </p>
            <div className="mt-6 flex flex-col items-center bg-[#124A46]/20 border border-[#006165]/30 rounded-xl p-3 w-full">
              <span className="text-[10px] text-gray-400 font-mono">Redirecting you back to your account...</span>
              <div className="w-1/2 bg-gray-700 h-1 rounded-full overflow-hidden mt-3">
                <div className="bg-[#23ffc8] h-full animate-[progress_3s_ease-in-out_forwards]"></div>
              </div>
            </div>
          </div>
        )}

        {/* Failure screen */}
        {paymentStatus === "failed" && (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400 text-3xl mb-4 shadow-lg shadow-red-500/10">
              <FaTimesCircle />
            </div>
            <h3 className="text-xl font-bold text-red-400">Payment Failed</h3>
            <p className="text-sm text-gray-300 mt-2 px-4">
              The payment simulation has failed. No balance has been credited.
            </p>
            <button
              onClick={() => setPaymentStatus("pending")}
              className="mt-6 text-xs text-[#23ffc8] border border-[#23ffc8]/30 hover:bg-[#124A46] px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Try Simulation Again
            </button>
          </div>
        )}

      </div>

      {/* Footer back button */}
      <button
        onClick={() => router.push("/deposit")}
        className="mt-6 text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
      >
        <FaArrowLeft />
        Cancel and return to deposit panel
      </button>

      {/* Custom Styles for animation */}
      <style jsx global>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default MockPaymentPage;
