import { addApplicationNote } from "@/features/careers/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { applicationNoteSchema } from "@/lib/validation";

/** Adds the team's internal note to an application (plan §9.5). */
export function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdminRoute(
    request,
    async ({ admin, requestId }) => {
      const { body } = await readJson(request, applicationNoteSchema);
      return addApplicationNote((await params).id, body, { adminId: admin.adminId, requestId });
    },
    { successStatus: 201 },
  );
}
