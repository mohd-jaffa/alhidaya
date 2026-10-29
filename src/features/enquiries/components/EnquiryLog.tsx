"use client";

import Link from "next/link";
import { useState } from "react";

import { StatusChip } from "@/components/admin/StatusChip";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { API_ROUTES } from "@/constants/routes";
import { ENQUIRY_STATUS_LABELS } from "@/constants/statuses";
import { dohaDateTime, dohaDay, dohaDayHeading } from "@/lib/dates";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiQuery } from "@/lib/query/useApiQuery";

import { enquiriesKey } from "../api.client";
import type { EnquiryList, EnquiryListItem, EnquiryListQuery, EnquiryOpened as Opened } from "../types";
import { EnquiryOpened } from "./EnquiryOpened";
import { EnquiryRow, STATUS_TONES } from "./EnquiryRow";

/** Another page of a list: its address with `page` set, the first page without it. */
function pageHref(base: string, page: number): string {
  const url = new URL(base, "http://admin.local");
  if (page > 1) url.searchParams.set("page", String(page));
  else url.searchParams.delete("page");
  return `${url.pathname}${url.search}`;
}

/** The arrivals of one page, by their day in Doha, newest first as they came. */
function byDay(items: readonly EnquiryListItem[]): { day: string; heading: string; items: EnquiryListItem[] }[] {
  const days: { day: string; heading: string; items: EnquiryListItem[] }[] = [];
  for (const item of items) {
    const at = new Date(item.createdAt);
    const day = dohaDay(at);
    if (days.at(-1)?.day !== day) days.push({ day, heading: dohaDayHeading(at), items: [] });
    days.at(-1)!.items.push(item);
  }
  return days;
}

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

/**
 * The day's log of enquiries (R6.1): one list, ruled by day, one row open at
 * a time, a page at a time. Loading draws the rows' shape; a failure says so
 * with Try again; an empty list says what will arrive.
 */
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
  const { data, error, isLoading, mutate } = useApiQuery<EnquiryList>(enquiriesKey(query));
  const [openId, setOpenId] = useState<string | null>(initiallyOpen);

  if (error) {
    return (
      <Notice tone="error" title={ADMIN_TEXT.loadFailed}>
        <p>{errorMessage(error)}</p>
        <Button variant="secondary" onClick={() => mutate()} className="mt-3">
          {ADMIN_TEXT.tryAgain}
        </Button>
      </Notice>
    );
  }
  if (isLoading || !data) {
    return (
      <div aria-busy="true" aria-label={ADMIN_TEXT.loading} className="grid gap-3">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="h-16 animate-pulse rounded-panel bg-mist" />
        ))}
      </div>
    );
  }
  if (data.items.length === 0 && !initiallyOpen) {
    return (
      <div className="grid gap-1 rounded-panel bg-mist p-6">
        <p className="font-semibold">{empty.title}</p>
        <p className="text-ink-2">{empty.body}</p>
      </div>
    );
  }

  const pages = Math.ceil(data.total / data.pageSize);
  const named = initiallyOpen && !data.items.some((item) => item.id === initiallyOpen) ? initiallyOpen : null;
  return (
    <div className="grid gap-8">
      {named ? <NamedEnquiry id={named} /> : null}
      {byDay(data.items).map((day) => (
        <section key={day.day} aria-labelledby={`day-${day.day}`} className="grid gap-2">
          <h2
            id={`day-${day.day}`}
            className="flex items-center gap-3 text-small font-bold text-ink-2 after:h-px after:flex-1 after:bg-rule"
          >
            {day.heading}
          </h2>
          <ul className="grid gap-1">
            {day.items.map((item) => (
              <li key={item.id}>
                <EnquiryRow
                  item={item}
                  open={openId === item.id}
                  onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
      {pages > 1 ? (
        <nav aria-label={ADMIN_TEXT.pageOf(data.page, pages)} className="flex items-center gap-4">
          {data.page > 1 ? (
            <Link
              href={pageHref(pageBase, data.page - 1)}
              className="font-semibold text-deep underline underline-offset-4"
            >
              {ADMIN_TEXT.newer}
            </Link>
          ) : null}
          <span className="text-ink-2">{ADMIN_TEXT.pageOf(data.page, pages)}</span>
          {data.page < pages ? (
            <Link
              href={pageHref(pageBase, data.page + 1)}
              className="font-semibold text-deep underline underline-offset-4"
            >
              {ADMIN_TEXT.older}
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
