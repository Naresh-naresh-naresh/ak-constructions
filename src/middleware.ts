import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Page-level access control.
 *
 * This is UX only — the matcher below covers pages, NOT /api/*. API routes are
 * guarded independently by src/lib/authz.ts, which is their sole authorization
 * boundary.
 *
 * Every check is "must EQUAL the expected role" so a token with no role claim
 * (issued before client accounts shipped) is denied rather than allowed through.
 *
 * Imports must stay limited to next-auth/jwt: middleware always runs on the Edge
 * runtime, and importing @/lib/auth would drag bcryptjs and @supabase/supabase-js
 * into the Edge bundle.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Dot access (not process.env["..."]) so Next statically inlines this for the
  // Edge runtime. With bracket access the secret can come through undefined, and
  // the symptom is opaque: login succeeds, then every request bounces back to
  // the login page with no error.
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    if (token?.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // /track/* — the client dashboard.
  if (token?.role === "admin") {
    // An admin has no project of their own to view; send them somewhere useful.
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  if (token?.role !== "client") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // /login and /signup are deliberately absent — they must stay reachable
  // while logged out. ":path*" also matches the bare prefix (e.g. /admin).
  matcher: ["/admin/:path*", "/track/:path*"],
};
