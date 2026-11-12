"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import LiveChatTrigger from "./LiveChatTrigger";
import {
  RiGamepadLine,
  RiFireFill,
  RiCoinsLine,
  RiVipCrownLine,
  RiVipCrownFill,
  RiCustomerService2Line,
  RiUserSharedLine,
  RiApps2Line,
  RiTrophyLine,
  RiPercentLine,
  RiGlobalLine,
} from "react-icons/ri";
import { IoFootballOutline, IoSparkles } from "react-icons/io5";
import {
  GiDiceSixFacesSix,
  GiCardRandom,
  GiFishCooked,
  GiTicket,
} from "react-icons/gi";
import { MdOutlineCasino, MdFavoriteBorder } from "react-icons/md";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  badgeClass?: string;
  isChat?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Casino & Games",
    items: [
      {
        title: "Lobby",
        href: "/games",
        icon: <RiGamepadLine />,
      },
      {
        title: "Hot Games",
        href: "/hot",
        icon: <RiFireFill className="text-red-400" />,
        badge: "HOT",
        badgeClass: "bg-red-500/20 text-red-400 border border-red-500/30",
      },
      {
        title: "Slots",
        href: "/slots",
        icon: <MdOutlineCasino />,
      },
      {
        title: "Live Casino",
        href: "/live-casino",
        icon: <GiCardRandom className="text-emerald-400" />,
        badge: "LIVE",
        badgeClass: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse",
      },
      {
        title: "Sports",
        href: "/sports",
        icon: <IoFootballOutline />,
      },
      {
        title: "Fish Hunter",
        href: "/fish",
        icon: <GiFishCooked className="text-cyan-400" />,
      },
      {
        title: "Arcade & PVP",
        href: "/arcade",
        icon: <GiDiceSixFacesSix />,
      },
      {
        title: "Lottery",
        href: "/lottery",
        icon: <GiTicket className="text-yellow-400" />,
      },
      {
        title: "Favorites",
        href: "/favorites",
        icon: <MdFavoriteBorder />,
      },
    ],
  },
  {
    title: "VIP & Rewards",
    items: [
      {
        title: "VIP Club",
        href: "/vip",
        icon: <RiVipCrownLine className="text-yellow-400" />,
        badge: "VIP",
        badgeClass: "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border border-yellow-500/30",
      },
      {
        title: "Promotions",
        href: "/promotion",
        icon: <RiPercentLine className="text-blue-400" />,
        badge: "PROMO",
        badgeClass: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
      },
      {
        title: "Reward Center",
        href: "/rewardCenter",
        icon: <RiTrophyLine className="text-amber-400" />,
      },
      {
        title: "Invite & Earn",
        href: "/invite-friends",
        icon: <RiUserSharedLine className="text-emerald-400" />,
        badge: "BONUS",
        badgeClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
      },
      {
        title: "Affiliate",
        href: "/affiliate",
        icon: <RiCoinsLine className="text-amber-300" />,
      },
      {
        title: "Missions",
        href: "/mission",
        icon: <IoSparkles className="text-purple-400" />,
      },
    ],
  },
  {
    title: "Support & Services",
    items: [
      {
        title: "24/7 Live Support",
        href: "/chat",
        icon: <RiCustomerService2Line className="text-teal-400" />,
        badge: "ONLINE",
        badgeClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
        isChat: true,
      },
      {
        title: "Mobile App",
        href: "/appp",
        icon: <RiApps2Line />,
      },
      {
        title: "Languages",
        href: "/languages",
        icon: <RiGlobalLine />,
      },
    ],
  },
];

const SideNav = () => {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-full bg-[#070e17] border-r border-[#15273d] flex flex-col justify-between overflow-hidden select-none font-sans">
      
      {/* ── Brand Header ─────────────────────────────────────────────────── */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#15273d] bg-[#0a1626]/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/logo.png"
            alt="RK444 Casino"
            width={110}
            height={32}
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            priority
          />
        </Link>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#142842] border border-[#23456e] text-[10px] font-bold text-yellow-400">
          <RiVipCrownFill size={11} />
          <span>PRO</span>
        </div>
      </div>

      {/* ── Scrollable Menu Area ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-[#15273d] scrollbar-track-transparent">

        {/* Quick VIP Pass Card */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#0c223d] to-[#0a1626] border border-[#1d3d63] shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <RiVipCrownFill className="text-yellow-400 text-sm" />
                <span className="text-[11px] font-extrabold text-yellow-300 tracking-wider">
                  VIP LOUNGE
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                Exclusive Cashbacks & VIP Gifts
              </p>
            </div>
            <Link
              href="/vip"
              className="px-2.5 py-1 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black text-[11px] font-black rounded-lg shadow active:scale-95 transition-all"
            >
              JOIN
            </Link>
          </div>
        </div>

        {/* Nav Sections */}
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
              {section.title}
            </span>
            <div className="space-y-0.5">
              {section.items.map((item, iIdx) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                const itemContent = (
                  <div
                    className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#142842] text-white shadow-sm border border-[#23456e]"
                        : "text-gray-300 hover:text-white hover:bg-[#0c1a2c]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`text-base flex-shrink-0 transition-transform group-hover:scale-110 ${
                          isActive
                            ? "text-[#3888e9]"
                            : "text-gray-400 group-hover:text-[#3888e9]"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.title}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${item.badgeClass}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                );

                if (item.isChat) {
                  return (
                    <LiveChatTrigger
                      key={iIdx}
                      fallbackHref={item.href}
                      ariaLabel={item.title}
                      className="w-full text-left"
                    >
                      {itemContent}
                    </LiveChatTrigger>
                  );
                }

                return (
                  <Link key={iIdx} href={item.href} className="block">
                    {itemContent}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── 24/7 Live Support Footer ────────────────────────────────────── */}
      <div className="p-3 border-t border-[#15273d] bg-[#0a1626]/60 backdrop-blur-sm">
        <LiveChatTrigger
          fallbackHref="/support"
          className="w-full p-2.5 rounded-xl bg-[#0e1f33] hover:bg-[#142c4a] border border-[#1b395e] flex items-center justify-between transition-all group active:scale-95"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-[#143254] flex items-center justify-center text-[#3888e9]">
                <RiCustomerService2Line size={18} />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#070e17] animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white group-hover:text-yellow-400 transition-colors">
                Live Support
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                24/7 Agents Online
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
            CHAT
          </span>
        </LiveChatTrigger>
      </div>

    </aside>
  );
};

export default SideNav;
