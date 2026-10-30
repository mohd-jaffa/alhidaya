"use client";

import Link from "next/link";

import { Pictogram } from "@/components/ui/pictogram";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { PAGE_NAMES } from "@/constants/messages";
import { ADMIN_ROUTES, ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { useApiQuery } from "@/lib/query/useApiQuery";

import type { PageStateItem } from "../types";

/**
 * What waits to be published, on Today (plan §16, D86): each page with saved
 * changes not on the website yet, a link to its editor. Nothing waiting, or
 * the list not read, and it is not shown: the Pages screen says why.
 */
export function UnpublishedPages() {
  const { data } = useApiQuery<PageStateItem[]>(ADMIN_API_ROUTES.adminPages);
  const waiting = data?.filter((state) => state.unpublishedChanges) ?? [];
  if (waiting.length === 0) return null;
  return (
    <section aria-labelledby="unpublished-heading" className="grid gap-3 rounded-panel border border-rule p-4">
      <div className="grid gap-1">
        <h2 id="unpublished-heading" className="font-bold">
          {ADMIN_TEXT.notPublishedYet}
        </h2>
        <p className="text-small text-ink-2">{ADMIN_TEXT.waitingBody}</p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {waiting.map((state) => (
          <li key={state.page}>
            <Link
              href={ADMIN_ROUTES.page(state.page)}
              className="inline-flex min-h-touch items-center gap-2 rounded-control bg-mist px-4 font-semibold text-deep hover:bg-sky/15"
            >
              {PAGE_NAMES[state.page]}
              <Pictogram name="arrow" size="sm" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
