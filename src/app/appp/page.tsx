"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import SideNavLayout from "@/components/SideNavLayout";
import TabLayout from "@/components/TabLayout";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import {
  FaAndroid,
  FaApple,
  FaBolt,
  FaCheckCircle,
  FaDownload,
  FaGift,
  FaLock,
  FaMobileAlt,
  FaQrcode,
  FaShieldAlt,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import toast from "react-hot-toast";

/**
 * RK444 Official Mobile App & Web-App Download Center (/appp)
 * Supports native PWA install prompt when available, QR code scanning for mobile,
 * and step-by-step Android & iOS installation guides.
 */
const AppDownloadPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"android" | "ios">("android");
  const [originUrl, setOriginUrl] = useState("https://rk444.site");
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOriginUrl(window.location.origin);
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true);
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult?.outcome === "accepted") {
        toast.success("RK444 App installation started!");
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }

    toast.success(
      activeTab === "android"
        ? "ব্রাউজারের মেনু (⋮) থেকে 'Add to Home Screen' বা 'Install App' সিলেক্ট করুন!"
        : "Safari-এর Share বাটন চাপুন এবং 'Add to Home Screen' সিলেক্ট করুন!"
    );
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    originUrl
  )}&bgcolor=0a1626&color=23ffc8`;

  const features = [
    {
      icon: <FaBolt className="text-yellow-400 text-lg" />,
      title: "২ গুণ দ্রুত গেম লোডিং",
      desc: "স্লট, ক্র্যাশ (Aviator) এবং লাইভ ক্যাসিনো গেম কোনোরকম ল্যাগ ছাড়াই সুপার-ফাস্ট লোড হয়।",
    },
    {
      icon: <FaShieldAlt className="text-emerald-400 text-lg" />,
      title: "ওয়ান-ট্যাপ বিকাশ ও নগদ ক্যাশিয়ার",
      desc: "অ্যাপ থেকে সরাসরি বিকাশ, নগদ ও রকেটের মাধ্যমে দ্রুত ডিপোজিট ও ২৪/৭ উইথড্র সুবিধা।",
    },
    {
      icon: <FaGift className="text-pink-400 text-lg" />,
      title: "1x টার্নওভার বোনাস অ্যালার্ট",
      desc: "ডেইলি লগইন বোনাস, ফ্রি স্পিন এবং মিশন রিওয়ার্ড সবার আগে নোটিফিকেশনে পান।",
    },
    {
      icon: <FaLock className="text-[#3888e9] text-lg" />,
      title: "অ্যাডভান্সড বায়োমেট্রিক সিকিউরিটি",
      desc: "অটোমেটিক সেশন প্রটেকশন এবং ২৫৬-বিট এনক্রিপ্টেড ওয়ালেট সুরক্ষা।",
    },
  ];

  return (
    <SideNavLayout>
      <TabLayout>
        <SiteHeader title="Download RK444 App" fallbackUrl="/" />

        <main className="min-h-screen bg-[#070e17] text-white px-3 sm:px-5 py-5 max-w-4xl mx-auto space-y-6 pb-28 md:pb-14">
          {/* Hero Banner */}
          <div className="relative rounded-3xl p-5 sm:p-8 bg-gradient-to-br from-[#0d1f38] via-[#0a1626] to-[#07111e] border border-[#1c3b63] shadow-2xl overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#3888e9]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-4 flex-1 text-center md:text-left">
                {/* App Icon + Badge */}
                <div className="flex items-center justify-center md:justify-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icon.png"
                    alt="RK444 App Icon"
                    className="w-14 h-14 rounded-2xl border-2 border-yellow-500/60 shadow-xl shadow-yellow-500/20 object-cover"
                  />
                  <div className="text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                      <HiSparkles className="animate-pulse" />
                      <span>OFFICIAL RK444 APP v1.0.5</span>
                    </div>
                    <div className="text-xs text-gray-300 font-bold mt-0.5">Android APK & PWA · 100% Secure</div>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  যেকোনো সময়, যেকোনো স্থানে খেলুন{" "}
                  <span className="text-yellow-400">RK444 অফিশিয়াল অ্যাপে</span>
                </h1>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl">
                  অ্যান্ড্রয়েড ডিভাইসের জন্য অফিশিয়াল রিলিজ APK। দ্রুততর গেমপ্লে, মাত্র 1x টার্নওভার বোনাস, ২৪ ঘণ্টা পর পর ফ্রি লাকি হুইল স্পিন এবং তাৎক্ষণিক বিকাশ/নগদ ডিপোজিট-উইথড্র সুবিধা।
                </p>

                {/* Primary Install CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 pt-2">
                  <a
                    href="/download/rk444.apk"
                    download="rk444.apk"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <FaAndroid className="text-xl" />
                    <span>Download Android APK</span>
                    <FaDownload className="text-xs opacity-90" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("ios");
                      handleInstallApp();
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#11243d] hover:bg-[#183356] border border-[#244875] text-white font-black text-sm flex items-center justify-center gap-2.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <FaApple className="text-lg text-gray-200" />
                    <span>Install for iOS (iPhone)</span>
                  </button>
                </div>
              </div>

              {/* QR Code Card for Desktop/Quick Scan */}
              <div className="p-4 rounded-2xl bg-[#07111e] border border-[#1c3b63] flex flex-col items-center text-center space-y-2.5 shrink-0 shadow-inner">
                <div className="p-2.5 rounded-xl bg-[#0a1626] border border-[#23ffc8]/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrImageUrl}
                    alt="Scan to Open RK444 Mobile App"
                    className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#23ffc8]">
                  <FaQrcode />
                  <span>স্ক্যান করে মোবাইলে খুলুন</span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">
                  Android & iOS ক্যামেরা সাপোর্ট
                </span>
              </div>
            </div>
          </div>

          {/* 4 App Advantage Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {features.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#0a1626] border border-[#162e4a] flex items-start gap-3.5 shadow-md"
              >
                <div className="w-11 h-11 rounded-xl bg-[#07111e] border border-[#1c385c] flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-white">{item.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Step-by-Step Installation Guide */}
          <div className="rounded-2xl p-5 bg-[#0a1626] border border-[#162e4a] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#162e4a]">
              <div className="flex items-center gap-2">
                <FaMobileAlt className="text-[#3888e9] text-lg" />
                <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  ১ মিনিটে ইনস্টল করার নিয়ম (Step-by-Step Guide)
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("android")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "android"
                      ? "bg-emerald-500 text-white shadow-md"
                      : "bg-[#07111e] text-gray-400 border border-[#162e4a]"
                  }`}
                >
                  <FaAndroid /> Android
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("ios")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "ios"
                      ? "bg-[#3888e9] text-white shadow-md"
                      : "bg-[#07111e] text-gray-400 border border-[#162e4a]"
                  }`}
                >
                  <FaApple /> iOS / iPhone
                </button>
              </div>
            </div>

            {activeTab === "android" ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-[#07111e] border border-[#152c47] space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[10px]">
                    STEP 1
                  </span>
                  <h4 className="font-black text-white text-sm">
                    Chrome ব্রাউজারে ওপেন করুন
                  </h4>
                  <p className="text-gray-400 leading-relaxed">
                    আপনার অ্যান্ড্রয়েড ফোনের Chrome ব্রাউজার থেকে সাইটটি ওপেন করে উপরের{" "}
                    <strong className="text-white">&quot;Install for Android&quot;</strong> বাটনে ট্যাপ করুন।
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#07111e] border border-[#152c47] space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[10px]">
                    STEP 2
                  </span>
                  <h4 className="font-black text-white text-sm">
                    Add to Home Screen / Install
                  </h4>
                  <p className="text-gray-400 leading-relaxed">
                    পপ-আপে <strong className="text-white">&quot;Install&quot;</strong> অথবা ব্রাউজারের ডান পাশের{" "}
                    <strong className="text-white">⋮ (Three Dots)</strong> মেনু থেকে{" "}
                    <strong className="text-white">&quot;Install App&quot;</strong> সিলেক্ট করুন।
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#07111e] border border-[#152c47] space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[10px]">
                    STEP 3
                  </span>
                  <h4 className="font-black text-white text-sm">
                    হোম স্ক্রিন থেকে লগইন করুন
                  </h4>
                  <p className="text-gray-400 leading-relaxed">
                    আপনার ফোনের হোম স্ক্রিনে <strong className="text-yellow-400">RK444</strong> আইকন যুক্ত হয়ে যাবে। ওয়ান-ট্যাপে ওপেন করে বোনাস ক্লেইম করুন!
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-[#07111e] border border-[#152c47] space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#3888e9]/20 text-[#3888e9] font-black text-[10px]">
                    STEP 1
                  </span>
                  <h4 className="font-black text-white text-sm">
                    Safari ব্রাউজারে ওপেন করুন
                  </h4>
                  <p className="text-gray-400 leading-relaxed">
                    আপনার iPhone বা iPad-এর <strong className="text-white">Safari</strong> ব্রাউজারে RK444 ওপেন করুন এবং নিচে মাঝখানের{" "}
                    <strong className="text-white">Share</strong> আইকনে ট্যাপ করুন।
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#07111e] border border-[#152c47] space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#3888e9]/20 text-[#3888e9] font-black text-[10px]">
                    STEP 2
                  </span>
                  <h4 className="font-black text-white text-sm">
                    Add to Home Screen সিলেক্ট করুন
                  </h4>
                  <p className="text-gray-400 leading-relaxed">
                    মেনুটি একটু নিচে স্ক্রল করে{" "}
                    <strong className="text-white">&quot;Add to Home Screen&quot;</strong> অপশনে ট্যাপ করে উপরের ডান কোণায়{" "}
                    <strong className="text-white">&quot;Add&quot;</strong> চাপুন।
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#07111e] border border-[#152c47] space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#3888e9]/20 text-[#3888e9] font-black text-[10px]">
                    STEP 3
                  </span>
                  <h4 className="font-black text-white text-sm">
                    ফুল-স্ক্রিন অ্যাপ উপভোগ করুন
                  </h4>
                  <p className="text-gray-400 leading-relaxed">
                    আপনার iPhone হোম স্ক্রিন থেকে সরাসরি ফুল-স্ক্রিন মোডে সব গেম এবং লাইভ ক্যাসিনো খেলুন।
                  </p>
                </div>
              </div>
            )}

            {/* Quick Bonus Link */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-[#0e223d] to-[#081526] border border-[#1e3f69]">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-gray-200">
                <FaCheckCircle className="text-emerald-400 shrink-0 text-base" />
                <span>
                  অ্যাপ ব্যবহারকারীদের জন্য ডেইলি চেক-ইন এবং মিশন রিওয়ার্ডে মাত্র{" "}
                  <strong className="text-yellow-400">1x Turnover</strong>!
                </span>
              </div>
              <Link
                href="/mission"
                className="px-4 py-2 rounded-xl bg-[#3888e9] hover:bg-[#2873d1] text-white font-black text-xs whitespace-nowrap transition-all"
              >
                মিশন সেন্টার দেখুন →
              </Link>
            </div>
          </div>
        </main>

        <Footer showPaymentMethods={false} />
      </TabLayout>
    </SideNavLayout>
  );
};

export default AppDownloadPage;
