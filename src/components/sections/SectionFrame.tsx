import type { ReactNode } from "react";

import type { PictogramName } from "@/assets/brand/pictograms";
import { IconChip } from "@/components/ui/icon-chip";
import { PillLabel } from "@/components/ui/pill-label";

/** The id of a section's heading, which names the section. */
export const headingId = (anchor: string) => `${anchor}-heading`;

/**
 * A section of a page (plan §7): at the site's width, named by its heading. A
 * jump to it lands with a little room above it.
 */
export function SectionFrame({
  anchor,
  named = true,
  className,
  children,
}: {
  anchor: string;
  /** False when the section has no one heading of its own. */
  named?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={anchor}
      aria-labelledby={named ? headingId(anchor) : undefined}
      className={["mx-auto w-full max-w-site scroll-mt-8 px-gutter", className].filter(Boolean).join(" ")}
    >
      {children}
    </section>
  );
}

/** A section's heading (D97): large and light, as the reference sets them. */
export function SectionHeading({ anchor, children }: { anchor: string; children: ReactNode }) {
  return (
    <h2 id={headingId(anchor)} className="text-display font-normal text-balance">
      {children}
    </h2>
  );
}

/**
 * A section's opening in the redesign (D97): who it speaks to, on a pale
 * pill, then its heading, large and light, with an icon chip set between its
 * two parts; centred, as the reference sets it.
 */
export function SectionOpening({
  anchor,
  label,
  start,
  pictogram,
  end,
}: {
  anchor: string;
  label: string;
  start: string;
  pictogram: PictogramName | null;
  end: string | null;
}) {
  return (
    <div className="mx-auto grid max-w-3xl justify-items-center gap-5 text-center">
      <PillLabel>{label}</PillLabel>
      <h2 id={headingId(anchor)} className="text-display font-normal text-balance">
        {start}
        {pictogram ? (
          <>
            {" "}
            <IconChip name={pictogram} tone="forest" size="inline" />
          </>
        ) : null}
        {end ? ` ${end}` : null}
      </h2>
    </div>
  );
}
