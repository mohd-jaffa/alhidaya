import { Reveal } from "@/components/motion/Reveal";
import { PillLink } from "@/components/ui/pill";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { PublishedJob } from "@/features/careers/api";
import type { Section } from "@/lib/validation";

import { JobLinks } from "./JobLinks";
import { SectionBand, SectionFrame, SectionHeading } from "./SectionFrame";

type JobsListContent = Extract<Section, { type: "JOBS_LIST" }>["content"];

/**
 * The open jobs on Careers (plan §6.5): the admin's introduction, every open
 * job as a card, and a general application (Q7). With none open, the admin's
 * words say so and the general application stays. On Careers it lies on
 * Home's pale-green band (D135).
 */
export function JobsListSection({
  anchor,
  content,
  jobs,
  band = false,
}: {
  anchor: string;
  content: JobsListContent;
  jobs: readonly PublishedJob[];
  /** On the pale-green band, as Careers sets it. */
  band?: boolean;
}) {
  const open = jobs.filter((job) => job.open);
  const parts = (
    <>
      <Reveal className="grid max-w-3xl gap-4">
        <SectionHeading anchor={anchor}>{UI_TEXT.openJobs}</SectionHeading>
        {open.length > 0 && content.intro.en ? (
          <p className="text-lead whitespace-pre-line text-ink-2">{content.intro.en}</p>
        ) : null}
        {open.length === 0 ? <p className="text-lead whitespace-pre-line">{content.emptyText.en}</p> : null}
      </Reveal>
      {open.length > 0 ? <JobLinks jobs={open} onBand={band} /> : null}
      <PillLink href={ROUTES.applyGeneral} variant="line" arrow className="justify-self-start">
        {UI_TEXT.generalApplication}
      </PillLink>
    </>
  );
  return band ? (
    <SectionBand anchor={anchor} tone="leaf" className="grid gap-8">
      {parts}
    </SectionBand>
  ) : (
    <SectionFrame anchor={anchor} className="grid gap-8">
      {parts}
    </SectionFrame>
  );
}
