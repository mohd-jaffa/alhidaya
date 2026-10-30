import { retryApplicationAlert } from "@/features/careers/api";
import { withAdminRoute } from "@/lib/api/admin";

/** Sends an application's HR email again, when it was not sent (plan §9.3). */
export function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdminRoute(request, async ({ admin, requestId }) => ({
    emailStatus: await retryApplicationAlert((await params).id, { adminId: admin.adminId, requestId }),
  }));
}
