import type { ActivityKind } from "@/constants/admin-routes";

import type { ActivityEntry } from "./api";

/** One change as Activity's endpoint answers it (D96): its time as text, made a date again where it is shown. */
export type ActivityItem = Omit<ActivityEntry, "createdAt"> & { createdAt: string };

/** Which changes Activity shows; what is left out is every kind, from the first page. */
export interface ActivityQuery {
  kind?: ActivityKind;
  page?: number;
}
