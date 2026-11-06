import { PAGE_ROUTES, ROUTES } from "@/constants/routes";
import { SEED_SERVICES, seedJob } from "@/db/seed/content";

const job = seedJob("2026-10-01");
export const MISSING_PERFORMANCE_ROUTE = "/performance-page-that-does-not-exist";

/** Every published launch page, including each service, the job and both application variants. */
export const PUBLIC_PERFORMANCE_ROUTES = [
  ...Object.values(PAGE_ROUTES),
  ...SEED_SERVICES.map((service) => ROUTES.service(service.slug)),
  ROUTES.job(job.slug),
  ROUTES.applyGeneral,
  ROUTES.applyForJob(job.slug),
  MISSING_PERFORMANCE_ROUTE,
];
