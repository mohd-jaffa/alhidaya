import type { Metadata } from "next";

import { PageHero } from "@/components/sections/PageHero";
import { WayBack } from "@/components/site/WayBack";
import { UI_TEXT } from "@/constants/messages";

export const metadata: Metadata = { title: UI_TEXT.notFoundTitle, robots: { index: false } };

/** A page the site does not have (plan §6.10, D109): an opening saying so, and the ways on. */
export default function NotFound() {
  return (
    <div className="py-section">
      <PageHero
        anchor="start"
        label={UI_TEXT.notFoundTitle}
        headline={UI_TEXT.notFoundHeadline}
        lede={UI_TEXT.notFoundLede}
      >
        <WayBack />
      </PageHero>
    </div>
  );
}
