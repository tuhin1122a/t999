import React from "react";
import AppNotice from "./AppNotice";
import AppMenuItems from "./AppMenuItems";
import SlotGames from "./SlotsGames";
import WithdrawDepositButton from "./WithdrawDepositButton";
import LiveCasino from "./LiveCasino";
import Sports from "./Sports";
import HeroSliderWrapper from "./HeroSliderWrapper";
import { db } from "@/lib/db";

const HomeApp = async () => {
  const siteSettings = await db.siteSetting.findFirst();
  const sliderImages = siteSettings?.sliderImages || [];

  return (
    <div className="app p-3">
      <AppNotice />
      <HeroSliderWrapper sliderImages={sliderImages} />
      <WithdrawDepositButton />
      <AppMenuItems />
      {/* <HotGames /> */}
      <SlotGames />
      {/* <ESports /> */}
      <Sports />
      <LiveCasino />
    </div>
  );
};

export default HomeApp;
