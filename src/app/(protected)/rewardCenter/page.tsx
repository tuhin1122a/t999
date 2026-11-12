import React from "react";
import RewardHeader from "./header";
import RewardCards from "./reward-cards";
import SideNavLayout from "@/components/SideNavLayout";
import TabLayout from "@/components/TabLayout";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Reward Center | RK444",
  description: "Claim daily check-in streak rewards, friend referral bonuses, and VIP cashback.",
};

const RewardCenter = () => {
  return (
    <SideNavLayout>
      <TabLayout>
        <SiteHeader title="Reward Center" fallbackUrl="/" />
        <main className="min-h-screen bg-[#070e17] text-white px-3 sm:px-4 py-6 max-w-4xl mx-auto space-y-6 pb-28 md:pb-14">
          <RewardHeader />
          <RewardCards />
        </main>
        <Footer showPaymentMethods={false} />
      </TabLayout>
    </SideNavLayout>
  );
};

export default RewardCenter;
