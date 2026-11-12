import { NextResponse } from "next/server";
import { findCurrentUser } from "@/data/user";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Get affiliate analytics and statistics
export async function GET() {
  try {
    const user = await findCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
            commissions: {
              select: {
                amount: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        commissions: {
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
        clicks: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "User is not an affiliate" },
        { status: 404 }
      );
    }

    const totalClicks = await db.affiliateClick.count({
      where: { affiliateId: affiliate.id },
    });

    const conversionRate =
      totalClicks > 0
        ? Math.round(((affiliate.totalReferrals || 0) / totalClicks) * 100 * 10) / 10
        : 0;

    const thisMonthEarnings = affiliate.commissions.reduce((sum, commission) => {
      return sum + Number(commission.amount || 0);
    }, 0);

    const clicksChart = affiliate.clicks.reduce((acc, click) => {
      const date = click.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const chartData = {
      clicks: Object.entries(clicksChart).map(([date, clicks]) => ({
        date,
        clicks,
      })),
      earnings: affiliate.commissions.map((commission) => ({
        date: commission.createdAt.toISOString().split("T")[0],
        amount: Number(commission.amount || 0),
      })),
    };

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalClicks,
          totalReferrals: affiliate.totalReferrals,
          activeReferrals: affiliate.activeReferrals,
          conversionRate,
          totalEarnings: Number(affiliate.totalEarnings || 0),
          pendingEarnings: Number(affiliate.pendingEarnings || 0),
          thisMonthEarnings,
        },
        chartData,
        topReferrals: affiliate.referrals.map((referral) => {
          const commissionsSum = referral.commissions.reduce(
            (sum, c) => sum + Number(c.amount || 0),
            0
          );
          return {
            id: referral.id,
            name: referral.referredUser.name || "Member",
            phone: referral.referredUser.phone,
            totalDeposits: Number(referral.totalDeposits || 0),
            totalCommissions: commissionsSum,
            joinDate: referral.createdAt.toISOString().split("T")[0],
            status: referral.status,
          };
        }),
      },
    });
  } catch (error) {
    console.error("[AFFILIATE_ANALYTICS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
