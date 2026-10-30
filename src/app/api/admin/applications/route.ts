import { listApplications } from "@/features/careers/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readQuery } from "@/lib/api/handler";
import { applicationListQuerySchema } from "@/lib/validation";

/** The applications inbox (plan §9.5): newest first, by job, status and search, a page at a time. */
export function GET(request: Request) {
  return withAdminRoute(request, async () => listApplications(readQuery(request, applicationListQuerySchema)));
}
