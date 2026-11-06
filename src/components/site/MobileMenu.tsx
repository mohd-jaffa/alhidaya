"use client";
"use no memo"; // Rarely redrawn: memoising it would only add to the page's JavaScript budget (plan §31).

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type CSSProperties, useEffect, useRef, useState } from "react";

import mark from "@/assets/brand/logo-mark-white.svg";
import { IconChip } from "@/components/ui/icon-chip";
import { Pictogram } from "@/components/ui/pictogram";
import { UI_TEXT } from "@/constants/messages";
import { displayPhone, telHref, whatsappHref } from "@/lib/contact";
import { REDUCED_MOTION_QUERY } from "@/lib/motion/preferences";
import type { SiteDocument } from "@/lib/validation";

import { HeaderAction } from "./HeaderAction";
import { Logo } from "./Logo";
import { isHere, type NavigationLink } from "./navigation";

/** The animation that lifts the sheet away (src/app/globals.css): the dialog closes when it ends. */
const SHEET_OUT = "menu-out";

function finishSheet(element: HTMLDialogElement) {
  element.removeAttribute("data-closing");
  element.close();
}

/** One way to reach the company as a tile: its mark, what it is, and the number. */
function Tile({ kind, number }: { kind: "whatsapp" | "call"; number: string }) {
  const whatsapp = kind === "whatsapp";
  return (
    <a
      href={whatsapp ? whatsappHref(number, UI_TEXT.whatsappPrefill) : telHref(number)}
      className={`grid min-h-28 min-w-0 content-between gap-3 rounded-card p-3.5 text-navy min-[22.5rem]:p-4 transition-transform duration-(--duration-state) ease-out active:scale-[0.98] focus-visible:outline-focus-on-deep ${whatsapp ? "bg-leaf" : "bg-card"}`}
    >
      <IconChip name={whatsapp ? "chat" : "phone"} tone={whatsapp ? "onLeaf" : "mist"} />
      <span className="grid min-w-0 gap-0.5">
        <span className="font-semibold">{whatsapp ? UI_TEXT.whatsappUs : UI_TEXT.callUs}</span>
        <span className={`text-small wrap-anywhere tabular-nums ${whatsapp ? "text-on-leaf-2" : "text-ink-2"}`}>
          {displayPhone(number)}
        </span>
      </span>
    </a>
  );
}

/**
 * The menu on a phone (plan §30.1, D97, D101, D167): the whole screen in the
 * logo's deep blue, each page in large white words under a faint rule, the
 * current one in semibold with a leaf arrow, then WhatsApp and a call as two
 * tiles and the brochure on a white button (the quote until there is one). The
 * sheet drops in from the top and its rows settle after it; closing, the rows
 * fade and the sheet lifts away before the dialog closes. The browser's own
 * modal dialog holds focus inside, closes on Escape (through the same
 * animation) and returns focus to the button.
 */
export function MobileMenu({ site, links }: { site: SiteDocument | null; links: NavigationLink[] }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const element = dialog.current!;
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY);
    const preference = () => {
      if (reduced.matches && element.hasAttribute("data-closing")) finishSheet(element);
    };
    const cancelled = (event: AnimationEvent) => {
      if (event.target === element && event.animationName === SHEET_OUT && element.hasAttribute("data-closing"))
        finishSheet(element);
    };
    element.addEventListener("animationcancel", cancelled);
    reduced.addEventListener("change", preference);
    return () => {
      element.removeEventListener("animationcancel", cancelled);
      reduced.removeEventListener("change", preference);
    };
  }, []);

  /** Opens the sheet in the tap itself, not a render later, so it starts at once. */
  const show = () => {
    // The dialog element is always rendered, so it is there by the time anything is tapped.
    dialog.current!.showModal();
    setOpen(true);
  };

  /** Lifts the sheet away, then closes; with no animation to wait for (motion reduced), closes at once. */
  const close = () => {
    const element = dialog.current!;
    if (!element.open || element.hasAttribute("data-closing")) return;
    element.setAttribute("data-closing", "");
    const animation = getComputedStyle(element).animationName;
    if (animation === "" || animation === "none") finishSheet(element);
  };

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={show}
        className="-me-2 grid size-touch place-items-center rounded-full text-navy hover:bg-mist lg:hidden"
      >
        <Pictogram name="menu" label={UI_TEXT.menu} />
      </button>
      <dialog
        ref={dialog}
        aria-label={UI_TEXT.menu}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClose={() => setOpen(false)}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && event.animationName === SHEET_OUT)
            finishSheet(event.currentTarget);
        }}
        className="menu-sheet m-0 h-dvh max-h-none w-full max-w-none bg-deep p-0 text-on-deep backdrop:bg-transparent"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <Image src={mark} alt="" unoptimized className="absolute -end-24 -bottom-36 w-85 max-w-none opacity-7" />
        </div>
        <div className="relative">
          <div className="flex h-(--header-height) items-center justify-between px-gutter">
            <Logo variant="white" className="h-8 min-w-0 w-auto min-[22.5rem]:h-10" />
            <button
              type="button"
              onClick={close}
              className="-me-2 grid size-touch shrink-0 place-items-center rounded-full bg-on-deep/15 text-on-deep hover:bg-on-deep/25 focus-visible:outline-focus-on-deep"
            >
              <Pictogram name="close" label={UI_TEXT.close} />
            </button>
          </div>
          <nav aria-label={UI_TEXT.mainNavigation} className="px-gutter pt-2">
            <ul>
              {links.map((link, index) => {
                const here = isHere(pathname, link.href);
                return (
                  <li key={link.href} className="menu-row" style={{ "--i": index } as CSSProperties}>
                    <Link
                      href={link.href}
                      aria-current={here ? "page" : undefined}
                      onClick={close}
                      className={`menu-word flex items-center justify-between gap-4 text-on-deep focus-visible:outline-focus-on-deep ${here ? "font-semibold" : "font-medium"} ${index < links.length - 1 ? "border-b border-on-deep/20" : ""}`}
                    >
                      <span className="min-w-0 wrap-anywhere">{link.label.en}</span>
                      <span
                        className={`grid size-10 shrink-0 place-items-center rounded-full ${here ? "bg-leaf text-on-leaf" : "text-on-deep/60"}`}
                      >
                        <Pictogram name="arrow" size="sm" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {site ? (
            <div
              className="menu-row menu-contact-tiles grid gap-3 px-gutter pt-6"
              style={{ "--i": links.length } as CSSProperties}
            >
              <Tile kind="whatsapp" number={site.contact.whatsapp} />
              <Tile kind="call" number={site.contact.phone} />
            </div>
          ) : null}
          <div className="menu-row px-gutter pt-3 pb-8" style={{ "--i": links.length + 1 } as CSSProperties}>
            <HeaderAction site={site} variant="onDeep" size="lg" className="w-full" onNavigate={close} />
          </div>
        </div>
      </dialog>
    </>
  );
}
