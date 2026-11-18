import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyActiveUserSession } from "@/lib/activeSession";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.AUTH_SECRET || "rk444_secret_key_t999_app";

function getDecodedAuthFromRequest(
  req: NextRequest
): { userId: string; sid?: string } | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      sub?: string;
      sid?: string;
    };
    if (!decoded?.sub) return null;
    return { userId: decoded.sub, sid: decoded.sid };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const authInfo = getDecodedAuthFromRequest(req);
    if (!authInfo?.userId) {
      return NextResponse.json(
        { success: false, error: "Authorization header missing or invalid" },
        { status: 401 }
      );
    }

    const { userId, sid } = authInfo;
    const gameSessionId = req.nextUrl.searchParams.get("gameSessionId") || null;

    const sessionCheck = await verifyActiveUserSession(
      userId,
      sid,
      gameSessionId
    );
    if (!sessionCheck.valid) {
      return NextResponse.json(
        {
          success: false,
          code: sessionCheck.reason || "SESSION_REPLACED",
          error: "Your account was logged in on another device.",
        },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        bettingRecord: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        {
          success: false,
          error: "Your account has been banned by the administrator.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        playerId: user.playerId,
        phone: user.phone,
        name: user.name || "Pro User",
        facebook: user.facebook || "",
        createdAt: user.createdAt,
        balance: user.wallet ? Number(user.wallet.balance) : 0,
        isBanned: user.isBanned,
        turnOver: user.wallet ? Number(user.wallet.turnOver) : 0,
        totalBet: user.bettingRecord ? Number(user.bettingRecord.totalBet) : 0,
        totalWin: user.bettingRecord ? Number(user.bettingRecord.totalWin) : 0,
      },
    });
  } catch (error: any) {
    console.error("Mobile GetMe Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authInfo = getDecodedAuthFromRequest(req);
    const userId = authInfo?.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { name, facebook, currentPassword, newPassword } = body;

    const updateData: Record<string, any> = {};
    if (typeof name === "string" && name.trim()) {
      updateData.name = name.trim();
    }
    if (typeof facebook === "string") {
      updateData.facebook = facebook.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: "Please enter your current password" },
          { status: 400 }
        );
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, error: "Current password is incorrect" },
          { status: 400 }
        );
      }
      if (String(newPassword).length < 6) {
        return NextResponse.json(
          {
            success: false,
            error: "New password must be at least 6 characters",
          },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(String(newPassword), 10);
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        wallet: true,
        bettingRecord: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully!",
      user: {
        id: updated.id,
        playerId: updated.playerId,
        phone: updated.phone,
        name: updated.name || "Pro User",
        facebook: updated.facebook || "",
        createdAt: updated.createdAt,
        balance: updated.wallet ? Number(updated.wallet.balance) : 0,
        isBanned: updated.isBanned,
        turnOver: updated.wallet ? Number(updated.wallet.turnOver) : 0,
        totalBet: updated.bettingRecord
          ? Number(updated.bettingRecord.totalBet)
          : 0,
        totalWin: updated.bettingRecord
          ? Number(updated.bettingRecord.totalWin)
          : 0,
      },
    });
  } catch (error: any) {
    console.error("Mobile UpdateMe Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
