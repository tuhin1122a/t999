import React from "react";
import RewardHeader from "./header";
import RewardCards from "./reward-cards";
import TabNav from "@/components/TabNav";

const RewardCenter = () => {
  return (
    <div className="bg-[#F5F5F9] md:px-50 lg:px-[350px] min-h-screen pb-24">
      <RewardHeader />
      <main className="pt-16 px-3">
        <RewardCards />
      </main>
      <TabNav />
    </div>
  );
};

export default RewardCenter;
