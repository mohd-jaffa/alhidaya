import { renameAdmin } from "@/features/auth/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/responses";
import { profileNameSchema } from "@/lib/validation";

/** The signed-in admin's own details (D115): who they are, as the session holds them. */
export function GET(request: Request) {
  return withAdminRoute(request, async ({ requestId, admin }) =>
    successResponse({ name: admin.name, email: admin.email }, requestId),
  );
}

/** Renames the signed-in admin (D115). */
export function PATCH(request: Request) {
  return withAdminRoute(request, async ({ requestId, admin }) => {
    const { name } = await readJson(request, profileNameSchema);
    await renameAdmin(request.headers, admin.adminId, name, requestId);
    return successResponse({ name, email: admin.email }, requestId);
  });
}
