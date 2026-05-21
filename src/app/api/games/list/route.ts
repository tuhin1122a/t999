import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await request.json();
    // Return no dummy/mock games. The real game list should come from GameXA or SoftAPI.
    // This endpoint intentionally returns an empty games list to avoid showing placeholders.
    const gamesList: Record<string, unknown[]> = {};

    return NextResponse.json({ success: true, gamesList });
  } catch (error) {
    console.error("Error fetching games list:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch games list",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
