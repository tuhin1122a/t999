import { PrismaClient, PaymentWalletType, ManagementRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start database seeding...");

  // 1. Seed Bonus Settings
  console.log("Seeding Bonus settings...");
  const bonusCount = await prisma.bonus.count();
  if (bonusCount === 0) {
    await prisma.bonus.create({
      data: {
        signinBonus: 5,
        referralBonus: 5,
      },
    });
  } else {
    console.log("Bonus settings already seeded.");
  }

  // 2. Seed SiteSettings
  console.log("Seeding SiteSettings...");
  const siteSettingCount = await prisma.siteSetting.count();
  if (siteSettingCount === 0) {
    await prisma.siteSetting.create({
      data: {
        maxWithdraw: 50000,
        minWithdraw: 200,
        dpTurnover: 0,
      },
    });
  } else {
    console.log("SiteSettings already seeded.");
  }

  // 3. Seed SigninBonusRewards
  console.log("Seeding SigninBonusRewards...");
  const signinRewardsCount = await prisma.signinBonusRewards.count();
  if (signinRewardsCount === 0) {
    const signinRewards = [
      { day: "1", prize: 5, deposit: 200 },
      { day: "2", prize: 10, deposit: 200 },
      { day: "3", prize: 15, deposit: 500 },
      { day: "4", prize: 20, deposit: 500 },
      { day: "5", prize: 25, deposit: 1000 },
      { day: "6", prize: 30, deposit: 1000 },
      { day: "7", prize: 50, deposit: 2000 },
    ];
    for (const reward of signinRewards) {
      await prisma.signinBonusRewards.create({
        data: reward,
      });
    }
  } else {
    console.log("SigninBonusRewards already seeded.");
  }

  // 4. Seed InvitationRewards
  console.log("Seeding InvitationRewards...");
  const inviteRewardsCount = await prisma.invitationRewards.count();
  if (inviteRewardsCount === 0) {
    const inviteRewards = [
      { rewardImg: "https://example.com/bronze.png", targetReferral: 3, prize: 50 },
      { rewardImg: "https://example.com/silver.png", targetReferral: 10, prize: 200 },
      { rewardImg: "https://example.com/gold.png", targetReferral: 30, prize: 1000 },
    ];
    for (const reward of inviteRewards) {
      await prisma.invitationRewards.create({
        data: reward,
      });
    }
  } else {
    console.log("InvitationRewards already seeded.");
  }

  // 5. Seed Admin User
  console.log("Seeding Admin User...");
  const adminExists = await prisma.admin.findUnique({
    where: { email: "admin@example.com" }
  });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("password123", 10);
    await prisma.admin.create({
      data: {
        name: "Super Admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: ManagementRole.ADMIN,
      },
    });
  } else {
    console.log("Admin user already exists.");
  }

  // 6. Seed Payment Wallets
  console.log("Seeding Payment Wallets...");
  const wallets = [
    {
      walletName: "bKash",
      walletLogo: "https://res.cloudinary.com/dxs9u7pqc/image/upload/v1746607129/mbuzz88/kdi4ajsyggxdjl8xvyy5.png",
      walletType: PaymentWalletType.EWALLET,
    },
    {
      walletName: "Nagad",
      walletLogo: "https://res.cloudinary.com/dxs9u7pqc/image/upload/v1746607134/mbuzz88/ittgozvoezof3cqbprik.png",
      walletType: PaymentWalletType.EWALLET,
    },
    {
      walletName: "Upay",
      walletLogo: "https://res.cloudinary.com/dxs9u7pqc/image/upload/v1746607130/mbuzz88/dx7stvyko3gvwvrwgxwx.png",
      walletType: PaymentWalletType.EWALLET,
    },
    {
      walletName: "Rocket",
      walletLogo: "https://res.cloudinary.com/dxs9u7pqc/image/upload/v1746607131/mbuzz88/mqo9muoc3pevb6kff8jb.png",
      walletType: PaymentWalletType.EWALLET,
    },
    {
      walletName: "DurantoPay",
      walletLogo: "https://res.cloudinary.com/dxs9u7pqc/image/upload/v1746607130/mbuzz88/xrqqj8zdn7dtdwcsn4wd.png",
      walletType: PaymentWalletType.EWALLET,
    },
  ];

  for (const w of wallets) {
    const walletExists = await prisma.paymentWallet.findFirst({
      where: { walletName: w.walletName }
    });
    
    if (!walletExists) {
      const createdWallet = await prisma.paymentWallet.create({
        data: w,
      });

      // Create corresponding deposit wallet
      await prisma.depositWallet.create({
        data: {
          paymentWalletId: createdWallet.id,
          walletsNumber: ["01700000000"],
          instructions: `Send money to our ${w.walletName} account`,
          trxType: "mobile",
          minDeposit: 100,
          maximumDeposit: 50000,
          isActive: true,
        },
      });
    } else {
      console.log(`PaymentWallet ${w.walletName} already exists.`);
    }
  }

  // 7. Seed Demo User / Player
  console.log("Seeding Demo User...");
  const demoPhone = "01712345678";
  const userExists = await prisma.user.findUnique({
    where: { phone: demoPhone }
  });
  if (!userExists) {
    const demoHashedPassword = await bcrypt.hash("password123", 10);
    const referId = "DEMO_REF_" + Math.floor(1000 + Math.random() * 9000);
    const mockGameXAPlayerId = "MOCK_GX_" + Math.floor(100000 + Math.random() * 900000);

    const newPlayer = await prisma.player.create({
      data: {
        playerId: mockGameXAPlayerId,
        name: "Demo Player",
        email: `${demoPhone}@tk1111.com`,
      },
    });

    await prisma.user.create({
      data: {
        phone: demoPhone,
        email: `${demoPhone}@tk1111.com`,
        password: demoHashedPassword,
        playerId: newPlayer.playerId,
        gameXAPlayerId: newPlayer.playerId,
        referId,
        isBanned: false,
        bettingRecord: { create: {} },
        wallet: {
          create: {
            balance: 5000, // Give them 5000 BDT demo balance
            signinBonus: true,
            referralBonus: false,
            currency: "BDT",
            playerId: newPlayer.id,
          },
        },
        inviationBonus: { create: {} },
      },
    });
    console.log("Demo player user seeded successfully!");
  } else {
    console.log("Demo player user already exists.");
  }

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
