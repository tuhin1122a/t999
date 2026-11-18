import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const JWT_SECRET = process.env.AUTH_SECRET || "rk444_secret_key_t999_app";

function getUserIdFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string };
    return decoded?.sub || null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const messages = await db.chatMessage.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(
      { success: true, messages },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Mobile Chat API GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { content } = await req.json();
    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Message content is required" },
        { status: 400 }
      );
    }

    const newMessage = await db.chatMessage.create({
      data: {
        senderId: userId,
        receiverId: "support",
        content: content.trim(),
      },
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Mobile Chat API POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
