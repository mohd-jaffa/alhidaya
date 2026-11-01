import type { ReactNode } from "react";

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

const BANDS = {
  /** The pastel blue of Home's What we do (D131). */
  mist: "bg-mist",
  /** The pale green of Home's quote (D130). */
  leaf: "bg-leaf-pale",
} as const;

/**
 * A section on a band of colour edge to edge (Theme 6, D135), named by its
 * heading, its content at the site's width.
 */
export function SectionBand({
  anchor,
  tone,
  named = true,
  className,
  children,
}: {
  anchor: string;
  tone: keyof typeof BANDS;
  /** False when the section has no one heading of its own. */
  named?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={anchor}
      aria-labelledby={named ? headingId(anchor) : undefined}
      className={`scroll-mt-8 py-section ${BANDS[tone]}`}
    >
      <div className={["mx-auto w-full max-w-site px-gutter", className].filter(Boolean).join(" ")}>{children}</div>
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
