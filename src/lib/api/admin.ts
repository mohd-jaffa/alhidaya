import { getAdminSession, type AdminSession } from "@/lib/auth/session";
import { authenticationError } from "@/lib/errors";

import { type ApiContext, withApiHandler } from "./handler";
import { assertSameOrigin } from "./origin";

export interface AdminContext extends ApiContext {
  admin: AdminSession;
}

/**
 * What every admin route is wrapped in (plan §26.1, AGENTS.md §9): the
 * request must come from the site's own pages, and carry a session the
 * database still holds; the proxy's cookie check is not authorization. The
 * admin is then known to the route, its audit rows and its error log.
 */
export function withAdminRoute<TData>(
  request: Request,
  handler: (context: AdminContext) => Promise<TData>,
  options?: { successStatus?: number },
) {
  return withApiHandler(
    request,
    async (context) => {
      assertSameOrigin(request);
      const admin = await getAdminSession(request.headers);
      if (!admin) throw authenticationError("AUTH_SESSION_REQUIRED");
      context.adminId = admin.adminId;
      return handler({ ...context, admin });
    },
    options,
  );
}

/** Copies the cookies Better Auth set onto the route's own answer. */
export function withCookies(response: Response, headers: Headers): Response {
  for (const cookie of headers.getSetCookie()) response.headers.append("set-cookie", cookie);
  return response;
}
