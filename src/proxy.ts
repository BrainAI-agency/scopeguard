import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/chat", "/audit", "/connect", "/api/audit", "/api/connections"];

export async function proxy(request: NextRequest) {
  // Let Auth0 handle its own routes (/auth/*)
  const authResponse = await auth0.middleware(request);

  // Check if route needs protection
  const isProtected = PROTECTED_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtected) {
    const session = await auth0.getSession(request);
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
