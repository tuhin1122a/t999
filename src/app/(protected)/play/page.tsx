"use client";

import AppHeader from "@/components/AppHeader";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import useGetCurrentUser from "@/hook/useCurrentUser";
import {
  createPlayer,
  launchGameFromAnyAPI,
} from "@/lib/features/gameService";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiChevronDown, FiX } from "react-icons/fi";

const Play = () => {
  const [isIframeLoading, setIsLoading] = useState(true);
  const [iframe, setIframe] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [displayBalance, setDisplayBalance] = useState<string | null>(null);

  // HEADER STATE
  const [showHeader, setShowHeader] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const searchParams = useSearchParams();
  const gameId = searchParams.get("gameId") || "";

  const user = useGetCurrentUser();

  const walletBalance = Number(
    (user as any)?.wallet?.balance ??
      (user as any)?.balance ??
      0
  ).toFixed(2);

  const balanceValue = displayBalance ?? walletBalance;

  // Periodic balance refresh from local wallet (updated via SoftAPI callback webhook)
  useEffect(() => {
    if (!iframe) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/wallet");
        if (res.ok) {
          const data = await res.json();
          if (data?.payload?.balance !== undefined) {
            setDisplayBalance(Number(data.payload.balance).toFixed(2));
          }
        }
      } catch {
        // ignore
      }
    }, 15_000);
    return () => clearInterval(interval);
  }, [iframe]);

  // -------- PLAYER ----------
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

  // -------- LAUNCH GAME ----------
  useEffect(() => {
    if (!user || !gameId) return;

    const launch = async () => {
      try {
        setIsLoading(true);

        const playerId = await getPlayerId(user);

        const res = await launchGameFromAnyAPI(gameId, playerId ?? "");

        const url =
          res?.content?.game?.url ||
          res?.game_launch_url;

        if (!url) throw new Error("Game URL missing");

        setIframe(url);
      } catch (err: any) {
        toast.error(err.message || "Game failed");
        setError(true);
        setErrorMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    launch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, user]);

  return (
    <div className="w-full h-[100dvh] bg-black overflow-hidden relative">

      {/* HEADER */}
      <div
        className={`absolute top-0 left-0 w-full z-50 transition-all duration-300 ${
          showHeader
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        <div className="relative">
          <AppHeader title={`৳ ${balanceValue}`} />

          {/* CLOSE BUTTON */}
          <button
            onClick={() => setShowHeader(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2
            z-[60] bg-black/50 text-white rounded-full p-2"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* SMALL TOP ARROW */}
      {!showHeader && (
        <button
          onClick={() => setShowHeader(true)}
          className="absolute top-0 left-1/2 -translate-x-1/2
          z-[60] w-[72px] h-[28px]
          bg-gray-500/80 rounded-b-xl
          flex items-center justify-center
          backdrop-blur-md"
        >
          <FiChevronDown
            size={20}
            className="text-white"
          />
        </button>
      )}

      {/* GAME AREA */}
      <div className="w-full h-full relative bg-black">

        {!error && iframe && (
          <iframe
            ref={iframeRef}
            src={iframe}
            className="absolute inset-0 w-full h-full border-0 bg-black"
            onLoad={() => setIsLoading(false)}
            allowFullScreen
          />
        )}

        {/* ERROR */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#006165]">
            <div className="w-[300px] bg-white rounded-xl overflow-hidden">
              <div className="bg-red-500 p-4 text-white">
                <h2 className="text-xl font-bold">
                  Error
                </h2>

                <p className="text-sm">
                  {errorMessage}
                </p>
              </div>

              <div className="p-4 flex justify-end">
                <Link href="/">
                  <SecondaryButton>
                    Go Home
                  </SecondaryButton>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Play;
