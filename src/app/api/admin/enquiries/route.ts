import { listEnquiries } from "@/features/enquiries/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readQuery } from "@/lib/api/handler";
import { enquiryListQuerySchema } from "@/lib/validation";

/** The enquiries inbox (plan §10.5): newest first, by form, status and search, a page at a time. */
export function GET(request: Request) {
  return withAdminRoute(request, async () => listEnquiries(readQuery(request, enquiryListQuerySchema)));
}
