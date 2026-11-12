import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const code = new URL(req.url).searchParams.get("code")?.trim();
    if (!code) {
      return NextResponse.json({ success: true, valid: false }, { status: 200 });
    }

    const agent = await db.admin.findFirst({
      where: {
        role: "SUBADMIN",
        isActive: true,
        agentCode: {
          equals: code,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        agentCode: true,
      },
    });

    if (!agent) {
      return NextResponse.json({ success: true, valid: false }, { status: 200 });
    }

    return NextResponse.json(
      {
        success: true,
        valid: true,
        agent: {
          name: agent.name,
          agentCode: agent.agentCode,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SubAdmin Resolve Error]:", error);
    return NextResponse.json(
      { success: false, valid: false },
      { status: 200 }
    );
  }
}

