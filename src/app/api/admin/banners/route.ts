// Admin Banner Management API
// GET    /api/admin/banners - list all banners
// POST   /api/admin/banners - create a new banner
// PATCH  /api/admin/banners - update sortOrder of banners (reorder)

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper: verify admin session (basic check using admin cookie/token)
async function isAdmin(req: NextRequest): Promise<boolean> {
  // Check for session cookie or Authorization header
  const authHeader = req.headers.get('authorization');
  // For now, check if admin session cookie exists via the admin endpoint
  // Admin dashboard uses next-auth or similar session
  // We'll use a simple check: if the request comes with a valid admin token
  // that matches an Admin record in the database
  if (!authHeader) return false;
  
  const token = authHeader.replace('Bearer ', '');
  const admin = await prisma.admin.findFirst({
    where: { sessionToken: token } as any,
  }).catch(() => null);
  
  // If no session-based admin found, allow if session cookie is present
  // (admin dashboard calls this from server-side Next.js)
  return admin !== null;
}

export async function GET(req: NextRequest) {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, banners });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch banners' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, title, linkUrl, isActive, sortOrder } = body;

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: 'imageUrl is required' }, { status: 400 });
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
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create banner' }, { status: 500 });
  }
}
