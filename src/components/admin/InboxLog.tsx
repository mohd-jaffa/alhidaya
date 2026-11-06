"use client";

import Link from "next/link";
import { type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { dohaDay, dohaDayHeading } from "@/lib/dates";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiQuery } from "@/lib/query/useApiQuery";

/** What every inbox list answers (plan §9.5, §10.5): a page of arrivals, and how many there are. */
export interface InboxPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Another page of a list: its address with `page` set, the first page without it. */
function pageHref(base: string, page: number): string {
  const url = new URL(base, "http://admin.local");
  if (page > 1) url.searchParams.set("page", String(page));
  else url.searchParams.delete("page");
  return `${url.pathname}${url.search}`;
}

/** The arrivals of one page, by their day in Doha, newest first as they came. */
function byDay<T extends { createdAt: string }>(items: readonly T[]): { day: string; heading: string; items: T[] }[] {
  const days: { day: string; heading: string; items: T[] }[] = [];
  for (const item of items) {
    const at = new Date(item.createdAt);
    const day = dohaDay(at);
    if (days.at(-1)?.day !== day) days.push({ day, heading: dohaDayHeading(at), items: [] });
    days.at(-1)!.items.push(item);
  }
  return days;
}

/**
 * The day's log (R6.1, D81): one list of arrivals, ruled by day, one row open
 * at a time, a page at a time; each inbox says how its rows look. Loading
 * draws the rows' shape; a failure says so with Try again; an empty list says
 * what will arrive. An arrival an address named (an email's link) that is not
 * on this page is shown open above the list, so the link always lands on it.
 */
export function InboxLog<T extends { id: string; createdAt: string }>({
  listKey,
  pageBase,
  empty,
  initiallyOpen = null,
  named,
  row,
}: {
  /** The list's address, which is also its SWR key. */
  listKey: string;
  /** This list's address, without its page: the pages are numbered on it. */
  pageBase: string;
  empty: { title: string; body: string };
  initiallyOpen?: string | null;
  named?: (id: string) => ReactNode;
  row: (item: T, open: boolean, toggle: () => void) => ReactNode;
}) {
  const { data, error, isLoading, mutate } = useApiQuery<InboxPage<T>>(listKey);
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
        {[0, 1, 2, 3].map((placeholder) => (
          <div key={placeholder} className="h-16 animate-pulse rounded-panel bg-mist" />
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
  const namedId = initiallyOpen && !data.items.some((item) => item.id === initiallyOpen) ? initiallyOpen : null;
  return (
    <div className="grid gap-8">
      {namedId && named ? named(namedId) : null}
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
                {row(item, openId === item.id, () => setOpenId((current) => (current === item.id ? null : item.id)))}
              </li>
            ))}
          </ul>
        </section>
      ))}
      {pages > 1 ? (
        <nav aria-label={ADMIN_TEXT.pageOf(data.page, pages)} className="flex flex-wrap items-center gap-4">
          {data.page > 1 ? (
            <Link
              href={pageHref(pageBase, data.page - 1)}
              className="inline-flex min-h-touch min-w-touch items-center font-semibold text-deep underline underline-offset-4"
            >
              {ADMIN_TEXT.newer}
            </Link>
          ) : null}
          <span className="text-ink-2">{ADMIN_TEXT.pageOf(data.page, pages)}</span>
          {data.page < pages ? (
            <Link
              href={pageHref(pageBase, data.page + 1)}
              className="inline-flex min-h-touch min-w-touch items-center font-semibold text-deep underline underline-offset-4"
            >
              {ADMIN_TEXT.older}
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
