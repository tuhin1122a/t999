// src/app/api/notifications/route.ts
import { createNotification } from "@/action/notifications";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Notifications API
 * Security: Enforces strict session ownership so a user can only read or create
 * notifications belonging to their own authenticated account.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestedUserId = searchParams.get("userId") || session.user.id;

  // Prevent IDOR: User cannot query another user's notifications
  if (requestedUserId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

  try {
    const skip = (page - 1) * limit;

    const [notifications, totalCount] = await Promise.all([
      db.notification.findMany({
        where: { userId: session.user.id },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.notification.count({ where: { userId: session.user.id } }),
    ]);

    return NextResponse.json({
      notifications: notifications || [],
      totalCount: totalCount || 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

const notificationSchema = z.object({
  userId: z.string().optional(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  icon: z.enum(["MONEY", "BELL", "TROPHY", "WARNING", "INFO"]).optional(),
  metadata: z.any().optional(),
});

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validation = notificationSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors },
      { status: 400 }
    );
  }

  // Always scope to authenticated session user ID to prevent spoofing notifications to others
  const result = await createNotification({
    ...validation.data,
    userId: session.user.id,
  });

  if (result && !result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result.notification);
}
