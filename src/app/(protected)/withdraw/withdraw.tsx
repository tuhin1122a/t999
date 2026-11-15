"use client";

import React from "react";
import {
  useFetchWithdrawPageDataQuery,
  useFetchWithdrawWalletQuery,
} from "@/lib/features/withdrawSlice";
import WithdrawInfo from "./withdraw-info";
import WithdrawForm from "./withdraw-form";

const Withdraw = () => {
  const { data: withdrwData, isLoading: withdrawLoading } =
    useFetchWithdrawPageDataQuery();

  const { data, isLoading: walletLoading } = useFetchWithdrawWalletQuery();
  const wallets = data?.payload?.wallets;
  
  return (
    <>
      {withdrwData && !withdrawLoading && !walletLoading && wallets && (
        <>
          <WithdrawInfo
            availableBalance={Number(withdrwData.availableBalance)}
            mainBalance={Number(withdrwData.mainBalance)}
            remainingWithdrawal={Number(withdrwData.remainingWithdrawal)}
            turnOver={Number(withdrwData.turnOver)}
            totalWagered={Number(withdrwData.totalWagered || 0)}
            turnoverProgressPercent={Number(withdrwData.turnoverProgressPercent ?? 100)}
          />
          <WithdrawForm
            wallets={wallets}
            availableBalance={Number(withdrwData.availableBalance)}
            turnOver={Number(withdrwData.turnOver)}
          />
        </>
      )}

      {(!withdrwData || withdrawLoading || walletLoading || !wallets) && (
        <div className="w-full h-screen flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </>
  );
};

export default Withdraw;
