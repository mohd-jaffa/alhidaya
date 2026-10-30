"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { PillLink } from "@/components/ui/pill";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { SiteDocument } from "@/lib/validation";

import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { isHere, visibleLinks } from "./navigation";

/**
 * The header (D107): the logo home, the site's pages in a light row with the
 * current one marked, and the forest quote pill on a wide screen; the menu on
 * a phone. It is not pinned: it scrolls away with the page, so nothing
 * stands over what the visitor reads.
 */
export function SiteHeader({ site }: { site: SiteDocument | null }) {
  const pathname = usePathname();
  const links = visibleLinks(site);

  return (
    <header className="relative z-(--z-header) bg-ground">
      <div className="mx-auto flex h-(--header-height) max-w-site items-center justify-between gap-3 px-gutter sm:gap-6">
        <Link href={ROUTES.home} className="shrink-0">
          <Logo priority className="h-8 w-auto min-[22.5rem]:h-10 lg:h-11" />
        </Link>
        <nav aria-label={UI_TEXT.mainNavigation} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isHere(pathname, link.href) ? "page" : undefined}
                  className="flex min-h-touch items-center rounded-pill px-4 text-ink-2 transition-colors duration-(--duration-state) hover:text-navy aria-[current=page]:bg-mist aria-[current=page]:text-navy"
                >
                  {link.label.en}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden lg:block">
          <PillLink href={ROUTES.quote} arrow>
            {UI_TEXT.requestQuote}
          </PillLink>
        </div>
        <MobileMenu site={site} links={links} />
      </div>
    </header>
  );
}
