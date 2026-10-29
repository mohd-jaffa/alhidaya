import { draftMode } from "next/headers";

import { withAdminRoute } from "@/lib/api/admin";
import { readQuery } from "@/lib/api/handler";
import { previewQuerySchema } from "@/lib/validation";

/**
 * Opens a public page in the admin's preview (plan §14): draft mode on, then
 * the page, showing drafts under the preview bar. Only the signed-in admin;
 * only a page of the public site.
 */
export function GET(request: Request) {
  return withAdminRoute(request, async () => {
    const { path } = readQuery(request, previewQuerySchema);
    (await draftMode()).enable();
    return new Response(null, { status: 303, headers: { location: path, "cache-control": "no-store" } });
  });
}
