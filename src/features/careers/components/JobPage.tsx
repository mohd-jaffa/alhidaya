import { Reveal } from "@/components/motion/Reveal";
import { JobLinks } from "@/components/sections/JobLinks";
import { PageHero } from "@/components/sections/PageHero";
import { SectionFrame, SectionHeading } from "@/components/sections/SectionFrame";
import { JsonLd } from "@/components/site/JsonLd";
import { IconChip } from "@/components/ui/icon-chip";
import { Notice } from "@/components/ui/notice";
import { PillLink } from "@/components/ui/pill";
import { RichText } from "@/components/ui/rich-text";
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
    <div className="grid gap-4">
      <h3 className="text-section font-medium">{title}</h3>
      <ul className="grid max-w-measure gap-3">
        {items.map((item) => (
          <li key={item.en} className="flex items-start gap-3">
            <IconChip name="check" size="sm" />
            <span className="pt-0.5">{item.en}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A job's page (plan §6.6, D109): its opening on Careers' pill with Apply and
 * the way to every open job; the job in full beside its facts on a mist card;
 * and the other open jobs as cards. A closed job stays reachable and says so,
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
      <div className="career-document grid grid-cols-[minmax(0,1fr)] gap-section pt-16 pb-section xl:pt-12">
        <div className="grid gap-8">
          <PageHero anchor="start" label={PAGE_NAMES.CAREERS} headline={published.title.en} lede={published.summary.en}>
            {open ? (
              <PillLink href={ROUTES.applyForJob(published.slug)} size="lg" arrow>
                {UI_TEXT.applyForJob}
              </PillLink>
            ) : (
              <PillLink href={ROUTES.applyGeneral} size="lg" arrow>
                {UI_TEXT.generalApplication}
              </PillLink>
            )}
            <PillLink href={ROUTES.careers} variant="line" size="lg">
              {UI_TEXT.allOpenJobs}
            </PillLink>
          </PageHero>
          {open ? null : (
            <div className="mx-auto w-full max-w-site px-gutter">
              <div className="max-w-measure">
                <Notice tone="info" title={UI_TEXT.jobClosed}>
                  {UI_TEXT.jobClosedBody}
                </Notice>
              </div>
            </div>
          )}
        </div>

        <SectionFrame
          anchor="about"
          className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start lg:gap-16"
        >
          <Reveal className="grid content-start gap-8">
            <SectionHeading anchor="about">{UI_TEXT.aboutJob}</SectionHeading>
            {published.description.length > 0 ? <RichText blocks={published.description} headingLevel="h3" /> : null}
            <JobPoints title={UI_TEXT.responsibilities} items={published.responsibilities} />
            <JobPoints title={UI_TEXT.qualifications} items={published.qualifications} />
            <JobPoints title={UI_TEXT.benefits} items={published.benefits} />
          </Reveal>
          <Reveal order={1} className="grid content-start gap-6 rounded-card bg-mist p-6 sm:p-8">
            <h3 className="text-title font-medium">{UI_TEXT.jobFacts}</h3>
            <dl className="grid gap-4">
              {facts.map((fact) =>
                fact.value === null ? null : (
                  <div key={fact.term} className="grid gap-0.5">
                    <dt className="text-small text-ink-2">{fact.term}</dt>
                    <dd className="font-medium">{fact.value}</dd>
                  </div>
                ),
              )}
            </dl>
            {open ? (
              <PillLink href={ROUTES.applyForJob(published.slug)} arrow className="justify-self-start">
                {UI_TEXT.applyForJob}
              </PillLink>
            ) : null}
          </Reveal>
        </SectionFrame>

        {others.length > 0 ? (
          <SectionFrame anchor="more" className="grid gap-8">
            <SectionHeading anchor="more">{UI_TEXT.otherOpenJobs}</SectionHeading>
            <JobLinks jobs={others} />
          </SectionFrame>
        ) : null}
      </div>
    </>
  );
}
