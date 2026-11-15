"use client";

import React, { useState } from "react";
import Link from "next/link";
import SideNavLayout from "@/components/SideNavLayout";
import TabLayout from "@/components/TabLayout";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import {
  FaBookOpen,
  FaCheckCircle,
  FaCoins,
  FaExchangeAlt,
  FaGift,
  FaShieldAlt,
  FaUserPlus,
  FaWallet,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

/**
 * RK444 Official Player Manual & Help Guide (/manual)
 * Provides interactive step-by-step instructions on Deposits, 1x Turnover Rules,
 * Withdrawals, and Referral Rewards.
 */
const ManualPage = () => {
  const [activeSection, setActiveSection] = useState<
    "deposit" | "turnover" | "withdraw" | "referral"
  >("deposit");

  return (
    <SideNavLayout>
      <TabLayout>
        <SiteHeader title="Player Manual & Guide" fallbackUrl="/" />

        <main className="min-h-screen bg-[#070e17] text-white px-3 sm:px-5 py-5 max-w-4xl mx-auto space-y-6 pb-28 md:pb-14">
          {/* Top Hero */}
          <div className="rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-[#0d1f38] via-[#0a1626] to-[#07111e] border border-[#1c3b63] shadow-xl space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-[10px] sm:text-xs font-black uppercase tracking-wider">
              <FaBookOpen />
              <span>RK444 PLAYER HANDBOOK</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              প্লেয়ার গাইড ও পূর্ণাঙ্গ নিয়মাবলী (Beginner&apos;s Manual)
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl">
              RK444-এ কীভাবে সহজে ডিপোজিট করবেন, 1x টার্নওভার বোনাস ব্যবহার করবেন এবং দ্রুত বিকাশ/নগদে উইথড্র নিবেন—সবকিছুর বিস্তারিত গাইড।
            </p>
          </div>

          {/* 4 Category Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              {
                id: "deposit" as const,
                label: "ডিপোজিট গাইড",
                icon: <FaWallet className="text-emerald-400" />,
              },
              {
                id: "turnover" as const,
                label: "1x টার্নওভার নিয়ম",
                icon: <FaGift className="text-yellow-400" />,
              },
              {
                id: "withdraw" as const,
                label: "উইথড্র গাইড",
                icon: <FaExchangeAlt className="text-[#3888e9]" />,
              },
              {
                id: "referral" as const,
                label: "রেফার ও ইনকাম",
                icon: <FaUserPlus className="text-purple-400" />,
              },
            ].map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`p-3.5 rounded-2xl border font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeSection === tab.id
                    ? "bg-[#112846] border-[#3888e9] text-white shadow-lg"
                    : "bg-[#0a1626] border-[#162e4a] text-gray-400 hover:text-white"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Section Content */}
          {activeSection === "deposit" && (
            <div className="rounded-2xl p-5 bg-[#0a1626] border border-[#162e4a] space-y-4">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <FaWallet className="text-emerald-400" />
                <span>কীভাবে বিকাশ / নগদ / রকেটে ডিপোজিট করবেন?</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                <div className="p-4 rounded-xl bg-[#07111e] border border-[#152c47] space-y-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black text-[10px]">
                    ধাপ ১
                  </span>
                  <h3 className="text-sm font-black text-white">
                    গেটওয়ে ও নম্বর কপি করুন
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Deposit পেজে গিয়ে বিকাশ বা নগদ সিলেক্ট করুন, টাকার পরিমাণ দিন এবং প্রদর্শিত এজেন্ট/মার্চেন্ট নম্বরটি কপি করুন।
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#07111e] border border-[#152c47] space-y-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black text-[10px]">
                    ধাপ ২
                  </span>
                  <h3 className="text-sm font-black text-white">
                    টাকা পাঠান ও TrxID কপি করুন
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    আপনার বিকাশ/নগদ অ্যাপ থেকে নির্দিষ্ট পরিমাণ টাকা পাঠিয়ে সফল লেনদেনের{" "}
                    <strong className="text-white">Transaction ID (TrxID)</strong> কপি করে নিন।
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#07111e] border border-[#152c47] space-y-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black text-[10px]">
                    ধাপ ৩
                  </span>
                  <h3 className="text-sm font-black text-white">
                    সাবমিট করুন ও ব্যালেন্স পান
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    ফর্মে আপনার প্রেরক নম্বর ও TrxID বসিয়ে সাবমিট করলেই ভেরিফিকেশনের সাথে সাথে আপনার ওয়ালেটে ব্যালেন্স ও বোনাস যোগ হয়ে যাবে!
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/deposit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs transition-all"
                >
                  <span>এখনই ডিপোজিট পেজে যান →</span>
                </Link>
              </div>
            </div>
          )}

          {activeSection === "turnover" && (
            <div className="rounded-2xl p-5 bg-[#0a1626] border border-[#162e4a] space-y-4">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <HiSparkles className="text-yellow-400" />
                <span>1x Turnover কী এবং এটি কীভাবে কাজ করে?</span>
              </h2>

              <div className="p-4 rounded-xl bg-[#07111e] border border-[#152c47] space-y-3 text-xs leading-relaxed text-gray-300">
                <p>
                  <strong className="text-yellow-400">1x Turnover</strong> মানে হলো আপনি যে পরিমাণ ডিপোজিট বা বোনাস গ্রহণ করবেন, উইথড্র করার আগে যেকোনো গেমে (স্লট, লাইভ ক্যাসিনো, ক্র্যাশ বা স্পোর্টস) ঠিক{" "}
                  <strong className="text-white">১ বার সমপরিমাণ টাকা বাজি (Bet/Wager)</strong> ধরতে হবে।
                </p>

                <div className="p-3.5 rounded-xl bg-[#0d1f36] border border-[#1e3e68] space-y-1.5">
                  <div className="font-black text-emerald-400">
                    সহজ উদাহরণ:
                  </div>
                  <p>
                    • আপনি যদি <strong className="text-white">৳ ১০০</strong> ডেইলি লগইন বা ইনভাইট বোনাস ক্লেইম করেন, আপনার টার্নওভার লক্ষ্য হবে মাত্র <strong className="text-white">৳ ১০০</strong>।
                  </p>
                  <p>
                    • আপনি যেকোনো গেমে মোট ৳ ১০০ বেট সম্পন্ন করলেই আপনার বকেয়া টার্নওভার <strong className="text-emerald-400">৳ ০.০০</strong> হয়ে যাবে এবং সম্পূর্ণ ব্যালেন্স উইথড্র করতে পারবেন!
                  </p>
                </div>

                <div className="flex items-start gap-2.5 pt-1 text-emerald-300 font-semibold">
                  <FaShieldAlt className="mt-0.5 shrink-0" />
                  <span>
                    <strong>Zero-Balance Auto Reset সুবিধা:</strong> আপনার ওয়ালেট ব্যালেন্স যদি কখনো ৳ ১-এর নিচে নেমে যায়, তবে পুরনো যেকোনো বকেয়া টার্নওভার স্বয়ংক্রিয়ভাবে ০ হয়ে যাবে!
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeSection === "withdraw" && (
            <div className="rounded-2xl p-5 bg-[#0a1626] border border-[#162e4a] space-y-4">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <FaExchangeAlt className="text-[#3888e9]" />
                <span>কীভাবে দ্রুত উইথড্র (Cashout) করবেন?</span>
              </h2>

              <div className="space-y-3 text-xs text-gray-300">
                <div className="p-3.5 rounded-xl bg-[#07111e] border border-[#152c47] flex items-start gap-3">
                  <FaCheckCircle className="text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white block">১. ওয়ালেট কার্ড যুক্ত করুন:</strong>
                    প্রথমে Member Center বা My Cards থেকে আপনার নিজের বিকাশ বা নগদ পার্সোনাল নম্বরটি যুক্ত করুন এবং একটি উইথড্র পাসওয়ার্ড সেট করুন।
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#07111e] border border-[#152c47] flex items-start gap-3">
                  <FaCheckCircle className="text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white block">২. 1x Turnover মিটার চেক করুন:</strong>
                    Withdraw পেজে আপনার লাইভ 1x Turnover প্রগ্রেস বার ১০০% (Remaining: ৳ 0.00) দেখালে ওয়ালেট সিলেক্ট করে টাকার পরিমাণ ও পাসওয়ার্ড দিয়ে সাবমিট করুন।
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <Link
                  href="/withdraw"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3888e9] hover:bg-[#2873d1] text-white font-black text-xs transition-all"
                >
                  <span>উইথড্র পেজে যান →</span>
                </Link>
              </div>
            </div>
          )}

          {activeSection === "referral" && (
            <div className="rounded-2xl p-5 bg-[#0a1626] border border-[#162e4a] space-y-4">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <FaCoins className="text-yellow-400" />
                <span>বন্ধুকে ইনভাইট করে আনলিমিটেড আয়ের নিয়ম</span>
              </h2>

              <p className="text-xs text-gray-300 leading-relaxed">
                আপনার ব্যক্তিগত রেফারেল লিংক বন্ধুদের সাথে শেয়ার করুন। বন্ধু একাউন্ট খুলে প্রথমবার ডিপোজিট করলেই সে একজন{" "}
                <strong className="text-emerald-400">Valid Referral</strong> হিসেবে গণ্য হবে এবং আপনি মাইলস্টোন ক্যাশ রিওয়ার্ড (৳ ১০০ থেকে ৳ ৬,৫০০+) মাত্র{" "}
                <strong className="text-yellow-400">1x Turnover</strong>-এ ক্লেইম করতে পারবেন!
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/invite-friends"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-xs transition-all"
                >
                  রেফারেল লিংক কপি করুন →
                </Link>
                <Link
                  href="/affiliate"
                  className="px-5 py-2.5 rounded-xl bg-[#112642] border border-[#224778] text-white font-black text-xs transition-all"
                >
                  অ্যাফিলিয়েট প্রোগ্রাম দেখুন →
                </Link>
              </div>
            </div>
          )}
        </main>

        <Footer showPaymentMethods={false} />
      </TabLayout>
    </SideNavLayout>
  );
};

export default ManualPage;
