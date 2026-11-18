import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  DEFAULT_TAWK_WIDGET_URL,
  getTawkDirectChatUrl,
  parseTawkConfig,
  TAWK_CONFIG_KEY,
} from "@/lib/tawk";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const tawkRow = await db.siteConfig
      .findUnique({ where: { key: TAWK_CONFIG_KEY } })
      .catch(() => null);
    const tawkConfig = parseTawkConfig(tawkRow?.value);
    const widgetUrl = tawkConfig.widgetUrl || DEFAULT_TAWK_WIDGET_URL;
    const directChatUrl = getTawkDirectChatUrl(widgetUrl);

    return NextResponse.json(
      {
        success: true,
        enabled: tawkConfig.enabled,
        widgetUrl,
        directChatUrl,
        showFloatingBubble: tawkConfig.showFloatingBubble,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch {
    return NextResponse.json({
      success: true,
      enabled: true,
      widgetUrl: DEFAULT_TAWK_WIDGET_URL,
      directChatUrl: getTawkDirectChatUrl(DEFAULT_TAWK_WIDGET_URL),
      showFloatingBubble: true,
    });
  }
}
