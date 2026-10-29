import type { Metadata } from "next";

import { WayBack } from "@/components/site/WayBack";
import { SignPanel } from "@/components/ui/sign-panel";
import { UI_TEXT } from "@/constants/messages";

export const metadata: Metadata = { title: UI_TEXT.notFoundTitle, robots: { index: false } };

/** A page the site does not have (plan §6.10): a sign saying so, and the ways on. */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-site px-gutter py-section">
      <SignPanel headline={UI_TEXT.notFoundHeadline} lede={UI_TEXT.notFoundLede}>
        <WayBack />
      </SignPanel>
    </div>
  );
}
