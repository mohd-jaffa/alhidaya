"use client";

import { WayBack } from "@/components/site/WayBack";
import { Button } from "@/components/ui/button";
import { SignPanel } from "@/components/ui/sign-panel";
import { UI_TEXT } from "@/constants/messages";

/**
 * A page that failed on the server (plan §6.10): a sign saying so, a retry,
 * the ways back, and the reference that ties it to the server's log. Never
 * the error's own words (AGENTS.md §10).
 */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-site px-gutter py-section">
      <SignPanel headline={UI_TEXT.errorHeadline} lede={UI_TEXT.errorLede}>
        <div className="grid gap-6">
          <div>
            <Button variant="onDeep" onClick={reset}>
              {UI_TEXT.tryAgain}
            </Button>
          </div>
          <WayBack />
          {error.digest ? (
            <p className="text-small text-on-deep-2">
              {UI_TEXT.errorReference}: <span className="tabular-nums">{error.digest}</span>
            </p>
          ) : null}
        </div>
      </SignPanel>
    </div>
  );
}
