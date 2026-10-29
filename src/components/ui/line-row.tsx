import type { ReactNode } from "react";

import type { PictogramName } from "@/assets/brand/pictograms";
import type { LineTone } from "@/components/motion/TheLine";

import { Pictogram } from "./pictogram";
import { StationMarker } from "./station-marker";

const FILLS = { sky: "bg-sky", deep: "bg-deep", leaf: "bg-leaf" } as const;

/**
 * One of the three lines (plan §30.1): its colour, a station, its pictogram
 * and name, and its working actions. On a phone the row is tall and the
 * actions sit under the name; on a wide screen they sit at its end.
 */
export function LineRow({
  tone,
  pictogram,
  title,
  level = "h2",
  children,
}: {
  tone: LineTone;
  pictogram: PictogramName;
  title: string;
  level?: "h2" | "h3";
  /** The line's actions. */
  children: ReactNode;
}) {
  const Heading = level;
  return (
    <div className="relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 border-b border-rule pt-7 pb-5 md:grid-cols-[auto_minmax(0,1fr)_auto]">
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-(--line-width) ${FILLS[tone]}`} />
      <StationMarker tone={tone} />
      <div className="flex min-w-0 items-center gap-3">
        <Pictogram name={pictogram} size="md" className="text-navy" />
        <Heading className="text-section font-bold">{title}</Heading>
      </div>
      <div className="col-start-2 flex flex-wrap gap-2 md:col-start-3 md:justify-end">{children}</div>
    </div>
  );
}
