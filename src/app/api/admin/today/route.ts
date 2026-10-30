import { applicationSummaries } from "@/features/careers/api";
import { enquirySummaries } from "@/features/enquiries/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readQuery } from "@/lib/api/handler";
import { listArrivals } from "@/lib/inbox/arrivals";
import { todayQuerySchema } from "@/lib/validation";

/** Today (D81, plan §16): enquiries and applications as one stream, newest first, a page at a time. */
export function GET(request: Request) {
  return withAdminRoute(request, async () =>
    listArrivals(readQuery(request, todayQuerySchema), {
      enquiry: enquirySummaries,
      application: applicationSummaries,
    }),
  );
}
