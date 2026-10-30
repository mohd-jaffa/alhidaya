import { ADMIN_API_ROUTES } from "@/constants/admin-routes";

import type { ActivityQuery } from "./types";

/** Activity's address for a kind and a page, which is also its SWR key (D96). */
export function activityKey(query: ActivityQuery = {}): string {
  const params = new URLSearchParams();
  if (query.kind) params.set("kind", query.kind);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const search = params.toString();
  return search ? `${ADMIN_API_ROUTES.adminActivity}?${search}` : ADMIN_API_ROUTES.adminActivity;
}
