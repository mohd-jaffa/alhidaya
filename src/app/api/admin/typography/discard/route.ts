import { discardTypographyDraft } from "@/features/settings/typography";
import { withAdminRoute } from "@/lib/api/admin";

export function POST(request: Request) {
  return withAdminRoute(request, ({ admin, requestId }) =>
    discardTypographyDraft({ adminId: admin.adminId, requestId }),
  );
}
