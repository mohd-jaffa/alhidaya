import { ADMIN_ROUTES } from "@/constants/routes";

/**
 * Where sign-in sends the admin next (plan §26.4): the admin page they were
 * headed to, and nowhere else. Anything not a plain path under /admin (another
 * site, "//elsewhere", the API) goes to Today, so the sign-in page can never
 * be used to send someone off the site.
 */
export function adminReturnPath(next: unknown): string {
  if (typeof next !== "string") return ADMIN_ROUTES.overview;
  const path = next.trim();
  const ours = /^\/admin(?:[/?#]|$)/.test(path) && !path.includes("\\\\") && !path.startsWith("//");
  return ours && !path.startsWith(ADMIN_ROUTES.login) ? path : ADMIN_ROUTES.overview;
}
