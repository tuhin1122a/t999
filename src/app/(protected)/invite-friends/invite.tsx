/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Overview from "./overview";
import Rewards from "./rewards";
import Records from "./records";
import { useFindInvitationRewardDataQuery } from "@/lib/features/rewardApiSlice";
import { HiSparkles, HiUsers } from "react-icons/hi2";
import { FaTrophy, FaListUl } from "react-icons/fa";

const Invite = () => {
  const { data, isLoading } = useFindInvitationRewardDataQuery();

  const rewards = data?.rewards || [];
  const statistic = data?.statistic || {
    registersCount: 0,
    todayIncome: 0,
    validReferral: 0,
    totalIncome: 0,
  };
  const referredUsers = data?.referredUsers || [];

  if (isLoading && !data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-44 rounded-2xl bg-[#0a1626] border border-[#162e4a]" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-[#0a1626] border border-[#162e4a]" />
          ))}
        </div>
        <div className="h-48 rounded-2xl bg-[#0a1626] border border-[#162e4a]" />
      </div>
    );
  }

  const claimableRewardsCount = rewards.filter(
    (r: any) => !r.isClaimed && r.completedReferral >= r.targetReferral
  ).length;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="w-full">
        {/* Dark Luxury Sticky Tab Navigation */}
        <div className="sticky top-14 z-30 bg-[#070e17]/95 backdrop-blur-md pb-3 pt-1">
          <TabsList className="bg-[#0a1626] border border-[#183454] p-1 rounded-2xl w-full grid grid-cols-3 h-auto">
            <TabsTrigger
              value="overview"
              className="text-xs sm:text-sm font-extrabold py-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 data-[state=active]:bg-[#3888e9] data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-400 hover:text-white"
            >
              <HiSparkles className="text-xs sm:text-sm" />
              <span>Overview</span>
            </TabsTrigger>

            <TabsTrigger
              value="rewards"
              className="text-xs sm:text-sm font-extrabold py-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 data-[state=active]:bg-[#3888e9] data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-400 hover:text-white relative"
            >
              <FaTrophy className="text-xs" />
              <span>Rewards</span>
              {claimableRewardsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-black animate-pulse">
                  {claimableRewardsCount}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="records"
              className="text-xs sm:text-sm font-extrabold py-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 data-[state=active]:bg-[#3888e9] data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-400 hover:text-white"
            >
              <HiUsers className="text-xs sm:text-sm" />
              <span>Records</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#12263d] text-gray-300 font-bold">
                {referredUsers.length}
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-4 focus-visible:outline-none">
          <Overview statictic={statistic} />
        </TabsContent>

        {/* Tab 2: Milestone Rewards */}
        <TabsContent value="rewards" className="space-y-4 focus-visible:outline-none">
          <Rewards rewards={rewards} />
        </TabsContent>

        {/* Tab 3: Records */}
        <TabsContent value="records" className="space-y-4 focus-visible:outline-none">
          <Records referredUsers={referredUsers} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Invite;
