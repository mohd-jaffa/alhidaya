import { receiveEnquiry } from "@/features/enquiries/api";
import { readJson, withApiHandler } from "@/lib/api/handler";
import { assertSameOrigin } from "@/lib/api/origin";
import { clientIp } from "@/lib/api/request-info";
import { enquirySchema } from "@/lib/validation";

/** A Quote or Contact form (plan §10): only from the site's own pages; nothing about the enquiry is answered back. */
export function POST(request: Request) {
  return withApiHandler(
    request,
    async () => {
      assertSameOrigin(request);
      const payload = await readJson(request, enquirySchema);
      await receiveEnquiry(payload, clientIp(request));
      return { received: true };
    },
    { successStatus: 201 },
  );
}
