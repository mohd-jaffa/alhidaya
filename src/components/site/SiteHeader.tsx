"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { Pictogram } from "@/components/ui/pictogram";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { displayPhone, telHref } from "@/lib/contact";
import type { SiteDocument } from "@/lib/validation";

import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { isHere, visibleLinks } from "./navigation";

/**
 * The sign bar (plan §30.1): the logo home, the site's pages with the current
 * one underlined in the line's weight as where the visitor is, the phone and
 * the quote on a wide screen, the menu on a phone. It stays in view.
 */
export function SiteHeader({ site }: { site: SiteDocument | null }) {
  const pathname = usePathname();
  const links = visibleLinks(site);

  return (
    <header className="sticky top-0 z-(--z-header) border-b border-rule bg-ground">
      <div className="mx-auto flex h-(--header-height) max-w-site items-center justify-between gap-6 px-gutter">
        <Link href={ROUTES.home} className="shrink-0">
          <Logo priority className="h-10 w-auto lg:h-12" />
        </Link>
        <nav aria-label={UI_TEXT.mainNavigation} className="hidden h-full lg:block">
          <ul className="flex h-full items-stretch gap-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isHere(pathname, link.href) ? "page" : undefined}
                  className="relative flex h-full items-center px-3 font-semibold hover:text-deep after:absolute after:inset-x-3 after:bottom-0 after:h-(--line-width) after:rounded-t-full after:bg-deep after:opacity-0 aria-[current=page]:after:opacity-100"
                >
                  {link.label.en}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden items-center gap-5 lg:flex">
          {site ? (
            <a
              href={telHref(site.contact.phone)}
              className="flex min-h-touch items-center gap-2 font-semibold tabular-nums hover:text-deep"
            >
              <Pictogram name="phone" size="sm" className="text-deep" />
              {displayPhone(site.contact.phone)}
            </a>
          ) : null}
          <ButtonLink href={ROUTES.quote}>{UI_TEXT.requestQuote}</ButtonLink>
        </div>
        <MobileMenu site={site} links={links} />
      </div>
    </header>
  );
}
