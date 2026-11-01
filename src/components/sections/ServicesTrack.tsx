"use client";
"use no memo"; // Rarely redrawn: memoising it would only add to the page's JavaScript budget (plan §31).

import { type ReactNode, useEffect, useRef, useState } from "react";

import { Pictogram } from "@/components/ui/pictogram";
import { UI_TEXT } from "@/constants/messages";

const ROUND =
  "grid size-11 shrink-0 place-items-center rounded-full transition-[background-color,opacity] duration-(--duration-state) disabled:opacity-40";

/**
 * The services' row (D131): the section's opening and two arrows above a row
 * of cards that scrolls sideways, snapping card by card, reaching the
 * window's end on a wide screen. Each arrow moves it by about a card, and
 * rests at its end; a swipe, the keyboard and a trackpad move it too.
 */
export function ServicesTrack({ opening, cards }: { opening: ReactNode; cards: readonly ReactNode[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [ends, setEnds] = useState({ start: true, end: false });

  useEffect(() => {
    const element = track.current!;
    const read = () => {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      const along = Math.abs(scrollLeft);
      setEnds({ start: along < 4, end: along + clientWidth > scrollWidth - 4 });
    };
    read();
    element.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      element.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  const move = (direction: 1 | -1) => {
    const element = track.current!;
    const card = element.querySelector("li")?.getBoundingClientRect().width ?? element.clientWidth;
    const rtl = getComputedStyle(element).direction === "rtl" ? -1 : 1;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollBy({ left: direction * rtl * (card + 20), behavior: still ? "auto" : "smooth" });
  };

  return (
    <div className="grid gap-9">
      <div className="mx-auto flex w-full max-w-site items-end justify-between gap-6 px-gutter">
        {opening}
        <div className="flex shrink-0 gap-2 max-sm:hidden">
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={ends.start}
            aria-label={UI_TEXT.previousServices}
            className={`${ROUND} bg-ground text-deep ring-[1.5px] ring-rule ring-inset hover:ring-deep`}
          >
            <Pictogram name="arrow" size="sm" className="rotate-180 rtl:rotate-0" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={ends.end}
            aria-label={UI_TEXT.nextServices}
            className={`${ROUND} bg-deep text-on-deep hover:bg-navy`}
          >
            <Pictogram name="arrow" size="sm" className="rtl:rotate-180" />
          </button>
        </div>
      </div>
      <ul
        ref={track}
        className="flex snap-x snap-mandatory scroll-px-gutter gap-5 overflow-x-auto px-gutter pb-4 [scrollbar-width:none] lg:scroll-ps-[max(var(--spacing-gutter),calc((100vw-var(--container-site))/2+var(--spacing-gutter)))] lg:ps-[max(var(--spacing-gutter),calc((100vw-var(--container-site))/2+var(--spacing-gutter)))] [&::-webkit-scrollbar]:hidden"
      >
        {cards}
      </ul>
    </div>
  );
}
