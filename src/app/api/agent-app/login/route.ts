import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signAgentToken } from "@/lib/agentAutoDeposit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const admin = await db.admin.findFirst({
      where: {
        email: { equals: email, mode: "insensitive" },
      },
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { success: false, error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Invalid password" },
        { status: 401 }
      );
    }

    const token = signAgentToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err: any) {
    console.error("[agent-app/login] Error:", err);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
