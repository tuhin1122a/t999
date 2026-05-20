// src/app/api/softapi/providers/route.ts
// Fetches all game providers (brands) from igamingapis.com
import { NextResponse } from "next/server";

const IGAMING_BASE = "https://igamingapis.com/provider";

export async function GET() {
  try {
    const res = await fetch(`${IGAMING_BASE}/`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch providers" },
        { status: 502 }
      );
    }

    const data = await res.json();

    return NextResponse.json(
      {
        success: true,
        total: data.total_games,
        providers: data.games || [],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("SoftAPI Providers Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
