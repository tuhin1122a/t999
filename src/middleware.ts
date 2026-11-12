import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authRoutes, publicRoutes, providerApiPrefix } from "./routes";
import authConfig from "./auth.config";

const { auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || "LQcRGPS3mr4RoxYioGcwHQhkHDmrFKve3IVy8jll3Yg=",
  cookies: {
    sessionToken: {
      name: "t999.session-token",
    },
    callbackUrl: {
      name: "t999.callback-url",
    },
    csrfToken: {
      name: "t999.csrf-token",
    },
  },
  logger: {
    error(error) {
      if ((error as { type?: string })?.type === "JWTSessionError") {
        return;
      }
      console.error("[t999 middleware auth][error]", error);
    },
  },
});

export default auth(async (req) => {
  const { nextUrl } = req;
  const session = !!req.auth;
  const isBanned = req.auth?.user?.isBanned;

  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isPublicRoute =
    publicRoutes.includes(nextUrl.pathname) ||
    nextUrl.pathname.startsWith("/api/auth") ||
    nextUrl.pathname.startsWith("/api/games/list") ||
    nextUrl.pathname.startsWith("/api/softapi/games") ||
    nextUrl.pathname.startsWith("/api/softapi/providers") ||
    nextUrl.pathname.startsWith("/api/softapi/callback") ||
    nextUrl.pathname.startsWith("/api/softapi/launch") ||
    nextUrl.pathname.startsWith("/api/games/hot") ||
    nextUrl.pathname.startsWith("/api/sub-admins/resolve") ||
    nextUrl.pathname.startsWith("/api/gamexa/games/providers") ||
    // ✅ Mobile app API routes — no browser session, authenticated via JWT Bearer token
    nextUrl.pathname.startsWith("/api/auth/mobile/");
  const isProvider = nextUrl.pathname.startsWith(providerApiPrefix);

  const stalePrefixes = [
    "t999.session-token",
    "authjs.session-token",
    "next-auth.session-token",
    "__Secure-authjs.session-token",
    "__Secure-next-auth.session-token",
  ];

  const matchingSessionCookies = req.cookies
    .getAll()
    .map((c) => c.name)
    .filter((name) => stalePrefixes.some((prefix) => name === prefix || name.startsWith(`${prefix}.`)));

  const hasSessionCookie = matchingSessionCookies.length > 0;

  let response: NextResponse;

  if (isBanned && !isAuthRoute && !isProvider && !nextUrl.pathname.startsWith("/api/auth")) {
    console.log("🚫 [Middleware] Banned user detected. Logging out and redirecting.");
    response = NextResponse.redirect(
      new URL("/login?error=Your%20account%20has%20been%20banned", nextUrl)
    );
    for (const name of matchingSessionCookies) {
      response.cookies.set(name, "", { maxAge: 0, path: "/" });
    }
    return response;
  }

  if (session && isAuthRoute && !isProvider) {
    response = NextResponse.redirect(new URL("/", nextUrl));
  } else if (!session && !isPublicRoute && !isProvider && !isAuthRoute) {
    const callbackUrl = nextUrl.pathname;
    const encodeCallbackUrl = encodeURIComponent(callbackUrl);
    response = NextResponse.redirect(
      new URL(`/login?redirect=${encodeCallbackUrl}`, nextUrl)
    );
  } else if (!session && hasSessionCookie) {
    // Strip broken/legacy session cookies before forwarding so Server Components never trigger JWTSessionError
    const requestHeaders = new Headers(req.headers);
    const cleanedCookieHeader = req.cookies
      .getAll()
      .filter((c) => !matchingSessionCookies.includes(c.name))
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
    if (cleanedCookieHeader) {
      requestHeaders.set("cookie", cleanedCookieHeader);
    } else {
      requestHeaders.delete("cookie");
    }
    response = NextResponse.next({
      request: { headers: requestHeaders },
    });
  } else {
    response = NextResponse.next();
  }

  // Delete invalid/expired/legacy session cookies on the browser response as well
  if (!session && hasSessionCookie) {
    for (const name of matchingSessionCookies) {
      response.cookies.set(name, "", { maxAge: 0, path: "/" });
    }
  }

  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

