"use client";
"use no memo"; // Rarely redrawn: memoising it would only add to the page's JavaScript budget (plan §31).

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { SiteDocument } from "@/lib/validation";

import { HeaderAction } from "./HeaderAction";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { isHere, visibleLinks } from "./navigation";

/** How far down the page the header may hide: never while the page's top is in view. */
const HIDE_AFTER = 160;

/**
 * Whether the header is out of the way: as the page goes down past its top,
 * and back the moment it goes up (D132). Read once a frame at most.
 */
function useHidden(): boolean {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const read = () => {
      frame = 0;
      const y = window.scrollY;
      if (y > last && y > HIDE_AFTER) setHidden(true);
      else if (y < last) setHidden(false);
      last = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return hidden;
}

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
 * stays at the top, slides away as the visitor reads down, and comes back as
 * soon as they scroll up; with focus inside it, it stays.
 */
export function SiteHeader({ site }: { site: SiteDocument | null }) {
  const pathname = usePathname();
  const links = visibleLinks(site);
  const hidden = useHidden();
  const list = useSlidingPill(pathname);

  return (
    <header
      data-hidden={hidden || undefined}
      className="site-header sticky top-0 z-(--z-header) bg-ground focus-within:transform-none"
    >
      <div className="mx-auto grid h-(--header-height) max-w-site grid-cols-[1fr_auto] items-center gap-3 px-gutter sm:gap-6 lg:grid-cols-[1fr_auto_1fr]">
        <Link href={ROUTES.home} className="shrink-0 justify-self-start">
          <Logo priority className="h-8 w-auto min-[22.5rem]:h-10 lg:h-11" />
        </Link>
        <nav aria-label={UI_TEXT.mainNavigation} className="hidden lg:block">
          <ul ref={list} className="relative isolate flex items-center gap-1 rounded-pill bg-card p-1.5 shadow-raised">
            {links.map((link) => {
              const here = isHere(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={here ? "page" : undefined}
                    className="nav-link relative flex min-h-10 items-center rounded-pill px-4 font-medium text-navy not-aria-[current=page]:hover:bg-mist aria-[current=page]:text-on-deep"
                  >
                    {here ? (
                      <span aria-hidden className="nav-pill absolute inset-0 -z-10 rounded-pill bg-deep" />
                    ) : null}
                    {link.label.en}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="hidden justify-self-end lg:block">
          <HeaderAction site={site} />
        </div>
        <div className="justify-self-end lg:hidden">
          <MobileMenu site={site} links={links} />
        </div>
      </div>
    </header>
  );
}
