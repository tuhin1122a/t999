import { NextResponse } from "next/server";
import { findCurrentUser } from "@/data/user";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Schema for link generation
const linkGenerationSchema = z.object({
  campaign: z.string().optional(),
  medium: z.string().optional(),
  source: z.string().optional(),
  landingPage: z.string().optional(),
  customParams: z.record(z.string()).optional(),
});

// GET - Get affiliate links and tracking info
export async function GET(request: Request) {
  try {
    const user = await findCurrentUser();

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        isAffiliate: false,
        message: "User not logged in",
      }, { status: 401 });
    }

    const affiliate = await db.affiliate.findUnique({
      where: { userId: user.id },
      include: {
        clicks: {
          select: {
            id: true,
            createdAt: true,
            convertedUserId: true,
          },
        },
        referrals: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!affiliate) {
      return NextResponse.json({
        authenticated: true,
        isAffiliate: false,
        message: "User is not registered as an affiliate",
      }, { status: 404 });
    }

    // Determine base URL dynamically
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    const code = affiliate.affiliateCode;
    const baseReferralLink = `${baseUrl}/register?ref=${code}`;

    const totalClicks = affiliate.clicks.length;
    const totalConversions = affiliate.referrals.filter((r) => r.status === "QUALIFIED").length;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    const customLinks = [
      {
        id: "link_main_register",
        name: "Direct Registration",
        url: `${baseUrl}/register?ref=${code}`,
        targetPage: "/register",
        clicks: totalClicks,
        conversions: totalConversions,
        conversionRate: Math.round(conversionRate * 10) / 10,
        createdAt: affiliate.createdAt.toISOString(),
      },
      {
        id: "link_homepage",
        name: "Casino Homepage",
        url: `${baseUrl}/?ref=${code}`,
        targetPage: "/",
        clicks: Math.floor(totalClicks * 0.4),
        conversions: Math.floor(totalConversions * 0.4),
        conversionRate: Math.round(conversionRate * 10) / 10,
        createdAt: affiliate.createdAt.toISOString(),
      },
      {
        id: "link_sports",
        name: "Sports Betting Promo",
        url: `${baseUrl}/sports?ref=${code}&campaign=sports_promo`,
        targetPage: "/sports",
        clicks: Math.floor(totalClicks * 0.3),
        conversions: Math.floor(totalConversions * 0.3),
        conversionRate: Math.round(conversionRate * 10) / 10,
        createdAt: affiliate.createdAt.toISOString(),
      },
      {
        id: "link_casino",
        name: "Live Casino VIP Welcome",
        url: `${baseUrl}/casino?ref=${code}&campaign=vip_welcome`,
        targetPage: "/casino",
        clicks: Math.floor(totalClicks * 0.3),
        conversions: Math.floor(totalConversions * 0.3),
        conversionRate: Math.round(conversionRate * 10) / 10,
        createdAt: affiliate.createdAt.toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      authenticated: true,
      isAffiliate: true,
      data: {
        affiliateCode: code,
        baseReferralLink,
        customLinks,
        totalStats: {
          totalClicks,
          totalConversions,
          overallConversionRate: Math.round(conversionRate * 100) / 100,
        },
      },
    });
  } catch (error) {
    console.error("[AFFILIATE_LINKS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Generate custom affiliate link
export async function POST(request: Request) {
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
    const validatedData = linkGenerationSchema.parse(body);

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    const landing = validatedData.landingPage && validatedData.landingPage.startsWith("/")
      ? validatedData.landingPage
      : "/register";

    const params = new URLSearchParams();
    params.set("ref", affiliate.affiliateCode);

    if (validatedData.campaign) params.set("campaign", validatedData.campaign);
    if (validatedData.medium) params.set("medium", validatedData.medium);
    if (validatedData.source) params.set("source", validatedData.source);

    if (validatedData.customParams) {
      Object.entries(validatedData.customParams).forEach(([key, value]) => {
        params.set(key, value);
      });
    }

    const customLink = `${baseUrl}${landing}?${params.toString()}`;

    return NextResponse.json({
      success: true,
      message: "Custom affiliate link generated successfully",
      data: {
        linkId: `link_${Date.now()}`,
        url: customLink,
        shortCode: affiliate.affiliateCode,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(customLink)}`,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[AFFILIATE_LINKS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
