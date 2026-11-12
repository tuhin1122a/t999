import React from "react";
import PromotionList from "./promotion-list";
import TabLayout from "@/components/TabLayout";
import SideNavLayout from "@/components/SideNavLayout";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Promotions & Bonus Offers | RK444",
  description:
    "Explore the latest welcome bonuses, slots reload offers, and weekly cashback promotions on RK444.",
};

const Promotion = () => {
  return (
    <SideNavLayout>
      <TabLayout>
        <SiteHeader title="Promotions & Bonuses" fallbackUrl="/" />
        <main className="min-h-screen bg-[#070e17] text-white px-3 sm:px-4 py-6 max-w-6xl mx-auto pb-28 md:pb-14">
          <PromotionList />
        </main>
        <Footer />
      </TabLayout>
    </SideNavLayout>
  );
};

export default Promotion;
