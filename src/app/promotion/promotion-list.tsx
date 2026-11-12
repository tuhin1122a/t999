/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { promotions, PromotionItem } from "../../../data/promotions";
import { FaGift, FaArrowRight, FaBolt, FaTag, FaCheckCircle } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { MdOutlineLocalOffer } from "react-icons/md";

const CATEGORIES = [
  { id: "all", label: "All Offers" },
  { id: "welcome", label: "Welcome Bonus" },
  { id: "slots", label: "Slots" },
  { id: "reload", label: "Deposit Reload" },
  { id: "cashback", label: "Cashback" },
  { id: "referral", label: "Refer & Earn" },
];

const PromotionList = () => {
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredPromotions =
    activeTab === "all"
      ? promotions
      : promotions.filter((p) => p.category === activeTab);

  return (
    <div className="space-y-6">
      {/* ── Top Hero Header ────────────────────────────────────────────── */}
      <div className="relative rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-[#0c1a2d] via-[#10243d] to-[#0a1728] border border-[#1a385c] shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3888e9]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-black uppercase tracking-wider">
            <HiSparkles className="text-sm" />
            <span>EXCLUSIVE CASINO REWARDS</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Promotions & Bonus Hub
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed font-medium">
            Supercharge your winnings on RK444 with massive first-deposit bonuses, daily reload boosts, and automated weekly cashback with friendly 1x turnover rules.
          </p>
        </div>
      </div>

      {/* ── Category Filter Tabs ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((tab) => {
          const isSelected = activeTab === tab.id;
          const count =
            tab.id === "all"
              ? promotions.length
              : promotions.filter((p) => p.category === tab.id).length;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? "bg-[#3888e9] text-white shadow-md shadow-[#3888e9]/30 border border-[#3888e9]"
                  : "bg-[#0a1626] text-gray-300 hover:text-white border border-[#183454] hover:bg-[#102238]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isSelected ? "bg-white/20 text-white" : "bg-[#142842] text-gray-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Promotions Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filteredPromotions.map((promo) => (
          <PromotionCard key={promo.id} promo={promo} />
        ))}
      </div>

      {filteredPromotions.length === 0 && (
        <div className="text-center py-12 bg-[#0a1626] border border-[#162e4a] rounded-2xl space-y-2">
          <p className="text-sm font-bold text-gray-300">No promotions available in this category</p>
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className="text-xs text-[#3888e9] font-bold hover:underline"
          >
            Show all available promotions
          </button>
        </div>
      )}
    </div>
  );
};

export default PromotionList;

// Individual Promotion Card
export const PromotionCard = ({ promo }: { promo: PromotionItem }) => {
  return (
    <div className="group rounded-2xl bg-[#0a1626] border border-[#162e4a] hover:border-[#3888e9]/60 shadow-lg overflow-hidden transition-all duration-300 flex flex-col justify-between">
      {/* Banner Image Container */}
      <div className="relative w-full aspect-[16/8] sm:aspect-[16/7] overflow-hidden bg-[#06101c]">
        <Image
          src={promo.image}
          alt={promo.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1626] via-transparent to-black/30" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider">
            {promo.context}
          </span>

          {promo.badge && (
            <span
              className={`px-2.5 py-1 rounded-lg font-black text-[10px] uppercase tracking-wider shadow-md ${
                promo.badgeColor || "bg-yellow-500 text-black"
              }`}
            >
              {promo.badge}
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#3888e9] transition-colors line-clamp-1">
            {promo.title}
          </h3>

          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-medium">
            {promo.description}
          </p>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-gray-300 pt-1">
          {promo.minDeposit && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#06101c] border border-[#162e4a]">
              <span className="text-gray-400">Min:</span>
              <span className="text-white font-extrabold">{promo.minDeposit}</span>
            </div>
          )}
          {promo.turnover && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#06101c] border border-[#162e4a]">
              <span className="text-gray-400">Turnover:</span>
              <span className="text-emerald-400 font-extrabold">{promo.turnover}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2 border-t border-[#132840]">
          <Link
            href={`/promotion/${promo.id}`}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#0f223a] hover:bg-[#16355b] border border-[#1e426d] text-white font-extrabold text-xs text-center flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <span>View Details & Rules</span>
            <FaArrowRight size={11} className="text-[#3888e9]" />
          </Link>

          <Link
            href="/deposit"
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs text-center shadow-md shadow-emerald-500/20 active:scale-95 transition-all whitespace-nowrap"
          >
            Claim Now
          </Link>
        </div>
      </div>
    </div>
  );
};
