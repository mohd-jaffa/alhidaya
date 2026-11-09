import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

import { ADMIN_ROUTES, ADMIN_PUBLIC_ROUTES } from "@/constants/admin-routes";
import { contentSecurityPolicy } from "@/lib/security/policy";

/**
 * The admin's signed-in gate (AGENTS.md §9): a page under /admin without a
 * session cookie goes to sign-in, keeping where it was headed. It only looks
 * for the cookie; every admin route checks the session itself
 * (`withAdminRoute`), so this is convenience, not authorization. No admin page
 * is ever indexed.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const admin = pathname === "/admin" || pathname.startsWith("/admin/");
  const open = ADMIN_PUBLIC_ROUTES.includes(pathname);
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const policy = contentSecurityPolicy(nonce, process.env.NODE_ENV === "development");
  const headers = new Headers(request.headers);
  // Replace caller-supplied values: Next reads this policy to nonce its bootstrap scripts.
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", policy);

  let response: NextResponse;
  if (admin && !open && !getSessionCookie(request, { cookiePrefix: "alhidaya" })) {
    const signIn = new URL(ADMIN_ROUTES.login, request.url);
    signIn.searchParams.set("next", `${pathname}${search}`);
    response = NextResponse.redirect(signIn);
  } else {
    response = NextResponse.next({ request: { headers } });
  }
  response.headers.set("Content-Security-Policy", policy);
  if (admin) response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/((?!api(?:/|$)|_next(?:/|$)|media(?:/|$)).*)"],
};
