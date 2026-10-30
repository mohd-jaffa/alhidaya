import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import type { ApplicationStatus } from "@/constants/statuses";
import { deleteJson, patchJson, postJson } from "@/lib/api/client";

import type { ApplicationListQuery, ApplicationNoteItem } from "./types";

/**
 * A list's address, which is also its SWR key: only what differs from the
 * inbox's defaults, always in one order, so two screens asking for the same
 * list (the rail's count and Today) share one read.
 */
export function applicationsKey(query: ApplicationListQuery = {}): string {
  const params = new URLSearchParams();
  if (query.job) params.set("job", query.job);
  if (query.status) params.set("status", query.status);
  if (query.needsYou) params.set("needsYou", "true");
  if (query.q) params.set("q", query.q);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const search = params.toString();
  return search ? `${ADMIN_API_ROUTES.adminApplications}?${search}` : ADMIN_API_ROUTES.adminApplications;
}

/** The endpoints the applications inbox calls; the form's is in `form.client.ts` (plan §31). */
export const ApplicationsClient = {
  setStatus: ({ id, status }: { id: string; status: ApplicationStatus }) =>
    patchJson<{ status: ApplicationStatus }>(ADMIN_API_ROUTES.adminApplication(id), { status }),
  addNote: ({ id, body }: { id: string; body: string }) =>
    postJson<ApplicationNoteItem>(ADMIN_API_ROUTES.adminApplicationNotes(id), { body }),
  retryAlert: (id: string) => postJson<{ emailStatus: string }>(ADMIN_API_ROUTES.adminApplicationRetryMail(id)),
  remove: (id: string) => deleteJson<{ deleted: true }>(ADMIN_API_ROUTES.adminApplication(id)),
};
