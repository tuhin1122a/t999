import { findCurrentUser } from "@/data/user";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await findCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    const messages = await db.chatMessage.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("Chat API GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await findCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    const { content } = await req.json();
    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const newMessage = await db.chatMessage.create({
      data: {
        senderId: user.id,
        receiverId: "support",
        content: content.trim(),
      },
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Chat API POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
