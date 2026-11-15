// PATCH  /api/admin/banners/[id] - update a banner (admin protected)
// DELETE /api/admin/banners/[id] - delete a banner (admin protected)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { imageUrl, title, linkUrl, isActive, sortOrder } = body;

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...(imageUrl !== undefined && { imageUrl }),
        ...(title !== undefined && { title }),
        ...(linkUrl !== undefined && { linkUrl }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json({ success: true, banner });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update banner" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await prisma.banner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete banner" },
      { status: 500 }
    );
  }
}
