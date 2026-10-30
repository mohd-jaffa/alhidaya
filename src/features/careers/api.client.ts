import { API_ROUTES } from "@/constants/routes";
import type { ApplicationStatus } from "@/constants/statuses";
import { deleteJson, patchJson, postForm, postJson } from "@/lib/api/client";

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
  return search ? `${API_ROUTES.adminApplications}?${search}` : API_ROUTES.adminApplications;
}

/** The endpoint the application form calls (AGENTS.md §14). */
export const CareersClient = {
  /**
   * What was typed goes as one JSON part, to be read once more by the route's
   * schema exactly as a JSON body would be, and the CV as a file beside it.
   */
  apply: (values: Record<string, unknown>) => {
    const { cv, ...fields } = values;
    const form = new FormData();
    form.set("fields", JSON.stringify(fields));
    if (cv instanceof File) form.set("cv", cv);
    return postForm<{ received: true }>(API_ROUTES.applications, form);
  },
};

/** The endpoints the applications inbox calls, apart from the form's so the public page never carries them. */
export const ApplicationsClient = {
  setStatus: ({ id, status }: { id: string; status: ApplicationStatus }) =>
    patchJson<{ status: ApplicationStatus }>(API_ROUTES.adminApplication(id), { status }),
  addNote: ({ id, body }: { id: string; body: string }) =>
    postJson<ApplicationNoteItem>(API_ROUTES.adminApplicationNotes(id), { body }),
  retryAlert: (id: string) => postJson<{ emailStatus: string }>(API_ROUTES.adminApplicationRetryMail(id)),
  remove: (id: string) => deleteJson<{ deleted: true }>(API_ROUTES.adminApplication(id)),
};
