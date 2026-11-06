import { Reveal } from "@/components/motion/Reveal";
import { PillLink } from "@/components/ui/pill";
import { MediaImage } from "@/components/ui/media-image";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { PublishedJob } from "@/features/careers/api";
import type { SiteImage } from "@/features/media/types";
import type { Section } from "@/lib/validation";

import { JobLinks } from "./JobLinks";
import { headingId, SectionFrame } from "./SectionFrame";

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
  image = null,
  band = false,
  primary = false,
}: {
  anchor: string;
  content: JobsListContent;
  jobs: readonly PublishedJob[];
  image?: SiteImage | null;
  /** On the pale-green band, as Careers sets it. */
  band?: boolean;
  /** The page heading when Careers' opening is hidden. */
  primary?: boolean;
}) {
  const open = jobs.filter((job) => job.open);
  const parts = (
    <>
      <Reveal
        className={`jobs-introduction grid gap-5 ${band && image ? "jobs-introduction-with-photo" : "max-w-3xl"}`}
      >
        {primary ? (
          <h1 id={headingId(anchor)} className="jobs-heading text-display font-semibold">
            {UI_TEXT.openJobs}
            {band ? <JobDots /> : null}
          </h1>
        ) : (
          <h2 id={headingId(anchor)} className="jobs-heading text-display font-semibold">
            {UI_TEXT.openJobs}
            {band ? <JobDots /> : null}
          </h2>
        )}
        {band && image ? (
          <div className="jobs-photo overflow-hidden rounded-frame shadow-careers-photo">
            <MediaImage
              image={image}
              decorative
              sizes="(min-width: 768px) 240px, 112px"
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
        {open.length > 0 && content.intro.en ? (
          <p className="jobs-intro-copy max-w-measure text-lead whitespace-pre-line text-ink-2">{content.intro.en}</p>
        ) : null}
        {open.length === 0 ? (
          <p className="jobs-intro-copy max-w-measure text-lead whitespace-pre-line">{content.emptyText.en}</p>
        ) : null}
      </Reveal>
      {open.length > 0 ? <JobLinks jobs={open} onBand={band} /> : null}
      <PillLink href={ROUTES.applyGeneral} variant="line" arrow className="justify-self-start">
        {UI_TEXT.generalApplication}
      </PillLink>
    </>
  );
  return band ? (
    <div className="bg-mist px-gutter py-4 sm:py-6">
      <SectionFrame
        anchor={anchor}
        className="careers-jobs grid gap-8 rounded-card bg-leaf-pale py-8 sm:py-12 lg:py-16"
      >
        {parts}
      </SectionFrame>
    </div>
  ) : (
    <SectionFrame anchor={anchor} className="grid gap-8">
      {parts}
    </SectionFrame>
  );
}

/** Decorative, fixed-width punctuation: never re-announced by assistive technology. */
function JobDots() {
  return (
    <span className="jobs-dots" aria-hidden="true">
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </span>
  );
}
