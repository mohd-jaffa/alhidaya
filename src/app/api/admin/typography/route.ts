import { getTypographyForAdmin, saveTypographyDraft } from "@/features/settings/typography";
import { withAdminRoute } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { typographySchema } from "@/lib/validation/schemas/typography";

export function GET(request: Request) {
  return withAdminRoute(request, () => getTypographyForAdmin());
}
export function PUT(request: Request) {
  return withAdminRoute(request, async ({ admin, requestId }) =>
    saveTypographyDraft(await readJson(request, typographySchema), { adminId: admin.adminId, requestId }),
  );
}
