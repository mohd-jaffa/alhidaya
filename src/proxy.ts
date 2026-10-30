import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

import { ADMIN_ROUTES, ADMIN_PUBLIC_ROUTES } from "@/constants/admin-routes";

/**
 * The admin's signed-in gate (AGENTS.md §9): a page under /admin without a
 * session cookie goes to sign-in, keeping where it was headed. It only looks
 * for the cookie; every admin route checks the session itself
 * (`withAdminRoute`), so this is convenience, not authorization. No admin page
 * is ever indexed.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const open = ADMIN_PUBLIC_ROUTES.includes(pathname);

  if (!open && !getSessionCookie(request, { cookiePrefix: "alhidaya" })) {
    const signIn = new URL(ADMIN_ROUTES.login, request.url);
    signIn.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(signIn);
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
