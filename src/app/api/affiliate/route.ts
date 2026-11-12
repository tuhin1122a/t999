import { NextResponse } from "next/server";
import { findCurrentUser } from "@/data/user";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Get affiliate information for the current user
export async function GET() {
  try {
    const user = await findCurrentUser();

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        isAffiliate: false,
        message: "User is not logged in",
      });
    }

    const affiliate = await db.affiliate.findUnique({
      where: { userId: user.id },
      include: {
        referrals: {
          include: {
            referredUser: {
              select: {
                id: true,
                name: true,
                phone: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        commissions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        payouts: {
          orderBy: { requestedAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            referrals: true,
            commissions: true,
            clicks: true,
          },
        },
      },
    });

    if (!affiliate) {
      return NextResponse.json({
        authenticated: true,
        isAffiliate: false,
        message: "User is not registered as an affiliate partner",
      });
    }

    const stats = {
      totalReferrals: affiliate._count.referrals,
      totalCommissions: affiliate._count.commissions,
      totalClicks: affiliate._count.clicks,
      totalEarnings: Number(affiliate.totalEarnings || 0),
      pendingEarnings: Number(affiliate.pendingEarnings || 0),
      activeReferrals: affiliate.activeReferrals,
      commissionRate: Number(affiliate.commissionRate || 0.05),
      tier: affiliate.tier,
    };

    return NextResponse.json({
      authenticated: true,
      isAffiliate: true,
      affiliate: {
        id: affiliate.id,
        affiliateCode: affiliate.affiliateCode,
        isActive: affiliate.isActive,
        createdAt: affiliate.createdAt,
        ...stats,
      },
      referrals: affiliate.referrals.map((ref) => ({
        ...ref,
        firstDepositAmount: ref.firstDepositAmount ? Number(ref.firstDepositAmount) : null,
        totalDeposits: Number(ref.totalDeposits || 0),
        totalBets: Number(ref.totalBets || 0),
      })),
      recentCommissions: affiliate.commissions.map((comm) => ({
        ...comm,
        amount: Number(comm.amount || 0),
        sourceAmount: Number(comm.sourceAmount || 0),
        commissionRate: Number(comm.commissionRate || 0),
      })),
      recentPayouts: affiliate.payouts.map((p) => ({
        ...p,
        amount: Number(p.amount || 0),
      })),
    });
  } catch (error) {
    console.error("[AFFILIATE_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Register as affiliate or update affiliate info
export async function POST() {
  try {
    const user = await findCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is already an affiliate
    const existingAffiliate = await db.affiliate.findUnique({
      where: { userId: user.id },
    });

    if (existingAffiliate) {
      return NextResponse.json({
        success: true,
        isAffiliate: true,
        message: "You are already an active affiliate partner!",
        affiliate: existingAffiliate,
      });
    }

    // Generate unique affiliate code
    const generateAffiliateCode = async (): Promise<string> => {
      const code = `AFF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const existing = await db.affiliate.findUnique({
        where: { affiliateCode: code },
      });
      return existing ? generateAffiliateCode() : code;
    };

    const affiliateCode = await generateAffiliateCode();

    // Create new affiliate in database
    const newAffiliate = await db.affiliate.create({
      data: {
        userId: user.id,
        affiliateCode,
        isActive: true,
        totalEarnings: 0,
        pendingEarnings: 0,
        totalReferrals: 0,
        activeReferrals: 0,
        commissionRate: 0.05, // 5% default Bronze
        tier: "BRONZE",
      },
    });

    return NextResponse.json({
      success: true,
      isAffiliate: true,
      message: "Congratulations! You are now an official RK444 Affiliate Partner.",
      affiliate: newAffiliate,
    });
  } catch (error) {
    console.error("[AFFILIATE_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
