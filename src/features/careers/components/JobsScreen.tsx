"use client";

import Link from "next/link";

import { DraftStateChip } from "@/components/admin/editor/DraftStateChip";
import { Button, buttonClasses } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Pictogram } from "@/components/ui/pictogram";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { EMPLOYMENT_TYPE_LABELS } from "@/constants/statuses";
import { readableDay } from "@/lib/dates";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiQuery } from "@/lib/query/useApiQuery";

import type { JobSummaryItem } from "../types";

/** One job's row: its title, terms and dates, where it stands, opening its editor. */
function JobRow({ job }: { job: JobSummaryItem }) {
  return (
    <li className="border-b border-rule">
      <Link
        href={ADMIN_ROUTES.job(job.id)}
        className="grid min-h-touch grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 rounded-panel px-4 py-3.5 hover:bg-mist"
      >
        <span className="grid gap-0.5">
          <span className="font-semibold">{job.title || ADMIN_TEXT.unnamed}</span>
          <span className="text-small text-ink-2">
            {[
              job.location,
              EMPLOYMENT_TYPE_LABELS[job.employmentType],
              ADMIN_TEXT.postedOnShort(readableDay(job.postedOn)),
              job.closesOn ? ADMIN_TEXT.closesOnShort(readableDay(job.closesOn)) : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
        <DraftStateChip state={job} />
      </Link>
    </li>
  );
}

function JobGroup({ title, jobs }: { title: string; jobs: JobSummaryItem[] }) {
  if (jobs.length === 0) return null;
  return (
    <section aria-label={title} className="grid gap-2">
      <h2 className="text-title font-bold">
        {title} <span className="font-normal text-ink-2">({jobs.length})</span>
      </h2>
      <ul className="grid">
        {jobs.map((job) => (
          <JobRow key={job.id} job={job} />
        ))}
      </ul>
    </section>
  );
}

/**
 * Jobs (plan §16, D92), newest posting first, grouped by where each stands:
 * open on the website, not published yet, closed, and the archived folded
 * below; each opens its editor.
 */
export function JobsScreen() {
  const { data, error, isLoading, mutate } = useApiQuery<JobSummaryItem[]>(ADMIN_API_ROUTES.adminJobs);
  const current = data?.filter((job) => !job.archivedAt) ?? [];
  const archived = data?.filter((job) => job.archivedAt) ?? [];
  return (
    <div className="grid max-w-5xl gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="text-section font-bold">{ADMIN_TEXT.jobs}</h1>
          <p className="max-w-prose text-ink-2">{ADMIN_TEXT.jobsIntro}</p>
        </div>
        <Link href={ADMIN_ROUTES.newJob} className={buttonClasses({ variant: "secondary" })}>
          <Pictogram name="plus" size="sm" />
          <span>{ADMIN_TEXT.newJob}</span>
        </Link>
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
          {[0, 1, 2].map((placeholder) => (
            <div key={placeholder} className="h-16 animate-pulse rounded-panel bg-mist" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-ink-2">{ADMIN_TEXT.noJobs}</p>
      ) : (
        <div className="grid gap-8">
          <JobGroup title={ADMIN_TEXT.jobsOpen} jobs={current.filter((job) => job.publishedAt && job.open)} />
          <JobGroup title={ADMIN_TEXT.jobsDrafts} jobs={current.filter((job) => !job.publishedAt)} />
          <JobGroup title={ADMIN_TEXT.jobsClosed} jobs={current.filter((job) => job.publishedAt && !job.open)} />
          {archived.length > 0 ? (
            <details className="group grid gap-2">
              <summary className="flex min-h-touch cursor-pointer items-center gap-2 font-semibold text-deep">
                <Pictogram name="chevronDown" size="sm" className="transition-transform group-open:rotate-180" />
                {ADMIN_TEXT.archivedCount(archived.length)}
              </summary>
              <ul className="grid">
                {archived.map((job) => (
                  <JobRow key={job.id} job={job} />
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      )}
    </div>
  );
}
