"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type CSSProperties, useEffect, useRef, useState } from "react";

import { ContactAction } from "@/components/ui/contact-action";
import { Pictogram } from "@/components/ui/pictogram";
import { UI_TEXT } from "@/constants/messages";
import type { SiteDocument } from "@/lib/validation";

import { HeaderAction } from "./HeaderAction";
import { Logo } from "./Logo";
import { isHere, type NavigationLink } from "./navigation";

/**
 * The menu on a phone (plan §30.1, D97, D101): the whole screen, each page in
 * large light words on its own round row, the current one on the pale green,
 * and the ways to reach the company at hand as pills. It fades in over the
 * page and its rows rise into place one after another (D117). The browser's
 * own modal dialog holds focus inside, closes on Escape and returns focus to
 * the button.
 */
export function MobileMenu({ site, links }: { site: SiteDocument | null; links: NavigationLink[] }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    // The dialog element is always rendered, so it is there by the time this runs.
    const element = dialog.current!;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="-me-2 grid size-touch place-items-center rounded-full text-navy hover:bg-mist lg:hidden"
      >
        <Pictogram name="menu" label={UI_TEXT.menu} />
      </button>
      <dialog
        ref={dialog}
        aria-label={UI_TEXT.menu}
        onClose={() => setOpen(false)}
        className="menu-sheet m-0 h-dvh max-h-none w-full max-w-none bg-ground p-0 text-navy backdrop:bg-transparent"
      >
        <div className="flex h-(--header-height) items-center justify-between border-b border-rule px-gutter">
          <Logo className="h-8 w-auto min-[22.5rem]:h-10" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="-me-2 grid size-touch place-items-center rounded-full hover:bg-mist"
          >
            <Pictogram name="close" label={UI_TEXT.close} />
          </button>
        </div>
        <nav aria-label={UI_TEXT.mainNavigation} className="px-gutter pt-4">
          <ul className="grid gap-1">
            {links.map((link, index) => {
              const here = isHere(pathname, link.href);
              return (
                <li key={link.href} className="menu-row" style={{ "--i": index } as CSSProperties}>
                  <Link
                    href={link.href}
                    aria-current={here ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`-mx-3 flex min-h-16 items-center justify-between gap-4 rounded-pill px-3 text-display font-normal ${here ? "bg-leaf-pale text-forest" : "hover:bg-mist"}`}
                  >
                    <span>{link.label.en}</span>
                    <Pictogram name="arrow" size="sm" className="text-forest" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="menu-row grid gap-3 px-gutter py-8" style={{ "--i": links.length } as CSSProperties}>
          {site ? (
            <div className="grid grid-cols-2 gap-3">
              <ContactAction kind="whatsapp" to={site.contact.whatsapp} variant="line" />
              <ContactAction kind="call" to={site.contact.phone} variant="line" />
            </div>
          ) : null}
          <HeaderAction site={site} onNavigate={() => setOpen(false)} />
        </div>
      </dialog>
    </>
  );
}
