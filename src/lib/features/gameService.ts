// src/lib/features/gameService.ts
export interface PlayerData {
  username?: string;
  password?: string;
  currency?: string;
  language?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  full_name?: string;
}

// ==================== Player Management ====================
export const createPlayer = async (playerData: PlayerData): Promise<any> => {
  const playerId =
    playerData?.phone ||
    playerData?.username ||
    (playerData?.email ? playerData.email.split("@")[0] : null) ||
    `LOCAL_PLAYER_${Date.now()}`;

  return {
    success: true,
    player_id: playerId,
    player: { id: playerId },
  };
};

// ==================== Launch SoftAPI Game ====================
export const launchSoftAPIGameService = async (game_id: string) => {
  try {
    console.log("Launching SoftAPI game with game_id:", game_id);
    const res = await fetch("/api/softapi/launch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: game_id }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      let parsedError: any = null;
      try {
        parsedError = JSON.parse(errorText);
      } catch {
        parsedError = null;
      }

      const nestedRaw = parsedError?.raw
        ? typeof parsedError.raw === "string"
          ? (() => {
              try {
                return JSON.parse(parsedError.raw);
              } catch {
                return null;
              }
            })()
          : parsedError.raw
        : null;

      const message =
        parsedError?.error ||
        parsedError?.msg ||
        nestedRaw?.msg ||
        nestedRaw?.message ||
        errorText;

      console.error(
        "Launch SoftAPI game HTTP error:",
        res.status,
        message,
        "raw:",
        errorText
      );
      throw new Error("This game is currently under maintenance. Please try another game or check back shortly.");
    }

    const data = await res.json();
    console.log("🎯 launchSoftAPIGame response:", data);

    return data;
  } catch (error: any) {
    console.error("Launch SoftAPI game error:", error);
    throw new Error(
      error?.message?.includes("maintenance") || error?.message?.includes("under maintenance")
        ? error.message
        : "This game is currently under maintenance. Please try another game or check back shortly."
    );
  }
};

// ==================== Launch Game ====================
export const launchGameService = async (_player_id: string, game_id: string) =>
  launchSoftAPIGameService(game_id);

// ==================== Helper ====================
export const isGameXAGameCheck = () => false;

// ==================== Launch Game from any API ====================
export const launchGameFromAnyAPI = async (
  gameId: string,
  playerId: string,
  _openGame?: unknown
) => {
  console.log("launchGameFromAnyAPI called with:", { gameId, playerId });

  if (!gameId?.trim()) throw new Error("Game ID is required to launch a game");

  try {
    console.log("Attempting to launch via SoftAPI with gameId:", gameId);
    const softApiResponse = await launchSoftAPIGameService(gameId);

    if (softApiResponse && softApiResponse.success && softApiResponse.game_launch_url) {
      return {
        success: true,
        game_launch_url: softApiResponse.game_launch_url,
        content: {
          game: {
            url: softApiResponse.game_launch_url,
            iframe: "1",
            sessionId: softApiResponse.session_id,
          },
        },
      };
    }

    const launchError =
      softApiResponse?.error ||
      softApiResponse?.msg ||
      softApiResponse?.message ||
      "This game is currently under maintenance. Please try another game or check back shortly.";
    throw new Error(launchError);
  } catch (error: any) {
    console.error("Error launching game:", error);
    throw new Error(
      error?.message?.includes("maintenance") || error?.message?.includes("under maintenance")
        ? error.message
        : "This game is currently under maintenance. Please try another game or check back shortly."
    );
  }
};
