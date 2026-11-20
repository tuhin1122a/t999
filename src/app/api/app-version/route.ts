import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const DEFAULT_APP_VERSION_CONFIG = {
  latestVersion: "1.0.6",
  versionCode: 7,
  minVersion: "1.0.0",
  forceUpdate: false,
  downloadUrl: "https://rk444.site/download/rk444.apk",
  releaseNotes: "• Deposit quick amounts starting from ৳100\n• Updated Lucky Wheel (৳10/৳20/৳50, Blast, Respin, ৳10,000 Jackpot)\n• Fixed keyboard covering text inputs across all screens",
};

export async function GET() {
  try {
    const configRow = await db.siteConfig
      .findUnique({
        where: { key: "MOBILE_APP_VERSION" },
      })
      .catch(() => null);

    let config = DEFAULT_APP_VERSION_CONFIG;
    if (configRow?.value) {
      try {
        config = { ...DEFAULT_APP_VERSION_CONFIG, ...JSON.parse(configRow.value) };
      } catch {
        // fallback
      }
    }

    return NextResponse.json({
      success: true,
      ...config,
    });
  } catch (error: any) {
    console.error("Error fetching app version config:", error);
    return NextResponse.json({
      success: true,
      ...DEFAULT_APP_VERSION_CONFIG,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { latestVersion, versionCode, minVersion, forceUpdate, downloadUrl, releaseNotes } = body;

    const newConfig = {
      latestVersion: latestVersion || "1.0.0",
      versionCode: Number(versionCode) || 1,
      minVersion: minVersion || "1.0.0",
      forceUpdate: Boolean(forceUpdate),
      downloadUrl: downloadUrl || "https://rk444.site/download/rk444.apk",
      releaseNotes: releaseNotes || "",
    };

    await db.siteConfig.upsert({
      where: { key: "MOBILE_APP_VERSION" },
      update: { value: JSON.stringify(newConfig) },
      create: { key: "MOBILE_APP_VERSION", value: JSON.stringify(newConfig) },
    });

    return NextResponse.json({
      success: true,
      config: newConfig,
    });
  } catch (error: any) {
    console.error("Error saving app version config:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update version config" },
      { status: 500 }
    );
  }
}
