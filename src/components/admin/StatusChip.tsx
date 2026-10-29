import type { ReactNode } from "react";

/**
 * Where something stands in the admin (R6.1): a dot in its line's colour and
 * its words, never colour alone. New is deep blue, under way sky, done leaf;
 * a failure is the error red (D63).
 */
const TONES = {
  new: { chip: "bg-deep/10 text-deep", dot: "bg-deep" },
  progress: { chip: "bg-sky/15 text-navy", dot: "bg-sky" },
  done: { chip: "bg-leaf/20 text-navy", dot: "bg-leaf" },
  error: { chip: "bg-error/10 text-error", dot: "bg-error" },
} as const;

export type StatusTone = keyof typeof TONES;

export function StatusChip({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  const { chip, dot } = TONES[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-tag px-2 py-0.5 text-small font-semibold ${chip}`}>
      <span aria-hidden="true" className={`size-2 rounded-full ${dot}`} />
      {children}
    </span>
  );
}
