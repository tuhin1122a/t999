/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { findCurrentUser } from "@/data/user";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const referralTrackingSchema = z.object({
  affiliateCode: z.string(),
  referredUserId: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

// GET - Get affiliate referrals
export async function GET(request: NextRequest) {
  try {
    const user = await findCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    // Check if user is an affiliate
    const affiliate = await db.affiliate.findUnique({
      where: { userId: user.id },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "User is not an affiliate" },
        { status: 404 }
      );
    }

    const whereClause: any = {
      affiliateId: affiliate.id,
    };

    if (status) {
      whereClause.status = status;
    }

    const totalCount = await db.affiliateReferral.count({
      where: whereClause,
    });

    const referrals = await db.affiliateReferral.findMany({
      where: whereClause,
      include: {
        referredUser: {
          select: {
            id: true,
            name: true,
            phone: true,
            createdAt: true,
          },
        },
        commissions: {
          select: {
            amount: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json({
      success: true,
      data: {
        referrals: referrals.map((referral) => ({
          id: referral.id,
          referredUser: referral.referredUser,
          status: referral.status,
          firstDepositAmount: referral.firstDepositAmount
            ? Number(referral.firstDepositAmount)
            : null,
          firstDepositDate: referral.firstDepositDate,
          totalDeposits: Number(referral.totalDeposits || 0),
          totalBets: Number(referral.totalBets || 0),
          totalCommissions: referral.commissions.reduce(
            (sum, comm) => sum + Number(comm.amount || 0),
            0
          ),
          isActive: referral.isActive,
          createdAt: referral.createdAt,
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("[AFFILIATE_REFERRALS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Track a referral click/signup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = referralTrackingSchema.parse(body);

    const affiliate = await db.affiliate.findUnique({
      where: { affiliateCode: validatedData.affiliateCode },
    });

    if (!affiliate || !affiliate.isActive) {
      return NextResponse.json(
        { error: "Invalid or inactive affiliate code" },
        { status: 404 }
      );
    }

    const clientIp = validatedData.ipAddress || request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = validatedData.userAgent || request.headers.get("user-agent") || null;

    // Record click
    await db.affiliateClick.create({
      data: {
        affiliateId: affiliate.id,
        ipAddress: clientIp,
        userAgent: userAgent,
        landingPage: "/register",
        converted: !!validatedData.referredUserId,
        convertedUserId: validatedData.referredUserId || null,
      },
    });

    if (validatedData.referredUserId) {
      const existing = await db.affiliateReferral.findFirst({
        where: {
          affiliateId: affiliate.id,
          referredUserId: validatedData.referredUserId,
        },
      });

      if (!existing) {
        await db.affiliateReferral.create({
          data: {
            affiliateId: affiliate.id,
            referredUserId: validatedData.referredUserId,
            status: "PENDING",
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Referral tracked successfully",
    });
  } catch (error) {
    console.error("[AFFILIATE_REFERRALS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
