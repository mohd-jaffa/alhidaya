import { publishJob } from "@/features/careers/api";
import { withAdminRoute } from "@/lib/api/admin";

type Context = { params: Promise<{ id: string }> };

/** Publishes a job's saved draft, asked first in the editor (plan §14, D92). */
export function POST(request: Request, { params }: Context) {
  return withAdminRoute(request, async ({ admin, requestId }) =>
    publishJob((await params).id, { adminId: admin.adminId, requestId }),
  );
}
