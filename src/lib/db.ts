import { PrismaClient } from "@prisma/client";

const SUPABASE_FALLBACK_URL =
  "postgresql://postgres.xcfditzqdvgwhcmdcztm:Tuhin%40Akhi1122@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

function resolveValidDatabaseUrl(raw?: string): string {
  if (!raw) return SUPABASE_FALLBACK_URL;
  const cleaned = raw
    .trim()
    .replace(/^DATABASE_URL\s*=\s*/i, "")
    .replace(/^["']+|["']+$/g, "")
    .trim();

  if (
    (!cleaned.startsWith("postgresql://") && !cleaned.startsWith("postgres://")) ||
    cleaned.includes("localhost") ||
    cleaned.includes("127.0.0.1")
  ) {
    return SUPABASE_FALLBACK_URL;
  }
  return cleaned;
}

const effectiveDatabaseUrl = resolveValidDatabaseUrl(process.env.DATABASE_URL);
process.env.DATABASE_URL = effectiveDatabaseUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: effectiveDatabaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
