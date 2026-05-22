"use client";

import AppHeader from "@/components/AppHeader";
import TabNav from "@/components/TabNav";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import useGetCurrentUser from "@/hook/useCurrentUser";
import { createPlayer, launchGameFromAnyAPI } from "@/lib/features/gameService";
import { useOpenGameMutation } from "@/lib/features/gamesApiSlice";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const Play = () => {
  const [openGame] = useOpenGameMutation();

  const [isIframeLoading, setIsLoading] = useState(true);
  const [iframe, setIframe] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get("gameId") || "";

  const user = useGetCurrentUser();

  const balanceValue = Number(
    (user as any)?.wallet?.balance ?? (user as any)?.balance ?? 0
  ).toFixed(2);

  // -------- PLAYER ----------
  const getPlayerId = async (user: any) => {
    if (!user) return null;

    if (user.gameXAPlayerId) return user.gameXAPlayerId;

    const player = await createPlayer({
      username: user.phone || `user_${Date.now()}`,
      email: user.email || `${user.phone}@rk444.com`,
      full_name: user.name || `Guest ${Date.now()}`,
      phone: user.phone || "",
      password: "StrongPassword123!",
      currency: "IDR",
      language: "en",
    });

    return (
      player.player_id?.toString() ||
      player.player?.id?.toString() ||
      player.id?.toString()
    );
  };

  // -------- LAUNCH GAME ----------
  useEffect(() => {
    if (!user || !gameId) return;

    const launch = async () => {
      try {
        setIsLoading(true);

        const playerId = await getPlayerId(user);

        const res = await launchGameFromAnyAPI(
          gameId,
          playerId,
          openGame
        );

        const url =
          res?.content?.game?.url || res?.game_launch_url;

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
  }, [gameId, user, openGame]);

  return (
    <div className="w-full h-[100dvh] bg-black flex flex-col overflow-hidden">

      {/* HEADER */}
      <AppHeader balance={balanceValue} />

      {/* GAME AREA (FULL FIT FIX) */}
      <div className="flex-1 relative bg-black overflow-hidden">

        {/* {isIframeLoading && !error && <GameOpeningLoader />} */}

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
                <h2 className="text-xl font-bold">Error</h2>
                <p className="text-sm">{errorMessage}</p>
              </div>

              <div className="p-4 flex justify-end">
                <Link href="/">
                  <SecondaryButton>Go Home</SecondaryButton>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAV (always safe) */}
      <div className="md:hidden relative z-50">
        <TabNav />
      </div>

    </div>
  );
};

export default Play;