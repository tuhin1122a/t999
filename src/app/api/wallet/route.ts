import { findCurrentUser } from "@/data/user";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { db } from "@/lib/db";
import { verifyActiveUserSession } from "@/lib/activeSession";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = async (req: NextRequest) => {
  try {
    const user = await findCurrentUser();

    if (!user) {
      return Response.json({ error: "Authentication Failed" }, { status: 401 });
    }

    // Extract user ID from the session object
    const userId = user.id || (user as any)?.sub;
    
    if (!userId) {
      return Response.json({ error: "User ID is missing" }, { status: 500 });
    }

    const sessionId = (user as any)?.sessionId || null;
    const gameSessionId = req.nextUrl.searchParams.get("gameSessionId") || null;

    const sessionCheck = await verifyActiveUserSession(
      userId,
      sessionId,
      gameSessionId
    );
    if (!sessionCheck.valid) {
      return Response.json(
        {
          error: "Your account was logged in on another device.",
          code: sessionCheck.reason || "SESSION_REPLACED",
        },
        { status: 401 }
      );
    }

    const wallet = await db.wallet.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!wallet) {
      return Response.json({ error: "Wallet not found" }, { status: 404 });
    }

    return Response.json({ payload: wallet }, { status: 200 });
  } catch (error){
    console.error("Wallet error:", error);
    return Response.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
};
