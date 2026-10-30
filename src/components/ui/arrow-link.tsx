import Link from "next/link";
import type { ReactNode } from "react";

import { Pictogram } from "./pictogram";

/**
 * A way onward (plan §30.1, D97): words in forest and an arrow that steps
 * forward on hover, by transform alone. Pages of this site go through Next's
 * link.
 */
export function ArrowLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const classes = [
    "group inline-flex min-h-touch items-center gap-2 font-medium text-forest underline decoration-transparent underline-offset-4 hover:decoration-current",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const arrow = (
    <Pictogram
      name="arrow"
      size="sm"
      className="transition-transform duration-(--duration-state) ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
    />
  );
  return href.startsWith("/") ? (
    <Link href={href} className={classes}>
      <span>{children}</span>
      {arrow}
    </Link>
  ) : (
    <a href={href} className={classes}>
      <span>{children}</span>
      {arrow}
    </a>
  );
}
