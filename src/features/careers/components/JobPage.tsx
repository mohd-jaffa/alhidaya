import { JsonLd } from "@/components/site/JsonLd";
import { JobLinks } from "@/components/sections/JobLinks";
import { SectionFrame, SectionHeading } from "@/components/sections/SectionFrame";
import { ButtonLink } from "@/components/ui/button";
import { LineRow } from "@/components/ui/line-row";
import { Notice } from "@/components/ui/notice";
import { Pictogram } from "@/components/ui/pictogram";
import { RichText } from "@/components/ui/rich-text";
import { SignPanel } from "@/components/ui/sign-panel";
import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { EMPLOYMENT_TYPE_LABELS } from "@/constants/statuses";
import { readableDay } from "@/lib/dates";
import { publicSiteUrl } from "@/lib/env/public";
import { breadcrumbs, jobPosting } from "@/lib/seo/structured-data";

import type { PublishedJob } from "../api";

/** One part of the job as a list, under its heading; a part with nothing in it is left out. */
function JobPoints({ title, items }: { title: string; items: readonly { en: string }[] }) {
  if (items.length === 0) return null;
  return (
    <div className="grid gap-3">
      <h3 className="text-title font-bold">{title}</h3>
      <ul className="grid max-w-measure gap-3">
        {items.map((item) => (
          <li key={item.en} className="flex gap-3">
            <Pictogram name="check" size="md" className="text-deep" />
            <span>{item.en}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A job's page (plan §6.6): its sign on the nurses' leaf-green line with
 * Apply; the job in full beside its facts at a glance; and the line again,
 * with the other open jobs. A closed job stays reachable and says so,
 * offering the open jobs and the general application instead (Q7).
 */
export function JobPage({ job, others }: { job: PublishedJob; others: readonly PublishedJob[] }) {
  const { published, open } = job;
  const facts: { term: string; value: string | null }[] = [
    { term: UI_TEXT.location, value: published.location.en },
    { term: UI_TEXT.employment, value: EMPLOYMENT_TYPE_LABELS[published.employmentType] },
    { term: UI_TEXT.department, value: published.department.en },
    { term: UI_TEXT.experience, value: published.experience.en },
    { term: UI_TEXT.posted, value: readableDay(published.postedOn) },
    {
      term: open ? UI_TEXT.closes : UI_TEXT.closedOn,
      value: published.closesOn ? readableDay(published.closesOn) : null,
    },
  ];

  const siteUrl = publicSiteUrl();
  return (
    <>
      {open ? <JsonLd data={jobPosting(published, siteUrl)} /> : null}
      <JsonLd
        data={breadcrumbs(
          [
            { name: PAGE_NAMES.HOME, path: ROUTES.home },
            { name: PAGE_NAMES.CAREERS, path: ROUTES.careers },
            { name: published.title.en, path: ROUTES.job(published.slug) },
          ],
          siteUrl,
        )}
      />
      <div className="grid gap-section pt-16 pb-section xl:pt-12">
        <div id="start" className="mx-auto grid w-full max-w-site gap-6 px-gutter">
          <SignPanel tone="leaf" headline={published.title.en} lede={published.summary.en}>
            {open ? (
              <ButtonLink href={ROUTES.applyForJob(published.slug)} size="lg" pictogram="careers">
                {UI_TEXT.applyForJob}
              </ButtonLink>
            ) : null}
          </SignPanel>
          {open ? null : (
            <Notice tone="info" title={UI_TEXT.jobClosed}>
              {UI_TEXT.jobClosedBody}
            </Notice>
          )}
        </div>

        <SectionFrame anchor="about" className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="grid content-start gap-8">
            <SectionHeading anchor="about">{UI_TEXT.aboutJob}</SectionHeading>
            {published.description.length > 0 ? <RichText blocks={published.description} headingLevel="h3" /> : null}
            <JobPoints title={UI_TEXT.responsibilities} items={published.responsibilities} />
            <JobPoints title={UI_TEXT.qualifications} items={published.qualifications} />
            <JobPoints title={UI_TEXT.benefits} items={published.benefits} />
          </div>
          <div className="grid content-start gap-5 rounded-panel bg-mist p-sign">
            <h3 className="text-title font-bold">{UI_TEXT.jobFacts}</h3>
            <dl className="grid gap-4">
              {facts.map((fact) =>
                fact.value === null ? null : (
                  <div key={fact.term} className="grid gap-0.5">
                    <dt className="text-small font-semibold text-ink-2">{fact.term}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ),
              )}
            </dl>
          </div>
        </SectionFrame>

        <SectionFrame anchor="line" named={false} className="grid gap-8">
          <LineRow tone="leaf" pictogram="careers" title={UI_TEXT.lineCareers}>
            {open ? (
              <ButtonLink href={ROUTES.applyForJob(published.slug)}>{UI_TEXT.applyForJob}</ButtonLink>
            ) : (
              <ButtonLink href={ROUTES.applyGeneral} variant="leaf">
                {UI_TEXT.generalApplication}
              </ButtonLink>
            )}
            <ButtonLink href={ROUTES.careers} variant="secondary">
              {UI_TEXT.allOpenJobs}
            </ButtonLink>
          </LineRow>
          {others.length > 0 ? (
            <div className="grid gap-4">
              <h3 className="text-title font-bold">{UI_TEXT.otherOpenJobs}</h3>
              <JobLinks jobs={others} />
            </div>
          ) : null}
        </SectionFrame>
      </div>
    </>
  );
}
