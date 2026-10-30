import { discardPageDraft, pageFromParam } from "@/features/content/api";
import { withAdminRoute } from "@/lib/api/admin";

type Context = { params: Promise<{ key: string }> };

/** Throws a page's draft away, back to what is published, asked first in the editor (plan §14). */
export function POST(request: Request, { params }: Context) {
  return withAdminRoute(request, async ({ admin, requestId }) =>
    discardPageDraft(pageFromParam((await params).key), { adminId: admin.adminId, requestId }),
  );
}
