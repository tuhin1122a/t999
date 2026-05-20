#!/bin/sh
set -e

echo "🚀 Starting application..."

# Run database migrations and seed at startup (when DB is actually reachable)
if [ -n "$DATABASE_URL" ]; then
  echo "📦 Running Prisma db push..."
  npx prisma db push --accept-data-loss 2>&1 || echo "⚠️ Prisma db push failed (may already be up to date)"

  echo "🌱 Running Prisma db seed..."
  npx prisma db seed 2>&1 || echo "⚠️ Prisma db seed failed (may already be seeded)"
fi

echo "✅ Starting Next.js server..."
exec node server.js
