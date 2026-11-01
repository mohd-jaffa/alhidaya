import type { Metadata } from "next";

import { PageSplit } from "@/components/sections/PageSplit";
import { WayBack } from "@/components/site/WayBack";
import { UI_TEXT } from "@/constants/messages";

export const metadata: Metadata = { title: UI_TEXT.notFoundTitle, robots: { index: false } };

/** A page the site does not have (plan §6.10, D109, D135): an opening saying so, and the ways on. */
export default function NotFound() {
  return (
    <div className="pb-section">
      <PageSplit
        anchor="start"
        label={UI_TEXT.notFoundTitle}
        headline={UI_TEXT.notFoundHeadline}
        lede={UI_TEXT.notFoundLede}
      >
        <WayBack />
      </PageSplit>
    </div>
  );
}
