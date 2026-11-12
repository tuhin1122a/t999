// src/app/api/softapi/providers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getActiveMergedProviders } from "@/lib/gameCatalog";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const refresh = new URL(req.url).searchParams.get("refresh") === "1";
    const providers = await getActiveMergedProviders(refresh);

    return NextResponse.json(
      {
        status: true,
        success: true,
        total: providers.length,
        total_games: providers.length,
        providers,
        games: providers,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    console.error("[SoftAPI] Providers Error:", error);
    return NextResponse.json(
      {
        status: false,
        success: false,
        error: message,
        providers: [],
        games: [],
      },
      { status: 500 }
    );
  }
}
