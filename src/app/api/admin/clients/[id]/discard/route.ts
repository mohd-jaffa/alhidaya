import { discardClientDraft } from "@/features/clients/api";
import { withAdminRoute } from "@/lib/api/admin";

type Context = { params: Promise<{ id: string }> };

/** Throws a client logo's draft away, back to what is published, asked first (plan §14). */
export function POST(request: Request, { params }: Context) {
  return withAdminRoute(request, async ({ admin, requestId }) =>
    discardClientDraft((await params).id, { adminId: admin.adminId, requestId }),
  );
}
