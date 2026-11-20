"use client";

import SecondaryButton from "@/components/buttons/SecondaryButton";
import useGetCurrentUser from "@/hook/useCurrentUser";
import {
  createPlayer,
  launchGameFromAnyAPI,
} from "@/lib/features/gameService";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiMaximize,
  FiMinimize,
  FiPlus,
  FiX,
} from "react-icons/fi";
import { FaStar, FaTools, FaGamepad, FaHeadset } from "react-icons/fa";
import { HiWrenchScrewdriver } from "react-icons/hi2";

// ── Live Wallet Balance & Active Session Fetcher ─────────────────────────────
async function fetchLatestBalance(
  gameSessionId?: string | null
): Promise<{ balance: number | null; kickedOut?: boolean }> {
  try {
    const query = gameSessionId
      ? `?gameSessionId=${encodeURIComponent(gameSessionId)}`
      : "";
    const res = await fetch(`/api/wallet${query}`, { cache: "no-store" });
    if (res.status === 401) {
      const errData = await res.json().catch(() => ({}));
      if (
        errData?.code === "SESSION_REPLACED" ||
        errData?.code === "GAME_OPENED_ELSEWHERE"
      ) {
        return { balance: null, kickedOut: true };
      }
    }
    if (res.ok) {
      const data = await res.json();
      if (data?.payload?.balance !== undefined) {
        return { balance: Number(data.payload.balance) };
      }
    }
    return { balance: null };
  } catch {
    return { balance: null };
  }
}

// ── Launched-game cache (survives a browser tab discard / reload) ────────────
// Mobile browsers may kill a background tab to save memory and reload it when the
// player returns. We keep the last launch URL in sessionStorage (per tab) for a
// short time so the same game round is resumed instead of a fresh relaunch.
const LAUNCH_CACHE_PREFIX = "rk444_game_launch:";
const LAUNCH_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function readCachedLaunch(
  key: string
): { url: string; sessionId: string | null } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LAUNCH_CACHE_PREFIX + key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.url || Date.now() - Number(data.ts || 0) > LAUNCH_CACHE_TTL_MS) {
      sessionStorage.removeItem(LAUNCH_CACHE_PREFIX + key);
      return null;
    }
    return { url: String(data.url), sessionId: data.sessionId ?? null };
  } catch {
    return null;
  }
}

function writeCachedLaunch(key: string, url: string, sessionId: string | null) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      LAUNCH_CACHE_PREFIX + key,
      JSON.stringify({ url, sessionId, ts: Date.now() })
    );
  } catch {
    // storage full / private mode → ignore
  }
}

function clearCachedLaunches() {
  if (typeof window === "undefined") return;
  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith(LAUNCH_CACHE_PREFIX))
      .forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // ignore
  }
}

const Play = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get("gameId") || "";

  const user = useGetCurrentUser();

  const [iframe, setIframe] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fullscreen Casino UI States
  const [showHeader, setShowHeader] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [displayBalance, setDisplayBalance] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const gameSessionIdRef = useRef<string | null>(null);

  const handleKickOut = useCallback(async () => {
    setIframe("");
    clearCachedLaunches();
    try {
      if (typeof document !== "undefined" && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    }
    toast.error("অন্য ডিভাইসে লগইন বা গেম চালু হওয়ায় গেম থেকে বের করে দেওয়া হয়েছে।", {
      id: "session-kicked",
      duration: 5000,
    });
    await signOut({ callbackUrl: "/login" });
  }, []);

  // Initial balance
  const walletBalance = Number(
    (user as any)?.wallet?.balance ??
      (user as any)?.balance ??
      0
  ).toFixed(2);

  const balanceValue = displayBalance ?? walletBalance;

  // Toggle favorite state locally per gameId
  useEffect(() => {
    if (!gameId || typeof window === "undefined") return;
    try {
      const saved = JSON.parse(localStorage.getItem("rk444_fav_games") || "[]");
      setIsFavorite(Array.isArray(saved) && saved.includes(gameId));
    } catch {
      // ignore
    }
  }, [gameId]);

  const handleToggleFavorite = useCallback(() => {
    if (!gameId || typeof window === "undefined") return;
    setIsFavorite((prev) => {
      const next = !prev;
      try {
        const saved: string[] = JSON.parse(localStorage.getItem("rk444_fav_games") || "[]");
        const set = new Set(Array.isArray(saved) ? saved : []);
        if (next) set.add(gameId);
        else set.delete(gameId);
        localStorage.setItem("rk444_fav_games", JSON.stringify(Array.from(set)));
      } catch {
        // ignore
      }
      return next;
    });
  }, [gameId]);

  // ── Live Balance & Single-Device Session Polling (Every 6s) ───────────────
  useEffect(() => {
    if (!iframe) return;
    const interval = setInterval(async () => {
      const { balance: newBal, kickedOut } = await fetchLatestBalance(
        gameSessionIdRef.current
      );
      if (kickedOut) {
        clearInterval(interval);
        await handleKickOut();
        return;
      }
      if (newBal !== null) {
        setDisplayBalance(newBal.toFixed(2));
      }
    }, 6_000);
    return () => clearInterval(interval);
  }, [iframe, handleKickOut]);

  // ── Fullscreen Toggle ────────────────────────────────────────────────────────
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        setShowHeader(false);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        setShowHeader(true);
      }
    } catch {
      // Fallback on iOS Safari where Fullscreen API is restricted: toggle bar
      setShowHeader((prev) => !prev);
      setIsFullscreen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      const fs = Boolean(document.fullscreenElement);
      setIsFullscreen(fs);
      setShowHeader(!fs);
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
    // Player intentionally left → next open must start a fresh launch
    clearCachedLaunches();
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

  // ── Redirect to login only when auth has definitely resolved as logged-out ─
  const { status: authStatus } = useSession();
  useEffect(() => {
    if (typeof window !== "undefined" && authStatus === "unauthenticated") {
      const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.replace(`/login?redirect=${redirectUrl}`);
    }
  }, [authStatus, router]);

  // ── Launch Game (exactly ONCE per gameId + user) ──────────────────────────
  // IMPORTANT: Do NOT depend on the `user` object itself. next-auth refetches the
  // session whenever the tab regains focus (screen on / returning from another app),
  // and because the session carries the wallet balance, a brand-new `user` object is
  // produced every time. Depending on it re-launched the game and reloaded the iframe,
  // which made the game restart. We key the launch on the stable user id instead and
  // guard it with a ref so the iframe stays mounted while the screen is off.
  const userId = (user as any)?.id as string | undefined;
  const launchedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!gameId || !userId) return;

    const launchKey = `${userId}:${gameId}`;
    if (launchedKeyRef.current === launchKey) return; // already running → keep game alive
    launchedKeyRef.current = launchKey;

    // If the mobile browser discarded the tab in the background and reloaded the page,
    // resume the recently launched game URL instead of starting a brand-new round.
    const cached = readCachedLaunch(launchKey);
    if (cached) {
      gameSessionIdRef.current = cached.sessionId;
      setError(false);
      setIframe(cached.url);
      return;
    }

    const launch = async () => {
      try {
        setError(false);
        setErrorMessage("");

        const playerId = await getPlayerId(user);
        const res = await launchGameFromAnyAPI(gameId, playerId ?? "");

        const url =
          res?.content?.game?.url ||
          res?.game_launch_url;

        if (!url) throw new Error("Game URL could not be generated");

        gameSessionIdRef.current = res?.content?.game?.sessionId || null;
        writeCachedLaunch(launchKey, url, gameSessionIdRef.current);
        setIframe(url);
      } catch (err: any) {
        console.error("Game launch error:", err);
        launchedKeyRef.current = null; // allow a manual retry after a failure
        if (err?.message === "SESSION_REPLACED") {
          await handleKickOut();
          return;
        }
        setError(true);
        setErrorMessage("Game Under Maintenance");
      }
    };

    launch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, userId]);

  // ── Keep the screen awake while a game is running ────────────────────────
  // Uses the Screen Wake Lock API (Android Chrome / modern browsers). The lock is
  // released automatically by the browser when the tab is hidden, so we re-acquire
  // it when the player comes back. Silently ignored where unsupported (e.g. old iOS).
  useEffect(() => {
    if (!iframe || typeof navigator === "undefined") return;
    const nav = navigator as any;
    if (!nav.wakeLock?.request) return;

    let wakeLock: any = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        if (document.visibilityState !== "visible") return;
        wakeLock = await nav.wakeLock.request("screen");
        if (cancelled) {
          wakeLock?.release?.().catch(() => {});
        }
      } catch {
        // permission denied / unsupported → ignore
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") acquire();
    };

    acquire();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      wakeLock?.release?.().catch(() => {});
    };
  }, [iframe]);

  return (
    <div className="w-full h-[100dvh] bg-black overflow-hidden relative select-none flex flex-col font-sans">

      {/* ══════════════════════════════════════════════════════════════════════
          MINIMAL MOBILE GAME TOP BAR (Matches Provider Fullscreen Style)
      ══════════════════════════════════════════════════════════════════════ */}
      {showHeader && (
        <header className="h-12 w-full bg-black px-3 flex items-center justify-between text-white shrink-0 z-50">
          {/* LEFT: Back Arrow */}
          <button
            onClick={executeExit}
            className="w-9 h-9 flex items-center justify-start text-white hover:opacity-80 active:scale-90 transition-all"
            title="Back to Lobby"
            aria-label="Back to Lobby"
          >
            <FiArrowLeft size={22} className="stroke-[2.2]" />
          </button>

          {/* CENTER: Compact Balance Pill + Green Plus Circle */}
          <Link
            href="/deposit"
            className="flex items-center gap-2 bg-[#23262c] hover:bg-[#2d3139] active:scale-95 rounded-full pl-3.5 pr-1.5 py-1 transition-all"
            title="Deposit Funds"
          >
            <span className="text-[13px] font-bold text-white tracking-tight leading-none">
              {Number(balanceValue).toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}{" "}
              ৳
            </span>
            <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
              <FiPlus size={13} className="text-[#10b981] stroke-[3]" />
            </span>
          </Link>

          {/* RIGHT: Favorite Star + Fullscreen Toggle */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleToggleFavorite}
              className="w-8 h-8 flex items-center justify-center text-white hover:opacity-80 active:scale-90 transition-all"
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              aria-label="Favorite"
            >
              {isFavorite ? (
                <FaStar size={20} className="text-yellow-400" />
              ) : (
                <FaStar size={20} className="text-white" />
              )}
            </button>

            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 flex items-center justify-center text-white hover:opacity-80 active:scale-90 transition-all"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              aria-label="Fullscreen"
            >
              {isFullscreen ? (
                <FiMinimize size={20} className="stroke-[2.4]" />
              ) : (
                <FiMaximize size={20} className="stroke-[2.4]" />
              )}
            </button>
          </div>
        </header>
      )}

      {/* Minimal Floating Controls When Fullscreen Header Is Hidden */}
      {!showHeader && (
        <div className="absolute top-2 right-2 z-50 flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-sm border border-white/15 active:scale-90 transition-all"
            title="Exit Fullscreen"
            aria-label="Exit Fullscreen"
          >
            <FiMinimize size={16} />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN CASINO GAME FRAME (Provider's Own Native Loading Screen)
      ══════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 w-full h-full relative bg-black overflow-hidden">
        {/* The Game Iframe — mounts immediately with no custom loading overlay */}
        {!error && iframe && (
          <iframe
            ref={iframeRef}
            src={iframe}
            className="w-full h-full border-0 bg-black block"
            allow="autoplay; fullscreen; screen-wake-lock; orientation; clipboard-write; encrypted-media"
            allowFullScreen
          />
        )}

        {/* Simple & Clean "Game Under Maintenance" Card */}
        {error && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-[#0c1827] border border-[#1b3452] rounded-2xl p-6 sm:p-7 text-center shadow-2xl relative space-y-4 animate-scale-up">
              {/* Close Button */}
              <button
                onClick={executeExit}
                className="absolute top-3.5 right-3.5 text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <FiX size={18} />
              </button>

              {/* Maintenance Icon */}
              <div className="w-14 h-14 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
                <FaTools className="text-xl" />
              </div>

              {/* Text */}
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-white">
                  Game Under Maintenance
                </h2>
                <p className="text-xs text-gray-300 leading-relaxed">
                  গেমটি বর্তমানে সাময়িক রক্ষণাবেক্ষণে রয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।
                </p>
              </div>

              {/* Return to Lobby Button */}
              <div className="pt-2">
                <button
                  onClick={executeExit}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  লবিতে ফিরে যান (Return to Lobby)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  );
};

export default Play;
