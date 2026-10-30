import { publishSite } from "@/features/settings/api";
import { withAdminRoute } from "@/lib/api/admin";

/** Publishes the site's content, asked first in the editor (plan §13, §14, D94). */
export function POST(request: Request) {
  return withAdminRoute(request, ({ admin, requestId }) => publishSite({ adminId: admin.adminId, requestId }));
}
