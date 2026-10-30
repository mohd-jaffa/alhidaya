import Link from "next/link";

import { SectionFrame, SectionHeading } from "@/components/sections/SectionFrame";
import { ButtonLink } from "@/components/ui/button";
import { SignPanel } from "@/components/ui/sign-panel";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { getServerEnv } from "@/lib/env/server";

import type { PublishedJob } from "../api";
import { ApplicationForm } from "./ApplicationForm";

/**
 * An application page (plan §9.2, §9.3, Q7): the nurses' leaf-green sign
 * with the way back, then the form. For an open job, it names the job;
 * without one, it is the general application. Turnstile's site key is read
 * on the server at request time (plan §10.3).
 */
export function ApplyPage({ job }: { job: PublishedJob | null }) {
  const headline = job ? job.published.title.en : UI_TEXT.generalApplicationHeadline;
  return (
    <>
      <div className="grid gap-section pt-16 pb-section xl:pt-12">
        <div id="start" className="mx-auto grid w-full max-w-site px-gutter">
          <SignPanel tone="leaf" headline={headline} lede={job ? UI_TEXT.applyLede : UI_TEXT.generalApplicationLede}>
            {job ? (
              <ButtonLink href={ROUTES.job(job.published.slug)} variant="secondary">
                {UI_TEXT.aboutJob}
              </ButtonLink>
            ) : (
              <ButtonLink href={ROUTES.careers} variant="secondary">
                {UI_TEXT.allOpenJobs}
              </ButtonLink>
            )}
          </SignPanel>
        </div>

        <SectionFrame anchor="apply">
          <div className="grid max-w-measure gap-8">
            <div className="grid gap-4">
              <SectionHeading anchor="apply">{UI_TEXT.yourApplication}</SectionHeading>
              <p className="text-lead text-ink-2">
                {job ? (
                  <>
                    {UI_TEXT.applyingFor}{" "}
                    <Link
                      href={ROUTES.job(job.published.slug)}
                      className="font-semibold text-deep underline underline-offset-4"
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
            <ApplicationForm jobId={job?.id ?? null} siteKey={getServerEnv().TURNSTILE_SITE_KEY} />
          </div>
        </SectionFrame>
      </div>
    </>
  );
}
