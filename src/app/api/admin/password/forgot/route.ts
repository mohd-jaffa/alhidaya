import { requestPasswordReset } from "@/features/auth/api";
import { readJson, withApiHandler } from "@/lib/api/handler";
import { assertSameOrigin } from "@/lib/api/origin";
import { clientIp } from "@/lib/api/request-info";
import { forgotPasswordSchema } from "@/lib/validation";

/** Asks for a reset link; the answer never says whether the email is the admin's (plan §26.4). */
export function POST(request: Request) {
  return withApiHandler(request, async ({ requestId }) => {
    assertSameOrigin(request);
    const { email } = await readJson(request, forgotPasswordSchema);
    await requestPasswordReset(email, {
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
      requestId,
    });
    return { requested: true };
  });
}
