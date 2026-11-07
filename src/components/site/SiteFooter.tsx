import { plainText } from "@/lib/text/inline";
import { InlineText } from "@/components/ui/inline-text";
import Link from "next/link";

import colourLogo from "@/assets/brand/logo.svg";
import { Pictogram } from "@/components/ui/pictogram";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { SOCIAL_NETWORK_LABELS, SOCIAL_NETWORK_PICTOGRAMS } from "@/constants/statuses";
import { displayPhone, mailtoHref, telHref } from "@/lib/contact";
import { dohaDay } from "@/lib/dates";
import type { SiteDocument } from "@/lib/validation";

import { FooterArtwork } from "./FooterArtwork";
import { Logo } from "./Logo";

const LINK =
  "inline-flex min-h-touch min-w-touch max-w-full items-center underline decoration-transparent underline-offset-4 hover:text-navy hover:decoration-current";

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
      <div className="footer-main relative isolate">
        <FooterArtwork />
        <div className="footer-content mx-auto grid max-w-site gap-12 px-gutter py-16 md:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:py-20">
          <div className="grid content-start gap-5">
            <Link href={ROUTES.home} className="inline-flex min-h-touch w-fit items-center">
              <span className="footer-logo relative inline-flex">
                <Logo className="h-12 w-auto" />
                <span aria-hidden className="footer-logo-shine" style={{ maskImage: `url("${colourLogo.src}")` }} />
              </span>
            </Link>
            {site ? (
              <p className="max-w-[40ch]">
                <InlineText text={site.description.en} />
              </p>
            ) : null}
          </div>
          {site?.footer.map((column) => (
            <nav key={column.heading.en} aria-label={plainText(column.heading.en)} className="grid content-start gap-3">
              <h2 className={HEADING}>
                <InlineText text={column.heading.en} />
              </h2>
              <ul className="grid">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={LINK}>
                      <InlineText text={link.label.en} />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          {site ? (
            <div className="grid content-start gap-3">
              <h2 className={HEADING}>{UI_TEXT.contactHeading}</h2>
              <ul className="grid">
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
                    <InlineText text={site.contact.hours.en} />
                  </li>
                ) : null}
              </ul>
              {site.social.length > 0 ? (
                <div className="grid gap-1">
                  <h3 className={HEADING}>{UI_TEXT.followUs}</h3>
                  <ul aria-label={UI_TEXT.followUs} className="flex flex-wrap gap-2">
                    {site.social.map((social) => (
                      <li key={social.network}>
                        <a
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={SOCIAL_NETWORK_LABELS[social.network]}
                          className={`${site.social.length === 1 ? "gap-2.5 font-medium" : "w-touch justify-center"} ${LINK}`}
                        >
                          <Pictogram
                            name={SOCIAL_NETWORK_PICTOGRAMS[social.network]}
                            size="sm"
                            className={`text-deep ${social.network === "INSTAGRAM" ? "relative -start-0.5" : ""}`}
                          />
                          {site.social.length === 1 ? SOCIAL_NETWORK_LABELS[social.network] : null}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      <div className="border-t border-rule">
        <p className="mx-auto max-w-site px-gutter pt-6 pb-24 text-small sm:pb-6">
          © {dohaDay().slice(0, 4)} {UI_TEXT.legalName} {UI_TEXT.copyright}
        </p>
      </div>
    </footer>
  );
}
