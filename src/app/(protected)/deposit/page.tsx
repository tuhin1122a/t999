/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import useGetCurrentUser from "@/hook/useCurrentUser";
import {
  useGetDepositPaymentDataQuery,
  useMakeDepositeMutation,
} from "@/lib/features/depositApiSlice";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { MdOutlineSupportAgent, MdHistory } from "react-icons/md";
import { FaChevronLeft, FaCheck } from "react-icons/fa";
import { PulseLoader } from "react-spinners";
import PageLoader from "@/components/loader/PageLoader";
import toast from "react-hot-toast";
import SiteHeader from "@/components/SiteHeader";
import PaymentMethod from "@/components/PaymentMethod";

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

  const handleWalletNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletNumber(e.target.value);
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

    if (!walletNumber.trim()) {
      setError("Please enter your sender wallet number");
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

    if (!walletNumber) {
      setError("Please enter your wallet number");
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
  const isValidAmount = totalAmount >= (selectedPaymentMethod?.min_deposit || 100) && 
                        totalAmount <= (selectedPaymentMethod?.max_deposit || 50000);
  
  const isStep1Valid = selectedPaymentMethod && isValidAmount && walletNumber.trim() !== "";
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
          if (b.id === "signinBonus") return { ...b, value: bonus.signinBonus, disable: !(bonus.signinBonus > 0) };
          if (b.id === "referralBonus") return { ...b, value: bonus.referralBonus, disable: !(bonus.referralBonus > 0) };
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
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <SiteHeader title="Deposit">
            <Link href="/support" className="text-gray-700 hover:text-gray-900">
              <MdOutlineSupportAgent className="text-lg" />
            </Link>
            <Link href="/history" className="text-gray-700 hover:text-gray-900">
              <MdHistory className="text-lg" />
            </Link>
          </SiteHeader>

          {/* Premium Step Progress Indicator */}
          <div className="bg-white border-b border-gray-100 py-4 px-6 shadow-sm">
            <div className="max-w-md mx-auto flex items-center justify-between">
              {/* Step 1 Indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step === 1 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 ring-4 ring-blue-50" 
                    : "bg-green-500 text-white shadow-md shadow-green-200"
                }`}>
                  {step > 1 ? <FaCheck size={10} /> : "1"}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  step === 1 ? "text-blue-600 font-extrabold" : "text-gray-400"
                }`}>Method & Amount</span>
              </div>

              {/* Step Connection Bar */}
              <div className={`flex-1 h-0.5 mx-3 rounded transition-all duration-500 ${
                step > 1 ? "bg-green-400" : "bg-gray-200"
              }`} />

              {/* Step 2 Indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step === 2 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 ring-4 ring-blue-50" 
                    : "bg-gray-200 text-gray-400"
                }`}>
                  "2"
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  step === 2 ? "text-blue-600 font-extrabold" : "text-gray-400"
                }`}>Transfer Details</span>
              </div>
            </div>
          </div>

          <main className="w-full px-4 py-6 space-y-6">
            
            {/* STEP 1: Select Method and Enter Amount */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                {/* Payment Methods */}
                <section className="bg-white rounded-lg shadow-sm p-4">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Select Payment Method</h2>
                  <div className="flex overflow-x-auto pb-2 -mx-1 hide-scrollbar">
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

                {/* Amount Input */}
                <section className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-800">Deposit Amount</h2>
                    {selectedPaymentMethod && (
                      <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2.5 py-1 rounded-full">
                        Min: {selectedPaymentMethod.min_deposit} BDT | Max: {selectedPaymentMethod.max_deposit} BDT
                      </span>
                    )}
                  </div>
                  
                  {/* Deposit Amount Input */}
                  <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold">BDT</span>
                    </div>
                    <input
                      disabled={pending}
                      type="number"
                      className="block w-full pl-16 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 font-semibold text-lg text-gray-800"
                      placeholder="Enter amount"
                      value={depositAmount}
                      onChange={handleAmountChange}
                    />
                  </div>

                  {error && <div className="text-sm text-red-600 font-medium mb-3">{error}</div>}

                  <div className="grid grid-cols-3 gap-2">
                    {quickAmounts.map((amount) => (
                      <button
                        key={amount}
                        disabled={pending}
                        onClick={() => handleAmountButtonClick(amount)}
                        className={`py-2.5 px-3 border rounded-lg text-center whitespace-nowrap text-sm font-semibold transition-all ${
                          selectedAmountButton === amount
                            ? "bg-blue-50 border-blue-500 text-blue-700"
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {amount} BDT
                      </button>
                    ))}
                  </div>
                </section>

                {/* Sender Wallet Number */}
                <section className="bg-white rounded-lg shadow-sm p-4">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Sender Account</h2>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold">+88</span>
                    </div>
                    <input
                      disabled={pending}
                      type="text"
                      className="block w-full pl-16 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 font-semibold text-lg text-gray-800"
                      placeholder="Your Sender Wallet Number"
                      value={walletNumber}
                      onChange={handleWalletNumberChange}
                    />
                  </div>
                </section>

                {/* Bonus Selection */}
                <section className="bg-white rounded-lg shadow-sm p-4">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Select Bonus</h2>
                  <div className="space-y-3">
                    {bonusOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`flex items-start p-3 border rounded-lg cursor-pointer ${
                          option.disable
                            ? "opacity-50 cursor-not-allowed"
                            : selectedBonus.id === option.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => !option.disable && !pending && setSelectedBonus(option)}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              selectedBonus.id === option.id ? "border-blue-500" : "border-gray-400"
                            }`}
                          >
                            {selectedBonus.id === option.id && (
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            )}
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="font-medium text-gray-800">{option.label}</div>
                          <div className="text-sm text-gray-600">
                            {option.id === "signinBonus" && `Get ${option.value}% extra on first deposit`}
                            {option.id === "referralBonus" && `${option.value}% Bonus from referral`}
                            {option.id === "none" && `Proceed without any bonus`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Next Button */}
                <button
                  className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg shadow-sm transition-all ${
                    isStep1Valid ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.99]" : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!isStep1Valid}
                  onClick={handleNextStep}
                >
                  Next Step
                </button>
              </div>
            )}

            {/* STEP 2: Transfer Details & Transaction ID */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                {/* Back Button */}
                <button 
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-semibold bg-white border border-gray-200 rounded-lg py-2 px-4 shadow-sm w-fit transition-all hover:bg-gray-50"
                >
                  <FaChevronLeft className="text-xs" />
                  Back to Step 1
                </button>

                {/* Admin Wallet Numbers & Instructions */}
                {selectedPaymentMethod && (
                  <section className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-medium text-gray-800">
                        Send Money to Agent Account
                      </h2>
                      <span className="text-xs text-blue-600 font-bold bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full uppercase">
                        {selectedPaymentMethod.name}
                      </span>
                    </div>
                    
                    {selectedPaymentMethod.walletsNumber && selectedPaymentMethod.walletsNumber.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Please select and send money to one of the following numbers:</p>
                        <div className="grid gap-2">
                          {selectedPaymentMethod.walletsNumber.map((num: string, idx: number) => (
                            <div 
                              key={idx} 
                              onClick={() => setSelectedAgentNumber(num)}
                              className={`flex justify-between items-center border rounded-lg p-3 cursor-pointer transition-all ${
                                selectedAgentNumber === num
                                  ? "bg-blue-50 border-blue-500 shadow-sm"
                                  : "bg-gray-50 border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                                  selectedAgentNumber === num ? "border-blue-500" : "border-gray-400"
                                }`}>
                                  {selectedAgentNumber === num && <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>}
                                </div>
                                <span className="font-mono text-gray-800 font-bold">{num}</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(num);
                                  toast.success("Number copied to clipboard!");
                                }}
                                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded-md transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-red-500 font-medium">
                        No active receiver number found. Please contact support.
                      </p>
                    )}

                    {selectedPaymentMethod.instructions && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">
                          Instructions
                        </h3>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          {selectedPaymentMethod.instructions}
                        </p>
                      </div>
                    )}

                    {selectedPaymentMethod.warning && (
                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                        <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                          Warning
                        </h3>
                        <p className="text-sm text-amber-700 leading-relaxed">
                          {selectedPaymentMethod.warning}
                        </p>
                      </div>
                    )}
                  </section>
                )}

                {/* Transfer Details Form */}
                <section className="bg-white rounded-lg shadow-sm p-4">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Submit Payment Details</h2>
                  
                  {/* Transaction ID */}
                  <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold">TRX</span>
                    </div>
                    <input
                      disabled={pending}
                      type="text"
                      className="block w-full pl-16 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 font-mono font-bold uppercase placeholder-gray-400"
                      placeholder="Transaction ID (TrxID)"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                    />
                  </div>

                  {error && <div className="text-sm text-red-600 font-medium mb-3">{error}</div>}
                </section>

                {/* Summary */}
                <section className="bg-white rounded-lg shadow-sm p-4 animate-fade-in">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Summary</h2>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Selected Method:</span>
                      <span className="font-semibold text-gray-800 capitalize">{selectedPaymentMethod?.name || "None"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Agent Number:</span>
                      <span className="font-mono font-bold text-gray-800">{selectedAgentNumber || "Not Selected"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Deposit Amount:</span>
                      <span className="font-semibold text-gray-800">{totalAmount.toLocaleString()} BDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Bonus Amount:</span>
                      <span className="font-semibold text-green-600">
                        +{bonusAmount.toLocaleString()} BDT
                      </span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between">
                      <span className="text-gray-800 font-bold">Total:</span>
                      <span className="font-bold text-lg text-blue-600">{grandTotal.toLocaleString()} BDT</span>
                    </div>
                  </div>
                </section>

                {/* Action Button */}
                <button
                  className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg shadow-sm transition-all ${
                    isFormValid && !redirecting ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.99]" : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!isFormValid || pending || redirecting}
                  onClick={handleSubmit}
                >
                  {redirecting ? (
                    <div className="flex items-center justify-center">
                      <PulseLoader size={12} color="#fff" />
                      <span className="ml-2">Submitting request...</span>
                    </div>
                  ) : pending ? (
                    <div className="flex items-center justify-center">
                      <PulseLoader size={12} color="#fff" />
                      <span className="ml-2">Processing Submission...</span>
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
        <PageLoader />
      )}
    </>
  );
};

export default DepositPage;
