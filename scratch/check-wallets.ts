import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Fetching PaymentWallets...");
  const paymentWallets = await prisma.paymentWallet.findMany();
  console.log("PaymentWallets in DB:", JSON.stringify(paymentWallets, null, 2));

  console.log("\nFetching DepositWallets...");
  const depositWallets = await prisma.depositWallet.findMany();
  console.log("DepositWallets in DB:", JSON.stringify(depositWallets, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
