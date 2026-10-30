import { deleteImage, updateImageDetails } from "@/features/media/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { imageDetailsSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

/** Changes an image's words (D93): what it shows, decorative or not, where it came from. */
export function PATCH(request: Request, { params }: Context) {
  return withAdminRoute(request, async ({ admin, requestId }) => {
    const { id } = await params;
    return updateImageDetails(id, await readJson(request, imageDetailsSchema), { adminId: admin.adminId, requestId });
  });
}

/** Deletes an image and its files, asked first; refused, naming each place, while it is used (plan §15). */
export function DELETE(request: Request, { params }: Context) {
  return withAdminRoute(request, async ({ admin, requestId }) =>
    deleteImage((await params).id, { adminId: admin.adminId, requestId }),
  );
}
