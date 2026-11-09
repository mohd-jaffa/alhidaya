import { JSON_BODY_LIMITS } from "@/constants/limits";
import { signIn, signOut } from "@/features/auth/api";
import { withAdminRoute, withCookies } from "@/lib/api/admin";
import { readJson, withApiHandler } from "@/lib/api/handler";
import { assertSameOrigin } from "@/lib/api/origin";
import { clientIp } from "@/lib/api/request-info";
import { successResponse } from "@/lib/api/responses";
import { signInSchema } from "@/lib/validation";

/** Signs the admin in (plan §26.4). */
export function POST(request: Request) {
  return withApiHandler(request, async ({ requestId }) => {
    assertSameOrigin(request);
    const body = await readJson(request, signInSchema, JSON_BODY_LIMITS.auth);
    const cookies = await signIn(body, {
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
      requestId,
    });
    return withCookies(successResponse({ signedIn: true }, requestId), cookies);
  });
}

/** Signs the admin out. */
export function DELETE(request: Request) {
  return withAdminRoute(request, async ({ requestId, admin }) => {
    const cookies = await signOut(request.headers, admin.adminId, requestId);
    return withCookies(successResponse({ signedOut: true }, requestId), cookies);
  });
}
