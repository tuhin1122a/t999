import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "rk444_secret_key_t999_app";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authorization header missing or invalid" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: decoded.sub },
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
        { success: false, error: "Your account has been banned by the administrator." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name || "Pro User",
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
