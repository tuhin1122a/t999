export interface PlayerData {
  username?: string;
  password?: string;
  currency?: string;
  language?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

// ==================== Player Management ====================
export const createPlayer = async (playerData: PlayerData) => {
  const playerId =
    playerData?.phone ||
    playerData?.username ||
    (playerData?.email ? playerData.email.split("@")[0] : null) ||
    `LOCAL_PLAYER_${Date.now()}`;

  console.log("Bypassing GameXA player creation. Returning local playerId:", playerId);

  return {
    success: true,
    player_id: playerId,
    player: { id: playerId },
  };
};

// ==================== Launch Game ====================
export const launchGameService = async (_player_id: string, game_id: string) => {
  try {
    console.log("Launching game via SoftAPI with game_id:", game_id);
    const res = await fetch("/api/softapi/launch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: game_id }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Launch game HTTP error:", res.status, errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log("🎯 launchGame response:", data);

    return data;
  } catch (error) {
    console.error("Launch game error:", error);
    throw error;
  }
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
      console.error("Launch SoftAPI game HTTP error:", res.status, errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log("🎯 launchSoftAPIGame response:", data);

    return data;
  } catch (error) {
    console.error("Launch SoftAPI game error:", error);
    throw error;
  }
};

// ==================== Helper ====================
export const isGameXAGameCheck = () => false;

// ==================== Launch Game from any API ====================
export const launchGameFromAnyAPI = async (
  gameId: string,
  playerId: string
) => {
  console.log("launchGameFromAnyAPI called with:", { gameId, playerId });

  if (!gameId?.trim()) throw new Error("Game ID is required to launch a game");
  if (!playerId?.trim()) throw new Error("Player ID is required to launch a game");

  try {
    console.log("Attempting to launch via SoftAPI with gameId:", gameId);
    const softApiResponse = await launchSoftAPIGameService(gameId);

    if (softApiResponse && softApiResponse.success && softApiResponse.game_launch_url) {
      return {
        content: {
          game: {
            url: softApiResponse.game_launch_url,
            iframe: "1",
            sessionId: softApiResponse.session_id,
          },
        },
      };
    }

    throw new Error("SoftAPI launch failed. No fallback route is configured.");
  } catch (error) {
    console.error("Error launching game:", error);
    throw error;
  }
};
