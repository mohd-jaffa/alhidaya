import { setServiceArchived } from "@/features/services/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { archiveSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

/** Takes a service off the site, or puts it back, asked first (D92); it is never deleted. */
export function POST(request: Request, { params }: Context) {
  return withAdminRoute(request, async ({ admin, requestId }) => {
    const { archived } = await readJson(request, archiveSchema);
    return setServiceArchived((await params).id, archived, { adminId: admin.adminId, requestId });
  });
}
