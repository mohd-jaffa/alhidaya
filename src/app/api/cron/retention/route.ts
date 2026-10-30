import { purgeExpired } from "@/features/settings/api";
import { withCronRoute } from "@/lib/api/cron";

/** The daily clean-up (plan §18), called by the cPanel cron entry with CRON_SECRET. */
export function POST(request: Request) {
  return withCronRoute(request, () => purgeExpired());
}
