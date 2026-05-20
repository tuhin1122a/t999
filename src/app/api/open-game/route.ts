// src/app/api/open-game/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: "GameXA integration is disabled. Please launch games via SoftAPI." },
    { status: 400 }
  );
}
