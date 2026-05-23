/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useMakeWithdrawMutation } from "@/lib/features/withdrawSlice";
import { toast } from "sonner";
import { Prisma } from "@prisma/client";
import { FaLock, FaCheck, FaExclamationTriangle, FaTimes, FaPlus } from "react-icons/fa";
import { PulseLoader } from "react-spinners";
import { Input } from "@/components/ui/input";
import { INTERNAL_SERVER_ERROR } from "@/error";

interface WithdrawFormProps {
  wallets: any[];
  availableBalance: number;
  turnOver: number;
}

const WithdrawForm = ({ wallets, availableBalance, turnOver }: WithdrawFormProps) => {
  const [userCards, setUserCards] = useState<any[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [password, setPassword] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedAmountButton, setSelectedAmountButton] = useState<number | null>(null);
  const [validationError, setValidationError] = useState("");

  const [makeWithdrawApi, { isLoading: apiLoading }] = useMakeWithdrawMutation();
  const quickAmounts = [100, 500, 1000, 5000, 10000, 25000];

  // Fetch user bound wallet cards
  useEffect(() => {
    fetch("/api/card")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.cards) {
          setUserCards(data.cards);
        }
        setCardsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching cards:", err);
        setCardsLoading(false);
      });
  }, []);

  const handleCardClick = (card: any) => {
    setSelectedCard(card);
    setValidationError("");
  };

  const handleAmountButtonClick = (amount: number) => {
    setSelectedAmountButton(amount);
    setWithdrawAmount(amount.toString());
    setValidationError("");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWithdrawAmount(e.target.value);
    setSelectedAmountButton(null);
    setValidationError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (turnOver > 0) {
      setValidationError(`Turnover requirement active. You must bet ${turnOver} BDT more.`);
      return;
    }

    if (!selectedCard) {
      setValidationError("Please select a wallet card for withdrawal");
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      setValidationError("Please enter a valid withdrawal amount");
      return;
    }

    if (amount > availableBalance) {
      setValidationError("Insufficient available balance");
      return;
    }

    if (!password.trim()) {
      setValidationError("Please enter your withdrawal security password");
      return;
    }

    setValidationError("");

    // Submit withdrawal request to backend API
    makeWithdrawApi({
      amount: amount,
      account_number: selectedCard.walletNumber,
      password: password,
      ps: selectedCard.paymentWallet.walletName,
    })
      .unwrap()
      .then((res) => {
        toast.success("Withdrawal request submitted successfully!");
        setPassword("");
        setWithdrawAmount("");
        setSelectedAmountButton(null);
        setSelectedCard(null);
        // Reload page to update balances
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      })
      .catch((error) => {
        console.error("Withdrawal error:", error);
        if (error?.data?.message) {
          toast.error(error.data.message);
        } else {
          toast.error(INTERNAL_SERVER_ERROR);
        }
      });
  };

  // Check if turnover requirement prevents withdrawal
  const isBlockedByTurnover = turnOver > 0;

  return (
    <div className="space-y-6">
      {/* 1. SELECT WALLET CARD SECTION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#FFB800] uppercase tracking-wider">Select Wallet Card</h3>
          <span className="text-[10px] text-gray-400 font-semibold uppercase">Choose bound account</span>
        </div>

        {cardsLoading ? (
          <div className="flex items-center justify-center p-8 bg-[#002632] border border-[#006165] rounded-2xl">
            <PulseLoader size={8} color="#23FFC8" />
          </div>
        ) : isBlockedByTurnover ? (
          /* Locked due to turnover */
          <div className="bg-[#002632]/50 border border-red-500/20 rounded-2xl p-6 text-center space-y-2">
            <FaLock className="mx-auto text-red-400 text-2xl animate-pulse" />
            <p className="text-sm font-bold text-red-400">Withdrawal Wallet Locked</p>
            <p className="text-xs text-gray-400">
              টার্নওভারের শর্ত পূরণ না থাকায় ওয়ালেট নির্বাচন করা যাচ্ছে না। অনুগ্রহ করে বাকি গেমপ্লে সম্পন্ন করুন।
            </p>
          </div>
        ) : userCards.length === 0 ? (
          /* No wallets added yet */
          <div className="bg-[#002632] border border-dashed border-[#006165] rounded-2xl p-6 text-center space-y-4">
            <FaExclamationTriangle className="mx-auto text-[#FFB800] text-2xl" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">No bound wallets found</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                উত্তোলনের পূর্বে আপনাকে অন্তত একটি বিকাশ বা নগদ অ্যাকাউন্ট ওয়ালেট হিসেবে যুক্ত করতে হবে।
              </p>
            </div>
            <Link href="/member" className="inline-flex">
              <button className="bg-[linear-gradient(180deg,_#FFE600,_#FFB800)] text-[#B64100] border border-[#FFB800] px-5 py-2.5 rounded-xl text-xs font-black shadow-md hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-1.5 cursor-pointer">
                <FaPlus /> Add Wallet Account
              </button>
            </Link>
          </div>
        ) : (
          /* Cards Grid list */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {userCards.map((card) => {
              const isBkash = card.paymentWallet.walletName.toLowerCase() === "bkash";
              const isSelected = selectedCard?.id === card.id;

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className={`relative overflow-hidden rounded-2xl p-5 border cursor-pointer transition-all duration-300 ${
                    isBkash
                      ? isSelected
                        ? "bg-gradient-to-br from-[#E2125B] to-[#a00c40] border-[#23FFC8] ring-4 ring-[#23FFC8] shadow-[0_0_15px_rgba(35,255,200,0.4)] scale-[1.02]"
                        : "bg-gradient-to-br from-[#E2125B]/90 to-[#b00f45]/90 border-[#E2125B]/40 hover:border-[#E2125B] shadow-md"
                      : isSelected
                      ? "bg-gradient-to-br from-[#F57C00] to-[#cc4c00] border-[#23FFC8] ring-4 ring-[#23FFC8] shadow-[0_0_15px_rgba(35,255,200,0.4)] scale-[1.02]"
                      : "bg-gradient-to-br from-[#F57C00]/90 to-[#E65100]/90 border-[#F57C00]/40 hover:border-[#F57C00] shadow-md"
                  }`}
                >
                  {/* Subtle Glowing chip icon effect */}
                  <div className="absolute top-4 right-4 bg-white/10 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
                    {card.paymentWallet.walletName}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">Account Holder</p>
                      <p className="text-sm font-black text-white">{card.container.ownerName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">Wallet Number</p>
                      <p className="text-base font-black tracking-wide text-white">{card.walletNumber}</p>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-white/60 font-mono">
                      <span>{card.cardNumber}</span>
                      {isSelected && (
                        <span className="flex items-center gap-1 bg-[#23FFC8] text-[#002626] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                          <FaCheck size={7} /> Selected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. PASSWORD PROMPT IF SELECTED */}
      {selectedCard && !isBlockedByTurnover && (
        <section className="bg-[#002632] border border-[#006165] rounded-2xl p-5 shadow-lg space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#FFB800] uppercase tracking-wider flex items-center gap-1.5">
              <FaLock /> Security Verification
            </h3>
            <span className="text-[9px] text-gray-400 font-bold uppercase">Confirm Withdraw Pass</span>
          </div>

          <div className="relative">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="উইথড্রাল পাসওয়ার্ড লিখুন"
              disabled={apiLoading}
              className="w-full bg-[#003e3e] border-[#006165] text-white placeholder-gray-400 focus:ring-[#23FFC8] focus:border-[#23FFC8] py-3 rounded-xl font-bold font-mono"
            />
          </div>
        </section>
      )}

      {/* 3. WITHDRAWAL AMOUNT SECTION */}
      {!isBlockedByTurnover && userCards.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-[#002632] border border-[#006165] rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#FFB800] uppercase tracking-wider">Withdrawal Amount</h3>
              {selectedCard && (
                <span className="text-[9px] text-gray-300 font-bold bg-[#003e3e] border border-[#006165] px-2 py-0.5 rounded-full uppercase">
                  Min: 100 ৳ | Max: 50,000 ৳
                </span>
              )}
            </div>

            {/* Input Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-[#FFB800] font-black text-lg">BDT</span>
              </div>
              <input
                disabled={apiLoading}
                type="number"
                value={withdrawAmount}
                onChange={handleAmountChange}
                placeholder="পরিমাণ লিখুন (৳)"
                className="block w-full pl-16 pr-4 py-3.5 border border-[#006165] rounded-xl bg-[#003e3e] focus:ring-[#23FFC8] focus:border-[#23FFC8] text-white font-extrabold text-lg placeholder-gray-400"
              />
            </div>

            {/* Quick Amount Options */}
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((amount) => (
                <button
                  type="button"
                  key={amount}
                  disabled={apiLoading}
                  onClick={() => handleAmountButtonClick(amount)}
                  className={`py-2.5 px-3 border rounded-xl text-center text-xs font-bold transition-all duration-200 cursor-pointer ${
                    selectedAmountButton === amount
                      ? "bg-[#23FFC8]/10 border-[#23FFC8] text-[#23FFC8]"
                      : "bg-[#003e3e] border-[#006165] text-gray-200 hover:bg-[#003e3e]/80 hover:border-gray-400"
                  }`}
                >
                  {amount} BDT
                </button>
              ))}
            </div>
          </section>

          {/* Validation Error Block */}
          {validationError && (
            <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-3 flex items-start gap-2 text-xs text-red-400 font-semibold">
              <FaExclamationTriangle className="shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Action button */}
          <button
            type="submit"
            disabled={apiLoading || !selectedCard || !withdrawAmount || !password}
            className={`w-full py-4 px-6 rounded-2xl font-black text-white text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedCard && withdrawAmount && password && !apiLoading
                ? "bg-[linear-gradient(135deg,_#23ffc8,_#00bebe)] hover:brightness-110 text-[#002626] hover:shadow-[#23ffc8]/10 hover:-translate-y-0.5 active:scale-[0.99]"
                : "bg-gray-700/50 border border-gray-600/30 text-gray-500 cursor-not-allowed"
            }`}
          >
            {apiLoading ? (
              <>
                <PulseLoader size={6} color="#002626" />
                <span>Processing...</span>
              </>
            ) : (
              "Confirm Withdrawal Request"
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default WithdrawForm;
