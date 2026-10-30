import Link from "next/link";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES } from "@/constants/admin-routes";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUSES, type ApplicationStatus } from "@/constants/statuses";
import { pageFrom } from "@/lib/pagination";
import { GENERAL_APPLICATIONS } from "@/lib/validation/schemas/applications";

import type { ApplicationListQuery } from "../types";
import { ApplicationFilters } from "./ApplicationFilters";
import { ApplicationLog } from "./ApplicationLog";

type Param = string | string[] | undefined;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The inbox's address for a choice of filters; a new choice starts on the first page. */
function inboxHref(filters: { status?: ApplicationStatus; job?: string; q?: string }): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.job) params.set("job", filters.job);
  if (filters.q) params.set("q", filters.q);
  const search = params.toString();
  return search ? `${ADMIN_ROUTES.applications}?${search}` : ADMIN_ROUTES.applications;
}

const TAB =
  "grid min-h-touch place-items-center rounded-control px-4 font-semibold text-ink-2 hover:text-navy aria-[current=page]:bg-mist aria-[current=page]:text-navy";

/**
 * The applications inbox (plan §9.5, R5.5): every application, newest first
 * in the day's log, by where it stands, by job (or the general ones) and by a
 * search that works as a plain form. Opened from the HR email's link, its
 * application is open on arrival.
 */
export function ApplicationsScreen({
  searchParams,
  open = null,
}: {
  searchParams: { status?: Param; job?: Param; q?: Param; page?: Param };
  open?: string | null;
}) {
  const status = APPLICATION_STATUSES.find((option) => option === searchParams.status);
  const job =
    typeof searchParams.job === "string" && (searchParams.job === GENERAL_APPLICATIONS || UUID.test(searchParams.job))
      ? searchParams.job
      : undefined;
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const page = pageFrom(searchParams.page);
  const query: ApplicationListQuery = { status, job, q: q || undefined, page };

  return (
    <div className="grid max-w-5xl gap-6">
      <h1 className="text-section font-bold">{ADMIN_TEXT.applications}</h1>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <nav aria-label={ADMIN_TEXT.applications} className="flex flex-wrap gap-1">
          {[undefined, ...APPLICATION_STATUSES].map((option) => (
            <Link
              key={option ?? "all"}
              href={inboxHref({ status: option, job, q })}
              aria-current={option === status ? "page" : undefined}
              className={TAB}
            >
              {option ? APPLICATION_STATUS_LABELS[option] : ADMIN_TEXT.allStatuses}
            </Link>
          ))}
        </nav>
        <ApplicationFilters query={query} />
      </div>
      <ApplicationLog
        key={JSON.stringify(query)}
        query={query}
        pageBase={inboxHref({ status, job, q })}
        initiallyOpen={open}
        empty={
          q || job
            ? { title: ADMIN_TEXT.nothingFound, body: ADMIN_TEXT.nothingFoundBody }
            : { title: ADMIN_TEXT.applicationsEmpty, body: ADMIN_TEXT.applicationsEmptyBody }
        }
      />
    </div>
  );
}
