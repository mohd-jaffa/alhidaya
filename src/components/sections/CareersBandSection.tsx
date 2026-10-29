import { ButtonLink } from "@/components/ui/button";
import { LineEdge } from "@/components/ui/line-edge";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { PublishedJob } from "@/features/careers/api";
import type { Section } from "@/lib/validation";

import { JobLinks } from "./JobLinks";
import { SectionFrame, SectionHeading } from "./SectionFrame";

type CareersBandContent = Extract<Section, { type: "CAREERS_BAND" }>["content"];

/** How many open jobs Home shows (plan D72). */
export const HOME_JOBS = 3;

/**
 * The nurses' line on Home (plan §6.1, D72): its heading and text, the three
 * most recent open jobs, and the way to all of them.
 */
export function CareersBandSection({
  anchor,
  content,
  jobs,
}: {
  anchor: string;
  content: CareersBandContent;
  /** Every published job, open ones first and newest first, as `listPublishedJobs` answers. */
  jobs: readonly PublishedJob[];
}) {
  const latest = jobs.filter((job) => job.open).slice(0, HOME_JOBS);
  return (
    <SectionFrame anchor={anchor}>
      <div className="relative grid gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <LineEdge tone="leaf" />
        <div className="grid content-start gap-5">
          <SectionHeading anchor={anchor}>{content.heading.en}</SectionHeading>
          {content.text.en ? (
            <p className="max-w-measure text-lead whitespace-pre-line text-ink-2">{content.text.en}</p>
          ) : null}
          <div className="pt-2">
            <ButtonLink href={ROUTES.careers} variant="leaf" size="lg" pictogram="careers">
              {UI_TEXT.allOpenJobs}
            </ButtonLink>
          </div>
        </div>
        {latest.length > 0 ? <JobLinks jobs={latest} /> : null}
      </div>
    </SectionFrame>
  );
}
