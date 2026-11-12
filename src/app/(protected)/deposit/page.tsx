/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import DepositPageLoader from "@/components/loader/DepositPageLoader";
import LiveChatTrigger from "@/components/LiveChatTrigger";
import PaymentMethod from "@/components/PaymentMethod";
import SiteHeader from "@/components/SiteHeader";
import useGetCurrentUser from "@/hook/useCurrentUser";
import {
  useGetDepositPaymentDataQuery,
  useMakeDepositeMutation,
} from "@/lib/features/depositApiSlice";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaChevronLeft } from "react-icons/fa";
import { MdHistory, MdOutlineSupportAgent, MdSecurity } from "react-icons/md";
import { HiSparkles } from "react-icons/hi2";
import { PulseLoader } from "react-spinners";

type BonusOption = {
  id: string;
  label: string;
  value: number;
  disable: boolean;
};

const DepositPage: React.FC = () => {
  const { data, isLoading } = useGetDepositPaymentDataQuery();
  const wallets: any[] = data?.wallets || [];
  const bonus = data?.bonus;

  const user: any = useGetCurrentUser();

  const [step, setStep] = useState<number>(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>();
  const [selectedAgentNumber, setSelectedAgentNumber] = useState<string>("");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [walletNumber, setWalletNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [selectedBonus, setSelectedBonus] = useState<BonusOption>({
    id: "none",
    label: "No Bonus",
    value: 0,
    disable: false,
  });
  const [selectedAmountButton, setSelectedAmountButton] = useState<number | null>();
  const quickAmounts = [400, 500, 800, 1000, 1500, 2000, 5000, 10000, 25000];
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const [bonusOptions, setBonusOptions] = useState<BonusOption[]>([
    { id: "signinBonus", label: "First Deposit Bonus", value: 0, disable: true },
    { id: "referralBonus", label: "Refer Bonus", value: 0, disable: true },
    { id: "none", label: "No Bonus", value: 0, disable: false },
  ]);

  const [makeDeposit] = useMakeDepositeMutation();

  // --- Handlers ---
  const handleAmountButtonClick = (amount: number) => {
    setSelectedAmountButton(amount);
    setDepositAmount(amount.toString());
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepositAmount(e.target.value);
    setSelectedAmountButton(null);
  };

  const calculateBonus = (amount: number) => {
    return selectedBonus ? Math.round((amount * selectedBonus.value) / 100) : 0;
  };

  const handleNextStep = () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (amount < selectedPaymentMethod.min_deposit) {
      setError(`Minimum deposit is ${selectedPaymentMethod.min_deposit} BDT`);
      return;
    }

    if (amount > selectedPaymentMethod.max_deposit) {
      setError(`Maximum deposit is ${selectedPaymentMethod.max_deposit} BDT`);
      return;
    }

    setError("");
    setStep(2);
  };

  const handleSubmit = () => {
    setPending(true);
    const amount = parseFloat(depositAmount);

    if (!amount || amount <= 0) {
      setError("Please enter a valid amount");
      setPending(false);
      return;
    }

    if (!trxId) {
      setError("Please enter the Transaction ID (TrxID)");
      setPending(false);
      return;
    }

    if (!selectedAgentNumber) {
      setError("Please select an Agent Account number");
      setPending(false);
      return;
    }

    // Call manual Deposit API
    makeDeposit({
      amount: amount,
      bonusFor: selectedBonus.id,
      senderNumber: walletNumber,
      trxID: trxId,
      walletId: selectedPaymentMethod.id,
      walletNumber: selectedAgentNumber,
    })
      .unwrap()
      .then((res) => {
        if (res && res.success) {
          setPending(false);
          setRedirecting(true);
          toast.success(res.payload?.message || "Deposit submitted successfully! Waiting for Admin approval.");
          setTimeout(() => {
            window.location.href = "/history";
          }, 1500);
        } else {
          toast.error("Failed to submit deposit. Please try again.");
          setPending(false);
        }
      })
      .catch((err: any) => {
        toast.error(err?.data?.message || err?.data?.error || "Deposit failed");
        setPending(false);
      });
  };

  const totalAmount = parseFloat(depositAmount) || 0;
  const bonusAmount = calculateBonus(totalAmount);
  const grandTotal = totalAmount + bonusAmount;

  // Validation checks for UI steps
  const isValidAmount =
    totalAmount >= (selectedPaymentMethod?.min_deposit || 100) &&
    totalAmount <= (selectedPaymentMethod?.max_deposit || 50000);

  const isStep1Valid = selectedPaymentMethod && isValidAmount;
  const isFormValid = isStep1Valid && trxId.trim() !== "" && selectedAgentNumber !== "";

  // --- Effects ---
  useEffect(() => {
    if (wallets.length) setSelectedPaymentMethod(wallets[0]);
  }, [wallets]);

  useEffect(() => {
    if (selectedPaymentMethod && selectedPaymentMethod.walletsNumber?.length > 0) {
      setSelectedAgentNumber(selectedPaymentMethod.walletsNumber[0]);
    } else {
      setSelectedAgentNumber("");
    }
  }, [selectedPaymentMethod]);

  useEffect(() => {
    if (bonus && user) {
      setBonusOptions((prev) =>
        prev.map((b) => {
          if (b.id === "signinBonus")
            return { ...b, value: bonus.signinBonus, disable: !(bonus.signinBonus > 0) };
          if (b.id === "referralBonus")
            return { ...b, value: bonus.referralBonus, disable: !(bonus.referralBonus > 0) };
          return b;
        })
      );
    }
  }, [bonus, user]);

  useEffect(() => {
    if (quickAmounts.includes(+depositAmount)) setSelectedAmountButton(+depositAmount);
  }, [depositAmount]);

  useEffect(() => {
    if (error) setError("");
  }, [depositAmount, walletNumber, trxId, selectedAgentNumber]);

  return (
    <>
      {data && !isLoading && user ? (
        <div className="min-h-screen bg-[#070e17] flex flex-col text-white pb-28">
          {/* Header */}
          <SiteHeader title="Deposit">
            <LiveChatTrigger
              fallbackHref="/support"
              title="Live Chat Support"
              ariaLabel="Live Chat Support"
              className="text-gray-300 hover:text-[#3888e9] cursor-pointer flex items-center transition-colors"
            >
              <MdOutlineSupportAgent className="text-xl" />
            </LiveChatTrigger>
            <Link
              href="/history"
              className="text-gray-300 hover:text-[#3888e9] transition-colors flex items-center"
            >
              <MdHistory className="text-xl" />
            </Link>
          </SiteHeader>

          {/* Premium Step Progress Indicator */}
          <div className="bg-[#0a1626] border-b border-[#142944] py-3.5 px-6 shadow-md select-none">
            <div className="max-w-md mx-auto flex items-center justify-between">
              {/* Step 1 Indicator */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs sm:text-sm transition-all duration-300 ${
                    step === 1
                      ? "bg-[#3888e9] text-white shadow-md shadow-[#3888e9]/40 ring-4 ring-[#3888e9]/20"
                      : "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                  }`}
                >
                  {step > 1 ? <FaCheck size={11} /> : "1"}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${
                    step === 1 ? "text-[#3888e9]" : "text-gray-400"
                  }`}
                >
                  Method & Amount
                </span>
              </div>

              {/* Step Connection Bar */}
              <div
                className={`flex-1 h-0.5 mx-3 rounded transition-all duration-500 ${
                  step > 1 ? "bg-emerald-500" : "bg-[#183454]"
                }`}
              />

              {/* Step 2 Indicator */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs sm:text-sm transition-all duration-300 ${
                    step === 2
                      ? "bg-[#3888e9] text-white shadow-md shadow-[#3888e9]/40 ring-4 ring-[#3888e9]/20"
                      : "bg-[#142840] border border-[#1e3c60] text-gray-500"
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${
                    step === 2 ? "text-[#3888e9]" : "text-gray-500"
                  }`}
                >
                  Transfer Details
                </span>
              </div>
            </div>
          </div>

          <main className="w-full max-w-md mx-auto px-4 py-6 space-y-5">
            {/* STEP 1: Select Method and Enter Amount */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                {/* 1. Payment Methods */}
                <section className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 shadow-md">
                  <div className="flex items-center justify-between mb-3.5">
                    <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Select Payment Method
                    </h2>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                      0% Fee · Fast
                    </span>
                  </div>
                  <div className="flex overflow-x-auto pb-1 -mx-1 scrollbar-none">
                    {wallets.map((wallet, i) => (
                      <PaymentMethod
                        key={i}
                        method={wallet}
                        selectedPaymentMethod={selectedPaymentMethod}
                        onClick={() => setSelectedPaymentMethod(wallet)}
                      />
                    ))}
                  </div>
                </section>

                {/* 2. Amount Input */}
                <section className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 shadow-md">
                  <div className="flex justify-between items-center mb-3.5">
                    <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                      Deposit Amount
                    </h2>
                    {selectedPaymentMethod && (
                      <span className="text-[11px] text-[#3888e9] font-bold bg-[#3888e9]/10 border border-[#3888e9]/25 px-2.5 py-0.5 rounded-full">
                        Min: {selectedPaymentMethod.min_deposit} | Max: {selectedPaymentMethod.max_deposit} BDT
                      </span>
                    )}
                  </div>

                  {/* Deposit Amount Input */}
                  <div className="relative mb-3.5">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <span className="text-xs font-black text-[#3888e9] bg-[#122844] px-2 py-1 rounded-md border border-[#1e426d]">
                        BDT
                      </span>
                    </div>
                    <input
                      disabled={pending}
                      type="number"
                      className="block w-full pl-16 pr-4 py-3.5 bg-[#06101c] border border-[#1b385a] focus:border-[#3888e9] rounded-xl text-white font-black text-xl placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-[#3888e9]/30"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={handleAmountChange}
                    />
                  </div>

                  {error && (
                    <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg font-bold mb-3">
                      {error}
                    </div>
                  )}

                  {/* Quick Amount Chips */}
                  <div className="grid grid-cols-3 gap-2">
                    {quickAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        disabled={pending}
                        onClick={() => handleAmountButtonClick(amount)}
                        className={`py-2.5 px-2 rounded-xl text-center whitespace-nowrap text-xs font-bold transition-all active:scale-95 ${
                          selectedAmountButton === amount
                            ? "bg-[#3888e9]/20 border-2 border-[#3888e9] text-white shadow-md shadow-[#3888e9]/20 font-black"
                            : "bg-[#0c1a2d] border border-[#183454] text-gray-300 hover:text-white hover:bg-[#11243d]"
                        }`}
                      >
                        {amount.toLocaleString()} ৳
                      </button>
                    ))}
                  </div>
                </section>

                {/* 3. Bonus Selection */}
                <section className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 shadow-md">
                  <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <HiSparkles className="text-yellow-400 text-base" />
                    Select Bonus
                  </h2>
                  <div className="space-y-2.5">
                    {bonusOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`flex items-start p-3 rounded-xl cursor-pointer transition-all ${
                          option.disable
                            ? "opacity-40 cursor-not-allowed border border-[#142944] bg-[#08121f]"
                            : selectedBonus.id === option.id
                            ? "border-2 border-yellow-500/80 bg-gradient-to-r from-yellow-500/15 via-[#0c1a2d] to-[#0c1a2d] shadow-md shadow-yellow-500/10"
                            : "border border-[#183454] bg-[#0c1a2d] hover:border-[#234b79]"
                        }`}
                        onClick={() => !option.disable && !pending && setSelectedBonus(option)}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedBonus.id === option.id ? "border-yellow-400" : "border-gray-500"
                            }`}
                          >
                            {selectedBonus.id === option.id && (
                              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                            )}
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="text-xs font-extrabold text-white">{option.label}</div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            {option.id === "signinBonus" &&
                              `Get ${option.value}% extra bonus on your first deposit`}
                            {option.id === "referralBonus" &&
                              `${option.value}% bonus from friend referral`}
                            {option.id === "none" && `Proceed without deposit bonus`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Next Button */}
                <button
                  type="button"
                  className={`w-full py-4 px-6 rounded-xl font-black text-white text-base tracking-wide shadow-lg transition-all duration-200 ${
                    isStep1Valid
                      ? "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-500 shadow-emerald-500/25 active:scale-[0.99] cursor-pointer"
                      : "bg-[#183250] text-gray-500 cursor-not-allowed border border-[#204066]"
                  }`}
                  disabled={!isStep1Valid}
                  onClick={handleNextStep}
                >
                  Continue to Transfer Details →
                </button>
              </div>
            )}

            {/* STEP 2: Transfer Details & Transaction ID */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-xs text-gray-300 hover:text-white font-bold bg-[#0a1626] border border-[#183454] hover:border-[#3888e9] rounded-xl py-2 px-3.5 shadow-sm transition-all active:scale-95"
                >
                  <FaChevronLeft className="text-[10px]" />
                  <span>Back to Amount</span>
                </button>

                {/* Receiver Account & Instructions */}
                {selectedPaymentMethod && (
                  <section className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 space-y-4 shadow-md">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                        Send Money to Agent Account
                      </h2>
                      <span className="text-xs font-black text-[#3888e9] bg-[#3888e9]/10 border border-[#3888e9]/30 px-3 py-1 rounded-full uppercase">
                        {selectedPaymentMethod.name}
                      </span>
                    </div>

                    {selectedPaymentMethod.walletsNumber &&
                    selectedPaymentMethod.walletsNumber.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-400 font-medium">
                          Select one of the official receiver numbers below to send:
                        </p>
                        <div className="grid gap-2">
                          {selectedPaymentMethod.walletsNumber.map((num: string, idx: number) => (
                            <div
                              key={idx}
                              onClick={() => setSelectedAgentNumber(num)}
                              className={`flex justify-between items-center border rounded-xl p-3 cursor-pointer transition-all ${
                                selectedAgentNumber === num
                                  ? "bg-gradient-to-r from-[#142944] to-[#0c1a2d] border-2 border-[#3888e9] shadow-md shadow-[#3888e9]/20"
                                  : "bg-[#06101c] border border-[#183454] hover:border-[#3888e9]/50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    selectedAgentNumber === num
                                      ? "border-[#3888e9]"
                                      : "border-gray-500"
                                  }`}
                                >
                                  {selectedAgentNumber === num && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#3888e9]" />
                                  )}
                                </div>
                                <span className="font-mono text-base font-black text-white tracking-wider">
                                  {num}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(num);
                                  toast.success("Number copied to clipboard!");
                                }}
                                className="text-xs font-black bg-[#3888e9] hover:bg-[#2c77d4] text-white py-1.5 px-3 rounded-lg active:scale-95 shadow-sm transition-all"
                              >
                                Copy
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                        No active receiver number found. Please contact support.
                      </p>
                    )}

                    {selectedPaymentMethod.instructions && (
                      <div className="bg-[#0e223a] border border-[#1b4372] rounded-xl p-3">
                        <h3 className="text-[10px] font-black text-[#3888e9] uppercase tracking-wider mb-1 flex items-center gap-1">
                          <MdSecurity /> Instructions
                        </h3>
                        <p className="text-xs text-blue-200 leading-relaxed font-medium">
                          {selectedPaymentMethod.instructions}
                        </p>
                      </div>
                    )}

                    {selectedPaymentMethod.warning && (
                      <div className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-3">
                        <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-wider mb-1">
                          Notice
                        </h3>
                        <p className="text-xs text-amber-200 leading-relaxed font-medium">
                          {selectedPaymentMethod.warning}
                        </p>
                      </div>
                    )}
                  </section>
                )}

                {/* Transfer Details Form */}
                <section className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 shadow-md">
                  <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider mb-3">
                    Submit Payment Details
                  </h2>

                  {/* Transaction ID */}
                  <div className="relative mb-3">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <span className="text-xs font-black text-[#3888e9] bg-[#122844] px-2 py-1 rounded-md border border-[#1e426d]">
                        TRX
                      </span>
                    </div>
                    <input
                      disabled={pending}
                      type="text"
                      className="block w-full pl-16 pr-4 py-3.5 bg-[#06101c] border border-[#1b385a] focus:border-[#3888e9] rounded-xl text-white font-mono font-bold tracking-wider placeholder-gray-500 uppercase transition-all focus:outline-none focus:ring-2 focus:ring-[#3888e9]/30"
                      placeholder="Transaction ID (TrxID)"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                    />
                  </div>

                  {error && (
                    <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg font-bold mb-3">
                      {error}
                    </div>
                  )}
                </section>

                {/* Summary */}
                <section className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 shadow-md animate-fade-in">
                  <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider mb-3.5 pb-2 border-b border-[#162e4a]">
                    Deposit Summary
                  </h2>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-medium">Selected Method:</span>
                      <span className="font-extrabold text-white capitalize">
                        {selectedPaymentMethod?.name || "None"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-medium">Agent Number:</span>
                      <span className="font-mono font-black text-[#3888e9]">
                        {selectedAgentNumber || "Not Selected"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-medium">Deposit Amount:</span>
                      <span className="font-extrabold text-white">
                        {totalAmount.toLocaleString()} BDT
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-medium">Bonus Amount:</span>
                      <span className="font-black text-emerald-400">
                        +{bonusAmount.toLocaleString()} BDT
                      </span>
                    </div>
                    <div className="border-t border-[#183454] pt-2.5 mt-2 flex justify-between items-center">
                      <span className="text-white font-black text-sm">Total Credit:</span>
                      <span className="font-black text-xl text-emerald-400">
                        {grandTotal.toLocaleString()} BDT
                      </span>
                    </div>
                  </div>
                </section>

                {/* Submit Action Button */}
                <button
                  type="button"
                  className={`w-full py-4 px-6 rounded-xl font-black text-white text-base tracking-wide shadow-lg transition-all duration-200 ${
                    isFormValid && !redirecting && !pending
                      ? "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-500 shadow-emerald-500/25 active:scale-[0.99] cursor-pointer"
                      : "bg-[#183250] text-gray-500 cursor-not-allowed border border-[#204066]"
                  }`}
                  disabled={!isFormValid || pending || redirecting}
                  onClick={handleSubmit}
                >
                  {redirecting ? (
                    <div className="flex items-center justify-center gap-2">
                      <PulseLoader size={8} color="#fff" />
                      <span>Submitting request...</span>
                    </div>
                  ) : pending ? (
                    <div className="flex items-center justify-center gap-2">
                      <PulseLoader size={8} color="#fff" />
                      <span>Processing Submission...</span>
                    </div>
                  ) : (
                    "Submit Deposit Request"
                  )}
                </button>
              </div>
            )}
          </main>
        </div>
      ) : (
        <DepositPageLoader />
      )}
    </>
  );
};

export default DepositPage;
