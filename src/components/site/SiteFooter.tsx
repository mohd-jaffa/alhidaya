import Link from "next/link";

import { PauseToggle } from "@/components/ui/pause-toggle";
import { Pictogram } from "@/components/ui/pictogram";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { SOCIAL_NETWORK_LABELS, SOCIAL_NETWORK_PICTOGRAMS } from "@/constants/statuses";
import { displayPhone, mailtoHref, telHref } from "@/lib/contact";
import { dohaDay } from "@/lib/dates";
import type { SiteDocument } from "@/lib/validation";

import { Logo } from "./Logo";

const LINK =
  "underline decoration-transparent underline-offset-4 hover:decoration-current focus-visible:outline-focus-on-leaf";

const HEADING = "text-title font-semibold";

/**
 * The admin's running words across the footer's top (D106, D113), as large as
 * the page allows, in an endless slow loop moved by CSS alone, so the footer
 * adds no script to any page. Their button, a checkbox drawn as a round
 * pause, stops them (WCAG 2.2.2); with motion reduced they stand still and
 * the button is not needed.
 */
function RunningWords({ words }: { words: string }) {
  return (
    <div className="running-band relative pt-16 lg:pt-20">
      <div aria-hidden="true" className="overflow-hidden">
        <p className="running-words flex w-max text-marquee font-normal whitespace-nowrap uppercase">
          {[0, 1, 2, 3].map((copy) => (
            <span key={copy} className="pe-[0.4em]">
              {words}
            </span>
          ))}
        </p>
      </div>
      <PauseToggle label={UI_TEXT.pauseRunningWords} tone="leaf" className="absolute end-gutter top-3 lg:top-4" />
    </div>
  );
}

/**
 * The footer (plan §13, §30.1, D97, D106, D113, D122): the logo's leaf with
 * navy words, the running words across its top; then the logo in navy with
 * the company's words, the admin's footer columns under their headings, and
 * a plain contact column: the phone, the email and the hours, then each
 * social network with its mark (the brochure is the header's, D116); and the
 * year in Doha with the registered name (D121), kept clear of the floating
 * WhatsApp button on a phone.
 */
export function SiteFooter({ site }: { site: SiteDocument | null }) {
  const words = site?.runningWords.en;
  return (
    <footer className="bg-leaf text-on-leaf">
      {words ? <RunningWords words={words} /> : null}
      <div className="mx-auto grid max-w-site gap-12 px-gutter py-16 md:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:py-20">
        <div className="grid content-start gap-5">
          <Link href={ROUTES.home} className="w-fit focus-visible:outline-focus-on-leaf">
            <Logo variant="navy" className="h-12 w-auto" />
          </Link>
          {site ? <p className="max-w-[40ch] text-on-leaf-2">{site.description.en}</p> : null}
        </div>
        {site?.footer.map((column) => (
          <nav key={column.heading.en} aria-label={column.heading.en} className="grid content-start gap-5">
            <h2 className={HEADING}>{column.heading.en}</h2>
            <ul className="grid gap-3 text-on-leaf-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={`${LINK} hover:text-on-leaf`}>
                    {link.label.en}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        {site ? (
          <div className="grid content-start gap-5">
            <h2 className={HEADING}>{UI_TEXT.contactHeading}</h2>
            <ul className="grid gap-3 text-on-leaf-2">
              <li>
                <a href={telHref(site.contact.phone)} className={`${LINK} tabular-nums hover:text-on-leaf`}>
                  {displayPhone(site.contact.phone)}
                </a>
              </li>
              <li>
                <a href={mailtoHref(site.contact.email)} className={`${LINK} hover:text-on-leaf`}>
                  {site.contact.email}
                </a>
              </li>
              {site.contact.hours.en ? <li>{site.contact.hours.en}</li> : null}
            </ul>
            {site.social.length > 0 ? (
              <ul aria-label={UI_TEXT.followUs} className="grid gap-3">
                {site.social.map((social) => (
                  <li key={social.network}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group inline-flex items-center gap-3 font-medium ${LINK}`}
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-on-leaf/40 transition-colors duration-(--duration-state) group-hover:bg-on-leaf/10">
                        <Pictogram name={SOCIAL_NETWORK_PICTOGRAMS[social.network]} size="sm" />
                      </span>
                      {SOCIAL_NETWORK_LABELS[social.network]}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="border-t border-on-leaf/20">
        <p className="mx-auto max-w-site px-gutter pt-6 pb-24 text-small text-on-leaf-2 sm:pb-6">
          © {dohaDay().slice(0, 4)} {UI_TEXT.legalName} {UI_TEXT.copyright}
        </p>
      </div>
    </footer>
  );
}
