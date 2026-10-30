import { createService, listServicesForAdmin } from "@/features/services/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { serviceDocumentSchema } from "@/lib/validation";

/** Every service, in its draft order, with where the order stands (D92). */
export function GET(request: Request) {
  return withAdminRoute(request, () => listServicesForAdmin());
}

/** Makes a service as a draft (D92); nothing shows on the site until it is published. */
export function POST(request: Request) {
  return withAdminRoute(
    request,
    async ({ admin, requestId }) =>
      createService(await readJson(request, serviceDocumentSchema), { adminId: admin.adminId, requestId }),
    { successStatus: 201 },
  );
}
