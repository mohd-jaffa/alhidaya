import Link from "next/link";
import type { ReactNode } from "react";

import type { PictogramName } from "@/assets/brand/pictograms";
import { Logo } from "@/components/site/Logo";
import { Pictogram } from "@/components/ui/pictogram";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { dohaDay } from "@/lib/dates";

/** What the panel looks after, as the way in names it (D115). */
const LOOKS_AFTER: { pictogram: PictogramName; label: string }[] = [
  { pictogram: "mail", label: ADMIN_TEXT.authInbox },
  { pictogram: "document", label: ADMIN_TEXT.authContent },
  { pictogram: "settings", label: ADMIN_TEXT.authAdministration },
];

/**
 * The frame of the admin's way in (R6.1, D101, D115, D123). On a wide screen
 * a panel in the logo's deep blue: the logo at its top; the panel's name,
 * what it is for and the three things it looks after, each with its mark;
 * the way back to the website and the year at its foot. On a phone a
 * deep-blue band with the logo. The form sits on white beside it, alone, with
 * one way elsewhere under it.
 */
export function AuthScene({
  title,
  intro,
  aside,
  children,
}: {
  title: string;
  intro?: string;
  /** The other way out: "Forgot your password?", "Back to sign in". */
  aside?: { label: string; href: string };
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh md:grid-cols-[minmax(18rem,26rem)_1fr]">
      <header className="flex flex-col gap-10 bg-deep px-gutter py-6 text-on-deep-2 md:justify-between md:px-10 md:py-12">
        <Logo variant="white" priority className="h-10 w-auto self-start md:h-12" />
        <div className="hidden gap-8 md:grid">
          <div className="grid gap-3">
            <p className="text-section font-semibold text-on-deep">{ADMIN_TEXT.admin}</p>
            <p className="max-w-[32ch]">{ADMIN_TEXT.authAside}</p>
          </div>
          <ul className="grid gap-4">
            {LOOKS_AFTER.map(({ pictogram, label }) => (
              <li key={pictogram} className="flex items-center gap-3 text-on-deep">
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-on-deep/10"
                >
                  <Pictogram name={pictogram} size="sm" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="hidden gap-3 text-small md:grid">
          <a
            href={ROUTES.home}
            className="inline-flex items-center gap-2 justify-self-start font-semibold text-on-deep underline decoration-transparent underline-offset-4 hover:decoration-current focus-visible:outline-focus-on-deep"
          >
            {ADMIN_TEXT.backToWebsite}
            <Pictogram name="arrow" size="sm" />
          </a>
          <p className="text-on-deep-2">
            © {dohaDay().slice(0, 4)} {UI_TEXT.siteName}
          </p>
        </div>
      </header>
      <main id="main" className="grid content-start px-gutter py-10 md:content-center md:px-16">
        <div className="grid w-full max-w-md gap-8">
          <div className="grid gap-3">
            <h1 className="text-section font-bold">{title}</h1>
            {intro ? <p className="text-ink-2">{intro}</p> : null}
          </div>
          {children}
          {aside ? (
            <Link href={aside.href} className="justify-self-start font-semibold text-deep underline underline-offset-4">
              {aside.label}
            </Link>
          ) : null}
        </div>
      </main>
    </div>
  );
}
