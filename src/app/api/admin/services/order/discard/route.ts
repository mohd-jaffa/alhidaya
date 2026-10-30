import { discardServiceOrder } from "@/features/services/api";
import { withAdminRoute } from "@/lib/api/admin";

/** Throws the order's draft away, back to the published order (D92). */
export function POST(request: Request) {
  return withAdminRoute(request, ({ admin, requestId }) => discardServiceOrder({ adminId: admin.adminId, requestId }));
}
