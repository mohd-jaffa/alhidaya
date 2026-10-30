import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import type { EnquiryStatus } from "@/constants/statuses";
import { deleteJson, patchJson, postJson } from "@/lib/api/client";

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
  return search ? `${ADMIN_API_ROUTES.adminEnquiries}?${search}` : ADMIN_API_ROUTES.adminEnquiries;
}

/** The endpoints the enquiries inbox calls; the forms' is in `form.client.ts` (plan §31). */
export const EnquiriesClient = {
  setStatus: ({ id, status }: { id: string; status: EnquiryStatus }) =>
    patchJson<{ status: EnquiryStatus }>(ADMIN_API_ROUTES.adminEnquiry(id), { status }),
  addNote: ({ id, body }: { id: string; body: string }) =>
    postJson<EnquiryNoteItem>(ADMIN_API_ROUTES.adminEnquiryNotes(id), { body }),
  retryAlert: (id: string) => postJson<{ emailStatus: string }>(ADMIN_API_ROUTES.adminEnquiryRetryMail(id)),
  remove: (id: string) => deleteJson<{ deleted: true }>(ADMIN_API_ROUTES.adminEnquiry(id)),
};
