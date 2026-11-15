import { NextRequest } from "next/server";
import { db } from "@/lib/db";

/**
 * Verifies admin authorization before reading or syncing user player IDs.
 * Prevents unauthenticated enumeration of user phone numbers and player IDs.
 */
async function verifyAdminAuth(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  const adminSecretHeader = req.headers.get("x-admin-secret");
  const envSecret = process.env.AUTH_SECRET || process.env.ADMIN_SECRET;

  if (envSecret && adminSecretHeader === envSecret) return true;
  if (!authHeader) return false;

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return false;
  if (envSecret && token === envSecret) return true;

  const admin = await db.admin
    .findFirst({ where: { id: token, isActive: true } })
    .catch(() => null);
  return admin !== null;
}

export async function POST(req: NextRequest) {
  try {
    if (!(await verifyAdminAuth(req))) {
      return Response.json(
        { success: false, error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const allUsers = await db.user.findMany({
      select: {
        id: true,
        phone: true,
        playerId: true,
        gameXAPlayerId: true,
      },
    });

    const usersWithMismatchedIds = allUsers.filter(
      (user) => !user.gameXAPlayerId || user.playerId !== user.gameXAPlayerId
    );

    const syncResults = [];

    for (const user of usersWithMismatchedIds) {
      try {
        const correctId = user.gameXAPlayerId || user.playerId;

        await db.user.update({
          where: { id: user.id },
          data: {
            playerId: correctId,
            gameXAPlayerId: correctId,
          },
        });

        syncResults.push({
          userId: user.id,
          oldPlayerId: user.playerId,
          oldGameXAPlayerId: user.gameXAPlayerId,
          newId: correctId,
          status: "synced",
        });
      } catch (error) {
        syncResults.push({
          userId: user.id,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return Response.json({
      success: true,
      message: `Processed ${usersWithMismatchedIds.length} users`,
      results: syncResults,
      summary: {
        total: usersWithMismatchedIds.length,
        synced: syncResults.filter((r) => r.status === "synced").length,
        failed: syncResults.filter((r) => r.status === "failed").length,
      },
    });
  } catch (error) {
    console.error("Sync player IDs error:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!(await verifyAdminAuth(req))) {
      return Response.json(
        { success: false, error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const allUsers = await db.user.findMany({
      select: {
        id: true,
        playerId: true,
        gameXAPlayerId: true,
      },
    });

    const usersWithMismatchedIds = allUsers.filter(
      (user) => !user.gameXAPlayerId || user.playerId !== user.gameXAPlayerId
    );

    return Response.json({
      success: true,
      message: `Found ${usersWithMismatchedIds.length} users with mismatched player IDs`,
      count: usersWithMismatchedIds.length,
    });
  } catch (error) {
    console.error("Check player IDs error:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
