import { NextRequest, NextResponse } from "next/server";
import { findCurrentUser } from "@/data/user";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Schema for payout request (in BDT)
const payoutRequestSchema = z.object({
  amount: z.number().min(500, "নূন্যতম উত্তোলনের পরিমাণ ৫০০ ৳ (Minimum payout amount is 500 BDT)"),
  paymentMethod: z.enum(["BKASH", "NAGAD", "ROCKET", "BANK_TRANSFER", "CRYPTO_USDT", "MOBILE_MONEY"]),
  paymentDetails: z.object({
    accountNumber: z.string().optional(),
    accountName: z.string().optional(),
    bankName: z.string().optional(),
    branchName: z.string().optional(),
    phoneNumber: z.string().optional(),
    walletAddress: z.string().optional(),
    notes: z.string().optional(),
  }),
});

// GET - Get affiliate payouts history
export async function GET(request: NextRequest) {
  try {
    const user = await findCurrentUser();

    if (!user) {
      return NextResponse.json(
        { authenticated: false, isAffiliate: false, message: "User not logged in" },
        { status: 401 }
      );
    }

    const affiliate = await db.affiliate.findUnique({
      where: { userId: user.id },
    });

    if (!affiliate) {
      return NextResponse.json(
        { authenticated: true, isAffiliate: false, message: "User is not an affiliate" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const status = searchParams.get("status") || undefined;

    const whereClause: any = {
      affiliateId: affiliate.id,
    };

    if (status && ["PENDING", "PROCESSING", "COMPLETED", "REJECTED", "CANCELLED"].includes(status.toUpperCase())) {
      whereClause.status = status.toUpperCase();
    }

    const [totalCount, payouts, allPayouts] = await Promise.all([
      db.affiliatePayout.count({ where: whereClause }),
      db.affiliatePayout.findMany({
        where: whereClause,
        orderBy: { requestedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.affiliatePayout.findMany({
        where: { affiliateId: affiliate.id },
        select: {
          amount: true,
          status: true,
        },
      }),
    ]);

    const totalEarnings = Number(affiliate.totalEarnings || 0);
    const pendingEarnings = Number(affiliate.pendingEarnings || 0);
    const availableBalance = Math.max(0, totalEarnings - pendingEarnings);

    const summary = allPayouts.reduce(
      (acc, payout) => {
        const amount = Number(payout.amount);
        acc.totalRequested += amount;

        if (payout.status === "COMPLETED") {
          acc.totalPaid += amount;
        } else if (payout.status === "PENDING" || payout.status === "PROCESSING") {
          acc.totalPending += amount;
        }

        return acc;
      },
      {
        totalRequested: 0,
        totalPaid: 0,
        totalPending: 0,
        availableBalance,
        totalEarnings,
      }
    );

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json({
      success: true,
      data: {
        payouts: payouts.map((payout) => ({
          id: payout.id,
          amount: Number(payout.amount),
          paymentMethod: payout.paymentMethod,
          paymentDetails: payout.paymentDetails,
          status: payout.status,
          requestedAt: payout.requestedAt.toISOString(),
          processedAt: payout.processedAt?.toISOString() || null,
          transactionId: payout.transactionId,
          notes: payout.notes,
        })),
        summary,
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
    console.error("[AFFILIATE_PAYOUTS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Request new affiliate payout
export async function POST(request: NextRequest) {
  try {
    const user = await findCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const affiliate = await db.affiliate.findUnique({
      where: { userId: user.id },
    });

    if (!affiliate) {
      return NextResponse.json({ error: "User is not an affiliate" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = payoutRequestSchema.parse(body);

    const totalEarnings = Number(affiliate.totalEarnings || 0);
    const pendingEarnings = Number(affiliate.pendingEarnings || 0);
    const availableBalance = Math.max(0, totalEarnings - pendingEarnings);

    if (validatedData.amount > availableBalance) {
      return NextResponse.json(
        {
          error: "অপর্যাপ্ত ব্যালেন্স (Insufficient available balance)",
          availableBalance,
          requestedAmount: validatedData.amount,
        },
        { status: 400 }
      );
    }

    // Check for pending payouts
    const existingPending = await db.affiliatePayout.findFirst({
      where: {
        affiliateId: affiliate.id,
        status: { in: ["PENDING", "PROCESSING"] },
      },
    });

    if (existingPending) {
      return NextResponse.json(
        {
          error: "আপনার ইতিমধ্যে একটি উত্তোলন অনুরোধ প্রক্রিয়াধীন রয়েছে। অনুগ্রহ করে পূর্বের অনুরোধটি সম্পূর্ণ হওয়া পর্যন্ত অপেক্ষা করুন।",
          pendingPayoutId: existingPending.id,
        },
        { status: 400 }
      );
    }

    // Create payout request & update pendingEarnings in a transaction
    const [payout] = await db.$transaction([
      db.affiliatePayout.create({
        data: {
          affiliateId: affiliate.id,
          amount: validatedData.amount,
          paymentMethod: validatedData.paymentMethod,
          paymentDetails: validatedData.paymentDetails,
          status: "PENDING",
        },
      }),
      db.affiliate.update({
        where: { id: affiliate.id },
        data: {
          pendingEarnings: { increment: validatedData.amount },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "উত্তোলনের অনুরোধ সফলভাবে জমা হয়েছে (Payout request submitted successfully)",
      payoutId: payout.id,
      amount: Number(payout.amount),
      status: payout.status,
      estimatedProcessingTime: "২ থেকে ২৪ ঘণ্টার মধ্যে পেমেন্ট পৌঁছে যাবে",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[AFFILIATE_PAYOUTS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
