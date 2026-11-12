import React from "react";
import PromotionList from "./promotion-list";
import TabLayout from "@/components/TabLayout";
import SideNavLayout from "@/components/SideNavLayout";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import LiveChatTrigger from "@/components/LiveChatTrigger";
import { MdOutlineSupportAgent } from "react-icons/md";

export const metadata = {
  title: "Promotions & Bonus Offers | RK444",
  description:
    "Explore the latest welcome bonuses, slots reload offers, and weekly cashback promotions on RK444.",
};

const Promotion = () => {
  return (
    <SideNavLayout>
      <TabLayout>
        <SiteHeader title="Promotions & Bonuses" fallbackUrl="/">
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

        <main className="min-h-screen bg-[#070e17] text-white px-2.5 sm:px-4 py-3 sm:py-6 max-w-6xl mx-auto space-y-6 pb-28 md:pb-14">
          <PromotionList />
        </main>
        <Footer />
      </TabLayout>
    </SideNavLayout>
  );
};

export default Promotion;
