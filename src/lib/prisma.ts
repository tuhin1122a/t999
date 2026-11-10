// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const SUPABASE_FALLBACK_URL =
  "postgresql://postgres.xcfditzqdvgwhcmdcztm:Tuhin%40Akhi1122@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

const rawUrl = process.env.DATABASE_URL;
const effectiveDatabaseUrl =
  !rawUrl || rawUrl.includes("localhost") || rawUrl.includes("127.0.0.1")
    ? SUPABASE_FALLBACK_URL
    : rawUrl;

declare global {
  // Prevent multiple instances in development
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: effectiveDatabaseUrl,
      },
    },
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
