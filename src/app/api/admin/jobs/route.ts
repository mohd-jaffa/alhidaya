import { createJob, listJobsForAdmin } from "@/features/careers/api";
import { withAdminRoute } from "@/lib/api/admin";
import { readJson } from "@/lib/api/handler";
import { jobDocumentSchema } from "@/lib/validation";

/** Every job, newest posting first, with where each stands on the site (D92). */
export function GET(request: Request) {
  return withAdminRoute(request, () => listJobsForAdmin());
}

/** Makes a job as a draft (D92); nothing shows on the site until it is published. */
export function POST(request: Request) {
  return withAdminRoute(
    request,
    async ({ admin, requestId }) =>
      createJob(await readJson(request, jobDocumentSchema), { adminId: admin.adminId, requestId }),
    { successStatus: 201 },
  );
}
