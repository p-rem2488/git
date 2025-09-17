import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Basic redirect to login if not authenticated and accessing root dashboard
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/onboarding") || req.nextUrl.pathname.startsWith("/api");
  const hasSession = req.cookies.get("sb-access-token");
  if (!isAuthRoute && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|public).*)"],
};

