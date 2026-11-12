/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { promotions } from "../../../../data/promotions";
import Image from "next/image";
import Link from "next/link";
import remarkGfm from "remark-gfm";
import ReactMarkDown from "react-markdown";
import SideNavLayout from "@/components/SideNavLayout";
import TabLayout from "@/components/TabLayout";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import LiveChatTrigger from "@/components/LiveChatTrigger";
import { FaChevronLeft, FaArrowRight, FaBolt, FaShieldAlt } from "react-icons/fa";
import { RiCustomerService2Fill } from "react-icons/ri";
import { MdOutlineSupportAgent } from "react-icons/md";

const fetchPromotion = (id: number) => {
  return promotions.find((promotion) => promotion.id === id);
};

type Params = Promise<{ id: string }>;

const PromotionDetail = async ({ params }: { params: Params }) => {
  const { id: promotionId } = await params;
  const promotion = fetchPromotion(+promotionId);

  return (
    <SideNavLayout>
      <TabLayout>
        <SiteHeader title={promotion?.title || "Promotion Details"} fallbackUrl="/promotion">
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

        <main className="min-h-screen bg-[#070e17] text-white px-3 sm:px-4 py-6 max-w-4xl mx-auto space-y-6 pb-28 md:pb-14">
          {/* Back Button */}
          <div>
            <Link
              href="/promotion"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-white px-3 py-1.5 rounded-xl bg-[#0a1626] border border-[#183454] hover:border-[#3888e9] transition-all"
            >
              <FaChevronLeft size={10} />
              <span>Back to all promotions</span>
            </Link>
          </div>

          {promotion ? (
            <div className="space-y-6">
              {/* ── Banner Card ────────────────────────────────────────── */}
              <div className="rounded-3xl bg-[#0a1626] border border-[#162e4a] overflow-hidden shadow-2xl">
                <div className="relative w-full aspect-[16/8] sm:aspect-[16/7] bg-[#06101c]">
                  <Image
                    src={promotion.image}
                    alt={promotion.title}
                    fill
                    priority
                    sizes="(max-width: 896px) 100vw, 896px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1626] via-transparent to-black/30" />

                  {/* Floating Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <span className="px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-black uppercase tracking-wider">
                      {promotion.context}
                    </span>

                    {promotion.badge && (
                      <span
                        className={`px-3 py-1 rounded-xl font-black text-xs uppercase tracking-wider shadow-md ${
                          promotion.badgeColor || "bg-yellow-500 text-black"
                        }`}
                      >
                        {promotion.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Banner Summary Info */}
                <div className="p-5 sm:p-7 space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                      {promotion.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                      {promotion.description}
                    </p>
                  </div>

                  {/* Quick Specs Strip */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 text-xs">
                    {promotion.minDeposit && (
                      <div className="px-3 py-1.5 rounded-xl bg-[#06101c] border border-[#162e4a] flex items-center gap-1.5">
                        <span className="text-gray-400">Min Deposit:</span>
                        <span className="text-white font-extrabold">{promotion.minDeposit}</span>
                      </div>
                    )}
                    {promotion.turnover && (
                      <div className="px-3 py-1.5 rounded-xl bg-[#06101c] border border-[#162e4a] flex items-center gap-1.5">
                        <span className="text-gray-400">Turnover:</span>
                        <span className="text-emerald-400 font-extrabold">{promotion.turnover}</span>
                      </div>
                    )}
                    <div className="px-3 py-1.5 rounded-xl bg-[#06101c] border border-[#162e4a] flex items-center gap-1.5">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-blue-400 font-extrabold">Active Now</span>
                    </div>
                  </div>

                  {/* Top Claim Button */}
                  <div className="pt-2 flex flex-wrap gap-3">
                    <Link
                      href="/deposit"
                      className="flex-1 min-w-[200px] py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-sm text-center shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Deposit & Claim Bonus</span>
                      <FaArrowRight size={12} />
                    </Link>

                    <LiveChatTrigger
                      fallbackHref="/support"
                      className="py-3 px-4 rounded-xl bg-[#0f223a] hover:bg-[#153456] border border-[#1e426d] text-gray-200 text-xs font-bold active:scale-95 transition-all flex items-center gap-2"
                    >
                      <RiCustomerService2Fill className="text-[#3888e9] text-base" />
                      <span>Ask Support</span>
                    </LiveChatTrigger>
                  </div>
                </div>
              </div>

              {/* ── Content & Rules Card ───────────────────────────────── */}
              <div className="rounded-3xl bg-[#0a1626] border border-[#162e4a] p-5 sm:p-8 shadow-xl">
                <div className="prose prose-invert max-w-none prose-headings:font-black prose-headings:text-white prose-h2:text-lg sm:prose-h2:text-xl prose-h2:border-b prose-h2:border-[#162e4a] prose-h2:pb-2.5 prose-h3:text-sm sm:prose-h3:text-base prose-p:text-xs sm:prose-p:text-sm prose-p:text-gray-300 prose-p:leading-relaxed prose-li:text-xs sm:prose-li:text-sm prose-li:text-gray-300 prose-strong:text-white prose-table:text-xs sm:prose-table:text-sm prose-th:text-white prose-th:bg-[#06101c] prose-th:p-2.5 prose-td:p-2.5 prose-td:border-b prose-td:border-[#132840]">
                  <ReactMarkDown remarkPlugins={[remarkGfm]}>
                    {promotion.content}
                  </ReactMarkDown>
                </div>

                {/* Bottom CTA Box */}
                <div className="mt-8 pt-6 border-t border-[#162e4a] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h4 className="text-sm font-black text-white">Ready to boost your game?</h4>
                    <p className="text-xs text-gray-400">
                      Deposit now and select this bonus on the cashier deposit page.
                    </p>
                  </div>

                  <Link
                    href="/deposit"
                    className="w-full sm:w-auto py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-sm text-center shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
                  >
                    Deposit & Play
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-[#0a1626] border border-[#162e4a] rounded-3xl space-y-3">
              <h3 className="text-lg font-black text-white">Promotion Not Found</h3>
              <p className="text-xs text-gray-400">
                The promotion offer you are looking for is currently unavailable or has expired.
              </p>
              <Link
                href="/promotion"
                className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-[#3888e9] text-white font-bold text-xs"
              >
                View Active Promotions
              </Link>
            </div>
          )}
        </main>

        <Footer />
      </TabLayout>
    </SideNavLayout>
  );
};

export default PromotionDetail;
