import promotion_1 from "../public/promotion/promotion-1.jpg";
import promotion_2 from "../public/promotion/promotion-2.jpeg";
import promotion_3 from "../public/promotion/promotion-3.jpeg";
import promotion_4 from "../public/promotion/promotion-4.jpeg";
import promotion_5 from "../public/promotion/promotion-5.jpeg";
import promotion_6 from "../public/promotion/promotion-6.jpeg";
import promotion_7 from "../public/promotion/promotion-7.jpeg";
import promotion_8 from "../public/promotion/promotion-8.jpeg";

export interface PromotionItem {
  id: number;
  context: string;
  category: "all" | "welcome" | "slots" | "reload" | "cashback" | "referral";
  badge?: string;
  badgeColor?: string;
  image: any;
  title: string;
  description: string;
  turnover?: string;
  minDeposit?: string;
  content: string;
}

export const promotions: PromotionItem[] = [
  {
    id: 1000,
    context: "Welcome Bonus",
    category: "welcome",
    badge: "100% BONUS",
    badgeColor: "bg-gradient-to-r from-amber-500 to-yellow-500 text-black",
    turnover: "10x Wager",
    minDeposit: "500 BDT",
    image: promotion_1,
    title: "Welcome Bonus 500 BDT On All Products",
    description:
      "Get your lucky start with a 100% bonus on ALL games worth up to 500 BDT for your first deposit on RK444!",
    content: `## 🎁 Claim Your Welcome Bonus in 3 Easy Steps

### Step 1:
Register on **RK444** and head over to the Deposit page.

### Step 2:
Select **Welcome Bonus - All Products: 100%** when choosing your deposit bonus.

### Step 3:
Make a minimum deposit of 500 BDT and receive your bonus automatically!

---

## 📜 Promotion Rules & Terms

- 🔒 The bonus is **exclusive to new members** and is given **only once on first deposit**.
- 💸 The **minimum qualifying deposit** is **500 BDT**.
- 🎮 Bonus can be wagered on **ALL games and products** on RK444.
- 🔁 **Wagering Requirement:** (Deposit + Bonus) must be wagered **10x** before funds can be withdrawn.
- ✅ The wagering requirement is fulfilled when the required bets are placed or account balance is below **10 BDT**.
- 🚫 Tie/draw bets and voided bets do not count toward the wagering requirement.
- 👥 Strictly one bonus per registered member, IP address, and financial account.
- ⚠️ **RK444** reserves the right to modify or terminate this promotion at its sole discretion.
`,
  },
  {
    id: 1001,
    context: "Top-Up Reward",
    category: "reload",
    badge: "3% INSTANT",
    badgeColor: "bg-emerald-500 text-white",
    turnover: "1x Wager",
    minDeposit: "Any Amount",
    image: promotion_2,
    title: "Get 3% Instant Bonus on Every Deposit",
    description: "Boost your bankroll on every deposit! Claim a 3% instant cash bonus on every single transaction with only 1x turnover.",
    content: `## 🎁 Claim Your 3% Reload Bonus on Every Deposit

### Step 1:
Go to the **RK444** Cashier Deposit page.

### Step 2:
Select **3% Instant Deposit Bonus** during your deposit.

### Step 3:
Complete your deposit and enjoy the 3% instant extra credit!

---

## 📜 Promotion Rules & Terms

- 🔁 Players can **claim this bonus on EVERY deposit transaction** with no daily limit.
- ✅ **Turnover Requirement:** Ultra-low **1x (Deposit + Bonus)** before withdrawal.
- 💸 Minimum deposit requirement is the standard wallet minimum (100 BDT).
- 🎮 Valid for all Slots, Live Casino, and Sportsbook games.
- ⚠️ **RK444** reserves the right to modify or cancel this promotion at its sole discretion.
`,
  },
  {
    id: 1002,
    context: "Welcome Bonus 200 BDT",
    category: "welcome",
    badge: "FREE 200 BDT",
    badgeColor: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
    turnover: "3x Wager",
    minDeposit: "500 BDT",
    image: promotion_3,
    title: "Welcome Bonus 200 BDT in All Products",
    description:
      "Get a fast 200 BDT free bonus boost with an ultra-easy 3x wagering requirement for your first deposit!",
    content: `## 🎁 Claim Your 200 BDT Bonus in 3 Easy Steps

### Step 1:
Register your account on **RK444** and open the Deposit page.

### Step 2:
Select **Welcome Bonus - Free 200 BDT** from the bonus selection options.

### Step 3:
Deposit 500 BDT or more and start playing with your extra 200 BDT credit!

---

## 📜 Promotion Rules & Terms

- 🎉 The bonus is **exclusive to newly registered RK444 members**.
- 💰 The **minimum qualifying deposit** is **500 BDT**.
- 🔁 **Wagering Requirement:** (Deposit + Bonus) must be wagered only **3x times**.
- 🎮 Usable across all slots, crash games, table games, and live dealers.
- ⚠️ **RK444** general terms and conditions apply.
`,
  },
  {
    id: 1003,
    context: "Welcome Offer",
    category: "slots",
    badge: "300% SLOTS",
    badgeColor: "bg-gradient-to-r from-pink-500 to-purple-600 text-white",
    turnover: "20x Wager",
    minDeposit: "1,000 BDT",
    image: promotion_4,
    title: "Slots 300% Welcome Bonus up to 8,000 BDT",
    description:
      "Mega Slots Booster! Triple your initial funds with a massive 300% bonus worth up to 8,000 BDT on all slot games.",
    content: `## 🎰 Claim Your 300% Slots Booster in 3 Easy Steps

### Step 1:
Log in to **RK444** and navigate to the Deposit Cashier.

### Step 2:
Select **First Deposit - Slots: 300% up to 8,000 BDT** on the deposit form.

### Step 3:
Deposit at least 1,000 BDT and unlock up to 8,000 BDT extra slots credit!

---

## 📜 Promotion Rules & Terms

- 🆕 Exclusive to new players on their initial slots deposit.
- 🎰 Valid on all certified slot providers: Pragmatic Play, JILI, PG Soft, NetEnt, Spribe, etc.
- 🔁 **Wagering Requirement:** 20x (Deposit + Bonus) on Slots only.
- 💰 Maximum bonus payout is capped at 8,000 BDT.
- ⚠️ Standard **RK444** promotion abuse policies apply.
`,
  },
  {
    id: 1004,
    context: "Weekly Reload Bonus",
    category: "reload",
    badge: "1100% REWARD",
    badgeColor: "bg-gradient-to-r from-yellow-400 to-amber-500 text-black",
    turnover: "15x Wager",
    minDeposit: "1,000 BDT",
    image: promotion_5,
    title: "Weekly Reload Bonus up to 1100%",
    description:
      "Boost your game play and win big! Claim reload rewards up to 8 times with a cumulative total of 1100% every single week!",
    content: `## 🔁 Claim Your 1100% Weekly Reload Journey

### Step 1:
Deposit regularly throughout the week on **RK444**.

### Step 2:
Choose **Weekly Reload Step Bonus** on each qualifying deposit.

### Step 3:
Unlock escalating rewards up to 225% on your 8th deposit of the week!

---

## 📊 Escalating Weekly Percentage Breakdown

| Deposit Sequence | Bonus Percentage |
|:----------------|:-----------------|
| 1st Deposit     | 50% Bonus        |
| 2nd Deposit     | 75% Bonus        |
| 3rd Deposit     | 100% Bonus       |
| 4th Deposit     | 125% Bonus       |
| 5th Deposit     | 150% Bonus       |
| 6th Deposit     | 175% Bonus       |
| 7th Deposit     | 200% Bonus       |
| 8th Deposit     | 225% Bonus       |
| **Total Bonus** | **1100% Combined**|

---

## 📜 Promotion Rules & Terms

- 🔄 Promotion restarts every Sunday at 23:59 (GMT+6).
- 💰 Maximum bonus payout is 5,000 BDT per deposit.
- 🔁 Wagering Requirement: 15x on Slots products before withdrawal.
- ⚠️ **RK444** terms and conditions apply.
`,
  },
  {
    id: 1005,
    context: "Slots Games 25% Daily",
    category: "slots",
    badge: "25% DAILY",
    badgeColor: "bg-cyan-500 text-black",
    turnover: "15x Wager",
    minDeposit: "500 BDT",
    image: promotion_6,
    title: "Slots Games 25% Daily Reload Bonus up to 5,000 BDT",
    description:
      "Deposit everyday and hit an additional 25% Slots Reload bonus up to 5,000 BDT with fast turnover.",
    content: `## 🎰 Claim Your 25% Daily Slots Reload

### Step 1:
Make a deposit of 500 BDT or more on **RK444**.

### Step 2:
Select **Daily Reload: Slots 25%** in the deposit cashier.

### Step 3:
Enjoy your 25% extra credit to spin on any Pragmatic, JILI, or PG Soft slot!

---

## 📜 Promotion Rules & Terms

- 🎰 Claimable once per day every 24 hours.
- 🔁 Wagering Requirement: 15x (Deposit + Bonus) on Slots.
- 💰 Maximum bonus amount: 5,000 BDT daily.
- ⚠️ **RK444** fair play rules apply.
`,
  },
  {
    id: 1006,
    context: "Slots Games 12%",
    category: "cashback",
    badge: "12% CASHBACK",
    badgeColor: "bg-emerald-400 text-black",
    turnover: "1x Wager",
    minDeposit: "Automatic",
    image: promotion_7,
    title: "Slots Games 12% Unlimited Weekly Cashback",
    description:
      "Spin your favorite Slots worry-free. Receive up to 12% unlimited cashback automatically every Monday with 1x turnover!",
    content: `## 🎁 Slots Weekly Netloss Cashback – Automatic Monday Payout!

### ✅ How to Participate:
1. Play any **Slots** game on **RK444** throughout the week.
2. If you experience net losses, your cashback is **automatically calculated and credited** every Monday before 1:00 PM!

---

## 📊 Cashback Tier Rates

| Weekly Net Loss (BDT) | Cashback % |
|:----------------------|:-----------|
| Below 150,000 ৳       | 8.00%      |
| 150,001 ৳ – 300,000 ৳ | 10.00%     |
| Above 300,001 ৳       | **12.00%** |

---

## 📜 Promotion Rules & Terms

- 💵 Minimum cashback payout is just 10 BDT.
- 🔁 **Turnover Requirement:** Only **1x** before withdrawal!
- 🕐 Automatically credited to your main balance every Monday.
- 👥 Open to all verified active players on **RK444**.
`,
  },
  {
    id: 1007,
    context: "Refer your Friend",
    category: "referral",
    badge: "600 BDT REWARD",
    badgeColor: "bg-gradient-to-r from-purple-500 to-indigo-600 text-white",
    turnover: "Automatic",
    minDeposit: "Invite",
    image: promotion_8,
    title: "Refer a Friend & Earn 600 BDT Cash for Both of You",
    description:
      "Earn real money by inviting your friends to join RK444! Get a 300 BDT cash reward for you and 300 BDT for your friend.",
    content: `## 🤝 Refer & Earn – 600 BDT Total Cash Reward!

### 🎯 How to Participate in 2 Easy Steps:

1. **Share your Referral Link or Code** found under:  
   **My Account → Profile → Referral**

2. When your friend registers and plays, **both of you receive 300 BDT cash directly**!

---

## 💸 Reward Breakdown

| Recipient | Free Cash Bonus | Friend Deposit Requirement | Friend Turnover |
|:----------|:----------------|:---------------------------|:----------------|
| You (Referrer) | **300 BDT** | 2,000 BDT | 5,000 BDT |
| Your Friend | **300 BDT** | 1,000 BDT | 3,000 BDT |

---

## 📜 Promotion Rules & Terms

- ✅ Unlimited referrals allowed! Refer 10 friends and earn 3,000 BDT!
- 💰 Bonuses are credited automatically once your friend completes the minimum deposit.
- ⚠️ Multiple accounts or self-referral will result in account suspension.
`,
  },
];
