import type { ReactNode } from "react";

/**
 * A sign in its line's colour (plan §6.4, §30.2): deep blue with white type,
 * or sky blue with navy type (white on sky fails AA), where focus rings turn
 * navy to stay visible.
 */
const TONES = {
  deep: { panel: "bg-deep text-on-deep", lede: "text-on-deep-2" },
  sky: { panel: "bg-sky text-navy [&_:focus-visible]:outline-navy", lede: "text-navy" },
} as const;

/**
 * The sign every page opens with (plan §6, §30.1): a deep-blue panel with the
 * headline standing alone, the supporting line, the page's own actions, and
 * on a wide screen a photograph beside it. "You are here" is said where the
 * visitor stands: where the three lines start, and on the line (plan D68).
 */
export function SignPanel({
  headline,
  lede,
  tone = "deep",
  level = "h1",
  media,
  children,
}: {
  headline: string;
  lede?: string | null;
  tone?: keyof typeof TONES;
  level?: "h1" | "h2";
  /** A photograph in its frame. */
  media?: ReactNode;
  /** The sign's actions. */
  children?: ReactNode;
}) {
  const Heading = level;
  return (
    <section
      className={`grid gap-8 rounded-panel p-sign lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-center ${TONES[tone].panel}`}
    >
      <div className="grid content-start gap-5">
        <Heading className="max-w-[16ch] text-sign font-bold">{headline}</Heading>
        {lede ? <p className={`max-w-[46ch] text-lead ${TONES[tone].lede}`}>{lede}</p> : null}
        {children ? <div className="flex flex-wrap gap-3 pt-2">{children}</div> : null}
      </div>
      {media ? <div className="min-w-0">{media}</div> : null}
    </section>
  );
}
