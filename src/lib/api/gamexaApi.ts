// src/lib/api/gamexaApi.ts

export const GAMEXA_ENABLED = false;

// ==================== Interfaces ====================
export interface GameXAAuthResponse {
  token: string;
  agent: {
    id: number;
    agent_code: string;
    name: string;
    email: string;
    role: string;
    balance: number;
  };
}

export interface GameXAGame {
  id: number;
  game_uid: string;
  game_name: string;
  provider_id: number;
  game_type: string;
  status: string;
  image_url: string;
  min_bet: number;
  max_bet: number;
  rtp: number;
  volatility: string;
  provider_code: string;
  provider_name: string;
  provider_logo: string;
  created_at: string;
  updated_at: string;
}

export interface GameXAGamesResponse {
  success: boolean;
  games: GameXAGame[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    search: string | null;
    provider: string | null;
    type: string | null;
    status: string;
  };
}

export interface GameXALaunchResponse {
  success: boolean;
  game_launch_url: string;
  session_id: string;
}

export interface AppGameFormat {
  id: string;
  name: string;
  img: string;
  device: string;
  title: string;
  categories: string;
  bm: string;
  demo: string;
  rewriterule: string;
  exitButton: string;
}

const mockGameXAGamesResponse: GameXAGamesResponse = {
  success: true,
  games: [],
  pagination: {
    page: 1,
    limit: 100,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  },
  filters: {
    search: null,
    provider: null,
    type: null,
    status: "active",
  },
};

// ==================== Auth ====================
export async function loginToGameXA(): Promise<string> {
  return "MOCK_GAMEXA_TOKEN";
}

// ==================== Games ====================
export async function fetchAllGames(params: { search?: string } = {}): Promise<GameXAGamesResponse> {
  return mockGameXAGamesResponse;
}

export function convertGameXAToAppFormat(gamexaGames: GameXAGamesResponse): AppGameFormat[] {
  return [];
}

// ==================== Player Management ====================
export async function createPlayer(data: {
  username: string;
  email?: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  phone: string;
  password: string;
  currency?: string;
}) {
  const playerId = data.phone || data.username || `LOCAL_PLAYER_${Date.now()}`;
  return { success: true, player_id: playerId, player: { id: playerId } };
}

export async function getAllPlayers(query?: { page?: number; limit?: number; search?: string; status?: string }) {
  return { success: true, data: [] };
}

// ==================== Transactions ====================
export async function depositToPlayer(playerId: string, amount: number, referenceId: string) {
  return { success: true, status: "SKIPPED", player_id: playerId, amount, reference_id: referenceId };
}

export async function withdrawFromPlayer(playerId: string, amount: number) {
  return { success: true, status: "SKIPPED", player_id: playerId, amount };
}

// ==================== Converter ====================
export function convertBDTToIDR(amount: number): number {
  return amount * 230; // Mock rate
}

// ==================== Game Launch ====================
export async function launchGame(playerId: string, gameUid: string, lobbyUrl?: string) {
  return {
    success: true,
    game_launch_url: "",
    session_id: Date.now().toString(),
    message: "GameXA disabled. No launch URL available."
  };
}
