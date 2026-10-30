import { getClientForAdmin, saveClientDraft } from "@/features/clients/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { clientDocumentSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

/** A client logo's draft, as the admin edits it (plan §14). */
export function GET(request: Request, { params }: Context) {
  return withAdminRoute(request, async () => getClientForAdmin((await params).id));
}

/** Saves a client logo's draft whole (plan §14, D92); the site is unchanged until Publish. */
export function PUT(request: Request, { params }: Context) {
  return withAdminRoute(request, async ({ admin, requestId }) => {
    const { id } = await params;
    return saveClientDraft(id, await readJson(request, clientDocumentSchema), { adminId: admin.adminId, requestId });
  });
}
