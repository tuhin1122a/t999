import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== PAYMENT WALLETS ===");
  const paymentWallets = await prisma.paymentWallet.findMany();
  console.log(JSON.stringify(paymentWallets, null, 2));

  console.log("\n=== USERS AND WALLETS ===");
  const users = await prisma.user.findMany({
    take: 5,
    include: {
      wallet: true,
    },
  });
  console.log(JSON.stringify(users.map(u => ({
    id: u.id,
    name: u.name,
    phone: u.phone,
    withdrawPasswordSet: !!u.withdrawPassword,
    wallet: u.wallet ? {
      balance: u.wallet.balance.toString(),
      turnOver: u.wallet.turnOver.toString(),
    } : null,
  })), null, 2));

  console.log("\n=== SITE SETTINGS ===");
  const siteSettings = await prisma.siteSetting.findFirst();
  console.log(JSON.stringify(siteSettings, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
