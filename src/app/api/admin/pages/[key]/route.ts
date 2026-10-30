import { getPageForAdmin, pageFromParam, savePageDraft } from "@/features/content/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { pageDocumentSchema } from "@/lib/validation";

type Context = { params: Promise<{ key: string }> };

/** A page's draft, as the admin edits it (plan §14). */
export function GET(request: Request, { params }: Context) {
  return withAdminRoute(request, async () => getPageForAdmin(pageFromParam((await params).key)));
}

/** Saves a page's draft whole, held to its page's rules (plan §7.1, D88); the site is unchanged until Publish. */
export function PUT(request: Request, { params }: Context) {
  return withAdminRoute(request, async ({ admin, requestId }) => {
    const page = pageFromParam((await params).key);
    const document = await readJson(request, pageDocumentSchema(page));
    return savePageDraft(page, document, { adminId: admin.adminId, requestId });
  });
}
