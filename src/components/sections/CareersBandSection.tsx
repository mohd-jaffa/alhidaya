import { Reveal } from "@/components/motion/Reveal";
import { PillLink } from "@/components/ui/pill";
import { PillLabel } from "@/components/ui/pill-label";
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
 * Careers on Home (plan §6.1, D72, D97): its pill, heading and text with the
 * way to every open job, and beside them the three most recent open jobs.
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
    <SectionFrame anchor={anchor} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
      <Reveal className="grid content-start justify-items-start gap-6">
        <PillLabel>{UI_TEXT.careers}</PillLabel>
        <SectionHeading anchor={anchor}>{content.heading.en}</SectionHeading>
        {content.text.en ? (
          <p className="max-w-measure text-lead whitespace-pre-line text-ink-2">{content.text.en}</p>
        ) : null}
        <PillLink href={ROUTES.careers} size="lg" arrow>
          {UI_TEXT.allOpenJobs}
        </PillLink>
      </Reveal>
      {latest.length > 0 ? <JobLinks jobs={latest} /> : null}
    </SectionFrame>
  );
}
