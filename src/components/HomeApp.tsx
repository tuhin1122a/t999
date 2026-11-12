import React from "react";
import AppNotice from "./AppNotice";
import AppMenuItems from "./AppMenuItems";
import SlotGames from "./SlotsGames";
import WithdrawDepositButton from "./WithdrawDepositButton";
import LiveCasino from "./LiveCasino";
import Sports from "./Sports";
import HotGames from "./HotGames";
import HeroSliderWrapper from "./HeroSliderWrapper";
import TrustedProviders from "./TrustedProviders";
import { db } from "@/lib/db";
import { getCuratedHotGames } from "@/lib/gameCatalog";
import { NetEnt } from "@/types/game";

const HomeApp = async () => {
  const [siteSettings, hotGames] = await Promise.all([
    db.siteSetting.findFirst().catch(() => null),
    getCuratedHotGames().catch(() => []),
  ]);
  const sliderImages = siteSettings?.sliderImages || [];

  return (
    <div className="app p-3">
      <AppNotice />
      <HeroSliderWrapper sliderImages={sliderImages} />
      <WithdrawDepositButton />
      <AppMenuItems />
      <HotGames initialGames={hotGames as unknown as NetEnt[]} />
      <SlotGames />
      {/* <ESports /> */}
      <Sports />
      <LiveCasino />
      <TrustedProviders />
    </div>
  );
};

export default HomeApp;
