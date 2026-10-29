import Link from "next/link";

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
 * The base of the sign (plan §13, §30.1): navy, the three lines running into
 * it, the logo in white, the admin's footer columns, the contact details and
 * social links, and the year in Doha.
 */
export function SiteFooter({ site }: { site: SiteDocument | null }) {
  return (
    <footer className="bg-navy text-on-deep">
      <div aria-hidden="true" className="grid h-(--line-width) grid-cols-3">
        <span className="bg-sky" />
        <span className="bg-deep" />
        <span className="bg-leaf" />
      </div>
      <div className="mx-auto grid max-w-site gap-12 px-gutter py-section md:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div className="grid content-start gap-5">
          <Link href={ROUTES.home} className="w-fit focus-visible:outline-focus-on-deep">
            <Logo variant="white" className="h-12 w-auto" />
          </Link>
          {site ? <p className="max-w-[40ch] text-on-deep-2">{site.description.en}</p> : null}
        </div>
        {site?.footer.map((column) => (
          <nav key={column.heading.en} aria-label={column.heading.en} className="grid content-start gap-4">
            <h2 className="text-label font-semibold uppercase text-on-deep-2">{column.heading.en}</h2>
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
            <h2 className="text-label font-semibold uppercase text-on-deep-2">{UI_TEXT.contactHeading}</h2>
            <address className="grid gap-1 not-italic text-on-deep-2">
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
              {site.contact.hours.en ? <li className="text-on-deep-2">{site.contact.hours.en}</li> : null}
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
          </div>
        ) : null}
      </div>
      <div className="border-t border-on-deep/15">
        <p className="mx-auto max-w-site px-gutter py-6 text-small text-on-deep-2">
          © {dohaDay().slice(0, 4)} {UI_TEXT.siteName}. {UI_TEXT.copyright}
        </p>
      </div>
    </footer>
  );
}
