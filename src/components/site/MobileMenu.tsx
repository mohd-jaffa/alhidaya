"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { ContactAction } from "@/components/ui/contact-action";
import { Pictogram } from "@/components/ui/pictogram";
import { StationMarker } from "@/components/ui/station-marker";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { SiteDocument } from "@/lib/validation";

import { Logo } from "./Logo";
import { isHere, type NavigationLink } from "./navigation";

/**
 * The menu on a phone (plan §30.1): the whole screen, each page a tall row
 * with the current one marked as where the visitor is, and the ways to reach
 * the company at hand. The browser's own modal dialog holds focus inside,
 * closes on Escape and returns focus to the button.
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
        className="-me-2 grid size-touch place-items-center rounded-control text-navy hover:bg-mist lg:hidden"
      >
        <Pictogram name="menu" label={UI_TEXT.menu} />
      </button>
      <dialog
        ref={dialog}
        aria-label={UI_TEXT.menu}
        onClose={() => setOpen(false)}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-ground p-0 text-navy backdrop:bg-navy/60"
      >
        <div className="flex h-(--header-height) items-center justify-between border-b border-rule px-gutter">
          <Logo className="h-10 w-auto" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="-me-2 grid size-touch place-items-center rounded-control hover:bg-mist"
          >
            <Pictogram name="close" label={UI_TEXT.close} />
          </button>
        </div>
        <nav aria-label={UI_TEXT.mainNavigation} className="px-gutter">
          <ul>
            {links.map((link) => {
              const here = isHere(pathname, link.href);
              return (
                <li key={link.href} className="border-b border-rule">
                  <Link
                    href={link.href}
                    aria-current={here ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className="flex min-h-16 items-center gap-4 text-title font-semibold"
                  >
                    {here ? <StationMarker tone="deep" /> : <StationMarker tone="deep" state="stop" />}
                    <span className="grow">{link.label.en}</span>
                    <Pictogram name="arrow" size="sm" className="text-deep" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="grid gap-3 px-gutter py-8">
          {site ? (
            <div className="grid grid-cols-2 gap-3">
              <ContactAction kind="whatsapp" to={site.contact.whatsapp} variant="sky" />
              <ContactAction kind="call" to={site.contact.phone} variant="secondary" />
            </div>
          ) : null}
          <ButtonLink href={ROUTES.quote} onClick={() => setOpen(false)}>
            {UI_TEXT.requestQuote}
          </ButtonLink>
        </div>
      </dialog>
    </>
  );
}
