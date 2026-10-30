import { deleteApplication, getApplication, setApplicationStatus } from "@/features/careers/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { applicationStatusSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

/** One application, every answer as sent, its CV as uploaded, with its notes (plan §9.5). */
export function GET(request: Request, { params }: Context) {
  return withAdminRoute(request, async () => getApplication((await params).id));
}

/** Moves an application along: new, in review, shortlisted, closed (plan §9.5). */
export function PATCH(request: Request, { params }: Context) {
  return withAdminRoute(request, async ({ admin, requestId }) => {
    const { status } = await readJson(request, applicationStatusSchema);
    await setApplicationStatus((await params).id, status, { adminId: admin.adminId, requestId });
    return { status };
  });
}

/** Deletes an application, its notes and its CV file at once, asked first in the inbox (D82). */
export function DELETE(request: Request, { params }: Context) {
  return withAdminRoute(request, async ({ admin, requestId }) => {
    await deleteApplication((await params).id, { adminId: admin.adminId, requestId });
    return { deleted: true };
  });
}
