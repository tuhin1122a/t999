import { db } from "@/lib/db";

function generateUuid(): string {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

interface StoredActiveSession {
  sessionId: string;
  gameSessionId: string;
  platform: "web" | "app";
  updatedAt: number;
}

const KEY_PREFIX = "active_session:";

function getKey(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

export async function getActiveUserSession(
  userId: string
): Promise<StoredActiveSession | null> {
  try {
    const row = await db.siteConfig.findUnique({
      where: { key: getKey(userId) },
    });
    if (!row?.value) return null;
    return JSON.parse(row.value) as StoredActiveSession;
  } catch {
    return null;
  }
}

export async function registerActiveUserSession(
  userId: string,
  platform: "web" | "app"
): Promise<string> {
  const sessionId = generateUuid();
  const payload: StoredActiveSession = {
    sessionId,
    gameSessionId: sessionId,
    platform,
    updatedAt: Date.now(),
  };

  try {
    await db.siteConfig.upsert({
      where: { key: getKey(userId) },
      update: { value: JSON.stringify(payload) },
      create: { key: getKey(userId), value: JSON.stringify(payload) },
    });
  } catch (err) {
    console.error("[activeSession] Failed to save user session:", err);
  }

  return sessionId;
}

export async function registerActiveGameSession(
  userId: string,
  sessionId?: string | null,
  platform: "web" | "app" = "web"
): Promise<{ allowed: boolean; gameSessionId: string; reason?: string }> {
  const existing = await getActiveUserSession(userId);

  if (existing && sessionId && existing.sessionId && existing.sessionId !== sessionId) {
    return {
      allowed: false,
      gameSessionId: "",
      reason: "SESSION_REPLACED",
    };
  }

  const gameSessionId = generateUuid();
  const nextPayload: StoredActiveSession = {
    sessionId: existing?.sessionId || sessionId || gameSessionId,
    gameSessionId,
    platform: existing?.platform || platform,
    updatedAt: Date.now(),
  };

  try {
    await db.siteConfig.upsert({
      where: { key: getKey(userId) },
      update: { value: JSON.stringify(nextPayload) },
      create: { key: getKey(userId), value: JSON.stringify(nextPayload) },
    });
  } catch (err) {
    console.error("[activeSession] Failed to save game session:", err);
  }

  return { allowed: true, gameSessionId };
}

export async function verifyActiveUserSession(
  userId: string,
  sessionId?: string | null,
  gameSessionId?: string | null
): Promise<{ valid: boolean; reason?: string }> {
  const existing = await getActiveUserSession(userId);
  if (!existing) {
    return { valid: true };
  }

  if (sessionId && existing.sessionId && existing.sessionId !== sessionId) {
    return { valid: false, reason: "SESSION_REPLACED" };
  }

  if (
    gameSessionId &&
    existing.gameSessionId &&
    existing.gameSessionId !== gameSessionId
  ) {
    return { valid: false, reason: "GAME_OPENED_ELSEWHERE" };
  }

  return { valid: true };
}
