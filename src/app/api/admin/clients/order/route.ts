import { saveClientOrder } from "@/features/clients/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { orderingDocumentSchema } from "@/lib/validation";

/** Saves the client logos' order as a draft (D92); the site keeps the published order until Publish. */
export function PUT(request: Request) {
  return withAdminRoute(request, async ({ admin, requestId }) =>
    saveClientOrder(await readJson(request, orderingDocumentSchema), { adminId: admin.adminId, requestId }),
  );
}
