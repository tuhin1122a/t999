import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Make sure prisma client is imported properly

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("SoftAPI Callback Received:", data);

    const game_uid = data.game_uid || '';
    const game_round = data.game_round || '';
    const member_account = data.member_account || '';
    const bet_amount = parseFloat(data.bet_amount || '0');
    const win_amount = parseFloat(data.win_amount || '0');
    
    if (!member_account) {
        return NextResponse.json({ credit_amount: -1, error: "Invalid user account" }, { status: 400 });
    }

    // Find the user by Phone, ID or PlayerID
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { phone: member_account },
                { id: member_account },
                { playerId: member_account }
            ]
        },
        include: { wallet: true, bettingRecord: true }
    });

    if (!user || !user.wallet) {
        console.error("User or wallet not found for account:", member_account);
        return NextResponse.json({ credit_amount: -1, error: "User not found" }, { status: 404 });
    }

    // Calculate new balance
    const current_balance = Number(user.wallet.balance);
    const new_balance = current_balance - bet_amount + win_amount;

    // Update wallet and betting record in a transaction
    await prisma.$transaction(async (tx) => {
        // Update wallet balance
        await tx.wallet.update({
            where: { id: user.wallet!.id },
            data: { balance: new_balance }
        });
        
        // Update betting record if it exists
        if (user.bettingRecord) {
            await tx.bettingRecord.update({
                where: { id: user.bettingRecord.id },
                data: {
                    totalBet: Number(user.bettingRecord.totalBet) + bet_amount,
                    totalWin: Number(user.bettingRecord.totalWin) + win_amount,
                }
            });
        }
    });

    console.log(`Updated balance for ${member_account}: ${current_balance} -> ${new_balance}`);

    // Return the response required by SoftAPI
    return NextResponse.json({
        credit_amount: new_balance,
        timestamp: Math.round(Date.now())
    }, { status: 200 });

  } catch (error: any) {
    console.error("SoftAPI callback error:", error);
    return NextResponse.json({ credit_amount: -1, error: error.message || "Unexpected error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
    return NextResponse.json({ success: true, message: "Callback endpoint active" }, { status: 200 });
}
