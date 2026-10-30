import { MEDIA_FIELDS_BYTES, UPLOAD_LIMITS } from "@/constants/limits";
import { listImagesForAdmin, uploadImage } from "@/features/media/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readFormData } from "@/lib/api/handler";
import { imageDetailsSchema, imageFileSchema } from "@/lib/validation";

/** The media library's images, newest first, with where each is used (D89, D93). */
export function GET(request: Request) {
  return withAdminRoute(request, () => listImagesForAdmin());
}

/**
 * Uploads an image (plan §15, D93): never larger than an image and its
 * words; its words checked, then its type and size read from its bytes as it
 * is stored in its sizes.
 */
export function POST(request: Request) {
  return withAdminRoute(
    request,
    async ({ admin, requestId }) => {
      const { fields, form } = await readFormData(request, {
        maxBytes: UPLOAD_LIMITS.imageBytes + MEDIA_FIELDS_BYTES,
        tooLarge: "UPLOAD_TOO_LARGE",
      });
      const details = imageDetailsSchema.parse(fields);
      const file = imageFileSchema.parse(form.get("file"));
      return uploadImage(new Uint8Array(await file.arrayBuffer()), details, { adminId: admin.adminId, requestId });
    },
    { successStatus: 201 },
  );
}
