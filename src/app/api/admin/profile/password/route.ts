import { JSON_BODY_LIMITS } from "@/constants/limits";
import { changeAdminPassword } from "@/features/auth/api";
import { withAdminRoute, withCookies } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/responses";
import { changePasswordSchema } from "@/lib/validation";

/** A new password from the signed-in admin's profile (D115); this session stays, every other ends. */
export function POST(request: Request) {
  return withAdminRoute(request, async ({ requestId, admin }) => {
    const { currentPassword, newPassword } = await readJson(request, changePasswordSchema, JSON_BODY_LIMITS.auth);
    const cookies = await changeAdminPassword(
      request.headers,
      admin.adminId,
      { currentPassword, newPassword },
      requestId,
    );
    return withCookies(successResponse({ changed: true }, requestId), cookies);
  });
}
