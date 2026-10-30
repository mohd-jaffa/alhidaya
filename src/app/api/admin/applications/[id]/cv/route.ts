import { downloadApplicationCv } from "@/features/careers/api";
import { withAdminRoute } from "@/lib/api/admin";
import { fileResponse } from "@/lib/api/responses";

/** An application's CV, for the signed-in admin only, saved as a file; every download is recorded (plan §9.4). */
export function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdminRoute(request, async ({ admin, requestId }) =>
    fileResponse(await downloadApplicationCv((await params).id, { adminId: admin.adminId, requestId }), requestId),
  );
}
