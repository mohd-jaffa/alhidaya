"use client";

import { ApplicationRow } from "@/features/careers/components/ApplicationRow";
import type { ApplicationListItem } from "@/features/careers/types";
import { EnquiryRow } from "@/features/enquiries/components/EnquiryRow";
import type { EnquiryListItem } from "@/features/enquiries/types";

import { InboxLog } from "./InboxLog";

/** An arrival in Today's stream: an enquiry or an application, as its own inbox shows it. */
export type TodayItem = ({ kind: "enquiry" } & EnquiryListItem) | ({ kind: "application" } & ApplicationListItem);

/** Today's log (D81): both kinds in one stream, each row its own kind's. */
export function TodayLog({
  listKey,
  pageBase,
  empty,
}: {
  listKey: string;
  pageBase: string;
  empty: { title: string; body: string };
}) {
  return (
    <InboxLog<TodayItem>
      listKey={listKey}
      pageBase={pageBase}
      empty={empty}
      row={(item, open, toggle) =>
        item.kind === "enquiry" ? (
          <EnquiryRow item={item} open={open} onToggle={toggle} />
        ) : (
          <ApplicationRow item={item} open={open} onToggle={toggle} />
        )
      }
    />
  );
}
