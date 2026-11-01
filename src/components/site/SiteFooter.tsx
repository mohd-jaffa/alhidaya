import Link from "next/link";

import { Pictogram } from "@/components/ui/pictogram";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { SOCIAL_NETWORK_LABELS, SOCIAL_NETWORK_PICTOGRAMS } from "@/constants/statuses";
import { displayPhone, mailtoHref, telHref } from "@/lib/contact";
import { dohaDay } from "@/lib/dates";
import type { SiteDocument } from "@/lib/validation";

import { Logo } from "./Logo";

const LINK = "underline decoration-transparent underline-offset-4 hover:text-navy hover:decoration-current";

const HEADING = "text-body font-semibold text-navy";

/**
 * The footer (plan §13, D132, from Theme 5): soft white under a rule; the logo
 * in its colours with the company's words, the admin's footer columns under
 * their headings, and a contact column: the phone, the email and the hours,
 * each beside its mark, then each social network with its mark; and the year
 * in Doha with the registered name (D121), kept clear of the floating
 * WhatsApp button on a phone.
 */
export function SiteFooter({ site }: { site: SiteDocument | null }) {
  return (
    <footer className="border-t border-rule bg-ground text-ink-2">
      <div className="mx-auto grid max-w-site gap-12 px-gutter py-16 md:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:py-20">
        <div className="grid content-start gap-5">
          <Link href={ROUTES.home} className="w-fit">
            <Logo className="h-12 w-auto" />
          </Link>
          {site ? <p className="max-w-[40ch]">{site.description.en}</p> : null}
        </div>
        {site?.footer.map((column) => (
          <nav key={column.heading.en} aria-label={column.heading.en} className="grid content-start gap-5">
            <h2 className={HEADING}>{column.heading.en}</h2>
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
          <div className="grid content-start gap-5">
            <h2 className={HEADING}>{UI_TEXT.contactHeading}</h2>
            <ul className="grid gap-3">
              <li className="flex items-center gap-2.5">
                <Pictogram name="phone" size="sm" className="text-deep" />
                <a href={telHref(site.contact.phone)} className={`${LINK} tabular-nums`}>
                  {displayPhone(site.contact.phone)}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Pictogram name="mail" size="sm" className="text-deep" />
                <a href={mailtoHref(site.contact.email)} className={LINK}>
                  {site.contact.email}
                </a>
              </li>
              {site.contact.hours.en ? (
                <li className="flex items-center gap-2.5">
                  <Pictogram name="clock" size="sm" className="text-deep" />
                  {site.contact.hours.en}
                </li>
              ) : null}
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
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mist text-deep transition-colors duration-(--duration-state) group-hover:bg-leaf-pale group-hover:text-forest">
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
      <div className="border-t border-rule">
        <p className="mx-auto max-w-site px-gutter pt-6 pb-24 text-small sm:pb-6">
          © {dohaDay().slice(0, 4)} {UI_TEXT.legalName} {UI_TEXT.copyright}
        </p>
      </div>
    </footer>
  );
}
