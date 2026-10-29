import type { LineTone } from "@/components/motion/TheLine";

import { StationMarker } from "./station-marker";

const FILLS = { sky: "bg-sky", deep: "bg-deep", leaf: "bg-leaf" } as const;

/**
 * A section's edge in its line's colour (plan §30.1, sign grammar): the line
 * across the top of a positioned block, with a station where it starts.
 * Decoration: the section's heading says which line it is.
 */
export function LineEdge({ tone }: { tone: LineTone }) {
  return (
    <>
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-(--line-width) ${FILLS[tone]}`} />
      <span aria-hidden="true" className="absolute start-0 top-[calc(var(--line-width)/2)] -translate-y-1/2">
        <StationMarker tone={tone} />
      </span>
    </>
  );
}
