import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    take: 5,
    include: { wallet: true }
  });
  console.dir(users, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
