import type { ReactNode } from "react";

/**
 * The sign every page opens with (plan §6, §30.1): a deep-blue panel with the
 * "You are here" marker, the headline, the supporting line, the page's own
 * actions, and on a wide screen a photograph beside it.
 */
export function SignPanel({
  marker,
  headline,
  lede,
  level = "h1",
  media,
  children,
}: {
  /** The marker's words: "You are here", or the page's name. */
  marker: string;
  headline: string;
  lede?: string | null;
  level?: "h1" | "h2";
  /** A photograph in its frame. */
  media?: ReactNode;
  /** The sign's actions. */
  children?: ReactNode;
}) {
  const Heading = level;
  return (
    <section className="grid gap-8 rounded-panel bg-deep p-sign text-on-deep lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-center">
      <div className="grid content-start gap-5">
        <p className="inline-flex items-center gap-3 text-label font-semibold uppercase">
          <span aria-hidden="true" className="size-4 rounded-full bg-on-deep ring-4 ring-on-deep/30" />
          {marker}
        </p>
        <Heading className="max-w-[16ch] text-sign font-bold">{headline}</Heading>
        {lede ? <p className="max-w-[46ch] text-lead text-on-deep-2">{lede}</p> : null}
        {children ? <div className="flex flex-wrap gap-3 pt-2">{children}</div> : null}
      </div>
      {media ? <div className="min-w-0">{media}</div> : null}
    </section>
  );
}
