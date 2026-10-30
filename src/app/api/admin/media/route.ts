import { listImagesForAdmin } from "@/features/media/api";
import { withAdminRoute } from "@/lib/api/admin";

/** The media library's images, newest first, for a section's photo (D89); upload joins at R6.5. */
export function GET(request: Request) {
  return withAdminRoute(request, () => listImagesForAdmin());
}
