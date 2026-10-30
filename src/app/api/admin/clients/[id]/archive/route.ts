import { setClientArchived } from "@/features/clients/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { archiveSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

/** Takes a client logo off the site, or puts it back, asked first (D92); it is never deleted. */
export function POST(request: Request, { params }: Context) {
  return withAdminRoute(request, async ({ admin, requestId }) => {
    const { archived } = await readJson(request, archiveSchema);
    return setClientArchived((await params).id, archived, { adminId: admin.adminId, requestId });
  });
}
