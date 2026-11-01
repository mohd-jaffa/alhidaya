"use client";

import { pillClasses } from "@/components/ui/pill-classes";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";

import "./globals.css";

/**
 * The last resort (plan §6.10): the site's own frame failed, so this page
 * stands alone, with its own document, saying so on a mist card (D97), with
 * a retry and the way home.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en" dir="ltr">
      <body className="grid min-h-dvh place-items-center bg-ground p-gutter text-navy">
        <main className="grid w-full max-w-xl justify-items-start gap-6 rounded-card bg-mist p-8 sm:p-10">
          <h1 className="text-display font-normal">{UI_TEXT.errorHeadline}</h1>
          <p className="text-lead text-ink-2">{UI_TEXT.errorLede}</p>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={reset} className={pillClasses({})}>
              {UI_TEXT.tryAgain}
            </button>
            {/* A full load on purpose: the site's own frame failed, so its router is not trusted. */}
            <a href={ROUTES.home} className={pillClasses({ variant: "line" })}>
              {UI_TEXT.home}
            </a>
          </div>
          {error.digest ? (
            <p className="text-small text-ink-2">
              {UI_TEXT.errorReference}: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
