import { retryApplicationAlerts } from "@/features/careers/api";
import { retryEnquiryAlerts } from "@/features/enquiries/api";
import { withCronRoute } from "@/lib/api/cron";

/**
 * The mail-retry cron (D85, plan §17), called every 10 minutes by the cPanel
 * cron entry with CRON_SECRET: each enquiry alert and HR email not sent, sent
 * again while it has tries left; answers what each inbox tried and sent.
 */
export function POST(request: Request) {
  return withCronRoute(request, async () => ({
    enquiries: await retryEnquiryAlerts(),
    applications: await retryApplicationAlerts(),
  }));
}
