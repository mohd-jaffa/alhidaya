import { pageFromParam, publishPage } from "@/features/content/api";
import { withAdminRoute } from "@/lib/api/admin";

type Context = { params: Promise<{ key: string }> };

/** Publishes a page's saved draft, asked first in the editor (plan §14, D86). */
export function POST(request: Request, { params }: Context) {
  return withAdminRoute(request, async ({ admin, requestId }) =>
    publishPage(pageFromParam((await params).key), { adminId: admin.adminId, requestId }),
  );
}
