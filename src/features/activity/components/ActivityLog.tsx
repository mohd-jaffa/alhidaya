"use client";

import { InboxLog } from "@/components/admin/InboxLog";

import { activityKey } from "../api.client";
import type { ActivityItem, ActivityQuery } from "../types";
import { ActivityRow } from "./ActivityRow";

/** Activity's day's log (D96): the changes ruled by day, a page at a time. */
export function ActivityLog({
  query,
  pageBase,
  empty,
}: {
  query: ActivityQuery;
  pageBase: string;
  empty: { title: string; body: string };
}) {
  return (
    <InboxLog<ActivityItem>
      listKey={activityKey(query)}
      pageBase={pageBase}
      empty={empty}
      row={(item) => <ActivityRow item={item} />}
    />
  );
}
