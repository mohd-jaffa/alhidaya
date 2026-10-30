import { API_ROUTES } from "@/constants/routes";

/**
 * Today's address, which is also its SWR key (D81): only what differs from
 * its defaults, so the rail's count and Today's list share one read.
 */
export function todayKey(query: { needsYou?: boolean; page?: number } = {}): string {
  const params = new URLSearchParams();
  if (query.needsYou) params.set("needsYou", "true");
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const search = params.toString();
  return search ? `${API_ROUTES.adminToday}?${search}` : API_ROUTES.adminToday;
}
