import { NextResponse } from "next/server";
import { getCuratedHotGames } from "@/lib/gameCatalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const games = await getCuratedHotGames();
    return NextResponse.json(
      {
        success: true,
        total: games.length,
        games,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load hot games";
    console.error("GET /api/games/hot error:", error);
    return NextResponse.json(
      {
        success: false,
        error: message,
        games: [],
      },
      { status: 500 }
    );
  }
}

