import Link from "next/link";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES } from "@/constants/admin-routes";
import { pageFrom } from "@/lib/pagination";
import { todayKey } from "@/lib/inbox/keys";

import { DiskWarning } from "./DiskWarning";
import { TodayLog } from "./TodayLog";
import { WaitingToPublish } from "./WaitingToPublish";

type View = "needs" | "everything";

const hrefFor = (view: View) =>
  view === "everything" ? `${ADMIN_ROUTES.overview}?view=everything` : ADMIN_ROUTES.overview;

/**
 * Today (R6.1, the plan's Overview, §16, D81): what needs the admin,
 * enquiries and applications in one stream, newest first in the day's log,
 * or everything that arrived.
 */
export function TodayScreen({
  searchParams,
}: {
  searchParams: { view?: string | string[]; page?: string | string[] };
}) {
  const view: View = searchParams.view === "everything" ? "everything" : "needs";
  const page = pageFrom(searchParams.page);
  const tabs: { view: View; label: string }[] = [
    { view: "needs", label: ADMIN_TEXT.needsYou },
    { view: "everything", label: ADMIN_TEXT.everything },
  ];
  return (
    <div className="grid max-w-5xl gap-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <h1 className="text-section font-bold">{ADMIN_TEXT.today}</h1>
        <nav aria-label={ADMIN_TEXT.today} className="flex gap-1">
          {tabs.map((tab) => (
            <Link
              key={tab.view}
              href={hrefFor(tab.view)}
              aria-current={tab.view === view ? "page" : undefined}
              className="grid min-h-touch place-items-center rounded-control px-4 font-semibold text-ink-2 hover:text-navy aria-[current=page]:bg-mist aria-[current=page]:text-navy"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
      {view === "needs" ? (
        <>
          <DiskWarning />
          <WaitingToPublish />
        </>
      ) : null}
      <TodayLog
        key={`${view}-${page}`}
        listKey={todayKey({ needsYou: view === "needs", page })}
        pageBase={hrefFor(view)}
        empty={
          view === "needs"
            ? { title: ADMIN_TEXT.todayEmpty, body: ADMIN_TEXT.todayEmptyBody }
            : { title: ADMIN_TEXT.everythingEmpty, body: ADMIN_TEXT.everythingEmptyBody }
        }
      />
    </div>
  );
}
