import { discardJobDraft } from "@/features/careers/api";
import { withAdminRoute } from "@/lib/api/admin";

type Context = { params: Promise<{ id: string }> };

/** Throws a job's draft away, back to what is published, asked first (plan §14). */
export function POST(request: Request, { params }: Context) {
  return withAdminRoute(request, async ({ admin, requestId }) =>
    discardJobDraft((await params).id, { adminId: admin.adminId, requestId }),
  );
}
