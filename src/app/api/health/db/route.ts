import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const start = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    const tables = await db.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;
    const tablesCount = Number(tables?.[0]?.count ?? 0);
    const latencyMs = Date.now() - start;

    return NextResponse.json(
      {
        ok: true,
        status: "healthy",
        database: "connected",
        tablesCount,
        latencyMs,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        status: "unhealthy",
        database: "disconnected",
        error: error?.code || error?.message || "Database connection check failed",
        latencyMs: Date.now() - start,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
