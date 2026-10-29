import Link from "next/link";

import { Pictogram } from "@/components/ui/pictogram";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { EMPLOYMENT_TYPE_LABELS } from "@/constants/statuses";
import type { PublishedJob } from "@/features/careers/api";
import { readableDay } from "@/lib/dates";

/**
 * Open jobs as a list (plan §6.5): each job's title (the whole row is its
 * link), where, on what terms, and the day it closes when it has one.
 */
export function JobLinks({ jobs }: { jobs: readonly PublishedJob[] }) {
  return (
    <ul className="grid border-t border-rule">
      {jobs.map(({ id, published: job }) => (
        <li
          key={id}
          className="group relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-rule py-5"
        >
          <div className="grid gap-1">
            <Link
              href={ROUTES.job(job.slug)}
              className="text-title font-bold underline decoration-transparent underline-offset-4 group-hover:decoration-current after:absolute after:inset-0"
            >
              {job.title.en}
            </Link>
            <p className="flex flex-wrap gap-x-3 text-ink-2">
              <span>{job.location.en}</span>
              <span aria-hidden="true">·</span>
              <span>{EMPLOYMENT_TYPE_LABELS[job.employmentType]}</span>
              {job.closesOn ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    {UI_TEXT.closes} {readableDay(job.closesOn)}
                  </span>
                </>
              ) : null}
            </p>
          </div>
          <Pictogram
            name="arrow"
            size="sm"
            className="text-deep transition-transform duration-(--duration-state) ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
          />
        </li>
      ))}
    </ul>
  );
}
