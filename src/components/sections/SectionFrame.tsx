import type { ReactNode } from "react";

/** The id of a section's heading, which names the section. */
export const headingId = (anchor: string) => `${anchor}-heading`;

/**
 * A section of a page (plan §7): a station on the page's line, at the site's
 * width, named by its heading. A jump to it lands below the header and the
 * phone's progress line.
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
      className={["mx-auto w-full max-w-site scroll-mt-[calc(var(--header-height)+4rem)] px-gutter", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </section>
  );
}

/** A section's heading, at the size of a page's. */
export function SectionHeading({ anchor, children }: { anchor: string; children: ReactNode }) {
  return (
    <h2 id={headingId(anchor)} className="text-page font-bold">
      {children}
    </h2>
  );
}
