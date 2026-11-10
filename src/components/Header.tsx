/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { RiMenuFoldLine } from "react-icons/ri";

import logo from "@/../public/logo.png";
import Image from "next/image";
import Link from "next/link";
import { findCurrentUser } from "@/data/user";
import { db } from "@/lib/db";
import HeaderBalance from "./HeaderBalance";
import AppSideCanva from "./AppSideCanva";

const Header = async () => {
  const user: any = await findCurrentUser().catch(() => null);
  const siteSettings = await db.siteSetting.findFirst().catch(() => null);
  const promotionsLogo = siteSettings?.promotionsLogo;

  return (
    <header
      className="flex items-center justify-between px-3 py-2 bg-[#0a1626] border-b border-[#1b3554] shadow-md"
      style={{
        width: "100%",
        height: 64,
        zIndex: 1000,
        position: "sticky",
        top: 0,
      }}
    >
      <div className="flex items-center  gap-2">
        <div
          data-variant="21"
          style={{
            width: 26,
            height: 26,
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,

              overflow: "hidden",
            }}
          >
            <AppSideCanva
              trigger={
                <RiMenuFoldLine className="w-6 h-5 cursor-pointer text-white " />
              }
            />
          </div>
        </div>
        <img
          style={{
            width: 89.98,
            height: 28.08,
            objectFit: "contain",
          }}
          src={typeof promotionsLogo === "string" && promotionsLogo ? promotionsLogo : logo.src}
          alt="logo"
        />
      </div>

      {user && user.wallet && (
        <HeaderBalance
          balance={+user.wallet.balance}
          currency={user.wallet.currency}
        />
      )}
      {!user && (
        <div className="flex items-center gap-2">
          <Link
            href={"/login"}
            className="h-8 px-4 flex items-center justify-center bg-[#14263d] hover:bg-[#1e395b] text-[#a3c2e6] hover:text-white rounded-md border border-[#234267] text-xs font-bold transition-all active:scale-95 shadow-sm"
          >
            Login
          </Link>
          <Link
            href={"/register"}
            className="h-8 px-4 flex items-center justify-center bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white rounded-md text-xs font-bold transition-all active:scale-95 shadow-md"
          >
            Register
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
