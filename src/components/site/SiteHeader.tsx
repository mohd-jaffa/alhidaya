"use client";
"use no memo"; // Rarely redrawn: memoising it would only add to the page's JavaScript budget (plan §31).

import { InlineText } from "@/components/ui/inline-text";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { SiteDocument } from "@/lib/validation";

import { HeaderAction } from "./HeaderAction";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { isHere, needsCompactMenu, visibleLinks } from "./navigation";

/**
 * The menu's deep-blue pill, sliding to the page just opened (D134): drawn
 * under the new page's link, it is set back where the last one's was, at its
 * width, then let go to its CSS transition (a transform only). With motion
 * reduced, or nothing to come from, it is simply there.
 */
function useSlidingPill(pathname: string) {
  const list = useRef<HTMLUListElement>(null);
  const last = useRef({ left: 0, width: 0 });
  useLayoutEffect(() => {
    const link = list.current!.querySelector<HTMLElement>('[aria-current="page"]');
    const from = last.current;
    const to = { left: link?.offsetLeft ?? 0, width: link?.offsetWidth ?? 0 };
    last.current = to;
    const pill = link?.querySelector<HTMLElement>(".nav-pill");
    if (!pill || !from.width || !to.width) return;
    pill.style.transition = "none";
    pill.style.transform = `translateX(${from.left - to.left}px) scaleX(${from.width / to.width})`;
    // Measuring lays the pill out where it starts, so letting go moves it (a call, which no minifier drops).
    pill.getBoundingClientRect();
    pill.style.transition = "";
    pill.style.transform = "";
  }, [pathname]);
  return list;
}

/**
 * The header (D132, from Theme 2): the logo home; the site's pages in a
 * floating pill, the current one deep blue; and the brochure (the quote's,
 * until a brochure is published) on a wide screen; the menu on a phone. It
 * stays in document flow at the top and scrolls away with the page (D162).
 */
export function SiteHeader({ site }: { site: SiteDocument | null }) {
  const pathname = usePathname();
  const links = visibleLinks(site);
  const list = useSlidingPill(pathname);

  return (
    <header data-compact={needsCompactMenu(links) || undefined} className="site-header relative z-(--z-header) bg-card">
      <div className="header-row mx-auto grid h-(--header-height) max-w-site grid-cols-[1fr_auto] items-center gap-3 px-gutter sm:gap-6 lg:grid-cols-[1fr_auto_1fr]">
        <Link href={ROUTES.home} className="inline-flex min-h-touch shrink-0 items-center justify-self-start">
          <Logo priority className="h-8 w-auto min-[22.5rem]:h-10 lg:h-11" />
        </Link>
        <nav aria-label={UI_TEXT.mainNavigation} className="desktop-nav hidden lg:block">
          <ul ref={list} className="relative isolate flex items-center gap-1 rounded-pill bg-card p-1.5 shadow-raised">
            {links.map((link) => {
              const here = isHere(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={here ? "page" : undefined}
                    className="nav-link relative flex min-h-touch items-center rounded-pill px-4 font-medium text-navy not-aria-[current=page]:hover:bg-mist aria-[current=page]:text-on-deep"
                  >
                    {here ? (
                      <span aria-hidden className="nav-pill absolute inset-0 -z-10 rounded-pill bg-deep" />
                    ) : null}
                    <InlineText text={link.label.en} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="header-action hidden justify-self-end lg:block">
          <HeaderAction site={site} />
        </div>
        <div className="mobile-nav justify-self-end lg:hidden">
          <MobileMenu site={site} links={links} />
        </div>
      </div>
    </header>
  );
}
