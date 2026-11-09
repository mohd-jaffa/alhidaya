"use client";
"use no memo"; // Rarely redrawn: memoising it would only add to the page's JavaScript budget (plan §31).

import { type ReactNode, useState } from "react";

import { CarouselArrow } from "@/components/ui/carousel-arrow";
import { UI_TEXT } from "@/constants/messages";

/** The current photo's slow drift (src/app/globals.css): its end moves the slides on. */
const DRIFT = "drift";

/**
 * Home's automatic slides: a three-second photo drift and progress
 * bar share the clock. The incoming wipe has its own layer; the outgoing
 * photo holds its last frame beneath it. Each visit starts a fresh drift.
 * Deliberate keyboard focus stops the clock without a button; hovering or
 * clicking the photo never stops automatic playback. With reduced
 * motion automatic playback stops and the chevrons still choose slides.
 * Words and photos are server drawn.
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
  const [{ at, was, turn }, setPlace] = useState({ at: 0, was: -1, turn: 0 });
  const move = (step: number) =>
    setPlace((place) => ({ at: (place.at + step + count) % count, was: place.at, turn: place.turn + 1 }));

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      aria-description={count > 1 ? UI_TEXT.slidesAutoplayHelp : undefined}
      tabIndex={count > 1 ? 0 : undefined}
      data-moved={was >= 0 || undefined}
      className="slides-band grid border-t border-rule lg:min-h-[40rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]"
    >
      <div className="grid content-center gap-10 px-gutter py-10 sm:py-14 lg:ps-[max(var(--spacing-gutter),calc((100vw-var(--container-site))/2+var(--spacing-gutter)))] lg:pe-14">
        <div className="grid lg:min-h-slide-copy" aria-live="off">
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
          <div className="slide-progress flex max-w-full items-center gap-1 justify-self-start rounded-pill bg-mist p-1">
            <CarouselArrow direction="previous" onClick={() => move(-1)} />
            <div className="flex min-w-0 items-center gap-(--spacing-slide-progress-gap)" aria-hidden="true">
              {texts.map((_, index) => (
                <span
                  key={index}
                  data-current={index === at || undefined}
                  data-done={index < at || undefined}
                  className="slide-bar grid w-6 items-center sm:w-8"
                >
                  <span className="slide-rail block h-1 rounded-pill bg-rule">
                    <span className="slide-fill block h-full rounded-pill bg-deep" />
                  </span>
                </span>
              ))}
            </div>
            <CarouselArrow direction="next" onClick={() => move(1)} />
          </div>
        ) : null}
      </div>
      <div className="relative min-h-[22rem] overflow-hidden max-lg:order-first sm:min-h-[30rem] lg:min-h-full">
        {photos.map((photo, index) => (
          <div
            key={index}
            data-current={index === at || undefined}
            data-was={index === was || undefined}
            aria-hidden={index !== at}
            className="slide-photo absolute inset-0"
          >
            <div
              key={index === at ? turn : index === was ? turn - 1 : -1}
              onAnimationEnd={(event) => {
                if (count > 1 && index === at && event.target === event.currentTarget && event.animationName === DRIFT)
                  move(1);
              }}
              className="slide-image absolute inset-0"
            >
              {photo}
            </div>
          </div>
        ))}
        {note}
      </div>
    </section>
  );
}
