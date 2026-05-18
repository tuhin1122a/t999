import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authRoutes, publicRoutes, providerApiPrefix } from "./routes";
import authConfig from "./auth.config";

const { auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
});

export default auth(async (req) => {
  const { nextUrl } = req;
  const session = !!req.auth;

  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isProvider = nextUrl.pathname.startsWith(providerApiPrefix);

  // Check if any NextAuth session cookies are present in the request
  const hasSessionCookie =
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("next-auth.session-token") ||
    req.cookies.has("__Secure-authjs.session-token") ||
    req.cookies.has("__Secure-next-auth.session-token");

  let response: NextResponse;

  if (session && isAuthRoute && !isProvider) {
    response = NextResponse.redirect(new URL("/", nextUrl));
  } else if (!session && !isPublicRoute && !isProvider && !isAuthRoute) {
    const callbackUrl = nextUrl.pathname;
    const encodeCallbackUrl = encodeURIComponent(callbackUrl);
    response = NextResponse.redirect(
      new URL(`/login?redirect=${encodeCallbackUrl}`, nextUrl)
    );
  } else {
    response = NextResponse.next();
  }

  // If there is no valid session but browser has sent invalid/expired/corrupt session cookies,
  // delete them immediately to prevent JWTSessionError: no matching decryption secret spam.
  if (!session && hasSessionCookie) {
    console.log("🧹 [Middleware] Cleaning up invalid/expired session cookies from browser...");
    response.cookies.set("authjs.session-token", "", { maxAge: 0, path: "/" });
    response.cookies.set("next-auth.session-token", "", { maxAge: 0, path: "/" });
    response.cookies.set("__Secure-authjs.session-token", "", { maxAge: 0, path: "/" });
    response.cookies.set("__Secure-next-auth.session-token", "", { maxAge: 0, path: "/" });
  }

  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

