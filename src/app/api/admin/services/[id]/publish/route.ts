import { publishService } from "@/features/services/api";
import { withAdminRoute } from "@/lib/api/admin";

type Context = { params: Promise<{ id: string }> };

/** Publishes a service's saved draft, asked first in the editor (plan §14, D92). */
export function POST(request: Request, { params }: Context) {
  return withAdminRoute(request, async ({ admin, requestId }) =>
    publishService((await params).id, { adminId: admin.adminId, requestId }),
  );
}
