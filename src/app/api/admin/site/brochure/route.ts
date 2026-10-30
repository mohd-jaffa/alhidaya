import { MEDIA_FIELDS_BYTES, UPLOAD_LIMITS } from "@/constants/limits";
import { uploadBrochure } from "@/features/settings/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readFormData } from "@/lib/api/handler";
import { brochureFileSchema } from "@/lib/validation";

/**
 * Uploads a new brochure (plan §12, D94): never larger than a brochure; its
 * type read from its bytes as it is kept. It goes live with Settings' Publish.
 */
export function POST(request: Request) {
  return withAdminRoute(
    request,
    async ({ admin, requestId }) => {
      const { form } = await readFormData(request, {
        maxBytes: UPLOAD_LIMITS.brochureBytes + MEDIA_FIELDS_BYTES,
        tooLarge: "UPLOAD_TOO_LARGE",
      });
      const file = brochureFileSchema.parse(form.get("file"));
      return uploadBrochure(new Uint8Array(await file.arrayBuffer()), { adminId: admin.adminId, requestId });
    },
    { successStatus: 201 },
  );
}
