"use client";

import { WayBack } from "@/components/site/WayBack";
import { pillClasses } from "@/components/ui/pill-classes";
import { UI_TEXT } from "@/constants/messages";

/**
 * A page that failed on the server (plan §6.10, D109): an opening saying so,
 * a retry, the ways back, and the reference that ties it to the server's log.
 * Never the error's own words (AGENTS.md §10). It takes the pills' look
 * alone, so it shares the frame's script rather than carrying its own.
 */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto grid w-full max-w-site justify-items-start gap-6 px-gutter py-section lg:gap-8">
      <h1 className="max-w-[15ch] text-hero font-normal">{UI_TEXT.errorHeadline}</h1>
      <p className="max-w-[40ch] text-lead text-ink-2">{UI_TEXT.errorLede}</p>
      <button type="button" onClick={reset} className={pillClasses({ size: "lg" })}>
        {UI_TEXT.tryAgain}
      </button>
      <WayBack />
      {error.digest ? (
        <p className="text-small text-ink-2">
          {UI_TEXT.errorReference}: <span className="tabular-nums">{error.digest}</span>
        </p>
      ) : null}
    </div>
  );
}
