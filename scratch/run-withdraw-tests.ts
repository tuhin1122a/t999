import { NextRequest } from "next/server";
import { GET as getMethods } from "@/app/api/withdraw/withdraw/methods/route";
import { GET as getPage } from "@/app/api/withdraw/page/route";
import { POST as submitWithdraw } from "@/app/api/withdraw/route";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// Test user IDs
const USER_OK_ID = "cmp9qnjon000vtjewggvn9uvf"; // Sajjad Rahman (balance: 1000, turnOver: 0)
const USER_TURNOVER_ID = "cmp9qnjo6000itjew0fj3c56i"; // Abir Hossain (balance: 5500.5, turnOver: 250)

async function setupTestData() {
  console.log("Setting up test user passwords...");
  const hashedPass = await bcrypt.hash("password123", 10);
  
  // Set password and withdrawPassword to "password123" for both test users
  await db.user.update({
    where: { id: USER_OK_ID },
    data: {
      password: hashedPass,
      withdrawPassword: null, // Test fallback to login password
    }
  });

  await db.user.update({
    where: { id: USER_TURNOVER_ID },
    data: {
      password: hashedPass,
      withdrawPassword: await bcrypt.hash("withdrawPassword123", 10), // Test specific withdraw password
    }
  });

  console.log("Test user passwords setup completed.");
}

async function testWithdrawMethods() {
  console.log("\n--- Testing GET /api/withdraw/withdraw/methods ---");
  process.env.MOCK_USER_ID = USER_OK_ID;
  
  const response = await getMethods();
  const data = await response.json();
  console.log("Status:", response.status);
  console.dir(data, { depth: null });
  
  // Assertions
  const wallets = data.payload.wallets;
  const durantoPayWallet = wallets.find((w: any) => w.name.toLowerCase() === "durantopay");
  if (durantoPayWallet) {
    throw new Error("FAIL: DurantoPay should be filtered out from withdrawal methods!");
  }
  if (wallets.length === 0) {
    throw new Error("FAIL: No wallets returned!");
  }
  console.log("✅ GET /api/withdraw/withdraw/methods passed!");
}

async function testWithdrawPageData() {
  console.log("\n--- Testing GET /api/withdraw/page (User with turnOver = 0) ---");
  process.env.MOCK_USER_ID = USER_OK_ID;
  let response = await getPage();
  let data = await response.json();
  console.log("Sajjad Rahman (turnOver = 0) page data:");
  console.log(`Available Balance: ${data.availableBalance}, Main Balance: ${data.mainBalance}, turnOver: ${data.turnOver}`);
  
  if (parseFloat(data.availableBalance) !== 1000) {
    throw new Error(`FAIL: Sajjad Rahman availableBalance should be 1000, got ${data.availableBalance}`);
  }

  console.log("\n--- Testing GET /api/withdraw/page (User with turnOver > 0) ---");
  process.env.MOCK_USER_ID = USER_TURNOVER_ID;
  response = await getPage();
  data = await response.json();
  console.log("Abir Hossain (turnOver = 250) page data:");
  console.log(`Available Balance: ${data.availableBalance}, Main Balance: ${data.mainBalance}, turnOver: ${data.turnOver}`);
  
  if (parseFloat(data.availableBalance) !== 0) {
    throw new Error(`FAIL: Abir Hossain availableBalance should be 0 because turnOver is ${data.turnOver}, got ${data.availableBalance}`);
  }

  console.log("✅ GET /api/withdraw/page passed!");
}

async function testWithdrawPostValidation() {
  console.log("\n--- Testing POST /api/withdraw (Validation Scenarios) ---");

  // Helper to trigger POST request
  const runPost = async (userId: string, body: any) => {
    process.env.MOCK_USER_ID = userId;
    const req = new NextRequest("http://localhost:3000/api/withdraw", {
      method: "POST",
      body: JSON.stringify(body)
    });
    const response = await submitWithdraw(req);
    return { status: response.status, data: await response.json() };
  };

  // Scenario 1: Missing fields
  console.log("Scenario 1: Missing fields");
  let res = await runPost(USER_OK_ID, { amount: "600" });
  console.log("Status:", res.status, "Message:", res.data.message);
  if (res.status !== 400 || res.data.success !== false) {
    throw new Error("FAIL: Should fail with 400 for missing fields");
  }

  // Scenario 2: Incorrect password (fallback case)
  console.log("Scenario 2: Incorrect password (fallback to login password)");
  res = await runPost(USER_OK_ID, {
    account_number: "01712345678",
    amount: "600",
    password: "wrongpassword",
    ps: "bKash"
  });
  console.log("Status:", res.status, "Message:", res.data.message);
  if (res.status !== 400 || res.data.message !== "Incorrect password") {
    throw new Error("FAIL: Should fail for incorrect password");
  }

  // Scenario 3: Specific withdraw password check
  console.log("Scenario 3: Specific withdraw password check");
  // Using user login password "password123" when user has a specific withdrawPassword should fail
  res = await runPost(USER_TURNOVER_ID, {
    account_number: "01712345678",
    amount: "600",
    password: "password123", // login password
    ps: "bKash"
  });
  console.log("Status:", res.status, "Message:", res.data.message);
  if (res.status !== 400 || res.data.message !== "Incorrect password") {
    throw new Error("FAIL: Should fail for using login password instead of withdraw password");
  }

  // Scenario 4: TurnOver check (turnOver > 0)
  console.log("Scenario 4: TurnOver check (turnOver > 0)");
  res = await runPost(USER_TURNOVER_ID, {
    account_number: "01712345678",
    amount: "600",
    password: "withdrawPassword123", // correct withdraw password
    ps: "bKash"
  });
  console.log("Status:", res.status, "Message:", res.data.message);
  if (res.status !== 400 || !res.data.message.includes("Turnover requirement not met")) {
    throw new Error("FAIL: Should fail due to turnOver requirement");
  }

  // Scenario 5: Min limit limit check (site settings limit is 500 BDT)
  console.log("Scenario 5: Min limit limit check (amount 100 BDT)");
  res = await runPost(USER_OK_ID, {
    account_number: "01712345678",
    amount: "100", // below minWithdraw 500
    password: "password123",
    ps: "bKash"
  });
  console.log("Status:", res.status, "Message:", res.data.message);
  if (res.status !== 400 || !res.data.message.includes("Minimum withdrawal amount is")) {
    throw new Error("FAIL: Should fail for being below min limit");
  }

  // Scenario 6: Max limit check (site settings limit is 25000 BDT)
  console.log("Scenario 6: Max limit check (amount 30000 BDT)");
  res = await runPost(USER_OK_ID, {
    account_number: "01712345678",
    amount: "30000", // above maxWithdraw 25000
    password: "password123",
    ps: "bKash"
  });
  console.log("Status:", res.status, "Message:", res.data.message);
  if (res.status !== 400 || !res.data.message.includes("Maximum withdrawal amount is")) {
    throw new Error("FAIL: Should fail for being above max limit");
  }

  // Scenario 7: Insufficient balance
  console.log("Scenario 7: Insufficient balance (amount 2000 BDT, user only has 1000)");
  res = await runPost(USER_OK_ID, {
    account_number: "01712345678",
    amount: "2000",
    password: "password123",
    ps: "bKash"
  });
  console.log("Status:", res.status, "Message:", res.data.message);
  if (res.status !== 400 || res.data.message !== "Insufficient balance") {
    throw new Error("FAIL: Should fail due to insufficient balance");
  }

  console.log("✅ POST /api/withdraw validation tests passed!");
}

async function testSuccessfulWithdraw() {
  console.log("\n--- Testing POST /api/withdraw (Successful Withdrawal Flow) ---");
  
  // Clean up any existing withdraws for this user to make tracking simple
  await db.withdraw.deleteMany({ where: { userId: USER_OK_ID } });

  // Get initial balance
  const initialWallet = await db.wallet.findUnique({ where: { userId: USER_OK_ID } });
  const initialBalance = parseFloat(initialWallet!.balance.toString());
  console.log("Initial balance:", initialBalance);

  // Submit valid withdraw of 600 BDT
  const withdrawAmount = 600;
  process.env.MOCK_USER_ID = USER_OK_ID;
  const req = new NextRequest("http://localhost:3000/api/withdraw", {
    method: "POST",
    body: JSON.stringify({
      account_number: "01876543210",
      amount: withdrawAmount.toString(),
      password: "password123",
      ps: "Nagad"
    })
  });

  const response = await submitWithdraw(req);
  const data = await response.json();
  console.log("Status:", response.status);
  console.dir(data, { depth: null });

  if (response.status !== 200 || data.success !== true) {
    throw new Error("FAIL: Successful withdrawal request failed!");
  }

  // Verify wallet balance decremented
  const updatedWallet = await db.wallet.findUnique({ where: { userId: USER_OK_ID } });
  const updatedBalance = parseFloat(updatedWallet!.balance.toString());
  console.log("Updated balance:", updatedBalance);
  if (updatedBalance !== initialBalance - withdrawAmount) {
    throw new Error(`FAIL: Balance not decremented properly! Expected ${initialBalance - withdrawAmount}, got ${updatedBalance}`);
  }

  // Verify Withdraw record created with correct status
  const withdrawRecord = await db.withdraw.findFirst({
    where: { userId: USER_OK_ID },
    include: {
      card: {
        include: {
          container: true
        }
      }
    }
  });

  if (!withdrawRecord) {
    throw new Error("FAIL: Withdraw record was not created in the database!");
  }

  console.log("Created Withdraw Record Details:");
  console.dir({
    id: withdrawRecord.id,
    amount: withdrawRecord.amount.toString(),
    status: withdrawRecord.status,
    cardId: withdrawRecord.cardId,
    cardNumber: withdrawRecord.card.cardNumber,
    walletNumber: withdrawRecord.card.walletNumber,
    containerOwner: withdrawRecord.card.container.ownerName,
  }, { depth: null });

  if (withdrawRecord.status !== "PENDING") {
    throw new Error(`FAIL: Withdraw record status should be 'PENDING', got '${withdrawRecord.status}'`);
  }

  if (parseFloat(withdrawRecord.amount.toString()) !== withdrawAmount) {
    throw new Error(`FAIL: Withdraw record amount mismatch! Expected ${withdrawAmount}, got ${withdrawRecord.amount}`);
  }

  if (withdrawRecord.card.walletNumber !== "01876543210") {
    throw new Error(`FAIL: Card wallet number mismatch! Expected '01876543210', got '${withdrawRecord.card.walletNumber}'`);
  }

  // Verify notification was created
  const notifications = await db.notification.findMany({
    where: { userId: USER_OK_ID },
    orderBy: { createdAt: "desc" }
  });

  if (notifications.length === 0 || !notifications[0].title.includes("Withdraw")) {
    throw new Error("FAIL: User notification was not created!");
  }

  console.log("Latest User Notification:", notifications[0].title, "-", notifications[0].description);

  // Restore the balance so we don't pollute database permanently
  await db.wallet.update({
    where: { userId: USER_OK_ID },
    data: { balance: initialBalance }
  });
  console.log("Restored user balance to initial value.");

  console.log("✅ Successful Withdrawal Flow passed!");
}

async function run() {
  try {
    await setupTestData();
    await testWithdrawMethods();
    await testWithdrawPageData();
    await testWithdrawPostValidation();
    await testSuccessfulWithdraw();
    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! The manual withdrawal flow works perfectly.");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

run();
