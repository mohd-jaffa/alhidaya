import { createClient, listClientsForAdmin } from "@/features/clients/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { clientDocumentSchema } from "@/lib/validation";

/** Every client logo, in its draft order, with where the order stands (D92). */
export function GET(request: Request) {
  return withAdminRoute(request, () => listClientsForAdmin());
}

/** Adds a client logo as a draft (D92); nothing shows on the site until it is published. */
export function POST(request: Request) {
  return withAdminRoute(
    request,
    async ({ admin, requestId }) =>
      createClient(await readJson(request, clientDocumentSchema), { adminId: admin.adminId, requestId }),
    { successStatus: 201 },
  );
}
