import { API_ROUTES } from "@/constants/routes";
import type { FormKind } from "@/constants/statuses";
import { postJson } from "@/lib/api/client";

/**
 * The endpoint the Quote and Contact forms call (AGENTS.md §14), apart from
 * the inbox's in `api.client.ts`, so the public pages never carry the admin's
 * addresses (plan §31).
 */
export const EnquiryFormClient = {
  /** What was typed is sent as it is, to be read once more by the route's schema. */
  submit: (form: FormKind, values: Record<string, unknown>) =>
    postJson<{ received: true }>(API_ROUTES.enquiries, { ...values, form }),
};
