import { getJobForAdmin, saveJobDraft } from "@/features/careers/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { jobDocumentSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

/** A job's draft, as the admin edits it (plan §14). */
export function GET(request: Request, { params }: Context) {
  return withAdminRoute(request, async () => getJobForAdmin((await params).id));
}

/** Saves a job's draft whole (plan §14, D92); the site is unchanged until Publish. */
export function PUT(request: Request, { params }: Context) {
  return withAdminRoute(request, async ({ admin, requestId }) => {
    const { id } = await params;
    return saveJobDraft(id, await readJson(request, jobDocumentSchema), { adminId: admin.adminId, requestId });
  });
}
