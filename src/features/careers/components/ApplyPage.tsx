import Link from "next/link";

import { PageHero } from "@/components/sections/PageHero";
import { SectionFrame, SectionHeading } from "@/components/sections/SectionFrame";
import { PillLink } from "@/components/ui/pill";
import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { getServerEnv } from "@/lib/env/server";

import type { PublishedJob } from "../api";
import { ApplicationForm } from "./ApplicationForm";

/**
 * An application page (plan §9.2, §9.3, Q7, D109): its opening on Careers'
 * pill with the way back, then the form on a mist panel beside what it is
 * for, as the reference sets a form (D104). For an open job, it names the
 * job; without one, it is the general application. Turnstile's site key is
 * read on the server at request time (plan §10.3).
 */
export function ApplyPage({ job }: { job: PublishedJob | null }) {
  const headline = job ? job.published.title.en : UI_TEXT.generalApplicationHeadline;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-section pt-16 pb-section xl:pt-12">
      <PageHero
        anchor="start"
        label={PAGE_NAMES.CAREERS}
        headline={headline}
        lede={job ? UI_TEXT.applyLede : UI_TEXT.generalApplicationLede}
      >
        {job ? (
          <PillLink href={ROUTES.job(job.published.slug)} variant="line" size="lg">
            {UI_TEXT.aboutJob}
          </PillLink>
        ) : (
          <PillLink href={ROUTES.careers} variant="line" size="lg">
            {UI_TEXT.allOpenJobs}
          </PillLink>
        )}
      </PageHero>

      <SectionFrame anchor="apply" className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div className="grid content-start gap-6 lg:sticky lg:top-8 lg:self-start">
          <SectionHeading anchor="apply">{UI_TEXT.yourApplication}</SectionHeading>
          <p className="text-lead text-ink-2">
            {job ? (
              <>
                {UI_TEXT.applyingFor}{" "}
                <Link
                  href={ROUTES.job(job.published.slug)}
                  className="font-medium text-forest underline underline-offset-4"
                >
                  {job.published.title.en}
                </Link>
                .
              </>
            ) : (
              UI_TEXT.generalApplicationFor
            )}
          </p>
        </div>
        <div className="rounded-card bg-mist p-5 sm:p-8 lg:p-10">
          <ApplicationForm jobId={job?.id ?? null} siteKey={getServerEnv().TURNSTILE_SITE_KEY} />
        </div>
      </SectionFrame>
    </div>
  );
}
