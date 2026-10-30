import { deleteEnquiry, getEnquiry, setEnquiryStatus } from "@/features/enquiries/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { enquiryStatusSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

/** One enquiry, every answer as sent, with its notes (plan §10.5). */
export function GET(request: Request, { params }: Context) {
  return withAdminRoute(request, async () => getEnquiry((await params).id));
}

/** Moves an enquiry along: new, in progress, resolved (plan §10.5). */
export function PATCH(request: Request, { params }: Context) {
  return withAdminRoute(request, async ({ admin, requestId }) => {
    const { status } = await readJson(request, enquiryStatusSchema);
    await setEnquiryStatus((await params).id, status, { adminId: admin.adminId, requestId });
    return { status };
  });
}

/** Deletes an enquiry and its notes at once, asked first in the inbox (D82). */
export function DELETE(request: Request, { params }: Context) {
  return withAdminRoute(request, async ({ admin, requestId }) => {
    await deleteEnquiry((await params).id, { adminId: admin.adminId, requestId });
    return { deleted: true };
  });
}
