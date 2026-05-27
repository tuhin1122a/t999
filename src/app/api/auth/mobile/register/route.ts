import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { referIdGenerate } from "@/lib/helpers";
import { createPlayer } from "@/lib/api/gamexaApi";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "rk444_secret_key_t999_app";

export async function POST(req: NextRequest) {
  try {
    const { phone, password, referralId } = await req.json();

    if (!phone || !password) {
      return NextResponse.json(
        { success: false, error: "Phone number and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Number is already registered" },
        { status: 409 }
      );
    }

    // ---------------- Referral Setup ----------------
    let invitedBy = {};
    let isReferralBonusActive = false;

    if (referralId) {
      const referralUser = await db.user.findUnique({
        where: { referId: referralId },
      });

      if (referralUser) {
        // Ensure referrer has invitation record
        let referralInvitation = await db.invitation.findUnique({
          where: { userId: referralUser.id },
        });
        if (!referralInvitation) {
          referralInvitation = await db.invitation.create({
            data: { userId: referralUser.id },
          });
        }

        // Ensure referrer has InvitationBonus record
        const referralInvitationBonus = await db.invitationBonus.findUnique({
          where: { userId: referralUser.id },
        });
        if (!referralInvitationBonus) {
          await db.invitationBonus.create({
            data: {
              userId: referralUser.id,
              totalRegisters: 1,
              totalValidreferral: 0,
            },
          });
        } else {
          await db.invitationBonus.update({
            where: { userId: referralUser.id },
            data: { totalRegisters: { increment: 1 } },
          });
        }

        isReferralBonusActive = true;
        invitedBy = {
          connect: { id: referralInvitation.id },
        };
      }
    }

    // Hash Password & Generate referId
    const hashedPassword = await bcrypt.hash(password, 10);
    const referId = await referIdGenerate();

    // ---------------- GameXA Player Creation ----------------
    let gameXAPlayerId: string | null = null;
    try {
      const playerResponse = await createPlayer({
        username: phone,
        email: `${phone}@rk444.com`,
        full_name: `Guest ${Date.now()}`,
        phone,
        currency: "IDR",
        password,
      });

      gameXAPlayerId =
        playerResponse?.player?.id?.toString() ||
        playerResponse?.id?.toString() ||
        playerResponse?.player_id?.toString() ||
        playerResponse?.data?.player?.id?.toString() ||
        playerResponse?.data?.id?.toString() ||
        playerResponse?.data?.player_id?.toString();

      if (!gameXAPlayerId) {
        throw new Error("Failed to extract gameXAPlayerId");
      }
    } catch (err) {
      console.warn("GameXA registration failed, using fallback playerId:", err);
      gameXAPlayerId = "MOCK_GX_" + Math.floor(100000 + Math.random() * 900000);
    }

    // Create DB Player
    const newPlayer = await db.player.create({
      data: {
        playerId: gameXAPlayerId,
        name: `Guest ${Date.now()}`,
        email: `${phone}@rk444.com`,
      },
    });

    // Create DB User & Wallet
    const newUser = await db.user.create({
      data: {
        phone,
        email: `${phone}@rk444.com`,
        password: hashedPassword,
        playerId: newPlayer.playerId,
        gameXAPlayerId: newPlayer.playerId,
        referId,
        isBanned: false,
        invitedBy,
        bettingRecord: { create: {} },
        wallet: {
          create: {
            balance: 0,
            signinBonus: false,
            referralBonus: isReferralBonusActive,
            currency: "BDT",
            playerId: newPlayer.id,
          },
        },
        inviationBonus: { create: {} },
      },
      include: {
        wallet: true,
        bettingRecord: true,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { sub: newUser.id, phone: newUser.phone },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        phone: newUser.phone,
        name: newUser.name || "Pro User",
        balance: newUser.wallet ? Number(newUser.wallet.balance) : 0,
        isBanned: newUser.isBanned,
        turnOver: newUser.wallet ? Number(newUser.wallet.turnOver) : 0,
        totalBet: newUser.bettingRecord ? Number(newUser.bettingRecord.totalBet) : 0,
        totalWin: newUser.bettingRecord ? Number(newUser.bettingRecord.totalWin) : 0,
      },
    });
  } catch (error: any) {
    console.error("Mobile Register Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
