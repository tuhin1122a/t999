"use client";

import SecondaryButton from "@/components/buttons/SecondaryButton";
import useGetCurrentUser from "@/hook/useCurrentUser";
import {
  createPlayer,
  launchGameFromAnyAPI,
} from "@/lib/features/gameService";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronUp,
  FiMaximize,
  FiMinimize,
  FiPlus,
  FiRefreshCw,
  FiVolume2,
  FiVolumeX,
  FiX,
} from "react-icons/fi";
import { RiGamepadLine, RiWallet3Line } from "react-icons/ri";
import { FaTools, FaGamepad, FaHeadset } from "react-icons/fa";
import { HiWrenchScrewdriver } from "react-icons/hi2";

// ── Live Wallet Balance Fetcher ──────────────────────────────────────────────
async function fetchLatestBalance(): Promise<number | null> {
  try {
    const res = await fetch("/api/wallet", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data?.payload?.balance !== undefined) {
        return Number(data.payload.balance);
      }
    }
    return null;
  } catch {
    return null;
  }
}

const Play = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get("gameId") || "";

  const user = useGetCurrentUser();

  const [isIframeLoading, setIsLoading] = useState(true);
  const [iframe, setIframe] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 1xBet Style UI States
  const [showHeader, setShowHeader] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayBalance, setDisplayBalance] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Initial balance
  const walletBalance = Number(
    (user as any)?.wallet?.balance ??
      (user as any)?.balance ??
      0
  ).toFixed(2);

  const balanceValue = displayBalance ?? walletBalance;

  // ── Manual Balance Refresh ────────────────────────────────────────────────
  const handleRefreshBalance = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    const newBal = await fetchLatestBalance();
    if (newBal !== null) {
      setDisplayBalance(newBal.toFixed(2));
      toast.success(`৳ ${newBal.toFixed(2)}`, { id: "bal-sync" });
    }
    setIsRefreshing(false);
  }, [isRefreshing]);

  // ── Live Balance Polling (Every 15s) ───────────────────────────────────────
  useEffect(() => {
    if (!iframe) return;
    const interval = setInterval(async () => {
      const newBal = await fetchLatestBalance();
      if (newBal !== null) {
        setDisplayBalance(newBal.toFixed(2));
      }
    }, 15_000);
    return () => clearInterval(interval);
  }, [iframe]);

  // ── 1xBet Fullscreen Toggle ───────────────────────────────────────────────
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn("Fullscreen toggle failed:", err);
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // ── Instant Safe Exit to Lobby (No hassle, 1-tap exit) ────────────────────
  const executeExit = useCallback(async () => {
    try {
      if (typeof document !== "undefined" && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    }
    setIframe("");
    try {
      // Fetch fresh balance right as user exits game
      await fetchLatestBalance();
    } catch {
      // ignore
    }
    router.replace("/games");
  }, [router]);

  // ── Handle Mobile Back Button & Gestures ──────────────────────────────────
  useEffect(() => {
    try {
      window.history.pushState({ inGame: true }, "", window.location.href);
    } catch {
      // ignore
    }

    const handlePopState = () => {
      executeExit();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [executeExit]);

  // ── Game Iframe Reload ────────────────────────────────────────────────────
  const handleReloadGame = useCallback(() => {
    if (!iframe) return;
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = iframe;
    }
  }, [iframe]);

  // ── Player Initialization ─────────────────────────────────────────────────
  const getPlayerId = async (u: any) => {
    if (!u) return null;
    if (u.gameXAPlayerId) return u.gameXAPlayerId;

    const player = await createPlayer({
      username: u.phone || `user_${Date.now()}`,
      email: u.email || `${u.phone}@rk444.com`,
      full_name: u.name || `Guest ${Date.now()}`,
      phone: u.phone || "",
      password: "StrongPassword123!",
      currency: "BDT",
      language: "en",
    });

    return (
      player.player_id?.toString() ||
      player.player?.id?.toString() ||
      null
    );
  };

  // ── Redirect to login if user is not authenticated ───────────────────────
  useEffect(() => {
    // If auth state has resolved (user hook returns undefined if loading or not logged in)
    // Wait briefly or check session
    if (typeof window !== "undefined" && user === null) {
      const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.replace(`/login?redirect=${redirectUrl}`);
    }
  }, [user, router]);

  // ── Launch Game ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!gameId) return;

    if (!user) {
      // User is not logged in
      setIsLoading(false);
      setError(true);
      setErrorMessage("Please login to your account to play this game.");
      return;
    }

    const launch = async () => {
      try {
        setIsLoading(true);
        setError(false);
        setErrorMessage("");

        const playerId = await getPlayerId(user);
        const res = await launchGameFromAnyAPI(gameId, playerId ?? "");

        const url =
          res?.content?.game?.url ||
          res?.game_launch_url;

        if (!url) throw new Error("Game URL could not be generated");

        setIframe(url);
      } catch (err: any) {
        console.error("Game launch error:", err);
        setError(true);
        const maintenanceMsg = "This game is currently under maintenance. Please try another game or check back shortly.";
        setErrorMessage(maintenanceMsg);
        toast.error("Game Under Maintenance (গেমটি সাময়িক রক্ষণাবেক্ষণে রয়েছে)", {
          id: "game-maintenance",
          duration: 4000,
        });
        setIsLoading(false);
      }
    };

    launch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, user]);

  return (
    <div className="w-full h-[100dvh] bg-[#070e17] overflow-hidden relative select-none flex flex-col font-sans">

      {/* ══════════════════════════════════════════════════════════════════════
          1XBET / MELBET STYLE TOP BAR
      ══════════════════════════════════════════════════════════════════════ */}
      <div
        className={`w-full z-50 transition-all duration-300 ease-in-out ${
          showHeader ? "h-12 opacity-100" : "h-0 opacity-0 overflow-hidden"
        }`}
      >
        <header className="h-12 w-full bg-[#0a1626] border-b border-[#1c304a] px-2 sm:px-4 flex items-center justify-between text-white shadow-lg">

          {/* LEFT: Back to Casino & Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={executeExit}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#14263d] hover:bg-[#dc2626] active:scale-90 text-white border border-[#234267] hover:border-red-500/50 transition-all shadow-md"
              title="Back to Lobby"
            >
              <FiChevronLeft size={20} className="stroke-[2.5] -ml-0.5" />
            </button>

            {/* Platform Logo */}
            <Link href="/" className="flex items-center gap-1.5">
              <Image
                src="/logo.png"
                alt="Casino Logo"
                width={85}
                height={26}
                className="h-6 w-auto object-contain hidden sm:block"
                priority
              />
            </Link>
          </div>

          {/* CENTER: Real-Time Wallet Balance with 1xBet Deposit Quick Action */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center bg-[#07101b] border border-[#1b3452] rounded-md px-2.5 py-1 shadow-inner">
              <RiWallet3Line className="text-[#10b981] mr-1.5 text-base" />
              <div className="flex flex-col text-right leading-none">
                <span className="text-[10px] text-gray-400 font-medium">Main Balance</span>
                <span className="text-xs sm:text-sm font-bold text-yellow-400 tracking-wide">
                  ৳ {balanceValue}
                </span>
              </div>
              <button
                onClick={handleRefreshBalance}
                disabled={isRefreshing}
                className="ml-2 text-gray-400 hover:text-teal-400 active:scale-90 p-0.5 transition-all"
                title="Refresh Balance"
              >
                <FiRefreshCw
                  size={13}
                  className={isRefreshing ? "animate-spin text-yellow-400" : ""}
                />
              </button>
            </div>

            {/* Quick Deposit Button (1xBet style "+ Deposit") */}
            <Link
              href="/deposit"
              target="_blank"
              className="hidden xs:flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white text-xs font-bold rounded-md shadow transition-all active:scale-95"
              title="Deposit Funds"
            >
              <FiPlus size={14} className="stroke-[3]" />
              <span>Deposit</span>
            </Link>
          </div>

          {/* RIGHT: Quick Casino Controls (Reload, Mute, Fullscreen, Collapse) */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              onClick={handleReloadGame}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#14263d] rounded-md active:scale-95 transition-all"
              title="Reload Game"
            >
              <FiRefreshCw size={15} />
            </button>

            <button
              onClick={() => setIsMuted((prev) => !prev)}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#14263d] rounded-md active:scale-95 transition-all hidden sm:block"
              title={isMuted ? "Unmute" : "Mute (Visual indicator)"}
            >
              {isMuted ? <FiVolumeX size={15} className="text-red-400" /> : <FiVolume2 size={15} />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#14263d] rounded-md active:scale-95 transition-all"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            >
              {isFullscreen ? <FiMinimize size={15} /> : <FiMaximize size={15} />}
            </button>

            <button
              onClick={() => setShowHeader(false)}
              className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-[#14263d] rounded-md active:scale-95 transition-all ml-0.5"
              title="Hide Bar for Full Experience"
            >
              <FiChevronUp size={18} />
            </button>
          </div>
        </header>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MINIMAL FLOATING TOP TRIGGER (When Header is Hidden)
      ══════════════════════════════════════════════════════════════════════ */}
      {!showHeader && (
        <>
          {/* Quick Floating Exit Button on top-left so player is never trapped */}
          <div className="absolute top-2 left-2 z-50">
            <button
              onClick={executeExit}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0a1626]/85 hover:bg-[#dc2626] text-white shadow-2xl backdrop-blur-md transition-all active:scale-90 border border-[#1c304a] hover:border-red-500/50"
              title="Back to Lobby"
            >
              <FiChevronLeft size={20} className="stroke-[2.5] -ml-0.5" />
            </button>
          </div>

          {/* Balance & Header Re-open Toggle */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40">
            <button
              onClick={() => setShowHeader(true)}
              className="group flex items-center gap-1.5 px-3 py-1 bg-[#0a1626]/90 hover:bg-[#14263d] border-b border-x border-[#1c304a] rounded-b-lg shadow-xl backdrop-blur-md transition-all active:scale-95"
              title="Expand 1xBet Controls"
            >
              <span className="text-[11px] font-bold text-yellow-400">৳ {balanceValue}</span>
              <FiChevronDown size={14} className="text-teal-400 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN CASINO GAME FRAME
      ══════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 w-full h-full relative bg-[#04080e] overflow-hidden">

        {/* 1xBet Style Loading Screen */}
        {isIframeLoading && !error && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gradient-to-b from-[#071322] via-[#091b31] to-[#040c16] text-white">
            <div className="relative flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-[#143254] border-t-[#3888e9] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <RiGamepadLine size={32} className="text-yellow-400 animate-pulse" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[#e1ecf9] tracking-wide mb-1">
              LAUNCHING GAME
            </h3>
            <p className="text-xs text-[#7196bf] font-medium animate-pulse mb-6">
              Connecting to secure 1xBet / World Casino server...
            </p>

            <button
              onClick={executeExit}
              className="px-5 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold rounded-md border border-red-500/40 transition-all shadow"
            >
              Cancel & Exit
            </button>
          </div>
        )}

        {/* The Game Iframe */}
        {!error && iframe && (
          <iframe
            ref={iframeRef}
            src={iframe}
            className="w-full h-full border-0 bg-black block"
            onLoad={() => setIsLoading(false)}
            allow="autoplay; fullscreen; screen-wake-lock; orientation; clipboard-write; encrypted-media"
            allowFullScreen
          />
        )}

        {/* World-Class Casino "Game Under Maintenance" Screen */}
        {error && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#03070e]/95 backdrop-blur-xl p-4 overflow-y-auto">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#3888e9]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-md bg-gradient-to-b from-[#0d1d32] via-[#091524] to-[#060e19] border border-[#1e3b63] rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] text-center overflow-hidden my-auto animate-scale-up">
              {/* Top Golden Accent Glow Line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

              {/* Close Button Top Right */}
              <button
                onClick={executeExit}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#112338] hover:bg-[#1a375a] active:scale-95 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-[#22436d]"
                title="Back to Lobby"
              >
                <FiX size={16} />
              </button>

              {/* 3D Casino Floating Centerpiece */}
              <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-4">
                <div className="absolute inset-0 rounded-3xl bg-amber-500/20 blur-xl animate-pulse" />
                <div className="relative w-full h-full rounded-3xl bg-gradient-to-b from-[#182d49] via-[#0f2035] to-[#0a1626] border border-[#2b5182] shadow-2xl flex items-center justify-center">
                  <RiGamepadLine className="text-3xl sm:text-4xl text-amber-300" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-black flex items-center justify-center shadow-lg font-bold">
                  <HiWrenchScrewdriver className="text-xs sm:text-sm" />
                </div>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/25 text-amber-300 text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>SERVER MAINTENANCE • রক্ষণাবেক্ষণ চলছে</span>
              </div>

              {/* Headings */}
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Game Temporarily Unavailable
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-relaxed max-w-sm mx-auto">
                গেম প্রোভাইডার কর্তৃক এই গেমটি বর্তমানে সাময়িক আপডেটে রয়েছে। খুব শীঘ্রই গেমটি স্বাভাবিক হবে। অনুগ্রহ করে আমাদের লবি থেকে অন্য যেকোনো জনপ্রিয় গেম উপভোগ করুন।
              </p>

              {/* Popular Alternatives Quick Links */}
              <div className="py-2.5 px-3 rounded-2xl bg-[#060f1b] border border-[#162e4a] my-4 text-left">
                <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider block mb-2">
                  জনপ্রিয় বিকল্প গেমস খেলুন:
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <Link
                    href="/games?category=Slots"
                    className="py-2 px-1.5 rounded-xl bg-[#0d1c2e] hover:bg-[#142c48] border border-[#1c385c] text-gray-200 hover:text-white font-bold text-center transition-all flex flex-col items-center gap-1 group"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">🎰</span>
                    <span className="text-[10px] sm:text-[11px] truncate w-full">স্লট গেমস</span>
                  </Link>

                  <Link
                    href="/games?category=Live"
                    className="py-2 px-1.5 rounded-xl bg-[#0d1c2e] hover:bg-[#142c48] border border-[#1c385c] text-gray-200 hover:text-white font-bold text-center transition-all flex flex-col items-center gap-1 group"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">🎲</span>
                    <span className="text-[10px] sm:text-[11px] truncate w-full">লাইভ ক্যাসিনো</span>
                  </Link>

                  <Link
                    href="/games?category=Crash"
                    className="py-2 px-1.5 rounded-xl bg-[#0d1c2e] hover:bg-[#142c48] border border-[#1c385c] text-gray-200 hover:text-white font-bold text-center transition-all flex flex-col items-center gap-1 group"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">🚀</span>
                    <span className="text-[10px] sm:text-[11px] truncate w-full">ক্র্যাশ / এভিয়েটর</span>
                  </Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Link
                  href="/games"
                  className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-black font-black text-xs sm:text-sm shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <FaGamepad className="text-base" />
                  <span>ক্যাসিনো লবিতে ফিরে যান (Explore All Games)</span>
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="py-2.5 rounded-xl bg-[#0f2136] hover:bg-[#183454] text-white border border-[#234267] text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <FiRefreshCw size={13} />
                    <span>আবার চেষ্টা করুন</span>
                  </button>

                  <Link
                    href="/support"
                    className="py-2.5 rounded-xl bg-[#0f2136] hover:bg-[#183454] text-[#3888e9] hover:text-white border border-[#234267] text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <FaHeadset className="text-xs" />
                    <span>২৪/৭ সাপোর্ট</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  );
};

export default Play;
