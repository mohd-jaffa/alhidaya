import { setJobArchived } from "@/features/careers/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { archiveSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

/** Takes a job off the site, or puts it back, asked first (D92); it and its applications are kept. */
export function POST(request: Request, { params }: Context) {
  return withAdminRoute(request, async ({ admin, requestId }) => {
    const { archived } = await readJson(request, archiveSchema);
    return setJobArchived((await params).id, archived, { adminId: admin.adminId, requestId });
  });
}
