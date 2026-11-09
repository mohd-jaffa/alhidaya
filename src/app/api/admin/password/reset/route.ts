import { JSON_BODY_LIMITS } from "@/constants/limits";
import { resetPassword } from "@/features/auth/api";
import { readJson, withApiHandler } from "@/lib/api/handler";
import { assertSameOrigin } from "@/lib/api/origin";
import { resetPasswordSchema } from "@/lib/validation";

/** Sets a new password from a reset link (plan §26.4). */
export function POST(request: Request) {
  return withApiHandler(request, async ({ requestId }) => {
    assertSameOrigin(request);
    const { token, password } = await readJson(request, resetPasswordSchema, JSON_BODY_LIMITS.auth);
    await resetPassword(token, password, requestId);
    return { reset: true };
  });
}
