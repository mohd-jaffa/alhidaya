import { setJobClosed } from "@/features/careers/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { closeSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

/** Closes a published job at once, or opens it again, asked first (D92). */
export function POST(request: Request, { params }: Context) {
  return withAdminRoute(request, async ({ admin, requestId }) => {
    const { closed } = await readJson(request, closeSchema);
    return setJobClosed((await params).id, closed, { adminId: admin.adminId, requestId });
  });
}
