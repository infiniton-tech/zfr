import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getSessionToken(req: NextRequest): string | undefined {
  // NextAuth v5 uses "authjs.session-token", legacy uses "next-auth.session-token"
  return req.cookies.get("authjs.session-token")?.value
    || req.cookies.get("__Secure-authjs.session-token")?.value
    || req.cookies.get("next-auth.session-token")?.value
    || req.cookies.get("__Secure-next-auth.session-token")?.value;
}

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const token = getSessionToken(req);
  const isLoggedIn = !!token;
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/register";

  if (isAdminRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register"],
};
