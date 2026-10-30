import { getOperationsForAdmin, saveOperations } from "@/features/settings/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { operationsSchema } from "@/lib/validation";

/** How the site runs (plan §13, D95): the recipients and the keeping periods, the folders' use, the last clean-up. */
export function GET(request: Request) {
  return withAdminRoute(request, () => getOperationsForAdmin());
}

/** Changes how the site runs, asked first when a keeping period changes; at once, and audited. */
export function PUT(request: Request) {
  return withAdminRoute(request, async ({ admin, requestId }) =>
    saveOperations(await readJson(request, operationsSchema), { adminId: admin.adminId, requestId }),
  );
}
