import type { ReactNode } from "react";

import { UI_TEXT } from "@/constants/messages";

/**
 * Where the three lines start (plan §6.1, D68): the point the visitor stands
 * at, a navy "You are here" station with a stem down to the first line, then
 * the lines. The station is the travelling marker's, standing still.
 */
export function LineStart({ children }: { children: ReactNode }) {
  return (
    <div className="grid">
      <p className="relative flex items-center gap-4 pb-6 font-semibold">
        <span
          aria-hidden="true"
          className="absolute top-1/2 bottom-0 start-(--line-rail-centre) w-(--line-width) bg-navy"
        />
        <span
          aria-hidden="true"
          className="relative size-(--line-station) shrink-0 rounded-full border-(length:--line-width) border-navy bg-ground"
        />
        {UI_TEXT.youAreHere}
      </p>
      {children}
    </div>
  );
}
