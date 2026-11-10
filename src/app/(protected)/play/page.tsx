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
  FiArrowLeft,
  FiChevronDown,
  FiChevronUp,
  FiHelpCircle,
  FiMaximize,
  FiMinimize,
  FiPlus,
  FiRefreshCw,
  FiVolume2,
  FiVolumeX,
  FiX,
} from "react-icons/fi";
import { RiGamepadLine, RiWallet3Line } from "react-icons/ri";

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
  const [showExitConfirm, setShowExitConfirm] = useState(false);

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

  // ── Safe Exit to Lobby ────────────────────────────────────────────────────
  const executeExit = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // ignore
      }
    }
    router.push("/games");
  }, [router]);

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

  // ── Launch Game ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !gameId) return;

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
        setErrorMessage(err.message || "Failed to launch game");
        toast.error(err.message || "Game failed to load");
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
              onClick={() => setShowExitConfirm(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#14263d] hover:bg-[#1e395b] active:scale-95 text-[#a3c2e6] hover:text-white rounded-md border border-[#234267] text-xs font-semibold transition-all"
              title="Back to Casino Games"
            >
              <FiArrowLeft size={16} className="text-[#3888e9]" />
              <span className="hidden sm:inline">Lobby</span>
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
              onClick={() => setShowExitConfirm(true)}
              className="px-5 py-1.5 bg-[#14263d] hover:bg-[#1e395b] text-[#a3c2e6] text-xs font-semibold rounded-md border border-[#234267] transition-all"
            >
              Cancel
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

        {/* Error Screen */}
        {error && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/85 p-4">
            <div className="w-full max-w-sm bg-[#0a1626] border border-[#1c304a] rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-[#b91c1c] px-4 py-3 text-white flex items-center gap-2.5">
                <FiX size={18} />
                <h2 className="text-sm font-bold">Game Launch Failed</h2>
              </div>
              <div className="p-4 text-gray-300 text-xs">
                <p className="bg-[#050b13] p-3 rounded border border-[#1b3452] text-red-300 mb-4 font-mono">
                  {errorMessage || "Unable to establish connection with the game server."}
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-3 py-1.5 bg-[#14263d] hover:bg-[#1e395b] text-white rounded font-semibold text-xs"
                  >
                    Try Again
                  </button>
                  <Link href="/games">
                    <SecondaryButton>Return to Lobby</SecondaryButton>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          1XBET EXIT CONFIRMATION MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs bg-[#0a1626] border border-[#1c304a] rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 text-center">
              <div className="w-11 h-11 mx-auto mb-3 rounded-full bg-[#14263d] flex items-center justify-center text-yellow-400">
                <FiHelpCircle size={24} />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Exit to Lobby?</h3>
              <p className="text-xs text-gray-400 mb-4">
                Your current session winnings will be safely credited to your main balance.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-2 bg-[#14263d] hover:bg-[#1e395b] text-gray-300 rounded-lg text-xs font-semibold transition-all"
                >
                  Stay & Play
                </button>
                <button
                  onClick={executeExit}
                  className="flex-1 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg text-xs font-bold transition-all shadow"
                >
                  Yes, Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Play;
