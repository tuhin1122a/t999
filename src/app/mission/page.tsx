"use client";

import React, { useState, useEffect, useCallback } from "react";
import SideNavLayout from "@/components/SideNavLayout";
import TabLayout from "@/components/TabLayout";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import LiveChatTrigger from "@/components/LiveChatTrigger";
import { MdOutlineSupportAgent, MdCheckCircle, MdAccountBalanceWallet } from "react-icons/md";
import {
  FaTrophy,
  FaGift,
  FaCalendarCheck,
  FaCoins,
  FaUsers,
  FaCrown,
  FaGamepad,
  FaDice,
  FaMoneyBillWave,
  FaHistory,
  FaArrowRight,
  FaSpinner,
  FaSignInAlt,
} from "react-icons/fa";
import { HiSparkles, HiFire } from "react-icons/hi2";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface MissionItem {
  id: string;
  category: "DAILY" | "WEEKLY" | "ACHIEVEMENT";
  title: string;
  description: string;
  reward: number;
  target: number;
  unit: string;
  iconType: string;
  badge?: string;
  current: number;
  percentage: number;
  isCompleted: boolean;
  isClaimed: boolean;
  lastClaimedAt?: string | null;
}

interface ClaimedRecord {
  id: string;
  title: string;
  description: string | null;
  rewardAmount: number;
  claimedAt: string;
}

interface MissionsResponse {
  authenticated: boolean;
  user?: {
    id: string;
    name: string;
    phone: string;
    balance: number;
  };
  summary: {
    totalRewardsEarned: number;
    todayCompletedCount: number;
    claimableRewardsCount: number;
    claimableTotalAmount: number;
    userBalance: number;
  };
  missions: MissionItem[];
  claimedHistory: ClaimedRecord[];
}

export default function MissionsPage() {
  const [data, setData] = useState<MissionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("daily");
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimSuccessModal, setClaimSuccessModal] = useState<{
    rewardAmount: number;
    message: string;
  } | null>(null);

  const fetchMissions = useCallback(async () => {
    try {
      const res = await fetch("/api/missions", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Error fetching missions data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const handleClaim = async (missionId: string) => {
    if (!data?.authenticated) {
      window.location.href = "/login";
      return;
    }

    setClaimingId(missionId);
    try {
      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setClaimSuccessModal({
          rewardAmount: json.rewardAmount,
          message: json.message,
        });
        await fetchMissions();
      } else {
        alert(json.error || "রিওয়ার্ড ক্লেইম করা যায়নি");
      }
    } catch (err) {
      console.error(err);
      alert("সার্ভার সংযোগে ত্রুটি হয়েছে");
    } finally {
      setClaimingId(null);
    }
  };

  const getMissionIcon = (iconType: string) => {
    switch (iconType) {
      case "login":
        return <FaGift className="text-xl text-amber-400" />;
      case "deposit":
        return <FaMoneyBillWave className="text-xl text-emerald-400" />;
      case "game":
        return <FaGamepad className="text-xl text-blue-400" />;
      case "dice":
        return <FaDice className="text-xl text-purple-400" />;
      case "crown":
        return <FaCrown className="text-xl text-yellow-400" />;
      case "calendar":
        return <FaCalendarCheck className="text-xl text-teal-400" />;
      case "wallet":
        return <FaCoins className="text-xl text-amber-400" />;
      case "trophy":
        return <FaTrophy className="text-xl text-yellow-400" />;
      case "users":
        return <FaUsers className="text-xl text-indigo-400" />;
      default:
        return <HiSparkles className="text-xl text-amber-400" />;
    }
  };

  const dailyMissions = data?.missions.filter((m) => m.category === "DAILY") || [];
  const weeklyMissions = data?.missions.filter((m) => m.category === "WEEKLY") || [];
  const achievementMissions = data?.missions.filter((m) => m.category === "ACHIEVEMENT") || [];
  const history = data?.claimedHistory || [];
  const summary = data?.summary;

  return (
    <SideNavLayout>
      <TabLayout>
        <SiteHeader title="Daily & Weekly Missions" fallbackUrl="/">
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
          {/* Top Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1c30] via-[#0d223c] to-[#071322] border border-[#1d3d63] p-5 sm:p-8 shadow-2xl">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#3888e9]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b3b61]/80 border border-[#2b588d] text-xs font-bold text-[#4fa4ff]">
                  <HiFire className="text-sm text-amber-400 animate-pulse" />
                  <span>দৈনিক ও সাপ্তাহিক মিশন রিওয়ার্ড সেন্টার</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  মিশন সম্পন্ন করুন, আয় করুন{" "}
                  <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                    আনলিমিটেড ক্যাশ বোনাস!
                  </span>
                </h1>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  প্রতিদিন ডিপোজিট, প্রিয় গেমপ্লে ও টার্নওভারের সহজ চ্যালেঞ্জ পূরণ করে সরাসরি আপনার ওয়ালেটে বোনাস যুক্ত করুন।
                </p>
              </div>

              {/* Claimable Alert Box */}
              {summary && summary.claimableRewardsCount > 0 && (
                <div className="w-full md:w-auto p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/10 border border-amber-400/40 text-center md:text-right shrink-0 space-y-1.5 animate-pulse">
                  <span className="text-[11px] font-bold text-amber-300 flex items-center justify-center md:justify-end gap-1">
                    <HiSparkles /> {summary.claimableRewardsCount}টি রিওয়ার্ড ক্লেইম করার জন্য প্রস্তুত!
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-amber-400">
                    ৳ {summary.claimableTotalAmount.toLocaleString("en-US")}
                  </div>
                  <span className="text-[10px] text-gray-300 block">
                    নিচে &quot;ক্লেইম করুন&quot; বাটনে চাপুন
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 4 Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Today Completed */}
            <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-3.5 sm:p-4 shadow-sm hover:border-[#3888e9]/40 transition-all">
              <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
                <span>আজকের মিশন</span>
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <FaCalendarCheck className="text-sm" />
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-black text-white mt-2">
                {summary?.todayCompletedCount || 0} / {dailyMissions.length || 5}
              </div>
              <span className="text-[10px] text-gray-400 font-medium">দৈনিক লক্ষ্যমাত্রা</span>
            </div>

            {/* Total Earned */}
            <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-3.5 sm:p-4 shadow-sm hover:border-[#3888e9]/40 transition-all">
              <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
                <span>মোট অর্জিত রিওয়ার্ড</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <FaCoins className="text-sm" />
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-black text-emerald-400 mt-2">
                ৳ {(summary?.totalRewardsEarned || 0).toLocaleString("en-US")}
              </div>
              <span className="text-[10px] text-gray-400 font-medium">সর্বমোট ক্লেইমড</span>
            </div>

            {/* Claimable Now */}
            <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-3.5 sm:p-4 shadow-sm hover:border-[#3888e9]/40 transition-all">
              <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
                <span>ক্লেইমযোগ্য ক্যাশ</span>
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <FaGift className="text-sm" />
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-black text-amber-400 mt-2">
                ৳ {(summary?.claimableTotalAmount || 0).toLocaleString("en-US")}
              </div>
              <span className="text-[10px] text-amber-300 font-bold">
                {summary?.claimableRewardsCount || 0}টি প্রস্তুত
              </span>
            </div>

            {/* User Wallet Balance */}
            <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-3.5 sm:p-4 shadow-sm hover:border-[#3888e9]/40 transition-all">
              <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
                <span>ওয়ালেট ব্যালেন্স</span>
                <div className="w-7 h-7 rounded-lg bg-[#3888e9]/10 text-[#3888e9] flex items-center justify-center">
                  <MdAccountBalanceWallet className="text-base" />
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-black text-white mt-2">
                ৳ {(summary?.userBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <Link href="/deposit" className="text-[10px] text-[#3888e9] hover:underline font-bold mt-0.5 inline-block">
                ডিপোজিট করুন →
              </Link>
            </div>
          </div>

          {/* Interactive Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Sticky Tab Navigation */}
            <div className="sticky top-14 z-30 bg-[#070e17]/95 backdrop-blur-md pb-3 pt-1">
              <TabsList className="bg-[#0a1626] border border-[#183454] p-1 rounded-2xl w-full grid grid-cols-4 h-auto">
                <TabsTrigger
                  value="daily"
                  className="text-xs sm:text-sm font-extrabold py-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 data-[state=active]:bg-[#3888e9] data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-400 hover:text-white relative"
                >
                  <HiSparkles className="text-xs sm:text-sm" />
                  <span>দৈনিক</span>
                  {dailyMissions.some((m) => m.isCompleted && !m.isClaimed) && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="weekly"
                  className="text-xs sm:text-sm font-extrabold py-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 data-[state=active]:bg-[#3888e9] data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-400 hover:text-white relative"
                >
                  <FaCalendarCheck className="text-xs sm:text-sm" />
                  <span>সাপ্তাহিক</span>
                  {weeklyMissions.some((m) => m.isCompleted && !m.isClaimed) && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="achievements"
                  className="text-xs sm:text-sm font-extrabold py-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 data-[state=active]:bg-[#3888e9] data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-400 hover:text-white"
                >
                  <FaTrophy className="text-xs sm:text-sm" />
                  <span>অর্জন</span>
                </TabsTrigger>

                <TabsTrigger
                  value="history"
                  className="text-xs sm:text-sm font-extrabold py-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 data-[state=active]:bg-[#3888e9] data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-400 hover:text-white"
                >
                  <FaHistory className="text-xs sm:text-sm" />
                  <span>রেকর্ডস</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-3 py-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-28 rounded-2xl bg-[#0a1626] border border-[#162e4a]" />
                ))}
              </div>
            )}

            {/* TAB 1: DAILY MISSIONS */}
            {!loading && (
              <TabsContent value="daily" className="space-y-3 mt-2">
                <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                  <span>প্রতিদিন রাত ১২:০০ টায় মিশনগুলো রিসেট হয়</span>
                  <span className="text-amber-400 font-bold">লাইভ ট্র্যাকিং সক্রিয়</span>
                </div>

                <div className="space-y-3">
                  {dailyMissions.map((mission) => (
                    <MissionCard
                      key={mission.id}
                      mission={mission}
                      authenticated={!!data?.authenticated}
                      claiming={claimingId === mission.id}
                      onClaim={() => handleClaim(mission.id)}
                      icon={getMissionIcon(mission.iconType)}
                    />
                  ))}
                </div>
              </TabsContent>
            )}

            {/* TAB 2: WEEKLY CHALLENGES */}
            {!loading && (
              <TabsContent value="weekly" className="space-y-3 mt-2">
                <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                  <span>সাপ্তাহিক চ্যালেঞ্জ প্রতি সোমবার রিসেট হয়</span>
                  <span className="text-purple-400 font-bold">বড় রিওয়ার্ড চ্যালেঞ্জ</span>
                </div>

                <div className="space-y-3">
                  {weeklyMissions.map((mission) => (
                    <MissionCard
                      key={mission.id}
                      mission={mission}
                      authenticated={!!data?.authenticated}
                      claiming={claimingId === mission.id}
                      onClaim={() => handleClaim(mission.id)}
                      icon={getMissionIcon(mission.iconType)}
                    />
                  ))}
                </div>
              </TabsContent>
            )}

            {/* TAB 3: ACHIEVEMENTS */}
            {!loading && (
              <TabsContent value="achievements" className="space-y-3 mt-2">
                <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                  <span>লাইফটাইম মাইলস্টোন ও স্পেশাল ব্যাজ</span>
                  <span className="text-emerald-400 font-bold">একবার ক্লেইমযোগ্য</span>
                </div>

                <div className="space-y-3">
                  {achievementMissions.map((mission) => (
                    <MissionCard
                      key={mission.id}
                      mission={mission}
                      authenticated={!!data?.authenticated}
                      claiming={claimingId === mission.id}
                      onClaim={() => handleClaim(mission.id)}
                      icon={getMissionIcon(mission.iconType)}
                    />
                  ))}
                </div>
              </TabsContent>
            )}

            {/* TAB 4: CLAIMED RECORDS */}
            {!loading && (
              <TabsContent value="history" className="space-y-3 mt-2">
                <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-[#162e4a] pb-3">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <FaHistory className="text-[#3888e9]" />
                      <span>ক্লেইম করা রিওয়ার্ডের ইতিহাস</span>
                    </h3>
                    <span className="text-xs text-emerald-400 font-bold">
                      মোট ক্লেইমড: ৳ {(summary?.totalRewardsEarned || 0).toLocaleString("en-US")}
                    </span>
                  </div>

                  {history.length > 0 ? (
                    <div className="divide-y divide-[#162e4a] overflow-hidden rounded-xl border border-[#162e4a]">
                      <div className="bg-[#0d1d31] px-4 py-2.5 text-[11px] font-bold text-gray-400 grid grid-cols-3">
                        <span>মিশনের নাম</span>
                        <span className="text-center">ক্লেইমের তারিখ</span>
                        <span className="text-right">প্রাপ্ত রিওয়ার্ড</span>
                      </div>
                      {history.map((rec) => (
                        <div
                          key={rec.id}
                          className="px-4 py-3 bg-[#0a1626] hover:bg-[#0c1a2d] transition-colors grid grid-cols-3 items-center text-xs"
                        >
                          <div>
                            <p className="font-bold text-white">{rec.title}</p>
                            <p className="text-[10px] text-gray-400">{rec.description}</p>
                          </div>
                          <span className="text-center text-[11px] text-gray-400">
                            {new Date(rec.claimedAt).toLocaleDateString("en-GB")}
                          </span>
                          <span className="text-right font-black text-emerald-400">
                            + ৳ {Number(rec.rewardAmount).toLocaleString("en-US")}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-400 space-y-2">
                      <FaGift className="text-3xl text-gray-600 mx-auto" />
                      <p className="text-sm font-medium">এখনো কোনো রিওয়ার্ড ক্লেইম করা হয়নি</p>
                      <p className="text-xs text-gray-500">
                        দৈনিক ও সাপ্তাহিক মিশনগুলো সম্পন্ন করে রিওয়ার্ড সংগ্রহ করুন।
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </main>

        {/* Claim Success Celebration Modal */}
        {claimSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0a1626] border border-amber-400/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scale-up">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 mx-auto flex items-center justify-center text-black shadow-lg shadow-amber-500/30 animate-bounce">
                <FaTrophy className="text-3xl" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  রিওয়ার্ড ক্লেইম সফল!
                </span>
                <h3 className="text-2xl font-black text-white">
                  + ৳ {claimSuccessModal.rewardAmount}
                </h3>
                <p className="text-xs text-gray-300">{claimSuccessModal.message}</p>
              </div>
              <button
                onClick={() => setClaimSuccessModal(null)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs transition-all cursor-pointer shadow-md"
              >
                দারুণ! ধন্যবাদ
              </button>
            </div>
          </div>
        )}

        <Footer showPaymentMethods={false} />
      </TabLayout>
    </SideNavLayout>
  );
}

// Reusable Mission Card Component
function MissionCard({
  mission,
  authenticated,
  claiming,
  onClaim,
  icon,
}: {
  mission: MissionItem;
  authenticated: boolean;
  claiming: boolean;
  onClaim: () => void;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        mission.isCompleted && !mission.isClaimed
          ? "bg-gradient-to-r from-[#0d223c] to-[#0a1a2e] border-amber-400/50 shadow-lg shadow-amber-500/5 hover:border-amber-400"
          : "bg-[#0a1626] border-[#162e4a] hover:border-[#1d3d63]"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Icon & Title */}
        <div className="flex items-start gap-3 w-full sm:w-auto">
          <div className="w-11 h-11 rounded-xl bg-[#14263d] border border-[#234267] flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white">{mission.title}</h3>
              {mission.badge && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  {mission.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 max-w-md">{mission.description}</p>
          </div>
        </div>

        {/* Right: Reward Tag & Action */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#162e4a]">
          {/* Reward Amount */}
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-gray-400 block font-medium">পুরস্কার</span>
            <span className="text-sm sm:text-base font-black text-amber-400">
              + ৳ {mission.reward.toLocaleString("en-US")}
            </span>
          </div>

          {/* Action Button */}
          {mission.isClaimed ? (
            <button
              disabled
              className="px-4 py-2 rounded-xl bg-[#11243a] text-gray-400 text-xs font-bold border border-[#1b3552] flex items-center gap-1.5 cursor-not-allowed opacity-80"
            >
              <MdCheckCircle className="text-emerald-400" />
              <span>ক্লেইম সম্পন্ন</span>
            </button>
          ) : mission.isCompleted ? (
            <button
              onClick={onClaim}
              disabled={claiming}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs shadow-lg shadow-amber-400/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer animate-pulse"
            >
              {claiming ? (
                <>
                  <FaSpinner className="animate-spin text-xs" />
                  <span>ক্লেইম হচ্ছে...</span>
                </>
              ) : (
                <>
                  <FaGift className="text-xs" />
                  <span>ক্লেইম করুন</span>
                </>
              )}
            </button>
          ) : authenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400 font-bold hidden sm:inline">
                চলমান
              </span>
              <Link
                href={
                  mission.id.includes("deposit")
                    ? "/deposit"
                    : mission.id.includes("invite")
                    ? "/invite-friends"
                    : "/"
                }
                className="px-3.5 py-1.5 rounded-xl bg-[#14263d] hover:bg-[#1e395b] text-[#3888e9] hover:text-white border border-[#234267] text-xs font-bold transition-all flex items-center gap-1"
              >
                <span>সম্পন্ন করুন</span>
                <FaArrowRight className="text-[9px]" />
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl bg-[#3888e9] hover:bg-[#2873d1] text-white text-xs font-bold transition-all flex items-center gap-1"
            >
              <FaSignInAlt className="text-xs" />
              <span>লগইন করুন</span>
            </Link>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 pt-3 border-t border-[#162e4a]/60 space-y-1.5">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-gray-400">
            অগ্রগতি:{" "}
            <span className="text-white font-mono font-bold">
              {mission.current.toLocaleString("en-US")} / {mission.target.toLocaleString("en-US")} {mission.unit}
            </span>
          </span>
          <span
            className={`font-bold font-mono ${
              mission.percentage >= 100 ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {mission.percentage}%
          </span>
        </div>
        <div className="h-2 w-full bg-[#070e17] rounded-full overflow-hidden p-0.5 border border-[#162e4a]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              mission.percentage >= 100
                ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                : "bg-gradient-to-r from-blue-500 via-[#3888e9] to-amber-400"
            }`}
            style={{ width: `${Math.min(100, Math.max(0, mission.percentage))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
