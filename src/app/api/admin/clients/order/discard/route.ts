import { discardClientOrder } from "@/features/clients/api";
import { withAdminRoute } from "@/lib/api/admin";

/** Throws the order's draft away, back to the published order (D92). */
export function POST(request: Request) {
  return withAdminRoute(request, ({ admin, requestId }) => discardClientOrder({ adminId: admin.adminId, requestId }));
}
