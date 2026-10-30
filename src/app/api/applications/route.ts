import { APPLICATION_FIELDS_BYTES, UPLOAD_LIMITS } from "@/constants/limits";
import { receiveApplication } from "@/features/careers/api";
import { readFormData, withApiHandler } from "@/lib/api/handler";
import { honeypotFilled } from "@/lib/api/honeypot";
import { assertSameOrigin } from "@/lib/api/origin";
import { clientIp } from "@/lib/api/request-info";
import { logger } from "@/lib/logger";
import { verifyTurnstile } from "@/lib/turnstile/verify";
import { applicationFormSchema } from "@/lib/validation";

/**
 * An application with its CV (plan §9.3): only from the site's own pages, and
 * never larger than a CV and its fields; a filled trap is answered as taken
 * and thrown away; then the fields and the file, then Cloudflare's check that
 * a person sent it, before the CV's type is read from its bytes and the
 * application is stored with the rate limit and its CV saved. Nothing about
 * the application is answered back.
 */
export function POST(request: Request) {
  return withApiHandler(
    request,
    async ({ requestId }) => {
      assertSameOrigin(request);
      const { fields, form } = await readFormData(request, {
        maxBytes: UPLOAD_LIMITS.cvBytes + APPLICATION_FIELDS_BYTES,
        tooLarge: "UPLOAD_TOO_LARGE",
      });
      if (honeypotFilled(fields)) {
        logger.info("Application discarded: its trap field was filled", undefined, requestId);
        return { received: true };
      }
      const payload = applicationFormSchema.parse({ ...(fields as object), cv: form.get("cv") });
      await verifyTurnstile(payload.turnstileToken);
      await receiveApplication(payload, clientIp(request));
      return { received: true };
    },
    { successStatus: 201 },
  );
}
