import { retryEnquiryAlert } from "@/features/enquiries/api";
import { withAdminRoute } from "@/lib/api/admin";

/** Sends an enquiry's alert again, when it was not sent (plan §10.4). */
export function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdminRoute(request, async ({ admin, requestId }) => ({
    emailStatus: await retryEnquiryAlert((await params).id, { adminId: admin.adminId, requestId }),
  }));
}
