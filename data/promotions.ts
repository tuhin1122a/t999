import promotion_1 from "../public/promotion/promotion-1.jpg";
import promotion_2 from "../public/promotion/promotion-2.jpeg";
import promotion_3 from "../public/promotion/promotion-3.jpeg";
import promotion_4 from "../public/promotion/promotion-4.jpeg";
import promotion_5 from "../public/promotion/promotion-5.jpeg";
import promotion_6 from "../public/promotion/promotion-6.jpeg";
import promotion_7 from "../public/promotion/promotion-7.jpeg";
import promotion_8 from "../public/promotion/promotion-8.jpeg";
import sports_1 from "../public/sports/sports-1.png";
import sports_2 from "../public/sports/sports-2.png";
import slider_1 from "../public/slider/slider-1.jpg";
import slider_3 from "../public/slider/slider-3.png";
import slider_4 from "../public/slider/slider-4.png";

export interface PromotionItem {
  id: number;
  context: string;
  category: "all" | "welcome" | "slots" | "reload" | "cashback" | "referral" | "sports" | "live";
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
  {
    id: 1008,
    context: "Sports & Cricket",
    category: "sports",
    badge: "100% SPORTS + FREE BET",
    badgeColor: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
    turnover: "5x Wager",
    minDeposit: "500 BDT",
    image: sports_1,
    title: "Cricket & Sportsbook 100% Welcome Bonus + 500 BDT Free Bet",
    description:
      "Back the Tigers in BPL, IPL, and international cricket matches with a 100% match bonus and a guaranteed 500 BDT Risk-Free Bet!",
    content: `## 🏏 Cricket & Sportsbook 100% Welcome Match

### Step 1:
Register on **RK444** and visit the Cashier Deposit section.

### Step 2:
Select **Sports Welcome Bonus: 100% Match + Free Bet** during deposit.

### Step 3:
Deposit 500 BDT or more and immediately receive your 100% extra balance plus a 500 BDT Free Bet voucher!

---

## 📜 Promotion Rules & Terms

- 🏏 Valid on all Cricket (IPL, BPL, ICC), Football, and Tennis sports markets.
- 🎯 Minimum qualifying odds for bonus wagering is **1.50 or higher**.
- 🔁 **Turnover Requirement:** Only **5x** (Deposit + Bonus) on Sports bets.
- 🎁 Free Bet winnings can be withdrawn directly after 1x turnover!
- ⚠️ Draw or canceled matches do not count toward turnover calculations.
`,
  },
  {
    id: 1009,
    context: "bKash & Nagad Booster",
    category: "reload",
    badge: "5% EXTRA CASH",
    badgeColor: "bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 text-white",
    turnover: "1x Turnover",
    minDeposit: "200 BDT",
    image: slider_3,
    title: "bKash & Nagad 5% Instant Extra Cash Top-Up Bonus",
    description:
      "Deposit using bKash, Nagad, or Rocket and receive an automatic 5% instant cash bonus credited straight into your wallet on every top-up!",
    content: `## ⚡ 5% Instant Cash on Every bKash / Nagad / Rocket Deposit

### Step 1:
Go to the **RK444** Deposit page and select **bKash**, **Nagad**, or **Rocket**.

### Step 2:
Choose **bKash & Nagad 5% Top-Up Bonus** from the bonus selection menu.

### Step 3:
Complete the deposit with your transaction ID (TrxID) and watch your 5% cash instantly add to your wallet upon admin approval!

---

## 📜 Promotion Rules & Terms

- 🔄 **Unlimited Claims:** Available on every single deposit transaction!
- 💸 Minimum deposit to qualify is only **200 BDT**.
- 🔁 **Turnover Requirement:** Ultra-friendly **1x Turnover** before cashout.
- 🎮 Valid for all casino games, slots, and sports wagering.
`,
  },
  {
    id: 1010,
    context: "Live Dealer Tables",
    category: "live",
    badge: "50% LIVE BOOSTER",
    badgeColor: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white",
    turnover: "12x Wager",
    minDeposit: "1,000 BDT",
    image: sports_2,
    title: "Live Casino & VIP Roulette 50% Weekend Reload Boost",
    description:
      "Play with attractive live dealers on Evolution, Sexy Baccarat, and Pragmatic Live with a 50% match bonus up to 10,000 BDT every weekend!",
    content: `## 💃 50% Weekend Live Casino & Roulette Match

### Step 1:
Deposit between Friday 00:00 and Sunday 23:59 on **RK444**.

### Step 2:
Select **Weekend Live Casino 50% Booster** in the cashier.

### Step 3:
Enjoy live video streaming blackjack, baccarat, roulette, and Crazy Time with 50% extra funds!

---

## 📜 Promotion Rules & Terms

- 🎲 Valid across all Live Dealer suites: Evolution, Sexy Baccarat, Ezugi, Pragmatic Live.
- 💰 Maximum bonus payout is **10,000 BDT** per weekend.
- 🔁 **Turnover Requirement:** 12x (Deposit + Bonus) on live table games.
- 🚫 Opposite betting (e.g., betting on both Red & Black on Roulette) is strictly prohibited.
`,
  },
  {
    id: 1011,
    context: "Crash & Aviator",
    category: "slots",
    badge: "20% RESCUE CASH",
    badgeColor: "bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 text-white",
    turnover: "1x Wager",
    minDeposit: "Any Flight",
    image: slider_4,
    title: "Aviator & Spribe Crash 20% Daily Flight Insurance",
    description:
      "Fly high with zero stress! Get 20% instant daily rescue cashback on Spribe Aviator and crash games if your plane flies away early.",
    content: `## ✈️ 20% Daily Flight Insurance for Aviator Players

### How it works:
1. Play **Spribe Aviator** or crash games on **RK444**.
2. If your net daily flight session doesn't go your way, claim **20% Flight Insurance Cashback**!
3. The insurance cash is credited daily straight into your main wallet with a light 1x turnover.

---

## 📜 Promotion Rules & Terms

- ✈️ Exclusively valid on **Spribe Aviator**, JetX, and certified crash games.
- 💸 Minimum cashback amount is **50 BDT**, maximum up to **5,000 BDT** daily.
- 🔁 **Turnover Requirement:** Ultra-fast **1x** before cashout.
`,
  },
  {
    id: 1012,
    context: "Royal VIP Level-Up",
    category: "welcome",
    badge: "200,000 BDT PRIZE",
    badgeColor: "bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black",
    turnover: "1x Turnover",
    minDeposit: "Play & Unlock",
    image: slider_1,
    title: "RK444 VIP Royal Tier Level-Up Cash Drops & Birthday Gifts",
    description:
      "Climb through Bronze, Silver, Gold, Platinum and Diamond Elite to unlock automatic cash gifts up to 200,000 BDT directly into your account!",
    content: `## 👑 Royal VIP Tier Progression Rewards

### 🏆 Level-Up Cash Drops Breakdown:

| VIP Tier | Required Volume | Level-Up Cash Drop | Weekly Cashback |
|:---------|:----------------|:-------------------|:----------------|
| **Bronze VIP** | 10,000 ৳ | **500 ৳** | 2.0% |
| **Silver VIP** | 50,000 ৳ | **2,500 ৳** | 5.0% |
| **Gold VIP** | 250,000 ৳ | **10,000 ৳** | 8.0% |
| **Platinum VIP** | 1,000,000 ৳ | **50,000 ৳** | 14.0% |
| **Diamond Elite** | 5,000,000 ৳ | **200,000 ৳** | **20.0%** |

---

## 📜 Promotion Rules & Terms

- 👑 Tier advancement is 100% automated based on your real wagering activity.
- 🎁 Cash drops are instantly credited upon crossing each tier threshold.
- 🔁 **Turnover Requirement:** Only **1x** before withdrawal!
`,
  },
];
