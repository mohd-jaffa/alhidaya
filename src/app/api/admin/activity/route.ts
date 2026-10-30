import { listActivity } from "@/features/activity/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readQuery } from "@/lib/api/handler";
import { activityQuerySchema } from "@/lib/validation";

/** Activity (D96): the admin's changes newest first, of one kind or all, a page at a time. */
export function GET(request: Request) {
  return withAdminRoute(request, async () => listActivity(readQuery(request, activityQuerySchema)));
}
