import { listPagesForAdmin } from "@/features/content/api";
import { withAdminRoute } from "@/lib/api/admin";

/** The eight pages, each with where it stands (D86, D88). */
export function GET(request: Request) {
  return withAdminRoute(request, () => listPagesForAdmin());
}
