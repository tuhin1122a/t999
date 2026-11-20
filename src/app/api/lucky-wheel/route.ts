import { NextRequest, NextResponse } from "next/server";
import { findCurrentUser } from "@/data/user";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.AUTH_SECRET || "rk444_secret_key_t999_app";

export const DEFAULT_SLICES = [
  { id: 1, label: "💥 Blast", value: 0, type: "BLAST", color: "#DC2626", probability: 35 },
  { id: 2, label: "৳10 Cash", value: 10, type: "CASH", color: "#10B981", probability: 12 },
  { id: 3, label: "🔄 Respin", value: 1, type: "RESPIN", color: "#06B6D4", probability: 25 },
  { id: 4, label: "৳20 Cash", value: 20, type: "CASH", color: "#3B82F6", probability: 8 },
  { id: 5, label: "💥 Blast", value: 0, type: "BLAST", color: "#EF4444", probability: 30 },
  { id: 6, label: "৳50 Cash", value: 50, type: "CASH", color: "#8B5CF6", probability: 5 },
  { id: 7, label: "👑 ৳10,000 JACKPOT", value: 10000, type: "CASH", color: "#EAB308", probability: 0.001 }, // 300 days limit
  { id: 8, label: "🔄 Respin", value: 1, type: "RESPIN", color: "#EC4899", probability: 25 },
];

/**
 * Authenticate either via NextAuth web session or Bearer JWT token from mobile app.
 */
async function getAuthenticatedUser(req: NextRequest) {
  // 1. Try NextAuth session
  try {
    const sessionUser = await findCurrentUser();
    if (sessionUser?.id) {
      return sessionUser;
    }
  } catch {
    // Session lookup fallback
  }

  // 2. Try Bearer token from headers
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string; id?: string };
      const userId = decoded.sub || decoded.id;
      if (userId) {
        const user = await db.user.findUnique({
          where: { id: userId },
          select: { id: true, phone: true, name: true, playerId: true },
        });
        if (user) return user;
      }
    } catch {
      // Invalid token
    }
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getAuthenticatedUser(req);

    let setting = await db.luckyWheelSetting.findFirst().catch(() => null);
    if (!setting) {
      setting = await db.luckyWheelSetting
        .create({
          data: {
            isActive: true,
            freeSpinsPerDay: 1,
            costPerSpin: 0,
            slices: DEFAULT_SLICES,
          },
        })
        .catch(() => null);
    } else {
      const currentSlices = setting.slices as any[];
      const hasNewJackpot = currentSlices?.some((s) => Number(s.value) === 10000);
      const hasTenCash = currentSlices?.some((s) => Number(s.value) === 10 && s.type === "CASH");
      if (!hasNewJackpot || !hasTenCash) {
        setting = await db.luckyWheelSetting.update({
          where: { id: setting.id },
          data: { slices: DEFAULT_SLICES },
        });
      }
    }

    const slices = (setting?.slices as any) || DEFAULT_SLICES;
    const isActive = setting?.isActive !== false;

    // Fetch recent 10 winners
    const recentWinners = await db.luckyWheelSpin
      .findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              phone: true,
              name: true,
              playerId: true,
            },
          },
        },
      })
      .catch(() => []);

    const formattedWinners = recentWinners.map((w) => {
      const p = w.user?.phone || "017******";
      const maskedPhone =
        p.length >= 7 ? `${p.slice(0, 3)}****${p.slice(-3)}` : p;
      return {
        id: w.id,
        phone: maskedPhone,
        prize: w.prizeLabel,
        createdAt: w.createdAt,
      };
    });

    if (!sessionUser) {
      return NextResponse.json({
        isActive,
        authenticated: false,
        canSpin: false,
        remainingSpins: 0,
        nextSpinAt: null,
        cooldownSeconds: 0,
        slices,
        recentWinners: formattedWinners,
      });
    }

    // ── 24-HOUR ROLLING COOLDOWN CHECK ──
    const latestSpin = await db.luckyWheelSpin.findFirst({
      where: { userId: sessionUser.id },
      orderBy: { createdAt: "desc" },
    });

    let canSpin = true;
    let nextSpinAt: string | null = null;
    let cooldownSeconds = 0;
    let remainingSpins = 1;
    let isRespinEligible = false;

    if (latestSpin) {
      if (latestSpin.prizeType === "RESPIN") {
        // Player won a respin! Can spin again immediately without waiting 24 hours
        canSpin = true;
        isRespinEligible = true;
        remainingSpins = 1;
        nextSpinAt = null;
        cooldownSeconds = 0;
      } else {
        const cooldownMs = 24 * 60 * 60 * 1000;
        const nextTime = new Date(latestSpin.createdAt.getTime() + cooldownMs);
        const diffMs = nextTime.getTime() - Date.now();

        if (diffMs > 0) {
          canSpin = false;
          remainingSpins = 0;
          nextSpinAt = nextTime.toISOString();
          cooldownSeconds = Math.ceil(diffMs / 1000);
        } else {
          canSpin = true;
          remainingSpins = 1;
          nextSpinAt = null;
          cooldownSeconds = 0;
        }
      }
    }

    return NextResponse.json({
      isActive,
      authenticated: true,
      canSpin: isActive && canSpin,
      remainingSpins,
      nextSpinAt,
      cooldownSeconds,
      isRespinEligible,
      slices,
      recentWinners: formattedWinners,
    });
  } catch (error: any) {
    console.error("Error fetching lucky wheel status:", error);
    return NextResponse.json(
      { error: "Failed to fetch lucky wheel" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getAuthenticatedUser(req);
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Please log in to spin the wheel" },
        { status: 401 }
      );
    }

    let setting = await db.luckyWheelSetting.findFirst().catch(() => null);
    if (!setting) {
      setting = await db.luckyWheelSetting.create({
        data: {
          isActive: true,
          freeSpinsPerDay: 1,
          costPerSpin: 0,
          slices: DEFAULT_SLICES,
        },
      });
    }

    if (setting.isActive === false) {
      return NextResponse.json(
        { error: "Lucky Wheel is temporarily in maintenance mode" },
        { status: 400 }
      );
    }

    // ── STRICT 24-HOUR COOLDOWN CHECK ──
    const latestSpin = await db.luckyWheelSpin.findFirst({
      where: { userId: sessionUser.id },
      orderBy: { createdAt: "desc" },
    });

    if (latestSpin && latestSpin.prizeType !== "RESPIN") {
      const cooldownMs = 24 * 60 * 60 * 1000;
      const nextTime = new Date(latestSpin.createdAt.getTime() + cooldownMs);
      const diffMs = nextTime.getTime() - Date.now();

      if (diffMs > 0) {
        const cooldownSeconds = Math.ceil(diffMs / 1000);
        return NextResponse.json(
          {
            error: "24-hour cooldown active. Please wait until your next spin.",
            nextSpinAt: nextTime.toISOString(),
            cooldownSeconds,
            canSpin: false,
            remainingSpins: 0,
          },
          { status: 400 }
        );
      }
    }

    // Ensure setting slices are migrated to the new 10/20/50/Blast/Respin/10000 configuration
    let slices = (setting.slices as any[]) || DEFAULT_SLICES;
    if (!slices.some((s) => Number(s.value) === 10000)) {
      slices = DEFAULT_SLICES;
      await db.luckyWheelSetting
        .update({ where: { id: setting.id }, data: { slices: DEFAULT_SLICES } })
        .catch(() => null);
    }

    // ── 1. STRICT 300-DAY RULE FOR ৳10,000 JACKPOT (Platform-wide: once every 300 days) ──
    const threeHundredDaysAgo = new Date(Date.now() - 300 * 24 * 60 * 60 * 1000);
    const recentJackpotWin = await db.luckyWheelSpin.findFirst({
      where: {
        prizeValue: { gte: 10000 },
        createdAt: { gte: threeHundredDaysAgo },
      },
      select: { id: true },
    });
    const isJackpotEligible = !recentJackpotWin;

    // ── 2. STRICT 7-DAY RULE FOR ৳10 / ৳20 / ৳50 CASH PRIZES (Per user: once every 7 days) ──
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSmallCashWin = await db.luckyWheelSpin.findFirst({
      where: {
        userId: sessionUser.id,
        prizeType: "CASH",
        prizeValue: { gte: 10, lt: 10000 },
        createdAt: { gte: sevenDaysAgo },
      },
      select: { id: true },
    });
    const isSmallCashEligible = !recentSmallCashWin;

    // ── 3. BUILD DYNAMIC WEIGHTS (Blast & Respin land frequently; Cash only after 7d; Jackpot only after 300d) ──
    const weightedSlices = slices.map((s, idx) => {
      const val = Number(s.value) || 0;
      const type = String(s.type || "").toUpperCase();
      const isJackpot = val >= 10000 || String(s.label || "").includes("10,000");
      const isSmallCash = type === "CASH" && val >= 10 && val < 10000;

      if (isJackpot) {
        return {
          ...s,
          originalIndex: idx,
          activeWeight: isJackpotEligible ? 0.01 : 0,
        };
      }
      if (isSmallCash) {
        return {
          ...s,
          originalIndex: idx,
          activeWeight: isSmallCashEligible ? (Number(s.probability) || 8) : 0,
        };
      }
      // BLAST and RESPIN always remain active with high weights
      return {
        ...s,
        originalIndex: idx,
        activeWeight: Number(s.probability) || 25,
      };
    });

    const totalWeight = weightedSlices.reduce((sum, s) => sum + s.activeWeight, 0);
    let randomNum = Math.random() * totalWeight;

    let winningSliceObj = weightedSlices[0];
    for (const slice of weightedSlices) {
      if (randomNum <= slice.activeWeight) {
        winningSliceObj = slice;
        break;
      }
      randomNum -= slice.activeWeight;
    }

    const winningIndex = winningSliceObj.originalIndex;
    const wonSlice = slices[winningIndex];
    const prizeValue = Number(wonSlice.value) || 0;
    const prizeType = wonSlice.type || "CASH";

    // ── HANDLE CASH PRIZE: ADD TO MAIN WALLET BALANCE & ENFORCE 1x TURNOVER ──
    let newBalance = 0;
    let newTurnOver = 0;

    if (prizeType === "CASH" && prizeValue > 0) {
      const updatedWallet = await db.wallet.update({
        where: { userId: sessionUser.id },
        data: {
          balance: { increment: prizeValue },
          turnOver: { increment: prizeValue }, // Strict 1x turnover requirement
        },
        select: { balance: true, turnOver: true },
      });
      newBalance = Number(updatedWallet.balance);
      newTurnOver = Number(updatedWallet.turnOver);

      // Create in-app reward notification
      await db.notification
        .create({
          data: {
            userId: sessionUser.id,
            title: "Lucky Wheel Reward Won! 🎁",
            description: `Congratulations! ৳${prizeValue} Cash has been credited to your Main Balance with a 1x turnover requirement.`,
            icon: "BONUS",
          },
        })
        .catch(() => null);
    } else {
      const currentWallet = await db.wallet.findUnique({
        where: { userId: sessionUser.id },
        select: { balance: true, turnOver: true },
      });
      newBalance = Number(currentWallet?.balance || 0);
      newTurnOver = Number(currentWallet?.turnOver || 0);
    }

    // Save spin record in database
    await db.luckyWheelSpin.create({
      data: {
        userId: sessionUser.id,
        sliceIndex: winningIndex,
        prizeLabel: wonSlice.label,
        prizeValue,
        prizeType,
      },
    });

    const isRespin = prizeType === "RESPIN";
    const isBlast = prizeType === "BLAST";

    const nextSpinAt = isRespin
      ? null
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const cooldownSeconds = isRespin ? 0 : 24 * 60 * 60;
    const canSpin = isRespin;
    const remainingSpins = isRespin ? 1 : 0;

    return NextResponse.json({
      success: true,
      winningSliceIndex: winningIndex,
      prize: wonSlice,
      prizeType,
      isRespin,
      isBlast,
      newBalance,
      turnOver: newTurnOver,
      canSpin,
      remainingSpins,
      nextSpinAt,
      cooldownSeconds,
      message: isRespin
        ? "🔄 FREE RESPIN! You get an extra spin right now!"
        : isBlast
        ? "💥 BOOM! Blast! Better luck next spin!"
        : prizeValue >= 10000
        ? "👑 MEGA JACKPOT! ৳10,000 Cash credited to your Main Balance (1x Turnover Requirement)!"
        : `🎉 You won ${wonSlice.label}! Credited to Main Balance with 1x Turnover.`,
    });
  } catch (error: any) {
    console.error("Error spinning lucky wheel:", error);
    return NextResponse.json(
      { error: error.message || "Failed to spin wheel" },
      { status: 500 }
    );
  }
}
