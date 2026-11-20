/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import LiveChatTrigger from "@/components/LiveChatTrigger";
import DepositPageLoader from "@/components/loader/DepositPageLoader";
import SiteHeader from "@/components/SiteHeader";
import useGetCurrentUser from "@/hook/useCurrentUser";
import {
    useGetDepositPaymentDataQuery,
    useMakeDepositeMutation,
} from "@/lib/features/depositApiSlice";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    FaCheck,
    FaCopy,
    FaFire,
    FaHandHoldingUsd,
    FaMobileAlt,
    FaPaperPlane,
    FaShoppingBag,
    FaTimes,
} from "react-icons/fa";
import { MdHistory, MdOutlineSupportAgent } from "react-icons/md";
import { PulseLoader } from "react-spinners";

type BonusOption = {
  id: string;
  label: string;
  value: number;
  disable: boolean;
};

const QUICK_AMOUNTS = [
  100, 200, 300, 500, 1000, 2000, 3000, 5000, 10000, 25000,
];

function getProviderMeta(nameRaw: string) {
  const n = (nameRaw || "").toLowerCase();
  if (n.includes("bkash")) {
    return {
      bnName: "বিকাশ",
      enName: "bKash",
      logo: "/wallet/bkash.png",
      bannerBg: "from-[#d81b60] via-[#e2136e] to-[#ad1457]",
    };
  }
  if (n.includes("nagad") || n.includes("nogod")) {
    return {
      bnName: "নগদ",
      enName: "Nagad",
      logo: "/wallet/nagad.png",
      bannerBg: "from-[#ea580c] via-[#ef4444] to-[#dc2626]",
    };
  }
  if (n.includes("rocket")) {
    return {
      bnName: "রকেট",
      enName: "Rocket",
      logo: "/wallet/rocket.png",
      bannerBg: "from-[#7e22ce] via-[#9333ea] to-[#6b21a8]",
    };
  }
  if (n.includes("upay")) {
    return {
      bnName: "উপায়",
      enName: "Upay",
      logo: "/wallet/upay.png",
      bannerBg: "from-[#ca8a04] via-[#eab308] to-[#a16207]",
    };
  }
  return {
    bnName: nameRaw || "ওয়ালেট",
    enName: nameRaw || "Wallet",
    logo: "/wallet/bkash.png",
    bannerBg: "from-emerald-600 via-teal-600 to-cyan-700",
  };
}

function formatDateTime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function generateClientTrackingId() {
  const hex = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return `${hex()}${hex()}-${hex()}-${hex()}-${hex()}-${hex()}${hex()}${hex()}`;
}

const DepositPage: React.FC = () => {
  const { data, isLoading } = useGetDepositPaymentDataQuery();
  const wallets: any[] = data?.wallets || [];
  const bonus = data?.bonus;
  const user: any = useGetCurrentUser();

  const [step, setStep] = useState<number>(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>();
  const [selectedAgentNumber, setSelectedAgentNumber] = useState<string>("");
  const [depositAmount, setDepositAmount] = useState<string>("100");
  const [trxId, setTrxId] = useState("");
  const [selectedBonus, setSelectedBonus] = useState<BonusOption>({
    id: "none",
    label: "কোনও প্রচারে অংশ নেওয়া যায় না",
    value: 0,
    disable: false,
  });
  const [selectedAmountButton, setSelectedAmountButton] = useState<
    number | null
  >(100);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Step 2 Gateway Order state
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const [orderCreatedAt, setOrderCreatedAt] = useState<Date | null>(null);
  const [orderExpiresAt, setOrderExpiresAt] = useState<Date | null>(null);
  const [orderTrackingId, setOrderTrackingId] = useState<string>("");
  const [remainingSeconds, setRemainingSeconds] = useState<number>(600);

  const [bonusOptions, setBonusOptions] = useState<BonusOption[]>([
    {
      id: "signinBonus",
      label: "প্রথম জমার বোনাস",
      value: 0,
      disable: true,
    },
    {
      id: "referralBonus",
      label: "রেফার বোনাস",
      value: 0,
      disable: true,
    },
    {
      id: "none",
      label: "কোনও প্রচারে অংশ নেওয়া যায় না",
      value: 0,
      disable: false,
    },
  ]);

  const [makeDeposit] = useMakeDepositeMutation();

  // Detect whether current wallet is Cash Out (Agent) or Send Money (Personal)
  const isCashOutOrder = useMemo(() => {
    const raw =
      `${selectedPaymentMethod?.trxType || ""} ${selectedPaymentMethod?.instructions || ""} ${selectedPaymentMethod?.name || ""}`.toLowerCase();
    return raw.includes("cash out") || raw.includes("cashout") || raw.includes("agent");
  }, [selectedPaymentMethod]);

  const providerMeta = useMemo(
    () => getProviderMeta(selectedPaymentMethod?.name || ""),
    [selectedPaymentMethod]
  );

  // Live 10-minute countdown in Step 2
  useEffect(() => {
    if (step !== 2 || !orderExpiresAt) return;
    const tick = () => {
      const diff = Math.max(
        0,
        Math.floor((orderExpiresAt.getTime() - Date.now()) / 1000)
      );
      setRemainingSeconds(diff);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [step, orderExpiresAt]);

  const formattedCountdown = useMemo(() => {
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [remainingSeconds]);

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
      setError("অনুগ্রহ করে সঠিক টাকার পরিমাণ লিখুন");
      return;
    }

    const minDep = Number(selectedPaymentMethod?.min_deposit || 100);
    const maxDep = Number(selectedPaymentMethod?.max_deposit || 25000);

    if (amount < minDep) {
      setError(`সর্বনিম্ন ডিপোজিট ${minDep} BDT`);
      return;
    }

    if (amount > maxDep) {
      setError(`সর্বোচ্চ ডিপোজিট ${maxDep} BDT`);
      return;
    }

    setError("");
    const now = new Date();
    const exp = new Date(now.getTime() + 10 * 60 * 1000);
    setOrderCreatedAt(now);
    setOrderExpiresAt(exp);
    setOrderTrackingId(generateClientTrackingId());
    setRemainingSeconds(600);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    setPending(true);
    const amount = parseFloat(depositAmount);

    if (!amount || amount <= 0) {
      setError("অনুগ্রহ করে সঠিক টাকার পরিমাণ লিখুন");
      setPending(false);
      return;
    }

    if (!trxId.trim()) {
      setError("TrxID অবশ্যই পূরণ করতে হবে!");
      setPending(false);
      return;
    }

    if (!selectedAgentNumber) {
      setError("কোনো অ্যাক্টিভ রিসিভার নাম্বার পাওয়া যায়নি");
      setPending(false);
      return;
    }

    makeDeposit({
      amount: amount,
      bonusFor: selectedBonus.id,
      senderNumber: "",
      trxID: trxId.trim().toUpperCase(),
      walletId: selectedPaymentMethod.id,
      walletNumber: selectedAgentNumber,
    })
      .unwrap()
      .then((res) => {
        if (res && res.success) {
          setPending(false);
          setRedirecting(true);
          toast.success(
            res.payload?.message ||
              "ডিপোজিট সফলভাবে জমা হয়েছে! অনুগ্রহ করে অপেক্ষা করুন।"
          );
          setTimeout(() => {
            window.location.href = "/history";
          }, 1500);
        } else {
          toast.error("ডিপোজিট সাবমিট করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
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

  const minDepositLimit = Number(selectedPaymentMethod?.min_deposit || 100);
  const maxDepositLimit = Number(selectedPaymentMethod?.max_deposit || 25000);

  const isValidAmount =
    totalAmount >= minDepositLimit && totalAmount <= maxDepositLimit;
  const isStep1Valid = Boolean(selectedPaymentMethod && isValidAmount);
  const isFormValid =
    isStep1Valid && trxId.trim().length >= 6 && selectedAgentNumber !== "";

  useEffect(() => {
    if (wallets.length && !selectedPaymentMethod) {
      setSelectedPaymentMethod(wallets[0]);
    }
  }, [wallets]);

  useEffect(() => {
    if (
      selectedPaymentMethod &&
      selectedPaymentMethod.walletsNumber?.length > 0
    ) {
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
            return {
              ...b,
              label: `প্রথম জমার বোনাস সর্বোচ্চ ${bonus.signinBonus}% পর্যন্ত`,
              value: bonus.signinBonus,
              disable: !(bonus.signinBonus > 0),
            };
          if (b.id === "referralBonus")
            return {
              ...b,
              label: `রেফার বোনাস ${bonus.referralBonus}%`,
              value: bonus.referralBonus,
              disable: !(bonus.referralBonus > 0),
            };
          return b;
        })
      );
    }
  }, [bonus, user]);

  useEffect(() => {
    const num = +depositAmount;
    if (QUICK_AMOUNTS.includes(num)) setSelectedAmountButton(num);
    else setSelectedAmountButton(null);
  }, [depositAmount]);

  useEffect(() => {
    if (error) setError("");
  }, [depositAmount, trxId, selectedAgentNumber]);

  const copyText = (text: string, label = "কপি করা হয়েছে!") => {
    navigator.clipboard.writeText(text);
    toast.success(label);
  };

  return (
    <>
      {data && !isLoading && user ? (
        <div className="min-h-screen bg-[#070e17] flex flex-col text-white pb-24">
          {/* STEP 1: 2777bet-style Deposit Screen matched to RK444 Dark/Emerald UI */}
          {step === 1 && (
            <>
              <SiteHeader title="জমা দিন">
                <LiveChatTrigger
                  fallbackHref="/support"
                  title="Live Chat Support"
                  ariaLabel="Live Chat Support"
                  className="text-gray-300 hover:text-emerald-400 cursor-pointer flex items-center transition-colors"
                >
                  <MdOutlineSupportAgent className="text-xl" />
                </LiveChatTrigger>
                <Link
                  href="/history"
                  className="text-gray-300 hover:text-emerald-400 transition-colors flex items-center"
                >
                  <MdHistory className="text-xl" />
                </Link>
              </SiteHeader>

              <main className="w-full max-w-md mx-auto px-3.5 py-4 space-y-4">
                {/* 1. আমানতের মোড (Payment Method Grid) */}
                <section className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-3.5 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <h2 className="text-sm font-black text-white">
                      আমানতের মোড
                    </h2>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {wallets.map((wallet, idx) => {
                      const active = selectedPaymentMethod?.id === wallet.id;
                      const meta = getProviderMeta(wallet.name);
                      const imgSrc =
                        wallet.image && !String(wallet.image).includes("mbuzz88")
                          ? wallet.image
                          : meta.logo;

                      return (
                        <button
                          key={wallet.id || idx}
                          type="button"
                          onClick={() => setSelectedPaymentMethod(wallet)}
                          className={`relative flex flex-col items-center justify-center rounded-xl p-2.5 transition-all cursor-pointer overflow-hidden ${
                            active
                              ? "bg-[#10253f] border-2 border-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.25)]"
                              : "bg-[#06101c] border border-[#183454] hover:border-[#2a5485]"
                          }`}
                        >
                          {/* Hot badge on first wallet */}
                          {idx === 0 && (
                            <span className="absolute top-0 left-0 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-br-lg flex items-center">
                              <FaFire className="w-2.5 h-2.5" />
                            </span>
                          )}

                          <div className="w-10 h-10 rounded-xl bg-white/95 p-1 flex items-center justify-center shadow-sm mb-1.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgSrc}
                              alt={wallet.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span
                            className={`text-[11px] font-bold text-center leading-tight line-clamp-2 ${
                              active ? "text-emerald-300" : "text-gray-300"
                            }`}
                          >
                            {wallet.name}
                          </span>

                          {/* Corner Checkmark Triangle */}
                          {active && (
                            <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 rounded-tl-lg flex items-center justify-center">
                              <FaCheck className="text-black text-[9px]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Warning Instruction Strip */}
                  <p className="mt-3 text-[11px] leading-relaxed text-amber-200/90 bg-amber-500/10 border border-amber-500/25 rounded-xl p-2.5">
                    অনুগ্রহ করে আপনার{" "}
                    <strong className="text-white">
                      ({providerMeta.enName})
                    </strong>{" "}
                    একাউন্টের মাধ্যমে অর্থ স্থানান্তর করুন এবং পেমেন্ট পাতায়{" "}
                    <strong className="text-emerald-300">(TRX ID)</strong>{" "}
                    অনুলিপি করে সঠিকভাবে পূরণ করুন। ⚠️ যদি আপনি (TRX ID) না
                    লিখেন বা ভুল লিখেন, তাহলে আপনার লেনদেন সফলভাবে সম্পন্ন হবে
                    না।
                  </p>
                </section>

                {/* 2. পেমেন্ট চ্যানেল (ONLY 1 Channel as requested) */}
                <section className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-3.5 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <h2 className="text-sm font-black text-white">
                      পেমেন্ট চ্যানেল
                    </h2>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      className="relative py-3 px-2 rounded-xl bg-[#10253f] border-2 border-emerald-400 text-emerald-300 font-black text-xs text-center shadow-[0_0_12px_rgba(16,185,129,0.2)] overflow-hidden"
                    >
                      চ্যানেল 1
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-tl-md flex items-center justify-center">
                        <FaCheck className="text-black text-[8px]" />
                      </div>
                    </button>
                  </div>
                </section>

                {/* 3. জমা পরিমাণ (Quick Amount Grid + Input) */}
                <section className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-3.5 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <h2 className="text-sm font-black text-white">
                        জমা পরিমাণ
                      </h2>
                    </div>
                    <span className="text-[11px] font-bold text-[#3888e9]">
                      ৳{minDepositLimit.toLocaleString()} - ৳
                      {maxDepositLimit.toLocaleString()}
                    </span>
                  </div>

                  {/* 5-column Quick Amount Grid */}
                  <div className="grid grid-cols-5 gap-1.5 mb-3">
                    {QUICK_AMOUNTS.map((amount) => {
                      const active = selectedAmountButton === amount;
                      const amtBonus = calculateBonus(amount);
                      return (
                        <button
                          key={amount}
                          type="button"
                          disabled={pending}
                          onClick={() => handleAmountButtonClick(amount)}
                          className={`relative rounded-xl overflow-hidden text-center transition-all active:scale-95 cursor-pointer ${
                            active
                              ? "bg-[#10253f] border-2 border-emerald-400 text-emerald-300 font-black shadow-md shadow-emerald-500/20"
                              : "bg-[#06101c] border border-[#183454] text-gray-200 hover:border-[#2a5485] font-bold"
                          }`}
                        >
                          {amtBonus > 0 && (
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-[9px] font-black py-0.5 leading-none">
                              +{amtBonus}
                            </div>
                          )}
                          <div className="py-2 text-xs">
                            {amount.toLocaleString()}
                          </div>
                          {active && (
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-tl-md flex items-center justify-center">
                              <FaCheck className="text-black text-[7px]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Amount Input Box with optional Bonus Header Strip */}
                  <div className="rounded-xl overflow-hidden border border-[#1b385a] focus-within:border-emerald-400 bg-[#06101c] transition-all">
                    {bonusAmount > 0 && (
                      <div className="bg-gradient-to-r from-emerald-500/20 via-emerald-500/40 to-emerald-500/80 px-3 py-1 flex justify-end">
                        <span className="text-[11px] font-black text-white">
                          + ৳ {bonusAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center px-3.5 py-2.5">
                      <span className="text-base font-black text-emerald-400 mr-2.5">
                        ৳
                      </span>
                      <input
                        disabled={pending}
                        type="number"
                        className="w-full bg-transparent text-white font-black text-lg placeholder-gray-500 focus:outline-none"
                        placeholder={`${minDepositLimit} - ${maxDepositLimit.toLocaleString()}`}
                        value={depositAmount}
                        onChange={handleAmountChange}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="mt-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/25 px-3 py-2 rounded-lg font-bold">
                      {error}
                    </div>
                  )}
                </section>

                {/* 4. কার্যক্রম (Bonus / Promotion Selector) */}
                <section className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-3.5 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-[#3888e9]" />
                    <h2 className="text-sm font-black text-white">কার্যক্রম</h2>
                  </div>

                  <div className="space-y-2.5">
                    {bonusOptions.map((option) => {
                      const isSelected = selectedBonus.id === option.id;
                      return (
                        <div
                          key={option.id}
                          onClick={() =>
                            !option.disable &&
                            !pending &&
                            setSelectedBonus(option)
                          }
                          className={`rounded-xl p-3 transition-all ${
                            option.disable
                              ? "opacity-40 cursor-not-allowed bg-[#06101c] border border-[#142944]"
                              : isSelected
                              ? "bg-emerald-500/10 border-2 border-emerald-400 cursor-pointer"
                              : "bg-[#06101c] border border-[#183454] hover:border-[#2a5485] cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? "border-emerald-400"
                                    : "border-gray-500"
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                )}
                              </div>
                              <span className="text-xs font-extrabold text-white">
                                {option.label}
                              </span>
                            </div>
                            {option.id !== "none" && (
                              <span className="text-[11px] font-bold text-emerald-400 shrink-0">
                                ≥ ৳ {minDepositLimit}.00
                              </span>
                            )}
                          </div>

                          {isSelected && option.id === "signinBonus" && (
                            <p className="mt-2 pl-6 text-[11px] leading-relaxed text-gray-300">
                              RK444 নতুন সদস্যদের জন্য প্রথম ডিপোজিটে{" "}
                              <strong className="text-emerald-300">
                                {option.value}% বোনাস
                              </strong>{" "}
                              প্রদান করে।
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* 5. পেমেন্ট বিবরণ (Summary Card) */}
                <section className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-3.5 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <h2 className="text-sm font-black text-white">
                      পেমেন্ট বিবরণ
                    </h2>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-[#183454] bg-[#06101c] text-xs">
                    <div className="flex justify-between items-center px-3.5 py-2.5 border-b border-[#142944]">
                      <span className="text-gray-400 font-medium">
                        জমা পরিমাণ
                      </span>
                      <span className="font-bold text-white">
                        ৳ {totalAmount.toFixed(2)}
                      </span>
                    </div>
                    {bonusAmount > 0 && (
                      <div className="flex justify-between items-center px-3.5 py-2.5 border-b border-[#142944]">
                        <span className="text-gray-400 font-medium">বোনাস</span>
                        <span className="font-bold text-amber-400">
                          +৳ {bonusAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center px-3.5 py-3 bg-emerald-500/10">
                      <span className="text-gray-200 font-bold">
                        প্রকৃত পেমেন্ট পরিমাণ
                      </span>
                      <span className="font-black text-base text-emerald-400">
                        ৳ {totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </section>
              </main>

              {/* Sticky Bottom "পরবর্তী" Button */}
              <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a1626]/95 backdrop-blur border-t border-[#162e4a] p-3">
                <div className="max-w-md mx-auto">
                  <button
                    type="button"
                    disabled={!isStep1Valid}
                    onClick={handleNextStep}
                    className={`w-full py-3.5 rounded-xl font-black text-base tracking-wide transition-all ${
                      isStep1Valid
                        ? "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-black shadow-lg shadow-emerald-500/25 active:scale-[0.99] cursor-pointer"
                        : "bg-[#183250] text-gray-500 cursor-not-allowed border border-[#204066]"
                    }`}
                  >
                    পরবর্তী
                  </button>
                </div>
              </div>
            </>
          )}

          {/* STEP 2: 2777bet-style Payment Gateway Checkout matched to RK444 UI */}
          {step === 2 && selectedPaymentMethod && (
            <div className="min-h-screen bg-[#070e17] flex flex-col">
              {/* Top Green Gateway Header */}
              <div className="bg-gradient-to-r from-[#065f46] via-[#047857] to-[#065f46] px-4 py-3.5 shadow-lg">
                <div className="max-w-md mx-auto flex items-center justify-between">
                  <div>
                    <div className="text-xl font-black text-white tracking-tight">
                      BDT {totalAmount.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-100 mt-0.5">
                      {lang === "bn"
                        ? isCashOutOrder
                          ? "কম বা বেশি করবেন না ক্যাশ আউট"
                          : "কম বা বেশি করবেন না সেন্ড মানি"
                        : isCashOutOrder
                        ? "Send exact amount via Cash Out"
                        : "Send exact amount via Send Money"}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="bg-black/35 hover:bg-black/50 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20 cursor-pointer transition"
                      >
                        {lang === "bn" ? "বাতিল করুন" : "Cancel"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        aria-label="Close"
                        className="w-7 h-7 rounded-full bg-black/35 hover:bg-black/50 text-white flex items-center justify-center border border-white/20 cursor-pointer transition"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                    <div className="inline-flex rounded-md overflow-hidden border border-white/25 text-[10px] font-black">
                      <button
                        type="button"
                        onClick={() => setLang("en")}
                        className={`px-2 py-0.5 cursor-pointer ${
                          lang === "en"
                            ? "bg-white text-emerald-900"
                            : "bg-black/25 text-white"
                        }`}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        onClick={() => setLang("bn")}
                        className={`px-2 py-0.5 cursor-pointer ${
                          lang === "bn"
                            ? "bg-white text-emerald-900"
                            : "bg-black/25 text-white"
                        }`}
                      >
                        বাং
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gateway Body */}
              <main className="w-full max-w-md mx-auto px-4 py-4 space-y-4">
                {/* Red/Amber Amount Notice */}
                <p className="text-xs font-bold leading-relaxed text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-xl p-3">
                  {lang === "bn"
                    ? `অনুগ্রহ করে সঠিক পরিমাণ (BDT ${totalAmount.toLocaleString()}) পাঠান এবং লেনদেন সম্পন্ন করে নিচে TrxID সঠিকভাবে দিন।`
                    : `Please send BDT ${totalAmount.toLocaleString()} and submit the exact TrxID below to receive instant credit.`}
                </p>

                {/* Provider Brand Banner (bKash Pink / Nagad Orange / Rocket Purple / Upay Yellow) */}
                <div
                  className={`rounded-2xl bg-gradient-to-r ${providerMeta.bannerBg} px-4 py-3 flex items-center gap-3.5 shadow-lg`}
                >
                  <div className="w-12 h-12 rounded-full bg-white p-1.5 flex items-center justify-center shadow shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        selectedPaymentMethod.image &&
                        !String(selectedPaymentMethod.image).includes("mbuzz88")
                          ? selectedPaymentMethod.image
                          : providerMeta.logo
                      }
                      alt={providerMeta.enName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">
                      {providerMeta.bnName}{" "}
                      <span className="italic font-bold">Deposit</span>
                    </div>
                    <div className="text-[11px] text-white/85 font-medium">
                      চ্যানেল 1 · অটো ডিপোজিট
                    </div>
                  </div>
                </div>

                {/* Wallet No* Box */}
                <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 space-y-3 shadow-md">
                  <div>
                    <div className="text-sm font-black italic text-white">
                      Wallet No<span className="text-red-400">*</span>
                    </div>
                    <div className="text-xs font-bold text-gray-300 mt-0.5">
                      {lang === "bn"
                        ? isCashOutOrder
                          ? `এই ${providerMeta.bnName} নাম্বারে শুধুমাত্র ক্যাশ আউট গ্রহণ করা হয়`
                          : `এই ${providerMeta.bnName} নাম্বারে শুধুমাত্র সেন্ড মানি গ্রহণ করা হয়`
                        : isCashOutOrder
                        ? `Only Cash Out is accepted on this ${providerMeta.enName} number`
                        : `Only Send Money is accepted on this ${providerMeta.enName} number`}
                    </div>
                  </div>

                  {/* Active Receiver Number + Copy */}
                  {selectedPaymentMethod.walletsNumber?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPaymentMethod.walletsNumber.map(
                        (num: string, idx: number) => {
                          const isSelectedNum = selectedAgentNumber === num;
                          return (
                            <div
                              key={idx}
                              onClick={() => setSelectedAgentNumber(num)}
                              className={`flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer transition-all ${
                                isSelectedNum
                                  ? "bg-[#0e223a] border-2 border-emerald-400"
                                  : "bg-[#06101c] border border-[#183454]"
                              }`}
                            >
                              <span className="font-mono text-lg font-black italic text-white tracking-wider">
                                {num}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyText(num, "নাম্বার কপি হয়েছে!");
                                }}
                                className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-xs font-black px-3 py-1.5 rounded-lg cursor-pointer transition active:scale-95"
                              >
                                <FaCopy className="text-sm" />
                                কপি
                              </button>
                            </div>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-red-400 font-bold">
                      কোনো অ্যাক্টিভ নাম্বার পাওয়া যায়নি।
                    </p>
                  )}

                  {/* পার্সোনাল বনাম এজেন্ট নাম্বার – পার্থক্য কী? */}
                  <div className="pt-2 border-t border-[#162e4a] space-y-2">
                    <div className="text-xs font-black text-white">
                      পার্সোনাল বনাম এজেন্ট নাম্বার – পার্থক্য কী?
                    </div>

                    {/* Personal Row */}
                    <div
                      className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs ${
                        !isCashOutOrder
                          ? "bg-emerald-500/15 border border-emerald-400/40 text-emerald-300"
                          : "bg-[#06101c] text-gray-400"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-black shrink-0">
                          পার্সোনাল নাম্বার
                        </span>
                        <span className="italic">
                          &quot;Send Money (সেন্ড মানি)&quot; দিয়ে পাঠান
                        </span>
                      </div>
                      {!isCashOutOrder && (
                        <span className="bg-emerald-500 text-black text-[10px] font-black px-2 py-1 rounded-lg shrink-0">
                          এই অর্ডার
                        </span>
                      )}
                    </div>

                    {/* Agent Row */}
                    <div
                      className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs ${
                        isCashOutOrder
                          ? "bg-emerald-500/15 border border-emerald-400/40 text-emerald-300"
                          : "bg-[#06101c] text-gray-400"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-black shrink-0">
                          এজেন্ট নাম্বার
                        </span>
                        <span className="italic">
                          &quot;Cash Out (ক্যাশ আউট)&quot; দিয়ে পাঠান
                        </span>
                      </div>
                      {isCashOutOrder && (
                        <span className="bg-emerald-500 text-black text-[10px] font-black px-2 py-1 rounded-lg shrink-0">
                          এই অর্ডার
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] leading-relaxed text-gray-400">
                      প্রতিটি ধরনের নাম্বার শুধু নিজের ধরনের লেনদেনই গ্রহণ করে।
                      উপরের নাম্বারটি{" "}
                      <strong className="text-gray-200">
                        {isCashOutOrder ? "এজেন্ট নাম্বার" : "পার্সোনাল নাম্বার"}
                      </strong>{" "}
                      – অন্য অপশনটি ব্যবহার করলে টাকা আমাদের কাছে পৌঁছাবে না।
                    </p>
                  </div>
                </div>

                {/* TrxID Input Section */}
                <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 space-y-3 shadow-md">
                  <label className="block text-sm font-black leading-snug text-white">
                    লেনদেন সম্পন্ন করার পর{" "}
                    <span className="italic text-emerald-300">
                      {isCashOutOrder ? "Cash Out" : "Send Money"}
                    </span>
                    -এর <span className="italic">TrxID (Transaction ID)</span>{" "}
                    সঠিকভাবে লিখুন।{" "}
                    <span className="text-red-400">(প্রয়োজন)</span>
                  </label>

                  <input
                    disabled={pending || redirecting}
                    type="text"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="TrxID অবশ্যই পূরণ করতে হবে!"
                    className={`w-full px-4 py-3.5 rounded-xl bg-[#06101c] text-white font-mono font-bold text-base uppercase tracking-wider placeholder-gray-400 focus:outline-none transition-all ${
                      trxId.trim().length >= 6
                        ? "border-2 border-emerald-400 ring-2 ring-emerald-500/20"
                        : "border-2 border-red-500/80 focus:border-red-400"
                    }`}
                  />

                  <p className="text-[11px] leading-relaxed text-gray-400">
                    ১০ অক্ষর, প্রথম ২টি ইংরেজি অক্ষর। TrxID হুবহু লিখুন।{" "}
                    <strong className="text-gray-200">0 (শূন্য)</strong> ও{" "}
                    <strong className="text-gray-200">O (অক্ষর)</strong> খেয়াল
                    করুন।
                  </p>

                  {error && (
                    <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 px-3 py-2 rounded-lg font-bold">
                      {error}
                    </div>
                  )}

                  {/* নিশ্চিত (Confirm Button) */}
                  <button
                    type="button"
                    disabled={!isFormValid || pending || redirecting}
                    onClick={handleSubmit}
                    className={`w-full py-3.5 rounded-xl font-black text-base transition-all ${
                      isFormValid && !pending && !redirecting
                        ? "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-black shadow-lg shadow-emerald-500/25 active:scale-[0.99] cursor-pointer"
                        : "bg-[#06101c] text-gray-400 border border-[#244369] cursor-not-allowed"
                    }`}
                  >
                    {redirecting || pending ? (
                      <span className="flex items-center justify-center gap-2">
                        <PulseLoader size={7} color="#10b981" />
                        <span>যাচাই করা হচ্ছে...</span>
                      </span>
                    ) : (
                      "নিশ্চিত"
                    )}
                  </button>
                </div>

                {/* 4-Icon Action Guide + Live Countdown */}
                <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 text-center space-y-3 shadow-md">
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      {
                        label: "সেন্ড মানি",
                        icon: FaPaperPlane,
                        active: !isCashOutOrder,
                        color: "text-rose-400",
                      },
                      {
                        label: "মোবাইল রিচার্জ",
                        icon: FaMobileAlt,
                        active: false,
                        color: "text-emerald-400",
                      },
                      {
                        label: "ক্যাশ আউট",
                        icon: FaHandHoldingUsd,
                        active: isCashOutOrder,
                        color: "text-cyan-400",
                      },
                      {
                        label: "পেমেন্ট",
                        icon: FaShoppingBag,
                        active: false,
                        color: "text-amber-400",
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className={`flex flex-col items-center justify-center rounded-xl py-2.5 px-1 transition-all ${
                            item.active
                              ? "bg-rose-500/15 border-2 border-rose-500 shadow-md shadow-rose-500/20"
                              : "bg-[#06101c] border border-[#142944] opacity-45"
                          }`}
                        >
                          <Icon className={`text-lg mb-1.5 ${item.color}`} />
                          <span className="text-[10px] font-bold text-white leading-tight">
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-1 space-y-1">
                    <div className="text-xs font-black text-[#3888e9]">
                      দেখে নিন
                    </div>
                    <div className="text-lg font-black text-rose-400">
                      {isCashOutOrder ? "ক্যাশ আউট" : "সেন্ড মানি"}
                    </div>
                    <div className="text-xs font-bold text-gray-300">
                      বাকি সময়{" "}
                      <span className="font-mono italic text-rose-400 font-black">
                        {formattedCountdown}
                      </span>
                    </div>
                  </div>

                  {/* Warning Box */}
                  <div className="pt-2 border-t border-[#162e4a] text-left space-y-1">
                    <div className="text-xs font-black text-white">সতর্কতাঃ</div>
                    <div className="text-xs font-black text-rose-400">
                      লেনদেন আইডি সঠিকভাবে পূরণ করতে হবে, অন্যথায় স্কোর ব্যর্থ
                      হবে!
                    </div>
                    <div className="text-[11px] italic text-gray-400">
                      {isCashOutOrder
                        ? "Send Money (সেন্ড মানি) ব্যবহার করবেন না।"
                        : "Cash Out (ক্যাশ আউট) ব্যবহার করবেন না।"}
                    </div>
                  </div>
                </div>

                {/* Order Footer Details (Tracking / Created / Expiry) */}
                <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 text-xs space-y-2 shadow-md">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-400 shrink-0">ট্র্যাকিং নম্বর</span>
                    <button
                      type="button"
                      onClick={() =>
                        copyText(orderTrackingId, "ট্র্যাকিং নম্বর কপি হয়েছে!")
                      }
                      className="font-mono text-[11px] font-bold text-emerald-400 underline truncate cursor-pointer"
                    >
                      {orderTrackingId}
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">তৈরি</span>
                    <span className="font-mono font-bold text-white">
                      {orderCreatedAt ? formatDateTime(orderCreatedAt) : "--"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">মেয়াদ</span>
                    <span className="font-mono font-bold text-white">
                      {orderExpiresAt ? formatDateTime(orderExpiresAt) : "--"}
                    </span>
                  </div>
                </div>
              </main>
            </div>
          )}
        </div>
      ) : (
        <DepositPageLoader />
      )}
    </>
  );
};

export default DepositPage;
