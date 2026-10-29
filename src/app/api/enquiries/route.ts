import * as z from "zod";

import { receiveEnquiry } from "@/features/enquiries/api";
import { readJson, withApiHandler } from "@/lib/api/handler";
import { honeypotFilled } from "@/lib/api/honeypot";
import { assertSameOrigin } from "@/lib/api/origin";
import { clientIp } from "@/lib/api/request-info";
import { logger } from "@/lib/logger";
import { verifyTurnstile } from "@/lib/turnstile/verify";
import { enquirySchema } from "@/lib/validation";

/**
 * A Quote or Contact form (plan §10.3): only from the site's own pages; a
 * filled trap is answered as taken and thrown away; then the fields, then
 * Cloudflare's check that a person sent it, before anything is stored with
 * the rate limit. Nothing about the enquiry is answered back.
 */
export function POST(request: Request) {
  return withApiHandler(
    request,
    async ({ requestId }) => {
      assertSameOrigin(request);
      const body = await readJson(request, z.unknown());
      if (honeypotFilled(body)) {
        logger.info("Enquiry discarded: its trap field was filled", undefined, requestId);
        return { received: true };
      }
      const payload = enquirySchema.parse(body);
      await verifyTurnstile(payload.turnstileToken);
      await receiveEnquiry(payload, clientIp(request));
      return { received: true };
    },
    { successStatus: 201 },
  );
}
