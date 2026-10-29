import { API_ROUTES } from "@/constants/routes";
import type { EnquiryStatus, FormKind } from "@/constants/statuses";
import { patchJson, postJson } from "@/lib/api/client";

import type { EnquiryListQuery, EnquiryNoteItem } from "./types";

/**
 * A list's address, which is also its SWR key: only what differs from the
 * inbox's defaults, always in one order, so two screens asking for the same
 * list (the rail's count and Today) share one read.
 */
export function enquiriesKey(query: EnquiryListQuery = {}): string {
  const params = new URLSearchParams();
  if (query.form) params.set("form", query.form);
  if (query.status) params.set("status", query.status);
  if (query.needsYou) params.set("needsYou", "true");
  if (query.q) params.set("q", query.q);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const search = params.toString();
  return search ? `${API_ROUTES.adminEnquiries}?${search}` : API_ROUTES.adminEnquiries;
}

/** The endpoints the forms and the inbox call (AGENTS.md §14). */
export const EnquiriesClient = {
  /** What was typed is sent as it is, to be read once more by the route's schema. */
  submit: (form: FormKind, values: Record<string, unknown>) =>
    postJson<{ received: true }>(API_ROUTES.enquiries, { ...values, form }),
  setStatus: ({ id, status }: { id: string; status: EnquiryStatus }) =>
    patchJson<{ status: EnquiryStatus }>(API_ROUTES.adminEnquiry(id), { status }),
  addNote: ({ id, body }: { id: string; body: string }) =>
    postJson<EnquiryNoteItem>(API_ROUTES.adminEnquiryNotes(id), { body }),
  retryAlert: (id: string) => postJson<{ emailStatus: string }>(API_ROUTES.adminEnquiryRetryMail(id)),
};
