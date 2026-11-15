// Admin Banner Management API
// GET    /api/admin/banners - list all banners (public read)
// POST   /api/admin/banners - create a new banner (admin protected)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Verifies that the caller holds a valid Admin token or internal secret.
 */
async function isAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  const adminSecretHeader = req.headers.get("x-admin-secret");
  const envSecret = process.env.AUTH_SECRET || process.env.ADMIN_SECRET;

  if (envSecret && adminSecretHeader === envSecret) {
    return true;
  }

  if (!authHeader) return false;

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return false;

  if (envSecret && token === envSecret) {
    return true;
  }

  const admin = await prisma.admin
    .findFirst({
      where: { id: token, isActive: true },
    })
    .catch(() => null);

  return admin !== null;
}

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ success: true, banners });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { imageUrl, title, linkUrl, isActive, sortOrder } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "imageUrl is required" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        imageUrl,
        title: title || null,
        linkUrl: linkUrl || null,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ success: true, banner });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create banner" },
      { status: 500 }
    );
  }
}
