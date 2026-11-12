"use client";

import React, { useState, useEffect, useCallback } from "react";
import SideNavLayout from "@/components/SideNavLayout";
import TabLayout from "@/components/TabLayout";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import LiveChatTrigger from "@/components/LiveChatTrigger";
import { MdOutlineSupportAgent, MdAccountBalanceWallet, MdCheckCircle } from "react-icons/md";
import {
  FaTrophy,
  FaUsers,
  FaLink,
  FaMoneyBillWave,
  FaQrcode,
  FaCopy,
  FaCheck,
  FaShareAlt,
  FaTelegram,
  FaWhatsapp,
  FaFacebook,
  FaArrowRight,
  FaShieldAlt,
  FaChartLine,
  FaSearch,
  FaSpinner,
  FaGift,
} from "react-icons/fa";
import { HiSparkles, HiArrowTrendingUp } from "react-icons/hi2";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface AffiliateData {
  authenticated?: boolean;
  isAffiliate: boolean;
  affiliate?: {
    id: string;
    affiliateCode: string;
    isActive: boolean;
    tier: string;
    totalEarnings: number;
    pendingEarnings: number;
    totalReferrals: number;
    activeReferrals: number;
    commissionRate: number;
    createdAt: string;
  };
  stats?: {
    totalEarnings: number;
    pendingEarnings: number;
    availableBalance: number;
    totalReferrals: number;
    activeReferrals: number;
    commissionRate: number;
    totalClicks: number;
    conversionRate: number;
  };
  message?: string;
}

interface AnalyticsData {
  overview: {
    totalClicks: number;
    totalReferrals: number;
    activeReferrals: number;
    conversionRate: number;
    totalEarnings: number;
    pendingEarnings: number;
    thisMonthEarnings: number;
  };
  chartData: {
    clicks: Array<{ date: string; clicks: number }>;
    earnings: Array<{ date: string; amount: number }>;
  };
  topReferrals: Array<{
    id: string;
    name: string;
    phone: string;
    totalDeposits: number;
    totalCommissions: number;
    joinDate: string;
    status: string;
  }>;
}

interface ReferralItem {
  id: string;
  user: {
    id: string;
    name: string;
    phone: string;
    createdAt: string;
  };
  status: string;
  totalDeposits: number;
  totalCommissions: number;
  commissionRate: number;
  joinedAt: string;
}

interface CustomLink {
  id: string;
  name: string;
  url: string;
  targetPage?: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
  createdAt: string;
}

interface PayoutItem {
  id: string;
  amount: number;
  paymentMethod: string;
  paymentDetails: any;
  status: string;
  requestedAt: string;
  processedAt: string | null;
  transactionId: string | null;
  notes?: string;
}

export default function AffiliatePage() {
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Referrals tab state
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [referralSearch, setReferralSearch] = useState("");
  const [referralStatus, setReferralStatus] = useState("ALL");

  // Links tab state
  const [linksData, setLinksData] = useState<{
    affiliateCode: string;
    baseReferralLink: string;
    customLinks: CustomLink[];
  } | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [selectedLanding, setSelectedLanding] = useState("/register");
  const [generatingLink, setGeneratingLink] = useState(false);
  const [generatedLinkInfo, setGeneratedLinkInfo] = useState<{
    url: string;
    qrCode: string;
  } | null>(null);

  // Payouts tab state
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [payoutsSummary, setPayoutsSummary] = useState<{
    totalRequested: number;
    totalPaid: number;
    totalPending: number;
    availableBalance: number;
  } | null>(null);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BKASH");
  const [accountPhone, setAccountPhone] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [payoutSuccessMessage, setPayoutSuccessMessage] = useState("");
  const [payoutErrorMessage, setPayoutErrorMessage] = useState("");

  // QR Modal
  const [activeQrModal, setActiveQrModal] = useState<string | null>(null);

  // Fetch core affiliate status & analytics
  const fetchAffiliateData = useCallback(async () => {
    try {
      const [resAff, resAna] = await Promise.all([
        fetch("/api/affiliate", { cache: "no-store" }),
        fetch("/api/affiliate/analytics", { cache: "no-store" }),
      ]);

      if (resAff.ok) {
        const affJson = await resAff.json();
        setAffiliateData(affJson);
      }

      if (resAna.ok) {
        const anaJson = await resAna.json();
        if (anaJson.success) {
          setAnalyticsData(anaJson.data);
        }
      }
    } catch (err) {
      console.error("Error loading affiliate profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAffiliateData();
  }, [fetchAffiliateData]);

  // Fetch referrals when referrals tab is active
  const fetchReferrals = useCallback(async () => {
    setReferralsLoading(true);
    try {
      const params = new URLSearchParams();
      if (referralStatus !== "ALL") params.set("status", referralStatus);
      if (referralSearch.trim()) params.set("search", referralSearch.trim());

      const res = await fetch(`/api/affiliate/referrals?${params.toString()}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setReferrals(json.data.referrals || []);
        }
      }
    } catch (e) {
      console.error("Error fetching referrals:", e);
    } finally {
      setReferralsLoading(false);
    }
  }, [referralStatus, referralSearch]);

  useEffect(() => {
    if (activeTab === "referrals" && affiliateData?.isAffiliate) {
      fetchReferrals();
    }
  }, [activeTab, affiliateData?.isAffiliate, fetchReferrals]);

  // Fetch links when links tab is active
  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/affiliate/links", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setLinksData(json.data);
        }
      }
    } catch (e) {
      console.error("Error fetching affiliate links:", e);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "links" && affiliateData?.isAffiliate) {
      fetchLinks();
    }
  }, [activeTab, affiliateData?.isAffiliate, fetchLinks]);

  // Fetch payouts when payouts tab is active
  const fetchPayouts = useCallback(async () => {
    setPayoutsLoading(true);
    try {
      const res = await fetch("/api/affiliate/payouts", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setPayouts(json.data.payouts || []);
          setPayoutsSummary(json.data.summary || null);
        }
      }
    } catch (e) {
      console.error("Error fetching affiliate payouts:", e);
    } finally {
      setPayoutsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "payouts" && affiliateData?.isAffiliate) {
      fetchPayouts();
    }
  }, [activeTab, affiliateData?.isAffiliate, fetchPayouts]);

  // Register as affiliate
  const handleRegister = async () => {
    setRegistering(true);
    try {
      const res = await fetch("/api/affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchAffiliateData();
      } else {
        alert(data.error || data.message || "নিবন্ধন সম্পন্ন করা যায়নি। দয়া করে সাইন ইন করুন।");
      }
    } catch (e) {
      console.error(e);
      alert("নিবন্ধন সম্পন্ন করার সময় ত্রুটি হয়েছে।");
    } finally {
      setRegistering(false);
    }
  };

  // Generate Custom Link
  const handleCreateCustomLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim()) return;

    setGeneratingLink(true);
    try {
      const res = await fetch("/api/affiliate/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign: campaignName.trim().toLowerCase().replace(/\s+/g, "_"),
          landingPage: selectedLanding,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setGeneratedLinkInfo({
          url: json.data.url,
          qrCode: json.data.qrCode,
        });
        await fetchLinks();
      } else {
        alert(json.error || "লিংক তৈরি করতে ব্যর্থ হয়েছে");
      }
    } catch (err) {
      console.error(err);
      alert("লিংক তৈরি করার সময় ত্রুটি হয়েছে");
    } finally {
      setGeneratingLink(false);
    }
  };

  // Request Payout
  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutErrorMessage("");
    setPayoutSuccessMessage("");

    const numAmount = parseFloat(payoutAmount);
    if (isNaN(numAmount) || numAmount < 500) {
      setPayoutErrorMessage("নূন্যতম উত্তোলনের পরিমাণ ৫০০ ৳");
      return;
    }

    if (!accountPhone && !accountHolder) {
      setPayoutErrorMessage("অনুগ্রহ করে আপনার অ্যাকাউন্ট নম্বর অথবা মোবাইল নম্বর লিখুন");
      return;
    }

    setSubmittingPayout(true);
    try {
      const res = await fetch("/api/affiliate/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          paymentMethod,
          paymentDetails: {
            phoneNumber: accountPhone,
            accountNumber: accountPhone,
            accountName: accountHolder,
            bankName: bankName,
          },
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setPayoutSuccessMessage(json.message || "উত্তোলন অনুরোধ সফলভাবে জমা হয়েছে!");
        setPayoutAmount("");
        setAccountPhone("");
        setBankName("");
        setAccountHolder("");
        await fetchPayouts();
        await fetchAffiliateData();
      } else {
        setPayoutErrorMessage(json.error || "উত্তোলন অনুরোধ ব্যর্থ হয়েছে");
      }
    } catch (err) {
      console.error(err);
      setPayoutErrorMessage("সার্ভার সংযোগে ত্রুটি হয়েছে");
    } finally {
      setSubmittingPayout(false);
    }
  };

  const copyText = (text: string, type: "code" | "link") => {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getTierBadge = (tier: string = "BRONZE") => {
    switch (tier.toUpperCase()) {
      case "DIAMOND":
        return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-400";
      case "PLATINUM":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400";
      case "GOLD":
        return "bg-gradient-to-r from-amber-400 to-yellow-600 text-black font-black border-amber-300";
      case "SILVER":
        return "bg-gradient-to-r from-slate-400 to-zinc-500 text-white border-slate-300";
      default:
        return "bg-gradient-to-r from-amber-700 to-orange-700 text-white border-amber-600";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
      case "ACTIVE":
      case "VERIFIED":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "PROCESSING":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    }
  };

  const affiliate = affiliateData?.affiliate;
  const stats = affiliateData?.stats;
  const overview = analyticsData?.overview;

  const totalEarnings = stats?.totalEarnings ?? affiliate?.totalEarnings ?? overview?.totalEarnings ?? 0;
  const pendingEarnings = stats?.pendingEarnings ?? affiliate?.pendingEarnings ?? overview?.pendingEarnings ?? 0;
  const availableBalance = stats?.availableBalance ?? Math.max(0, totalEarnings - pendingEarnings);
  const totalReferrals = stats?.totalReferrals ?? affiliate?.totalReferrals ?? overview?.totalReferrals ?? 0;
  const activeReferrals = stats?.activeReferrals ?? affiliate?.activeReferrals ?? overview?.activeReferrals ?? 0;
  const conversionRate = stats?.conversionRate ?? overview?.conversionRate ?? 0;
  const totalClicks = stats?.totalClicks ?? overview?.totalClicks ?? 0;
  const commissionRate = stats?.commissionRate ?? (affiliate?.commissionRate ? affiliate.commissionRate * 100 : 5);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://rk444.com";
  const refCode = affiliate?.affiliateCode || "AFFILIATE";
  const fullRefLink = `${baseUrl}/register?ref=${refCode}`;

  return (
    <SideNavLayout>
      <TabLayout>
        <SiteHeader title="Affiliate Partner Program" fallbackUrl="/">
          <LiveChatTrigger
            fallbackHref="/support"
            title="VIP Host & Support"
            ariaLabel="VIP Host & Support"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#14263d] hover:bg-[#1e395b] active:scale-95 text-[#3888e9] hover:text-white border border-[#234267] transition-all cursor-pointer relative"
          >
            <MdOutlineSupportAgent className="text-xl" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-[#0a1626]" />
          </LiveChatTrigger>
        </SiteHeader>

        <main className="min-h-screen bg-[#070e17] text-white px-2.5 sm:px-4 py-3 sm:py-6 max-w-5xl mx-auto space-y-5 pb-28 md:pb-14">
          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-44 rounded-2xl bg-[#0a1626] border border-[#162e4a]" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-[#0a1626] border border-[#162e4a]" />
                ))}
              </div>
              <div className="h-64 rounded-2xl bg-[#0a1626] border border-[#162e4a]" />
            </div>
          )}

          {/* GUEST / UNREGISTERED VIEW */}
          {!loading && !affiliateData?.isAffiliate && (
            <div className="space-y-6">
              {/* Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1c30] via-[#0d223c] to-[#071322] border border-[#1d3d63] p-6 sm:p-10 shadow-2xl">
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#3888e9]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-4 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b3b61]/80 border border-[#2b588d] text-xs font-bold text-[#4fa4ff]">
                    <HiSparkles className="text-sm text-amber-400" />
                    <span>অফিসিয়াল অ্যাফিলিয়েট পার্টনার প্রোগ্রাম</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                    প্লেয়ার রেফার করুন, আয় করুন আজীবন{" "}
                    <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                      ২০% পর্যন্ত কমিশন!
                    </span>
                  </h1>
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                    RK444-এর প্রিমিয়ার পার্টনার নেটওয়ার্কে যোগদান করুন। সরাসরি BDT কারেন্সিতে বিকাশ, নগদ, রকেট ও ব্যাংক একাউন্টে তাৎক্ষণিক উইথড্রয়াল সুবিধা।
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleRegister}
                      disabled={registering}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#3888e9] to-[#2065ba] hover:from-[#4394f7] hover:to-[#2b72ce] text-white font-black text-sm sm:text-base shadow-lg shadow-[#3888e9]/25 hover:shadow-[#3888e9]/40 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {registering ? (
                        <>
                          <FaSpinner className="animate-spin text-base" />
                          <span>নিবন্ধন হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <span>১-ক্লিকে অ্যাফিলিয়েট পার্টনার হন</span>
                          <FaArrowRight className="text-xs" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tier Commission System */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <FaTrophy className="text-amber-400 text-lg" />
                    <span>কমিশন টিয়ার স্ট্রাকচার (Tier System)</span>
                  </h2>
                  <span className="text-xs text-gray-400">লাইফটাইম রেভিনিউ শেয়ার</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { tier: "BRONZE", rate: "5%", req: "১ - ৫ মেম্বার", color: "from-amber-700 to-orange-800" },
                    { tier: "SILVER", rate: "8%", req: "৬ - ২০ মেম্বার", color: "from-slate-400 to-zinc-600" },
                    { tier: "GOLD", rate: "12%", req: "২১ - ৫০ মেম্বার", color: "from-amber-400 to-yellow-600" },
                    { tier: "PLATINUM", rate: "15%", req: "৫১ - ১০০ মেম্বার", color: "from-purple-500 to-indigo-600" },
                    { tier: "DIAMOND", rate: "20%", req: "১০০+ মেম্বার", color: "from-blue-500 to-cyan-500" },
                  ].map((t, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-3.5 flex flex-col items-center text-center hover:border-[#3888e9]/50 transition-all shadow-md group"
                    >
                      <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white bg-gradient-to-r ${t.color} mb-2 shadow`}>
                        {t.tier}
                      </div>
                      <span className="text-xl sm:text-2xl font-black text-amber-400 group-hover:scale-105 transition-transform">
                        {t.rate}
                      </span>
                      <span className="text-[11px] text-gray-400 mt-1 font-medium">{t.req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <FaMoneyBillWave className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">তাত্ক্ষণিক বিকাশ ও নগদ পেআউট</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      ন্যূনতম ৫০০ ৳ ব্যালেন্স হলেই বিকাশ, নগদ, রকেট বা ব্যাংকে সরাসরি উইথড্রয়াল করুন।
                    </p>
                  </div>
                </div>

                <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <FaChartLine className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">রিয়েল-টাইম লাইভ ট্র্যাকিং</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      প্রতিটি ক্লিক, ডিপোজিট এবং অর্জিত কমিশন সেকেন্ডের মধ্যে আপনার ড্যাশবোর্ডে আপডেট হয়।
                    </p>
                  </div>
                </div>

                <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <FaShieldAlt className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">ডেডিকেটেড VIP সাপোর্ট</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      ২৪/৭ এক্সক্লুসিভ অ্যাফিলিয়েট ম্যানেজার সহায়তা এবং পার্সোনালাইজড ক্যাম্পেইন গাইড।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REGISTERED AFFILIATE DASHBOARD */}
          {!loading && affiliateData?.isAffiliate && affiliate && (
            <div className="space-y-5">
              {/* Top Partner Identity Bar */}
              <div className="bg-gradient-to-r from-[#0c1c30] via-[#0d223c] to-[#071322] border border-[#1d3d63] rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#14263d] border border-[#234267] flex items-center justify-center text-[#3888e9] shrink-0">
                    <FaTrophy className="text-2xl text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-white">অ্যাফিলিয়েট পার্টনার ড্যাশবোর্ড</h2>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${getTierBadge(affiliate.tier)}`}>
                        {affiliate.tier} TIER ({commissionRate}% কমিশন)
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      সক্রিয় পার্টনার কোড: <span className="font-mono text-emerald-400 font-bold">{affiliate.affiliateCode}</span>
                    </p>
                  </div>
                </div>

                {/* Quick Referral Link & Copy */}
                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex items-center bg-[#070e17] border border-[#1a3654] rounded-xl px-3 py-2 text-xs font-mono text-gray-300 overflow-hidden">
                    <span className="truncate max-w-[200px] sm:max-w-[260px]">{fullRefLink}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyText(fullRefLink, "link")}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#3888e9] hover:bg-[#2873d1] text-white text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      {copiedLink ? <FaCheck className="text-emerald-300" /> : <FaCopy />}
                      <span>{copiedLink ? "কপি হয়েছে!" : "কপি লিংক"}</span>
                    </button>
                    <button
                      onClick={() => setActiveQrModal(fullRefLink)}
                      title="QR Code দেখুন"
                      className="p-2.5 rounded-xl bg-[#14263d] hover:bg-[#1e395b] text-gray-300 hover:text-white border border-[#234267] transition-all cursor-pointer"
                    >
                      <FaQrcode className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Stats Cards (BDT ৳) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {/* Total Earnings */}
                <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-3.5 sm:p-4 shadow-sm hover:border-[#3888e9]/40 transition-all">
                  <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
                    <span>মোট কমিশন আয়</span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <FaMoneyBillWave className="text-sm" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-emerald-400 mt-2">
                    ৳ {totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">আজীবন মোট আয়</span>
                </div>

                {/* Available Balance */}
                <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-3.5 sm:p-4 shadow-sm hover:border-[#3888e9]/40 transition-all">
                  <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
                    <span>উত্তোলনযোগ্য ব্যালেন্স</span>
                    <div className="w-7 h-7 rounded-lg bg-[#3888e9]/10 text-[#3888e9] flex items-center justify-center">
                      <MdAccountBalanceWallet className="text-base" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-amber-400 mt-2">
                    ৳ {availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <button
                    onClick={() => setActiveTab("payouts")}
                    className="text-[10px] text-[#3888e9] hover:underline font-bold mt-0.5 inline-block cursor-pointer"
                  >
                    উত্তোলন করুন →
                  </button>
                </div>

                {/* Total Referrals */}
                <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-3.5 sm:p-4 shadow-sm hover:border-[#3888e9]/40 transition-all">
                  <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
                    <span>রেফারেল মেম্বার</span>
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <FaUsers className="text-sm" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-white mt-2">
                    {totalReferrals} <span className="text-xs text-gray-400 font-normal">জন</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">{activeReferrals} জন সক্রিয় ডিপোজিটর</span>
                </div>

                {/* Conversion Rate */}
                <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-3.5 sm:p-4 shadow-sm hover:border-[#3888e9]/40 transition-all">
                  <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
                    <span>কনভার্সন রেট</span>
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <HiArrowTrendingUp className="text-base" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-purple-400 mt-2">
                    {conversionRate.toFixed(1)}%
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">মোট ক্লিক: {totalClicks}</span>
                </div>
              </div>

              {/* Main Functional Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Dark Luxury Sticky Tab Navigation */}
                <div className="sticky top-14 z-30 bg-[#070e17]/95 backdrop-blur-md pb-3 pt-1">
                  <TabsList className="bg-[#0a1626] border border-[#183454] p-1 rounded-2xl w-full grid grid-cols-4 h-auto">
                    <TabsTrigger
                      value="overview"
                      className="text-xs sm:text-sm font-extrabold py-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 data-[state=active]:bg-[#3888e9] data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-400 hover:text-white"
                    >
                      <HiSparkles className="text-xs sm:text-sm" />
                      <span className="hidden sm:inline">ওভারভিউ</span>
                      <span className="sm:hidden">হোম</span>
                    </TabsTrigger>

                    <TabsTrigger
                      value="referrals"
                      className="text-xs sm:text-sm font-extrabold py-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 data-[state=active]:bg-[#3888e9] data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-400 hover:text-white"
                    >
                      <FaUsers className="text-xs sm:text-sm" />
                      <span>রেফারেল</span>
                    </TabsTrigger>

                    <TabsTrigger
                      value="links"
                      className="text-xs sm:text-sm font-extrabold py-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 data-[state=active]:bg-[#3888e9] data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-400 hover:text-white"
                    >
                      <FaLink className="text-xs sm:text-sm" />
                      <span>লিংক</span>
                    </TabsTrigger>

                    <TabsTrigger
                      value="payouts"
                      className="text-xs sm:text-sm font-extrabold py-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 data-[state=active]:bg-[#3888e9] data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-400 hover:text-white relative"
                    >
                      <FaMoneyBillWave className="text-xs sm:text-sm" />
                      <span>পেআউট</span>
                      {availableBalance >= 500 && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* TAB 1: OVERVIEW */}
                <TabsContent value="overview" className="space-y-4 mt-2">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Performance Summary Card */}
                    <div className="lg:col-span-2 bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-[#162e4a] pb-3">
                        <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                          <FaChartLine className="text-[#3888e9]" />
                          <span>পারফর্মেন্স ওভারভিউ ও উপার্জন বিবরণী</span>
                        </h3>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {commissionRate}% বর্তমান রেট
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-[#0d1d31] rounded-xl border border-[#1a375a]">
                          <span className="text-xs text-gray-400">এই মাসের উপার্জন</span>
                          <p className="text-lg font-black text-emerald-400 mt-1">
                            ৳ {(overview?.thisMonthEarnings ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="p-3 bg-[#0d1d31] rounded-xl border border-[#1a375a]">
                          <span className="text-xs text-gray-400">প্রক্রিয়াধীন উইথড্রয়াল</span>
                          <p className="text-lg font-black text-amber-400 mt-1">
                            ৳ {pendingEarnings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="p-3 bg-[#0d1d31] rounded-xl border border-[#1a375a]">
                          <span className="text-xs text-gray-400">মোট রেফারেল রেজিস্ট্রেশন</span>
                          <p className="text-lg font-black text-white mt-1">{totalReferrals} জন</p>
                        </div>
                        <div className="p-3 bg-[#0d1d31] rounded-xl border border-[#1a375a]">
                          <span className="text-xs text-gray-400">অ্যাফিলিয়েট স্ট্যাটাস</span>
                          <p className="text-lg font-black text-emerald-400 mt-1">ACTIVE</p>
                        </div>
                      </div>

                      {/* Social Share Buttons */}
                      <div className="pt-2">
                        <span className="text-xs font-bold text-gray-300 block mb-2">
                          সোশ্যাল মিডিয়ায় প্রচার করুন:
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          <a
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Join RK444 with my partner code ${refCode} and get bonus! ${fullRefLink}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/30 font-bold text-xs transition-all"
                          >
                            <FaWhatsapp className="text-sm" />
                            <span>হোয়াটসঅ্যাপ</span>
                          </a>

                          <a
                            href={`https://t.me/share/url?url=${encodeURIComponent(fullRefLink)}&text=${encodeURIComponent(`Join RK444 with my partner code ${refCode} and get bonus!`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0088cc]/20 hover:bg-[#0088cc]/30 text-[#0088cc] border border-[#0088cc]/30 font-bold text-xs transition-all"
                          >
                            <FaTelegram className="text-sm" />
                            <span>টেলিগ্রাম</span>
                          </a>

                          <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullRefLink)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-[#1877F2] border border-[#1877F2]/30 font-bold text-xs transition-all"
                          >
                            <FaFacebook className="text-sm" />
                            <span>ফেসবুক</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Top Referrals Card */}
                    <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                      <div className="flex items-center justify-between border-b border-[#162e4a] pb-3">
                        <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                          <FaTrophy className="text-amber-400" />
                          <span>টপ পারফর্মার মেম্বার</span>
                        </h3>
                        <button
                          onClick={() => setActiveTab("referrals")}
                          className="text-xs text-[#3888e9] hover:underline font-bold cursor-pointer"
                        >
                          সব দেখুন →
                        </button>
                      </div>

                      <div className="space-y-2">
                        {analyticsData?.topReferrals && analyticsData.topReferrals.length > 0 ? (
                          analyticsData.topReferrals.slice(0, 5).map((ref) => (
                            <div
                              key={ref.id}
                              className="p-2.5 bg-[#0d1d31] rounded-xl border border-[#1a375a] flex items-center justify-between"
                            >
                              <div>
                                <p className="text-xs font-bold text-white">{ref.name || "User"}</p>
                                <p className="text-[11px] text-gray-400">{ref.phone}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-black text-emerald-400">
                                  + ৳ {ref.totalCommissions.toFixed(2)}
                                </p>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded border ${getStatusBadge(ref.status)}`}>
                                  {ref.status}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-400 text-xs space-y-2">
                            <FaUsers className="text-2xl text-gray-600 mx-auto" />
                            <p>এখনো কোনো রেফারেল মেম্বার নেই</p>
                            <button
                              onClick={() => copyText(fullRefLink, "link")}
                              className="px-3 py-1.5 rounded-lg bg-[#3888e9] text-white font-bold text-xs inline-block cursor-pointer"
                            >
                              লিংক শেয়ার করুন
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* TAB 2: REFERRALS */}
                <TabsContent value="referrals" className="space-y-4 mt-2">
                  <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                    {/* Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="relative flex-1">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                        <input
                          type="text"
                          value={referralSearch}
                          onChange={(e) => setReferralSearch(e.target.value)}
                          placeholder="নাম বা মোবাইল নম্বর দিয়ে সার্চ করুন..."
                          className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#070e17] border border-[#1b3552] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3888e9]"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        {["ALL", "QUALIFIED", "PENDING"].map((st) => (
                          <button
                            key={st}
                            onClick={() => setReferralStatus(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              referralStatus === st
                                ? "bg-[#3888e9] text-white"
                                : "bg-[#0d1d31] text-gray-400 hover:text-white border border-[#1a375a]"
                            }`}
                          >
                            {st === "ALL" ? "সকল" : st === "QUALIFIED" ? "কোয়ালিফাইড" : "পেন্ডিং"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Referrals Table / List */}
                    {referralsLoading ? (
                      <div className="py-12 text-center text-gray-400 space-y-2">
                        <FaSpinner className="animate-spin text-2xl text-[#3888e9] mx-auto" />
                        <p className="text-xs">রেফারেল তালিকা লোড হচ্ছে...</p>
                      </div>
                    ) : referrals.length > 0 ? (
                      <div className="divide-y divide-[#162e4a] overflow-hidden rounded-xl border border-[#162e4a]">
                        <div className="bg-[#0d1d31] px-4 py-2.5 text-[11px] font-bold text-gray-400 grid grid-cols-4 sm:grid-cols-5">
                          <span>ব্যবহারকারী</span>
                          <span className="hidden sm:inline">যোগদানের তারিখ</span>
                          <span className="text-center sm:text-left">স্ট্যাটাস</span>
                          <span className="text-right">মোট ডিপোজিট</span>
                          <span className="text-right">অর্জিত কমিশন</span>
                        </div>
                        {referrals.map((item) => (
                          <div
                            key={item.id}
                            className="px-4 py-3 bg-[#0a1626] hover:bg-[#0c1a2d] transition-colors grid grid-cols-4 sm:grid-cols-5 items-center text-xs"
                          >
                            <div>
                              <p className="font-bold text-white truncate">{item.user.name || "User"}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{item.user.phone}</p>
                            </div>
                            <span className="text-[11px] text-gray-400 hidden sm:inline">
                              {new Date(item.joinedAt).toLocaleDateString("en-GB")}
                            </span>
                            <div className="text-center sm:text-left">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(item.status)}`}>
                                {item.status}
                              </span>
                            </div>
                            <span className="text-right font-medium text-gray-300">
                              ৳ {item.totalDeposits.toLocaleString("en-US")}
                            </span>
                            <span className="text-right font-black text-emerald-400">
                              ৳ {item.totalCommissions.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-gray-400 space-y-3">
                        <FaUsers className="text-3xl text-gray-600 mx-auto" />
                        <p className="text-sm font-medium">কোনো রেফারেল পাওয়া যায়নি</p>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto">
                          আপনার রেফারেল লিংক সোশ্যাল মিডিয়া ও বন্ধুদের সাথে শেয়ার করে আজই কমিশন অর্জন শুরু করুন।
                        </p>
                        <button
                          onClick={() => copyText(fullRefLink, "link")}
                          className="px-4 py-2 rounded-xl bg-[#3888e9] hover:bg-[#2c75d4] text-white text-xs font-bold transition-all cursor-pointer shadow"
                        >
                          রেফারেল লিংক কপি করুন
                        </button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* TAB 3: CAMPAIGN LINKS */}
                <TabsContent value="links" className="space-y-4 mt-2">
                  {/* Custom Link Builder */}
                  <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                    <div className="border-b border-[#162e4a] pb-3">
                      <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                        <FaLink className="text-[#3888e9]" />
                        <span>কাস্টম ক্যাম্পেইন লিংক জেনারেটর</span>
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        ফেসবুক, ইউটিউব বা টেলিগ্রাম চ্যানেলের জন্য কাস্টম ট্র্যাকিং লিংক ও কিউআর কোড তৈরি করুন।
                      </p>
                    </div>

                    <form onSubmit={handleCreateCustomLink} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-gray-300 block mb-1">
                            ল্যান্ডিং পেজ নির্বাচন করুন
                          </label>
                          <select
                            value={selectedLanding}
                            onChange={(e) => setSelectedLanding(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#070e17] border border-[#1b3552] text-xs text-white focus:outline-none focus:border-[#3888e9]"
                          >
                            <option value="/register">রেজিস্ট্রেশন পেজ (/register)</option>
                            <option value="/">ক্যাসিনো হোমপেজ (/)</option>
                            <option value="/sports">স্পোর্টস বেটিং (/sports)</option>
                            <option value="/casino">লাইভ ক্যাসিনো (/casino)</option>
                            <option value="/promotion">প্রমোশন অফার (/promotion)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-300 block mb-1">
                            ক্যাম্পেইন নাম (যেমন: fb_ad, tg_vip, yt_promo)
                          </label>
                          <input
                            type="text"
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                            placeholder="যেমন: facebook_ad_2024"
                            className="w-full px-3 py-2 rounded-xl bg-[#070e17] border border-[#1b3552] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3888e9]"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={generatingLink || !campaignName.trim()}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3888e9] to-[#2065ba] hover:from-[#4394f7] hover:to-[#2b72ce] text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {generatingLink ? <FaSpinner className="animate-spin text-xs" /> : <FaLink />}
                        <span>ক্যাম্পেইন লিংক তৈরি করুন</span>
                      </button>
                    </form>

                    {/* Resulting Generated Link */}
                    {generatedLinkInfo && (
                      <div className="p-3 bg-[#0d1f35] rounded-xl border border-[#1e4875] flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
                        <div className="space-y-1 w-full sm:w-auto">
                          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                            <MdCheckCircle className="text-sm" /> লিংক তৈরি সম্পন্ন হয়েছে!
                          </span>
                          <p className="text-xs font-mono text-gray-200 break-all select-all">
                            {generatedLinkInfo.url}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => copyText(generatedLinkInfo.url, "link")}
                            className="px-3 py-1.5 rounded-lg bg-[#3888e9] text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                          >
                            <FaCopy className="text-xs" />
                            <span>কপি</span>
                          </button>
                          <button
                            onClick={() => setActiveQrModal(generatedLinkInfo.url)}
                            className="p-1.5 rounded-lg bg-[#14263d] text-gray-300 hover:text-white border border-[#234267] transition-all cursor-pointer"
                          >
                            <FaQrcode className="text-sm" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preset & Available Links List */}
                  <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-white">উপলব্ধ রেফারেল ও প্রমোশনাল লিংক</h3>
                    <div className="space-y-2.5">
                      {(linksData?.customLinks || [
                        {
                          id: "link_main_register",
                          name: "ডাইরেক্ট রেজিস্ট্রেশন লিংক",
                          url: fullRefLink,
                          clicks: totalClicks,
                          conversions: activeReferrals,
                          conversionRate: conversionRate,
                          createdAt: new Date().toISOString(),
                        },
                      ]).map((lnk) => (
                        <div
                          key={lnk.id}
                          className="p-3 bg-[#0d1d31] rounded-xl border border-[#1a375a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{lnk.name}</span>
                              <span className="text-[10px] text-gray-400">
                                ({lnk.clicks} ক্লিক • {lnk.conversions} কনভার্সন)
                              </span>
                            </div>
                            <p className="text-[11px] font-mono text-gray-400 break-all">{lnk.url}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => copyText(lnk.url, "link")}
                              className="px-3 py-1.5 rounded-lg bg-[#14263d] hover:bg-[#1e395b] text-gray-200 text-xs font-bold transition-all border border-[#234267] flex items-center gap-1 cursor-pointer"
                            >
                              <FaCopy className="text-xs" />
                              <span>কপি</span>
                            </button>
                            <button
                              onClick={() => setActiveQrModal(lnk.url)}
                              className="p-2 rounded-lg bg-[#14263d] hover:bg-[#1e395b] text-gray-200 border border-[#234267] transition-all cursor-pointer"
                            >
                              <FaQrcode className="text-xs" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* TAB 4: PAYOUTS */}
                <TabsContent value="payouts" className="space-y-4 mt-2">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Request Payout Form */}
                    <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                      <div className="border-b border-[#162e4a] pb-3">
                        <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                          <FaMoneyBillWave className="text-amber-400" />
                          <span>উত্তোলনের আবেদন (Withdrawal)</span>
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                          উপলব্ধ ব্যালেন্স:{" "}
                          <span className="font-bold text-amber-400">
                            ৳ {availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                        </p>
                      </div>

                      {payoutSuccessMessage && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                          <MdCheckCircle className="text-base shrink-0" />
                          <span>{payoutSuccessMessage}</span>
                        </div>
                      )}

                      {payoutErrorMessage && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                          <span className="font-bold">!</span>
                          <span>{payoutErrorMessage}</span>
                        </div>
                      )}

                      <form onSubmit={handleRequestPayout} className="space-y-3">
                        {/* Amount */}
                        <div>
                          <label className="text-xs font-bold text-gray-300 block mb-1">
                            উত্তোলনের পরিমাণ (৳ BDT)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                              ৳
                            </span>
                            <input
                              type="number"
                              min="500"
                              max={availableBalance > 0 ? availableBalance : 1000000}
                              value={payoutAmount}
                              onChange={(e) => setPayoutAmount(e.target.value)}
                              placeholder="ন্যূনতম ৫০০ ৳"
                              className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#070e17] border border-[#1b3552] text-xs text-white focus:outline-none focus:border-[#3888e9]"
                              required
                            />
                          </div>
                          <div className="flex gap-1.5 mt-1.5">
                            {[500, 1000, 2000, 5000].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setPayoutAmount(preset.toString())}
                                className="px-2 py-0.5 rounded bg-[#0d1d31] hover:bg-[#142c48] border border-[#1a375a] text-[10px] text-gray-300 cursor-pointer font-medium"
                              >
                                ৳{preset}
                              </button>
                            ))}
                            {availableBalance >= 500 && (
                              <button
                                type="button"
                                onClick={() => setPayoutAmount(Math.floor(availableBalance).toString())}
                                className="px-2 py-0.5 rounded bg-[#3888e9]/20 hover:bg-[#3888e9]/30 border border-[#3888e9]/40 text-[10px] text-[#3888e9] font-bold cursor-pointer"
                              >
                                সব
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Payment Method */}
                        <div>
                          <label className="text-xs font-bold text-gray-300 block mb-1">
                            পেমেন্ট মেথড
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: "BKASH", name: "বিকাশ (bKash)" },
                              { id: "NAGAD", name: "নগদ (Nagad)" },
                              { id: "ROCKET", name: "রকেট (Rocket)" },
                              { id: "BANK_TRANSFER", name: "ব্যাংক" },
                              { id: "CRYPTO_USDT", name: "USDT" },
                            ].map((pm) => (
                              <button
                                key={pm.id}
                                type="button"
                                onClick={() => setPaymentMethod(pm.id)}
                                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer text-center ${
                                  paymentMethod === pm.id
                                    ? "bg-[#3888e9] text-white border-[#3888e9]"
                                    : "bg-[#070e17] text-gray-400 border-[#1a375a] hover:text-white"
                                }`}
                              >
                                {pm.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Payment Details */}
                        <div>
                          <label className="text-xs font-bold text-gray-300 block mb-1">
                            {paymentMethod === "BANK_TRANSFER"
                              ? "ব্যাংক একাউন্ট নম্বর"
                              : paymentMethod === "CRYPTO_USDT"
                              ? "TRC20 Wallet Address"
                              : "মোবাইল ওয়ালেট নম্বর (Personal)"}
                          </label>
                          <input
                            type="text"
                            value={accountPhone}
                            onChange={(e) => setAccountPhone(e.target.value)}
                            placeholder={
                              paymentMethod === "CRYPTO_USDT"
                                ? "T..."
                                : "01XXXXXXXXX"
                            }
                            className="w-full px-3 py-2 rounded-xl bg-[#070e17] border border-[#1b3552] text-xs text-white focus:outline-none focus:border-[#3888e9]"
                            required
                          />
                        </div>

                        {paymentMethod === "BANK_TRANSFER" && (
                          <>
                            <div>
                              <label className="text-xs font-bold text-gray-300 block mb-1">
                                ব্যাংকের নাম ও শাখা
                              </label>
                              <input
                                type="text"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                placeholder="যেমন: City Bank, Gulshan Branch"
                                className="w-full px-3 py-2 rounded-xl bg-[#070e17] border border-[#1b3552] text-xs text-white focus:outline-none focus:border-[#3888e9]"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-300 block mb-1">
                                একাউন্টধারীর নাম
                              </label>
                              <input
                                type="text"
                                value={accountHolder}
                                onChange={(e) => setAccountHolder(e.target.value)}
                                placeholder="Account Holder Name"
                                className="w-full px-3 py-2 rounded-xl bg-[#070e17] border border-[#1b3552] text-xs text-white focus:outline-none focus:border-[#3888e9]"
                              />
                            </div>
                          </>
                        )}

                        <button
                          type="submit"
                          disabled={submittingPayout || availableBalance < 500}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
                        >
                          {submittingPayout ? (
                            <>
                              <FaSpinner className="animate-spin text-xs" />
                              <span>অনুরোধ জমা হচ্ছে...</span>
                            </>
                          ) : (
                            <>
                              <FaMoneyBillWave className="text-xs" />
                              <span>উত্তোলনের অনুরোধ পাঠান</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Payout History Table */}
                    <div className="lg:col-span-2 bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-[#162e4a] pb-3">
                        <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                          <FaMoneyBillWave className="text-[#3888e9]" />
                          <span>উত্তোলনের ইতিহাস (Payout History)</span>
                        </h3>
                        {payoutsSummary && (
                          <span className="text-xs text-gray-400">
                            মোট পরিশোধিত:{" "}
                            <span className="font-bold text-emerald-400">
                              ৳ {payoutsSummary.totalPaid.toLocaleString("en-US")}
                            </span>
                          </span>
                        )}
                      </div>

                      {payoutsLoading ? (
                        <div className="py-12 text-center text-gray-400 space-y-2">
                          <FaSpinner className="animate-spin text-2xl text-[#3888e9] mx-auto" />
                          <p className="text-xs">পেআউট রেকর্ড লোড হচ্ছে...</p>
                        </div>
                      ) : payouts.length > 0 ? (
                        <div className="divide-y divide-[#162e4a] overflow-hidden rounded-xl border border-[#162e4a]">
                          <div className="bg-[#0d1d31] px-4 py-2.5 text-[11px] font-bold text-gray-400 grid grid-cols-4">
                            <span>তারিখ ও মেথড</span>
                            <span>পরিমাণ (BDT)</span>
                            <span className="text-center">স্ট্যাটাস</span>
                            <span className="text-right">ট্রানজ্যাকশন আইডি</span>
                          </div>
                          {payouts.map((p) => (
                            <div
                              key={p.id}
                              className="px-4 py-3 bg-[#0a1626] hover:bg-[#0c1a2d] transition-colors grid grid-cols-4 items-center text-xs"
                            >
                              <div>
                                <p className="font-bold text-white">{p.paymentMethod}</p>
                                <p className="text-[10px] text-gray-400">
                                  {new Date(p.requestedAt).toLocaleDateString("en-GB")}
                                </p>
                              </div>
                              <span className="font-black text-emerald-400">
                                ৳ {p.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </span>
                              <div className="text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(p.status)}`}>
                                  {p.status}
                                </span>
                              </div>
                              <span className="text-right font-mono text-[11px] text-gray-400 truncate">
                                {p.transactionId || "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-gray-400 space-y-2">
                          <MdAccountBalanceWallet className="text-3xl text-gray-600 mx-auto" />
                          <p className="text-sm font-medium">কোনো উত্তোলনের রেকর্ড নেই</p>
                          <p className="text-xs text-gray-500">
                            উপার্জিত কমিশন ৫০০ ৳ হলেই আপনি প্রথম উইথড্রয়াল রিকোয়েস্ট পাঠাতে পারবেন।
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>

        {/* QR Code Modal */}
        {activeQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0a1626] border border-[#1a375a] rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scale-up">
              <h3 className="text-base font-black text-white">রেফারেল QR কোড</h3>
              <p className="text-xs text-gray-400">
                বন্ধুরা বা প্লেয়াররা এই QR কোড স্ক্যান করলেই সরাসরি আপনার আন্ডারে রেজিস্টার হবে।
              </p>
              <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(activeQrModal)}`}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyText(activeQrModal, "link")}
                  className="flex-1 py-2.5 rounded-xl bg-[#3888e9] hover:bg-[#2873d1] text-white text-xs font-bold transition-all cursor-pointer"
                >
                  লিংক কপি করুন
                </button>
                <button
                  onClick={() => setActiveQrModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#14263d] hover:bg-[#1e395b] text-gray-300 text-xs font-bold transition-all cursor-pointer border border-[#234267]"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer showPaymentMethods={false} />
      </TabLayout>
    </SideNavLayout>
  );
}
