import { getServerEnv } from "@/lib/env/server";
import { authorizationError } from "@/lib/errors";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Cross-site request forgery is refused at the door (plan §26.4): a request
 * that changes anything must come from the site's own pages, which browsers
 * prove with the `Origin` header. With `SameSite=Lax` cookies this is the
 * second lock, not the only one.
 */
export function forbiddenOrigin(request: Request): boolean {
  if (SAFE_METHODS.has(request.method)) return false;
  const origin = request.headers.get("origin");
  return origin !== new URL(getServerEnv().NEXT_PUBLIC_SITE_URL).origin;
}

export function assertSameOrigin(request: Request): void {
  if (forbiddenOrigin(request)) throw authorizationError("REQUEST_ORIGIN_REFUSED");
}
