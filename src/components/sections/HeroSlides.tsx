"use client";
"use no memo"; // Rarely redrawn: memoising it would only add to the page's JavaScript budget (plan §31).

import { type ReactNode, useState } from "react";

import { Pictogram } from "@/components/ui/pictogram";
import { UI_TEXT } from "@/constants/messages";

/** The current photo's slow drift (src/app/globals.css): its end moves the slides on. */
const DRIFT = "drift";

const ROUND = "grid size-11 shrink-0 place-items-center rounded-full transition-colors duration-(--duration-state)";

/**
 * Home's slides in motion (D128): which slide shows, the one it replaced (so
 * the new photo wipes in over it), and whether the visitor paused them. A
 * slide moves on when its photo's slow drift ends, as its bar fills: both are
 * CSS animations of the same length, so the pause stops both together; the
 * photo shows at every width, where the bars do not. With motion reduced
 * neither runs and the slides stay until the visitor moves them. The words and photos are
 * drawn on the server; this only marks the current ones.
 */
export function HeroSlides({
  label,
  photos,
  texts,
  note,
}: {
  label: string;
  photos: readonly ReactNode[];
  texts: readonly ReactNode[];
  /** The card on the photo, when the admin gave one. */
  note: ReactNode;
}) {
  const count = texts.length;
  const [{ at, was }, setPlace] = useState({ at: 0, was: -1 });
  const [paused, setPaused] = useState(false);
  const go = (next: number) => setPlace((place) => ({ at: (next + count) % count, was: place.at }));
  const two = (value: number) => String(value).padStart(2, "0");

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      data-paused={paused || undefined}
      data-moved={was >= 0 || undefined}
      className="slides-band grid border-t border-rule lg:min-h-[40rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]"
    >
      <div className="grid content-center gap-10 px-gutter py-10 sm:py-14 lg:ps-[max(var(--spacing-gutter),calc((100vw-var(--container-site))/2+var(--spacing-gutter)))] lg:pe-14">
        <div className="grid" aria-live={paused ? "polite" : "off"}>
          {texts.map((text, index) => (
            <div
              key={index}
              role="group"
              aria-roledescription="slide"
              aria-label={UI_TEXT.slideOf(index + 1, count)}
              data-current={index === at || undefined}
              className="slide-text col-start-1 row-start-1"
            >
              {text}
            </div>
          ))}
        </div>
        {count > 1 ? (
          <div className="flex items-center gap-3 justify-self-start rounded-pill bg-mist p-1.5 pe-2">
            <button
              type="button"
              onClick={() => go(at - 1)}
              aria-label={UI_TEXT.previousSlide}
              className={`${ROUND} bg-ground text-deep ring-[1.5px] ring-rule ring-inset hover:ring-deep`}
            >
              <Pictogram name="arrow" size="sm" className="rotate-180 rtl:rotate-0" />
            </button>
            <button
              type="button"
              onClick={() => go(at + 1)}
              aria-label={UI_TEXT.nextSlide}
              className={`${ROUND} bg-deep text-on-deep hover:bg-navy`}
            >
              <Pictogram name="arrow" size="sm" className="rtl:rotate-180" />
            </button>
            <div className="flex items-center gap-1.5 max-sm:hidden">
              {texts.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => go(index)}
                  aria-label={UI_TEXT.slideOf(index + 1, count)}
                  aria-current={index === at || undefined}
                  data-current={index === at || undefined}
                  data-done={index < at || undefined}
                  className="slide-bar grid h-11 w-6 items-center transition-[width] duration-(--duration-state) data-current:w-12"
                >
                  <span className="block h-1 rounded-pill bg-rule">
                    <span className="slide-fill block h-full rounded-pill bg-deep" />
                  </span>
                </button>
              ))}
            </div>
            <span className="px-1 text-small text-ink-2 tabular-nums">
              {two(at + 1)} / {two(count)}
            </span>
            <button
              type="button"
              onClick={() => setPaused((now) => !now)}
              aria-label={paused ? UI_TEXT.playSlides : UI_TEXT.pauseSlides}
              className={`${ROUND} relative size-9 bg-ground text-navy ring-[1.5px] ring-rule ring-inset before:absolute before:-inset-1 hover:ring-deep motion-reduce:hidden`}
            >
              <Pictogram name={paused ? "play" : "pause"} size="sm" />
            </button>
          </div>
        ) : null}
      </div>
      <div className="relative min-h-[22rem] overflow-hidden max-lg:order-first sm:min-h-[30rem] lg:min-h-full">
        {photos.map((photo, index) => (
          <div
            key={index}
            data-current={index === at || undefined}
            data-was={index === was || undefined}
            onAnimationEnd={(event) => {
              if (index === at && event.animationName === DRIFT) go(at + 1);
            }}
            className="slide-photo absolute inset-0"
          >
            {photo}
          </div>
        ))}
        {note}
      </div>
    </section>
  );
}
