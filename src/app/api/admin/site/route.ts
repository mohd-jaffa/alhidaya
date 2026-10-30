import { getSiteForAdmin, saveSiteDraft } from "@/features/settings/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { siteDocumentSchema } from "@/lib/validation";

/** The site's content as a draft, with its brochure (plan §13, D94). */
export function GET(request: Request) {
  return withAdminRoute(request, () => getSiteForAdmin());
}

/** Saves the site's content whole as a draft (plan §13, §14); the site is unchanged until Publish. */
export function PUT(request: Request) {
  return withAdminRoute(request, async ({ admin, requestId }) =>
    saveSiteDraft(await readJson(request, siteDocumentSchema), { adminId: admin.adminId, requestId }),
  );
}
