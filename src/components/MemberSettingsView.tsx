/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import useCurrentUser from "@/hook/useCurrentUser";
import { updateProfile } from "@/action/account";
import { logout } from "@/action/logout";
import TabNav from "@/components/TabNav";
import {
  FaArrowLeftLong,
  FaBell,
  FaCircleCheck,
  FaCircleInfo,
  FaCircleUser,
  FaCircleXmark,
  FaClockRotateLeft,
  FaCreditCard,
  FaGamepad,
  FaGift,
  FaHandPointer,
  FaHeadset,
  FaLock,
  FaPen,
  FaRightFromBracket,
  FaRotate,
  FaShieldHalved,
  FaTableCellsLarge,
  FaUserPlus,
  FaWallet,
  FaXmark,
} from "react-icons/fa6";

function maskPhone(phone?: string): string {
  if (!phone) return "---";
  const clean = phone.replace(/\D/g, "");
  if (clean.length >= 6) {
    return `${clean.slice(0, 3)}...${clean.slice(-2)}`;
  }
  return phone;
}

function formatRegDate(iso?: string | Date): string {
  if (!iso) return "18.09.2025";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "18.09.2025";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return "18.09.2025";
  }
}

export default function MemberSettingsView({
  defaultView = "settings",
}: {
  defaultView?: "settings" | "profile";
}) {
  const router = useRouter();
  const user: any = useCurrentUser();

  const [viewMode, setViewMode] = useState<"settings" | "profile">(defaultView);
  const [oneClickBet, setOneClickBet] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const rawParts = String(user?.name || "Player Md")
    .trim()
    .split(" ");
  const [firstName, setFirstName] = useState(rawParts[0] || "Player");
  const [surname, setSurname] = useState(rawParts.slice(1).join(" ") || "Md");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(user?.facebook || "");
  const [gender] = useState("Male");
  const [city, setCity] = useState("Dhaka");

  useEffect(() => {
    if (user?.name) {
      const parts = String(user.name).trim().split(" ");
      setFirstName(parts[0] || "Player");
      setSurname(parts.slice(1).join(" ") || "Md");
    }
    if (user?.facebook) {
      setEmail(user.facebook);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fullName = `${firstName.trim()} ${surname.trim()}`.trim();
      const res = await updateProfile({
        name: fullName || user?.name || "Player",
        phone: user?.phone || "",
        facebook: email.trim(),
      });
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Profile updated successfully!");
        setEditModalOpen(false);
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const res = await logout();
    if (res?.success) {
      window.location.href = "/";
    }
  };

  const playerId = user?.playerId || user?.id?.slice(0, 10) || "1390419915";
  const regDate = formatRegDate(user?.createdAt);

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW 2: PERSONAL PROFILE / PROFILE EDIT
  // ════════════════════════════════════════════════════════════════════════════
  if (viewMode === "profile") {
    return (
      <div className="min-h-screen bg-[#070e17] text-white pb-28">
        {/* Top Header */}
        <header className="h-14 bg-[#0a1626] border-b border-[#1b3554] px-4 flex items-center justify-between sticky top-0 z-50">
          <button
            type="button"
            onClick={() => {
              if (defaultView === "profile") {
                router.push("/member");
              } else {
                setViewMode("settings");
              }
            }}
            className="w-9 h-9 flex items-center justify-center text-[#3888e9] hover:text-white cursor-pointer"
          >
            <FaArrowLeftLong className="text-lg" />
          </button>

          <h1 className="text-[17px] font-bold text-white tracking-wide">
            Personal profile
          </h1>

          <button
            type="button"
            onClick={() => setEditModalOpen(true)}
            className="w-9 h-9 rounded-full bg-[#122844] border border-[#234267] flex items-center justify-center text-[#3888e9] hover:text-white transition-all active:scale-95 cursor-pointer"
            title="Edit Profile"
          >
            <FaPen size={14} />
          </button>
        </header>

        <main className="w-full max-w-md mx-auto px-3.5 pt-4 space-y-3">
          {/* Top Card: Enter details */}
          <button
            type="button"
            onClick={() => setEditModalOpen(true)}
            className="w-full bg-[#0a1626] border border-[#162e4a] rounded-2xl p-4 flex items-center gap-3.5 hover:border-[#3888e9]/50 transition-all cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-full bg-[#122844] flex items-center justify-center text-[#3888e9] shrink-0">
              <FaPen size={15} />
            </div>
            <div>
              <span className="text-[15px] font-semibold text-white block">
                Enter details (Edit Profile)
              </span>
              <span className="text-xs text-slate-400">
                Tap to edit name, surname, username, email &amp; city
              </span>
            </div>
          </button>

          {/* Section: Account */}
          <p className="text-[13px] font-bold text-[#60A5FA] pt-2 px-1">
            Account
          </p>
          <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl overflow-hidden divide-y divide-[#142944]">
            <div
              onClick={() => {
                navigator.clipboard.writeText(String(playerId));
                toast.success("Account ID copied!");
              }}
              className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-[#0e1f36]"
            >
              <span className="text-[15px] font-semibold text-white">
                Account number
              </span>
              <span className="text-sm font-semibold text-slate-400">
                id: {playerId}
              </span>
            </div>

            <div
              onClick={() => setEditModalOpen(true)}
              className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-[#0e1f36]"
            >
              <span className="text-[15px] font-semibold text-white">
                Username
              </span>
              <span className="text-sm font-bold text-[#3888e9]">
                {username || "Add"}
              </span>
            </div>

            <div
              onClick={() => setEditModalOpen(true)}
              className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-[#0e1f36]"
            >
              <span className="text-[15px] font-semibold text-white">Email</span>
              <span className="text-sm font-bold text-[#3888e9]">
                {email || "Link"}
              </span>
            </div>

            <div
              onClick={() => setEditModalOpen(true)}
              className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-[#0e1f36]"
            >
              <div>
                <p className="text-[15px] font-semibold text-white">
                  Phone number
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {maskPhone(user?.phone)}
                </p>
              </div>
              <span className="text-sm font-bold text-[#3888e9]">Change</span>
            </div>

            <Link
              href="/security/password"
              className="flex items-center justify-between px-4 py-4 hover:bg-[#0e1f36]"
            >
              <div>
                <p className="text-[15px] font-semibold text-white">Password</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Days since last change: 3
                </p>
              </div>
              <span className="text-sm font-bold text-[#3888e9]">Change</span>
            </Link>

            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-[15px] font-semibold text-white">
                Registration date
              </span>
              <span className="text-sm font-semibold text-slate-400">
                {regDate}
              </span>
            </div>
          </div>

          {/* Section: Personal information */}
          <p className="text-[13px] font-bold text-[#60A5FA] pt-2 px-1">
            Personal information
          </p>
          <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl overflow-hidden divide-y divide-[#142944]">
            <div
              onClick={() => setEditModalOpen(true)}
              className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-[#0e1f36]"
            >
              <span className="text-[15px] font-semibold text-white">Name</span>
              <span className="text-sm font-semibold text-slate-400">
                {firstName}
              </span>
            </div>

            <div
              onClick={() => setEditModalOpen(true)}
              className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-[#0e1f36]"
            >
              <span className="text-[15px] font-semibold text-white">
                Surname
              </span>
              <span className="text-sm font-semibold text-slate-400">
                {surname}
              </span>
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-[15px] font-semibold text-white">
                Gender
              </span>
              <span className="text-sm font-semibold text-slate-400">
                {gender}
              </span>
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-[15px] font-semibold text-white">
                Country
              </span>
              <span className="text-sm font-semibold text-slate-400">
                Bangladesh
              </span>
            </div>

            <div
              onClick={() => setEditModalOpen(true)}
              className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-[#0e1f36]"
            >
              <span className="text-[15px] font-semibold text-white">City</span>
              <span className="text-sm font-semibold text-slate-400">
                {city}
              </span>
            </div>
          </div>
        </main>

        {/* Edit Details Modal */}
        {editModalOpen && (
          <div className="fixed inset-0 z-[1000] bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <form
              onSubmit={handleSaveProfile}
              className="w-full max-w-md bg-[#0a1626] border-t sm:border border-[#162e4a] rounded-t-3xl sm:rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-black text-white">
                  Edit Personal Details
                </h3>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <FaXmark size={18} />
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#60A5FA] uppercase">
                  Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-[#06101c] border border-[#1b385a] text-sm font-semibold text-white focus:outline-none focus:border-[#3888e9]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#60A5FA] uppercase">
                  Surname
                </label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-[#06101c] border border-[#1b385a] text-sm font-semibold text-white focus:outline-none focus:border-[#3888e9]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#60A5FA] uppercase">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Optional username"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-[#06101c] border border-[#1b385a] text-sm font-semibold text-white focus:outline-none focus:border-[#3888e9]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#60A5FA] uppercase">
                  Email
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-[#06101c] border border-[#1b385a] text-sm font-semibold text-white focus:outline-none focus:border-[#3888e9]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#60A5FA] uppercase">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-[#06101c] border border-[#1b385a] text-sm font-semibold text-white focus:outline-none focus:border-[#3888e9]"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#3888e9] to-[#2563eb] text-white font-black text-sm shadow-md active:scale-98 transition-all cursor-pointer mt-2"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        <TabNav />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW 1 (DEFAULT): SETTINGS PAGE
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#070e17] text-white pb-28">
      {/* Top Header: Back | Settings | Info + Avatar Icon */}
      <header className="h-14 bg-[#0a1626] border-b border-[#1b3554] px-4 flex items-center justify-between sticky top-0 z-50">
        <button
          type="button"
          onClick={() => router.push("/member")}
          className="w-9 h-9 flex items-center justify-center text-[#3888e9] hover:text-white cursor-pointer"
        >
          <FaArrowLeftLong className="text-lg" />
        </button>

        <h1 className="text-[17px] font-bold text-white tracking-wide">
          Settings
        </h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toast.success("RK444 Official Platform · 256-Bit SSL")}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
            title="Platform Info"
          >
            <FaCircleInfo size={20} />
          </button>

          {/* Top-Right Avatar Button -> Opens Personal Profile */}
          <button
            type="button"
            onClick={() => setViewMode("profile")}
            className="w-9 h-9 rounded-full bg-[#122844] border border-[#234267] flex items-center justify-center text-[#3888e9] hover:text-white transition-all active:scale-95 cursor-pointer"
            title="Personal Profile"
          >
            <FaCircleUser size={21} />
          </button>
        </div>
      </header>

      <main className="w-full max-w-md mx-auto px-3.5 pt-4 space-y-3">
        {/* ── 1. Account management ── */}
        <p className="text-[13px] font-bold text-[#60A5FA] pt-1 px-1">
          Account management
        </p>
        <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl overflow-hidden divide-y divide-[#142944]">
          <button
            type="button"
            onClick={() => setViewMode("profile")}
            className="w-full flex items-center justify-between gap-3.5 px-4 py-3.5 hover:bg-[#0e1f36] transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#122844] flex items-center justify-center text-emerald-400 shrink-0">
                <FaCircleUser size={18} />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-white">
                  Personal Profile (Profile Edit)
                </div>
                <div className="text-[11px] text-gray-400">
                  Update name, email &amp; account info
                </div>
              </div>
            </div>
            <FaPen size={13} className="text-[#3888e9] shrink-0" />
          </button>

          <Link
            href="/deposit"
            className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#0e1f36] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#122844] flex items-center justify-center text-[#3888e9] shrink-0">
              <FaCreditCard size={16} />
            </div>
            <span className="text-[15px] font-semibold text-white">
              Make a deposit
            </span>
          </Link>

          <Link
            href="/withdraw"
            className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#0e1f36] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#122844] flex items-center justify-center text-[#3888e9] shrink-0">
              <FaWallet size={16} />
            </div>
            <span className="text-[15px] font-semibold text-white">
              Withdraw
            </span>
          </Link>

          <Link
            href="/history"
            className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#0e1f36] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#122844] flex items-center justify-center text-[#3888e9] shrink-0">
              <FaClockRotateLeft size={16} />
            </div>
            <span className="text-[15px] font-semibold text-white">
              Transaction history
            </span>
          </Link>

          <Link
            href="/betting-record"
            className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#0e1f36] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#122844] flex items-center justify-center text-[#3888e9] shrink-0">
              <FaGamepad size={16} />
            </div>
            <span className="text-[15px] font-semibold text-white">
              Betting history
            </span>
          </Link>
        </div>

        {/* ── 2. Security ── */}
        <p className="text-[13px] font-bold text-[#60A5FA] pt-2 px-1">
          Security
        </p>
        <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl overflow-hidden divide-y divide-[#142944]">
          <Link
            href="/security"
            className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#0e1f36] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#122844] flex items-center justify-center text-[#3888e9] shrink-0">
              <FaLock size={16} />
            </div>
            <span className="text-[15px] font-semibold text-white">
              PIN code and biometrics
            </span>
          </Link>

          <Link
            href="/security"
            className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#0e1f36] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#122844] flex items-center justify-center text-[#3888e9] shrink-0">
              <FaShieldHalved size={16} />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-white">
                Authenticator
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <FaCircleXmark className="text-red-500 text-xs" />
                <span className="text-xs text-slate-400">Not enabled</span>
              </div>
            </div>
          </Link>

          <Link
            href="/security"
            className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#0e1f36] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#122844] flex items-center justify-center text-[#3888e9] shrink-0">
              <FaLock size={16} />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-white">
                Security settings
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <FaCircleCheck className="text-emerald-500 text-xs" />
                <span className="text-xs text-slate-400">
                  Profile protected
                </span>
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => toast.success("Active session: Web Browser")}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#0e1f36] transition-colors text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#122844] flex items-center justify-center text-[#3888e9] shrink-0">
              <FaClockRotateLeft size={16} />
            </div>
            <span className="text-[15px] font-semibold text-white">
              Sign-in history
            </span>
          </button>
        </div>

        {/* ── 3. Bet settings ── */}
        <p className="text-[13px] font-bold text-[#60A5FA] pt-2 px-1">
          Bet settings
        </p>
        <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl overflow-hidden divide-y divide-[#142944]">
          <Link
            href="/vip"
            className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#0e1f36] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#122844] flex items-center justify-center text-[#3888e9] shrink-0">
              <FaRotate size={16} />
            </div>
            <span className="text-[15px] font-semibold text-white">
              Bet settings &amp; VIP
            </span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setOneClickBet(!oneClickBet);
              toast.success(
                !oneClickBet
                  ? "One-click bet enabled"
                  : "One-click bet disabled"
              );
            }}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#0e1f36] transition-colors text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#122844] flex items-center justify-center text-[#3888e9] shrink-0">
              <FaHandPointer size={16} />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-white">
                One-click bet
              </p>
              <p className="text-xs text-slate-400">
                {oneClickBet ? "Enabled" : "Disabled"}
              </p>
            </div>
          </button>

          <Link
            href="/promotion"
            className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#0e1f36] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#122844] flex items-center justify-center text-[#3888e9] shrink-0">
              <FaGift size={16} />
            </div>
            <span className="text-[15px] font-semibold text-white">
              Promotions &amp; Bonuses
            </span>
          </Link>

          <Link
            href="/invite-friends"
            className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#0e1f36] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#122844] flex items-center justify-center text-[#3888e9] shrink-0">
              <FaUserPlus size={16} />
            </div>
            <span className="text-[15px] font-semibold text-white">
              Invite Friends
            </span>
          </Link>
        </div>

        {/* ── 4. App settings ── */}
        <p className="text-[13px] font-bold text-[#60A5FA] pt-2 px-1">
          App settings
        </p>
        <div className="bg-[#0a1626] border border-[#162e4a] rounded-2xl overflow-hidden divide-y divide-[#142944]">
          <button
            type="button"
            onClick={() => toast.success("Odds type: Decimal")}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#0e1f36] transition-colors text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#122844] flex items-center justify-center text-[#3888e9] shrink-0">
              <FaTableCellsLarge size={16} />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-white">Odds type</p>
              <p className="text-xs text-slate-400">Decimal</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setPushEnabled(!pushEnabled);
              toast.success(
                !pushEnabled
                  ? "Push notifications enabled"
                  : "Push notifications muted"
              );
            }}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#0e1f36] transition-colors text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#122844] flex items-center justify-center text-[#3888e9] shrink-0">
              <FaBell size={16} />
            </div>
            <span className="text-[15px] font-semibold text-white">
              Push notifications
            </span>
          </button>

          <Link
            href="/support"
            className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#0e1f36] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#122844] flex items-center justify-center text-[#3888e9] shrink-0">
              <FaHeadset size={16} />
            </div>
            <span className="text-[15px] font-semibold text-white">
              24/7 Live Support
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#0e1f36] transition-colors text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center text-red-400 shrink-0">
              <FaRightFromBracket size={16} />
            </div>
            <span className="text-[15px] font-semibold text-red-400">
              Log out
            </span>
          </button>
        </div>
      </main>

      <TabNav />
    </div>
  );
}
