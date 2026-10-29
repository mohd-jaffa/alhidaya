import type { LineTone } from "@/components/motion/TheLine";

/** A station's look in each state, on each line (plan §30.1). */
const STATES = {
  sky: { stop: "border-rule bg-ground", passed: "border-sky bg-ground", current: "border-sky bg-sky" },
  deep: { stop: "border-rule bg-ground", passed: "border-deep bg-ground", current: "border-deep bg-deep" },
  leaf: { stop: "border-rule bg-ground", passed: "border-leaf bg-ground", current: "border-leaf bg-leaf" },
} as const;

export type StationState = "stop" | "passed" | "current";

/** The classes of a station dot: shared by the line in the margin and every line row. */
export function stationClasses(tone: LineTone, state: StationState): string {
  return `rounded-full border-(length:--line-width) ${STATES[tone][state]}`;
}

/** A station on a line (plan §30.1): decoration; what it stands for is always written beside it. */
export function StationMarker({ tone, state = "current" }: { tone: LineTone; state?: StationState }) {
  return <span aria-hidden="true" className={`block size-(--line-station) shrink-0 ${stationClasses(tone, state)}`} />;
}
