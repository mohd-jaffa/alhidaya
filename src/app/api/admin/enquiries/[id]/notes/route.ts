import { addEnquiryNote } from "@/features/enquiries/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { enquiryNoteSchema } from "@/lib/validation";

/** Adds the team's internal note to an enquiry (plan §10.5). */
export function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdminRoute(
    request,
    async ({ admin, requestId }) => {
      const { body } = await readJson(request, enquiryNoteSchema);
      return addEnquiryNote((await params).id, body, { adminId: admin.adminId, requestId });
    },
    { successStatus: 201 },
  );
}
