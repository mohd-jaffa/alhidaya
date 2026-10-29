import { API_ROUTES } from "@/constants/routes";
import type { FormKind } from "@/constants/statuses";
import { postJson } from "@/lib/api/client";

/** The endpoint the Quote and Contact forms send to (AGENTS.md §14). */
export const EnquiriesClient = {
  /** What was typed is sent as it is, to be read once more by the route's schema. */
  submit: (form: FormKind, values: Record<string, unknown>) =>
    postJson<{ received: true }>(API_ROUTES.enquiries, { ...values, form }),
};
