"use client";

import React, { useEffect, useState } from "react";
import SideNavLayout from "@/components/SideNavLayout";
import TabLayout from "@/components/TabLayout";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import {
  FaCheckCircle,
  FaClock,
  FaCoins,
  FaGlobeAsia,
  FaChartBar,
} from "react-icons/fa";
import toast from "react-hot-toast";

/**
 * RK444 Language, Currency & Regional Settings Page (/languages)
 * Allows players to configure their preferred display language, odds format,
 * and regional settings with instant persistence.
 */
const LanguagesPage = () => {
  const [selectedLang, setSelectedLang] = useState<"bn" | "en">("bn");
  const [oddsFormat, setOddsFormat] = useState<"decimal" | "hk" | "malay">("decimal");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("rk444_lang_pref");
      if (savedLang === "en" || savedLang === "bn") {
        setSelectedLang(savedLang);
      }
      const savedOdds = localStorage.getItem("rk444_odds_format");
      if (savedOdds === "decimal" || savedOdds === "hk" || savedOdds === "malay") {
        setOddsFormat(savedOdds);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleSelectLanguage = (lang: "bn" | "en") => {
    setSelectedLang(lang);
    try {
      localStorage.setItem("rk444_lang_pref", lang);
    } catch {
      // ignore
    }
    toast.success(
      lang === "bn"
        ? "ভাষা পরিবর্তন করে বাংলা (Bengali) সেট করা হয়েছে!"
        : "Language updated to English (International)!"
    );
  };

  const handleSelectOdds = (format: "decimal" | "hk" | "malay") => {
    setOddsFormat(format);
    try {
      localStorage.setItem("rk444_odds_format", format);
    } catch {
      // ignore
    }
    toast.success("Sportsbook odds display format saved!");
  };

  const languages = [
    {
      code: "bn" as const,
      flag: "🇧🇩",
      name: "বাংলা (Bengali)",
      nativeDesc: "বাংলাদেশ রিজিয়ন • বিকাশ/নগদ ও বাংলা গাইডসহ",
      badge: "Recommended",
    },
    {
      code: "en" as const,
      flag: "🌐",
      name: "English (International)",
      nativeDesc: "Global English interface & standard gaming terminology",
      badge: "Supported",
    },
  ];

  const oddsFormats = [
    {
      id: "decimal" as const,
      title: "Decimal Odds (1.95)",
      desc: "সবচেয়ে জনপ্রিয় ফরম্যাট — মোট পেআউট সরাসরি গুণিতক হিসেবে দেখায় (যেমন: ৳ ১০০ × ১.৯৫ = ৳ ১৯৫)।",
    },
    {
      id: "hk" as const,
      title: "Hong Kong Odds (0.95)",
      desc: "শুধুমাত্র নিট লাভ (Net Profit) হিসাব দেখায়, মূল স্টেক আলাদা থাকে।",
    },
    {
      id: "malay" as const,
      title: "Malay Odds (0.95 / -0.95)",
      desc: "এশিয়ান হ্যান্ডিক্যাপ ও লাইভ স্পোর্টস বেটিংয়ের জন্য ব্যবহৃত ফরম্যাট।",
    },
  ];

  return (
    <SideNavLayout>
      <TabLayout>
        <SiteHeader title="Language & Region" fallbackUrl="/" />

        <main className="min-h-screen bg-[#070e17] text-white px-3 sm:px-5 py-5 max-w-3xl mx-auto space-y-6 pb-28 md:pb-14">
          {/* Language Selection Section */}
          <section className="rounded-2xl p-5 bg-[#0a1626] border border-[#162e4a] shadow-lg space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#162e4a]">
              <FaGlobeAsia className="text-[#3888e9] text-lg" />
              <div>
                <h1 className="text-base font-black text-white">
                  Select Display Language (ভাষা নির্বাচন করুন)
                </h1>
                <p className="text-xs text-gray-400">
                  আপনার পছন্দের ভাষা নির্বাচন করুন। যেকোনো সময় এটি পরিবর্তন করা যাবে।
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {languages.map((lang) => {
                const isActive = selectedLang === lang.code;
                return (
                  <button
                    type="button"
                    key={lang.code}
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-br from-[#102949] to-[#09182b] border-emerald-500/70 shadow-lg shadow-emerald-500/10"
                        : "bg-[#07111e] border-[#162e4a] hover:border-[#3888e9]/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white">
                            {lang.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#132b47] text-[10px] font-bold text-[#3888e9]">
                            {lang.badge}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {lang.nativeDesc}
                        </p>
                      </div>
                    </div>

                    {isActive && (
                      <FaCheckCircle className="text-emerald-400 text-lg shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Sportsbook Odds Format Section */}
          <section className="rounded-2xl p-5 bg-[#0a1626] border border-[#162e4a] shadow-lg space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#162e4a]">
              <FaChartBar className="text-yellow-400 text-lg" />
              <div>
                <h2 className="text-base font-black text-white">
                  Sportsbook Odds Format (অডস ফরম্যাট)
                </h2>
                <p className="text-xs text-gray-400">
                  স্পোর্টস বেটিং পেজে ম্যাচের অডস কীভাবে দেখতে চান তা সিলেক্ট করুন।
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {oddsFormats.map((item) => {
                const isSelected = oddsFormat === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleSelectOdds(item.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-[#0e233d] border-[#3888e9] text-white"
                        : "bg-[#07111e] border-[#152c47] text-gray-300 hover:border-[#254973]"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs sm:text-sm font-black text-white">
                        {item.title}
                      </div>
                      <p className="text-[11px] text-gray-400">{item.desc}</p>
                    </div>
                    {isSelected && (
                      <FaCheckCircle className="text-[#3888e9] text-base shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Regional & Currency Info */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#0a1626] border border-[#162e4a] flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <FaCoins />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 block">
                  Account Currency
                </span>
                <span className="text-sm font-black text-white">
                  BDT (৳) — বাংলাদেশী টাকা
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0a1626] border border-[#162e4a] flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#3888e9]/15 border border-[#3888e9]/30 flex items-center justify-center text-[#3888e9] shrink-0">
                <FaClock />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 block">
                  Server Time Zone
                </span>
                <span className="text-sm font-black text-white">
                  GMT+06:00 (Dhaka Standard)
                </span>
              </div>
            </div>
          </section>
        </main>

        <Footer showPaymentMethods={false} />
      </TabLayout>
    </SideNavLayout>
  );
};

export default LanguagesPage;
