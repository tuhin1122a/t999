import { db } from "@/lib/db";

async function main() {
  const userCount = await db.user.count();
  console.log("User count is:", userCount);
}

main().catch(console.error);
