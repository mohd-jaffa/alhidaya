"use client";

import { InboxLog } from "@/components/admin/InboxLog";
import { StatusChip } from "@/components/admin/StatusChip";
import { Notice } from "@/components/ui/notice";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { APPLICATION_STATUS_LABELS } from "@/constants/statuses";
import { dohaDateTime } from "@/lib/dates";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiQuery } from "@/lib/query/useApiQuery";

import { applicationsKey } from "../api.client";
import type { ApplicationListItem, ApplicationListQuery, ApplicationOpened as Opened } from "../types";
import { ApplicationOpened } from "./ApplicationOpened";
import { APPLICATION_TONES, ApplicationFailures, ApplicationRow } from "./ApplicationRow";

/**
 * The application an address named (the HR email's link) when it is not on
 * this page of the list: open above it, so the link always lands on it.
 */
function NamedApplication({ id }: { id: string }) {
  const { data, error } = useApiQuery<Opened>(ADMIN_API_ROUTES.adminApplication(id));
  if (error) {
    return (
      <Notice tone="error" title={ADMIN_TEXT.loadFailed}>
        {errorMessage(error)}
      </Notice>
    );
  }
  if (!data) return null;
  return (
    <article aria-labelledby={`named-${id}`} className="grid gap-4 rounded-panel border border-rule bg-mist p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id={`named-${id}`} className="font-semibold">
            {ADMIN_TEXT.applicationFrom(data.name)}
          </h2>
          <p className="text-small text-ink-2">{dohaDateTime(new Date(data.createdAt))}</p>
        </div>
        <span className="flex flex-wrap gap-2">
          <ApplicationFailures item={data} />
          <StatusChip tone={APPLICATION_TONES[data.status]}>{APPLICATION_STATUS_LABELS[data.status]}</StatusChip>
        </span>
      </div>
      <ApplicationOpened id={id} />
    </article>
  );
}

/** The day's log of applications (R6.1, plan §9.5): the inbox's list, its rows the applications' own. */
export function ApplicationLog({
  query,
  pageBase,
  empty,
  initiallyOpen = null,
}: {
  query: ApplicationListQuery;
  /** This list's address, without its page: the pages are numbered on it. */
  pageBase: string;
  empty: { title: string; body: string };
  initiallyOpen?: string | null;
}) {
  return (
    <InboxLog<ApplicationListItem>
      listKey={applicationsKey(query)}
      pageBase={pageBase}
      empty={empty}
      initiallyOpen={initiallyOpen}
      named={(id) => <NamedApplication id={id} />}
      row={(item, open, toggle) => <ApplicationRow item={item} open={open} onToggle={toggle} />}
    />
  );
}
