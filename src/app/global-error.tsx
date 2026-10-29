"use client";

import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";

import "./globals.css";

/**
 * The last resort (plan §6.10): the site's own frame failed, so this page
 * stands alone, with its own document, a sign and a retry.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en" dir="ltr">
      <body className="grid min-h-dvh place-items-center bg-ground p-gutter text-navy">
        <main className="grid w-full max-w-xl gap-5 rounded-panel bg-deep p-sign text-on-deep">
          <h1 className="text-page font-bold">{UI_TEXT.errorHeadline}</h1>
          <p className="text-on-deep-2">{UI_TEXT.errorLede}</p>
          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={reset}
              className="min-h-touch rounded-control bg-ground px-5 font-semibold text-navy focus-visible:outline-focus-on-deep"
            >
              {UI_TEXT.tryAgain}
            </button>
            {/* A full load on purpose: the site's own frame failed, so its router is not trusted. */}
            <a
              href={ROUTES.home}
              className="font-semibold underline underline-offset-4 focus-visible:outline-focus-on-deep"
            >
              {UI_TEXT.home}
            </a>
          </div>
          {error.digest ? (
            <p className="text-small text-on-deep-2">
              {UI_TEXT.errorReference}: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
