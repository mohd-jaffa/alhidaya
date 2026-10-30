import { Reveal } from "@/components/motion/Reveal";
import { PillLink } from "@/components/ui/pill";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { PublishedJob } from "@/features/careers/api";
import type { Section } from "@/lib/validation";

import { JobLinks } from "./JobLinks";
import { SectionFrame, SectionHeading } from "./SectionFrame";

type JobsListContent = Extract<Section, { type: "JOBS_LIST" }>["content"];

/**
 * The open jobs on Careers (plan §6.5): the admin's introduction, every open
 * job as a card, and a general application (Q7). With none open, the admin's
 * words say so and the general application stays.
 */
export function JobsListSection({
  anchor,
  content,
  jobs,
}: {
  anchor: string;
  content: JobsListContent;
  jobs: readonly PublishedJob[];
}) {
  const open = jobs.filter((job) => job.open);
  return (
    <SectionFrame anchor={anchor} className="grid gap-8">
      <Reveal className="grid max-w-3xl gap-4">
        <SectionHeading anchor={anchor}>{UI_TEXT.openJobs}</SectionHeading>
        {open.length > 0 && content.intro.en ? (
          <p className="text-lead whitespace-pre-line text-ink-2">{content.intro.en}</p>
        ) : null}
        {open.length === 0 ? <p className="text-lead whitespace-pre-line">{content.emptyText.en}</p> : null}
      </Reveal>
      {open.length > 0 ? <JobLinks jobs={open} /> : null}
      <PillLink href={ROUTES.applyGeneral} variant="pale" arrow className="justify-self-start">
        {UI_TEXT.generalApplication}
      </PillLink>
    </SectionFrame>
  );
}
