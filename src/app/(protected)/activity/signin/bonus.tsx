/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Header from "./header";
import SigninBonusPlan from "./plan";
import BonusCards from "./bonus-cards";
import Rules from "./rules";
import useCurrentUser from "@/hook/useCurrentUser";
import { useFindSigninBonusRewardsDataQuery } from "@/lib/features/rewardApiSlice";

const SigninBonus = () => {
  const user: any = useCurrentUser();
  const { data, isLoading } = useFindSigninBonusRewardsDataQuery();

  const statictic = data?.statictic;
  const nextClaimAvailable = data?.nextClaimAvailable;
  const rewards = data?.rewards || [];
  const isAuthenticated = Boolean(user && user.id) || Boolean(data?.authenticated);

  const balance = user?.wallet?.balance
    ? Number(user.wallet.balance)
    : data?.user?.balance
    ? Number(data.user.balance)
    : 0;

  const lastSigninBonus = statictic?.lastSigninIncome || 0;
  const totalSigninBonus = statictic?.totalSigninIncome || 0;

  if (isLoading && !data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-48 rounded-2xl bg-[#0a1626] border border-[#162e4a]" />
        <div className="h-28 rounded-2xl bg-[#0a1626] border border-[#162e4a]" />
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-2xl bg-[#0a1626] border border-[#162e4a]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <Header
        balance={balance}
        lastSigninBonus={lastSigninBonus}
        totalSigninBonus={totalSigninBonus}
        playerId={user?.playerId || data?.user?.playerId}
        userName={user?.name || user?.phone || data?.user?.name}
        isAuthenticated={isAuthenticated}
      />

      <SigninBonusPlan
        nextClaimAvailable={nextClaimAvailable}
        isAuthenticated={isAuthenticated}
      />

      <BonusCards rewards={rewards} isAuthenticated={isAuthenticated} />

      <Rules />
    </div>
  );
};

export default SigninBonus;
