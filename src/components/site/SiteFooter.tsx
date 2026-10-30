import Link from "next/link";

import { PillLink } from "@/components/ui/pill";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { SOCIAL_NETWORK_LABELS } from "@/constants/statuses";
import { displayPhone, mailtoHref, telHref } from "@/lib/contact";
import { dohaDay } from "@/lib/dates";
import type { SiteDocument } from "@/lib/validation";

import { Logo } from "./Logo";

const LINK =
  "underline decoration-transparent underline-offset-4 hover:decoration-current focus-visible:outline-focus-on-deep";

/**
 * The footer (plan §13, §30.1, D97, D106): forest, the admin's running words
 * crossing its top with the scroll, as large as the page allows (moved by CSS
 * alone, so the footer adds no script to any page); then the
 * logo in white with the company's words, the admin's footer columns, the
 * contact details, social links and the quote; and the year in Doha, kept
 * clear of the floating WhatsApp button on a phone.
 */
export function SiteFooter({ site }: { site: SiteDocument | null }) {
  const words = site?.runningWords.en;
  return (
    <footer className="bg-forest text-on-forest">
      {words ? (
        <div aria-hidden="true" className="overflow-hidden pt-12 lg:pt-16">
          <p className="running-words flex w-max gap-[0.4em] ps-gutter text-marquee font-normal whitespace-nowrap uppercase">
            {[0, 1, 2].map((copy) => (
              <span key={copy}>{words}</span>
            ))}
          </p>
        </div>
      ) : null}
      <div className="mx-auto grid max-w-site gap-12 px-gutter py-16 md:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:py-20">
        <div className="grid content-start gap-5">
          <Link href={ROUTES.home} className="w-fit focus-visible:outline-focus-on-deep">
            <Logo variant="white" className="h-12 w-auto" />
          </Link>
          {site ? <p className="max-w-[40ch] text-on-forest-2">{site.description.en}</p> : null}
        </div>
        {site?.footer.map((column) => (
          <nav key={column.heading.en} aria-label={column.heading.en} className="grid content-start gap-4">
            <h2 className="text-label font-semibold uppercase text-on-forest-2">{column.heading.en}</h2>
            <ul className="grid gap-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={LINK}>
                    {link.label.en}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        {site ? (
          <div className="grid content-start gap-4">
            <h2 className="text-label font-semibold uppercase text-on-forest-2">{UI_TEXT.contactHeading}</h2>
            <address className="grid gap-1 not-italic text-on-forest-2">
              {site.contact.address.map((line) => (
                <span key={line.en}>{line.en}</span>
              ))}
            </address>
            <ul className="grid gap-2">
              <li>
                <a href={telHref(site.contact.phone)} className={`${LINK} tabular-nums`}>
                  {displayPhone(site.contact.phone)}
                </a>
              </li>
              <li>
                <a href={mailtoHref(site.contact.email)} className={LINK}>
                  {site.contact.email}
                </a>
              </li>
              {site.contact.hours.en ? <li className="text-on-forest-2">{site.contact.hours.en}</li> : null}
            </ul>
            {site.social.length > 0 ? (
              <ul aria-label={UI_TEXT.followUs} className="flex flex-wrap gap-4">
                {site.social.map((social) => (
                  <li key={social.network}>
                    <a href={social.url} target="_blank" rel="noopener noreferrer" className={`${LINK} font-semibold`}>
                      {SOCIAL_NETWORK_LABELS[social.network]}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
            {site.brochure ? (
              <Link href={ROUTES.brochure} className={`${LINK} font-semibold`}>
                {UI_TEXT.brochure}
              </Link>
            ) : null}
            <PillLink href={ROUTES.quote} variant="onForest" arrow className="justify-self-start">
              {UI_TEXT.requestQuote}
            </PillLink>
          </div>
        ) : null}
      </div>
      <div className="border-t border-on-forest/20">
        <p className="mx-auto max-w-site px-gutter pt-6 pb-24 text-small text-on-forest-2 sm:pb-6">
          © {dohaDay().slice(0, 4)} {UI_TEXT.siteName}. {UI_TEXT.copyright}
        </p>
      </div>
    </footer>
  );
}
