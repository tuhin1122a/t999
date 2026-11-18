/**
 * all about auth routes
 * for only unauthorized users
 * @type {string[]}
 */
export const authRoutes = ["/register", "/login", "/forget-password"];

/**
 * public routes
 * can be access without login or with login
 * @type {string[]}
 */
export const publicRoutes = [
  "/",
  "/slots",
  "/slot",
  "/games",
  "/game",
  "/card-x",
  "/pocker",
  "/roulette",
  "/table",
  "/fish",
  "/lottery",
  "/api/open-game",
  "/api/game/32328e87f8592ed205bbaa065dbacce4",
  "/live-casino",
  "/api/promotions",
  "/api/lucky-wheel",
  "/hot",
  "/api/durantopay/deposit",
  "/api/durantopay/withdraw",
  "/api/durantopay/callback",
  "/api/durantopay/query",
  "/api/durantopay/test",
  "/api/deposit/payment/methods",
  "/api/deposit",
  "/api/withdraw",
  "/sports",
  "/manual",
  "/languages",
  "/appp",
  "/pvp",
];

/**
 * The prefix for api authentication routes
 * @type {string}
 */
export const apiAuthRoutePrefix = "/api";

/**
 * The prefix for provider api endpoints
 * @type {string}
 */
export const providerApiPrefix = "/api/provider";
