import { InlineText } from "@/components/ui/inline-text";
import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { Pictogram } from "@/components/ui/pictogram";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { EMPLOYMENT_TYPE_LABELS } from "@/constants/statuses";
import type { PublishedJob } from "@/features/careers/api";
import { readableDay } from "@/lib/dates";

/** How many cards rise in one after another before the rest arrive together. */
const STAGGERED = 4;

/**
 * Open jobs as cards (plan §6.5, D97): each job's title (the whole card is
 * its link), where, on what terms, and the day it closes when it has one,
 * with an arrow in a chip: mist cards with a white chip, or on a band (D135)
 * white cards with a pale one.
 */
export function JobLinks({ jobs, onBand = false }: { jobs: readonly PublishedJob[]; onBand?: boolean }) {
  return (
    <ul className="grid gap-3">
      {jobs.map(({ id, published: job }, at) => (
        <li key={id}>
          <Reveal
            order={Math.min(at, STAGGERED)}
            className={`group relative flex items-center justify-between gap-4 rounded-card p-5 sm:p-6 ${onBand ? "bg-card shadow-raised" : "bg-mist"}`}
          >
            <div className="grid gap-1.5">
              <Link
                prefetch={false}
                href={ROUTES.job(job.slug)}
                className="text-title font-medium underline decoration-transparent underline-offset-4 group-hover:decoration-current after:absolute after:inset-0 after:rounded-card"
              >
                <InlineText text={job.title.en} />
              </Link>
              <p className="flex flex-wrap gap-x-3 text-small text-ink-2">
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
            <span
              aria-hidden="true"
              className={`grid size-11 shrink-0 place-items-center rounded-full text-forest ${onBand ? "bg-leaf-pale" : "bg-ground"}`}
            >
              <Pictogram
                name="arrow"
                size="sm"
                className="transition-transform duration-(--duration-state) ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
              />
            </span>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
