#!/bin/sh
set -e

echo "🚀 Starting application..."

# Apply Prisma schema safely (non-destructive) when DATABASE_URL is present
if [ -n "$DATABASE_URL" ]; then
  echo "📦 Synchronizing Prisma schema with PostgreSQL..."
  npx prisma db push --skip-generate 2>&1 || echo "⚠️ Prisma db push warning (continuing startup)"

  if [ "$RUN_DB_SEED" = "true" ]; then
    echo "🌱 Running Prisma db seed..."
    npx prisma db seed 2>&1 || echo "⚠️ Prisma db seed warning"
  fi
fi

echo "✅ Starting Next.js server..."
exec node server.js
