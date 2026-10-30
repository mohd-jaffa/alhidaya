import { publishClientOrder } from "@/features/clients/api";
import { withAdminRoute } from "@/lib/api/admin";

/** Publishes the client logos' order, asked first (D92). */
export function POST(request: Request) {
  return withAdminRoute(request, ({ admin, requestId }) => publishClientOrder({ adminId: admin.adminId, requestId }));
}
