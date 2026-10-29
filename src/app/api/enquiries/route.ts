import { after } from "next/server";
import * as z from "zod";

import { receiveEnquiry, sendEnquiryAlert } from "@/features/enquiries/api";
import { readJson, withApiHandler } from "@/lib/api/handler";
import { honeypotFilled } from "@/lib/api/honeypot";
import { captureError } from "@/lib/audit/errorLog";
import { assertSameOrigin } from "@/lib/api/origin";
import { clientIp } from "@/lib/api/request-info";
import { logger } from "@/lib/logger";
import { verifyTurnstile } from "@/lib/turnstile/verify";
import { enquirySchema } from "@/lib/validation";

/**
 * A Quote or Contact form (plan §10.3): only from the site's own pages; a
 * filled trap is answered as taken and thrown away; then the fields, then
 * Cloudflare's check that a person sent it, before anything is stored with
 * the rate limit. Nothing about the enquiry is answered back. Its alert goes
 * once the visitor has their answer (plan §10.4): they never wait on the mail
 * server, and a failure never reaches them.
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
      const id = await receiveEnquiry(payload, clientIp(request));
      after(async () => {
        try {
          await sendEnquiryAlert(id);
        } catch (error) {
          await captureError({ message: "Enquiry alert not recorded", error, reference: requestId });
        }
      });
      return { received: true };
    },
    { successStatus: 201 },
  );
}
