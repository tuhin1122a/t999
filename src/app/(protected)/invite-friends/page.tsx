import SiteHeader from "@/components/SiteHeader";
import React from "react";
import Invite from "./invite";
import TabNav from "@/components/TabNav";

const InviteFriends = () => {
  return (
    <div className="min-h-screen pb-24">
      <SiteHeader title="Invite Friends" />
      <main className="pb-6 space-y-3">
        <Invite />
      </main>
      <TabNav />
    </div>
  );
};

export default InviteFriends;
