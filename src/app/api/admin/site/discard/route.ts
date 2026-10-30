import { discardSiteDraft } from "@/features/settings/api";
import { withAdminRoute } from "@/lib/api/admin";

/** Throws the site's draft away, back to what is published, asked first (plan §14). */
export function POST(request: Request) {
  return withAdminRoute(request, ({ admin, requestId }) => discardSiteDraft({ adminId: admin.adminId, requestId }));
}
