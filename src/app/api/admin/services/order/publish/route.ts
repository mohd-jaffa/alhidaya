import { publishServiceOrder } from "@/features/services/api";
import { withAdminRoute } from "@/lib/api/admin";

/** Publishes the services' order, asked first (D92). */
export function POST(request: Request) {
  return withAdminRoute(request, ({ admin, requestId }) => publishServiceOrder({ adminId: admin.adminId, requestId }));
}
