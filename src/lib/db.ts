import { PrismaClient } from "@prisma/client";

const SUPABASE_FALLBACK_URL =
  "postgresql://postgres.xcfditzqdvgwhcmdcztm:Tuhin%40Akhi1122@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

const rawUrl = process.env.DATABASE_URL;
const effectiveDatabaseUrl =
  !rawUrl || rawUrl.includes("localhost") || rawUrl.includes("127.0.0.1")
    ? SUPABASE_FALLBACK_URL
    : rawUrl;

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
