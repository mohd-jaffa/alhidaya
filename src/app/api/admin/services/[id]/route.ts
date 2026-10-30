import { getServiceForAdmin, saveServiceDraft } from "@/features/services/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { serviceDocumentSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

/** A service's draft, as the admin edits it (plan §14). */
export function GET(request: Request, { params }: Context) {
  return withAdminRoute(request, async () => getServiceForAdmin((await params).id));
}

/** Saves a service's draft whole (plan §14, D92); the site is unchanged until Publish. */
export function PUT(request: Request, { params }: Context) {
  return withAdminRoute(request, async ({ admin, requestId }) => {
    const { id } = await params;
    return saveServiceDraft(id, await readJson(request, serviceDocumentSchema), { adminId: admin.adminId, requestId });
  });
}
