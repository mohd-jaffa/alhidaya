"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { PAGE_NAMES } from "@/constants/messages";
import { ADMIN_ROUTES, ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { PAGE_ROUTES } from "@/constants/routes";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiQuery } from "@/lib/query/useApiQuery";

import type { PageStateItem } from "../types";
import { PageStateChip } from "./PageStateChip";

/** Pages (D88): the eight fixed pages, each a row with its address and where it stands, opening its editor. */
export function PagesScreen() {
  const { data, error, isLoading, mutate } = useApiQuery<PageStateItem[]>(ADMIN_API_ROUTES.adminPages);
  return (
    <div className="grid max-w-5xl gap-6">
      <div className="grid gap-2">
        <h1 className="text-section font-bold">{ADMIN_TEXT.pages}</h1>
        <p className="max-w-prose text-ink-2">{ADMIN_TEXT.pagesIntro}</p>
      </div>
      {error ? (
        <Notice tone="error" title={ADMIN_TEXT.loadFailed}>
          <p>{errorMessage(error)}</p>
          <Button variant="secondary" onClick={() => mutate()} className="mt-3">
            {ADMIN_TEXT.tryAgain}
          </Button>
        </Notice>
      ) : isLoading || !data ? (
        <div aria-busy="true" aria-label={ADMIN_TEXT.loading} className="grid gap-3">
          {[0, 1, 2, 3].map((placeholder) => (
            <div key={placeholder} className="h-16 animate-pulse rounded-panel bg-mist" />
          ))}
        </div>
      ) : (
        <ul className="grid">
          {data.map((state) => (
            <li key={state.page} className="border-b border-rule">
              <Link
                href={ADMIN_ROUTES.page(state.page)}
                className="grid min-h-touch grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 rounded-panel px-4 py-3.5 hover:bg-mist"
              >
                <span className="grid gap-0.5">
                  <span className="font-semibold">{PAGE_NAMES[state.page]}</span>
                  <span className="text-small text-ink-2">{PAGE_ROUTES[state.page]}</span>
                </span>
                <PageStateChip state={state} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
