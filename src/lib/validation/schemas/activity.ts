import * as z from "zod";

import { ACTIVITY_KINDS } from "@/constants/admin-routes";

/** Activity (D96): the admin's changes, of one kind or all, a page at a time. */
export const activityQuerySchema = z.object({
  kind: z.enum(ACTIVITY_KINDS).optional(),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
});
export type ActivityQueryInput = z.input<typeof activityQuerySchema>;
export type ActivityQueryPayload = z.output<typeof activityQuerySchema>;
