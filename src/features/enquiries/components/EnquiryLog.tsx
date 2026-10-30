"use client";

import { InboxLog } from "@/components/admin/InboxLog";
import { StatusChip } from "@/components/admin/StatusChip";
import { Notice } from "@/components/ui/notice";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { API_ROUTES } from "@/constants/routes";
import { ENQUIRY_STATUS_LABELS } from "@/constants/statuses";
import { dohaDateTime } from "@/lib/dates";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiQuery } from "@/lib/query/useApiQuery";

import { enquiriesKey } from "../api.client";
import type { EnquiryListItem, EnquiryListQuery, EnquiryOpened as Opened } from "../types";
import { EnquiryOpened } from "./EnquiryOpened";
import { EnquiryRow, STATUS_TONES } from "./EnquiryRow";

/**
 * The enquiry an address named (the alert email's link) when it is not on
 * this page of the list: open above it, so the link always lands on it.
 */
function NamedEnquiry({ id }: { id: string }) {
  const { data, error } = useApiQuery<Opened>(API_ROUTES.adminEnquiry(id));
  if (error) {
    return (
      <Notice tone="error" title={ADMIN_TEXT.loadFailed}>
        {errorMessage(error)}
      </Notice>
    );
  }
  if (!data) return null;
  const title = data.form === "QUOTE" ? ADMIN_TEXT.quoteFrom(data.name) : ADMIN_TEXT.messageFrom(data.name);
  return (
    <article aria-labelledby={`named-${id}`} className="grid gap-4 rounded-panel border border-rule bg-mist p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id={`named-${id}`} className="font-semibold">
            {title}
          </h2>
          <p className="text-small text-ink-2">{dohaDateTime(new Date(data.createdAt))}</p>
        </div>
        <StatusChip tone={STATUS_TONES[data.status]}>{ENQUIRY_STATUS_LABELS[data.status]}</StatusChip>
      </div>
      <EnquiryOpened id={id} />
    </article>
  );
}

/** The day's log of enquiries (R6.1): the inbox's list, its rows the enquiries' own. */
export function EnquiryLog({
  query,
  pageBase,
  empty,
  initiallyOpen = null,
}: {
  query: EnquiryListQuery;
  /** This list's address, without its page: the pages are numbered on it. */
  pageBase: string;
  empty: { title: string; body: string };
  initiallyOpen?: string | null;
}) {
  return (
    <InboxLog<EnquiryListItem>
      listKey={enquiriesKey(query)}
      pageBase={pageBase}
      empty={empty}
      initiallyOpen={initiallyOpen}
      named={(id) => <NamedEnquiry id={id} />}
      row={(item, open, toggle) => <EnquiryRow item={item} open={open} onToggle={toggle} />}
    />
  );
}
