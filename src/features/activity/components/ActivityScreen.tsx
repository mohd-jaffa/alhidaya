import Link from "next/link";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ACTIVITY_KINDS, ADMIN_ROUTES, type ActivityKind } from "@/constants/admin-routes";
import { pageFrom } from "@/lib/pagination";

import { ActivityLog } from "./ActivityLog";

type Param = string | string[] | undefined;

/** Activity's address for a kind; a new kind starts on the first page. */
function activityHref(kind?: ActivityKind): string {
  return kind ? `${ADMIN_ROUTES.activity}?kind=${kind}` : ADMIN_ROUTES.activity;
}

const TAB =
  "grid min-h-touch place-items-center rounded-control px-4 font-semibold text-ink-2 hover:text-navy aria-[current=page]:bg-mist aria-[current=page]:text-navy";

/**
 * Activity (plan §36, D96): every change made in the admin, newest first in
 * the day's log, of one kind or all, 50 at a time: who, what and when.
 */
export function ActivityScreen({ searchParams }: { searchParams: { kind?: Param; page?: Param } }) {
  const kind = ACTIVITY_KINDS.find((option) => option === searchParams.kind);
  const page = pageFrom(searchParams.page);

  return (
    <div className="grid max-w-5xl gap-6">
      <div className="grid gap-2">
        <h1 className="text-section font-bold">{ADMIN_TEXT.activity}</h1>
        <p className="max-w-prose text-ink-2">{ADMIN_TEXT.activityIntro}</p>
      </div>
      <nav aria-label={ADMIN_TEXT.activity} className="flex flex-wrap gap-1">
        {[undefined, ...ACTIVITY_KINDS].map((option) => (
          <Link
            key={option ?? "all"}
            href={activityHref(option)}
            aria-current={option === kind ? "page" : undefined}
            className={TAB}
          >
            {option ? ADMIN_TEXT.activityKinds[option] : ADMIN_TEXT.allActivity}
          </Link>
        ))}
      </nav>
      <ActivityLog
        key={`${kind}-${page}`}
        query={{ kind, page }}
        pageBase={activityHref(kind)}
        empty={
          kind
            ? { title: ADMIN_TEXT.activityKindEmpty, body: ADMIN_TEXT.activityKindEmptyBody }
            : { title: ADMIN_TEXT.activityEmpty, body: ADMIN_TEXT.activityEmptyBody }
        }
      />
    </div>
  );
}
