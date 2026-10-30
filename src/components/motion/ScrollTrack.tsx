"use client";

import { type ReactNode, useEffect, useRef } from "react";

import { MOTION } from "@/lib/motion/tokens";

import { useMotion } from "./MotionProvider";

/** From this width the track moves with the scroll; narrower, it is swiped. */
const WIDE = "(min-width: 64rem)";

/**
 * A row wider than its place that travels sideways with the scroll (plan
 * §30.1, D97): `held`, the section stays in view while its row passes (how it
 * works); otherwise the row drifts as the section scrolls by (the services in
 * the families' card). It follows the scroll, so nothing moves on its own.
 * Before motion loads, on a phone and with motion reduced, the row is simply
 * swiped or scrolled sideways.
 */
export function ScrollTrack({
  held = false,
  label,
  as: Track = "div",
  className,
  trackClassName,
  children,
}: {
  held?: boolean;
  /**
   * The row's name, when nothing in it can take focus: the row then takes
   * focus itself, so it can be scrolled from the keyboard (WCAG 2.1.1).
   */
  label?: string;
  /** What the row is: a list when its items are one, so it is read as one. */
  as?: "div" | "ol" | "ul";
  className?: string;
  trackClassName?: string;
  children: ReactNode;
}) {
  const host = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLElement>(null);
  const { engine } = useMotion();

  useEffect(() => {
    const place = host.current;
    const row = track.current;
    if (!engine || !place || !row) return;
    const { gsap } = engine;
    const media = gsap.matchMedia();
    media.add(WIDE, () => {
      const distance = () => Math.max(0, row.scrollWidth - place.clientWidth);
      if (distance() === 0) return;
      place.style.overflow = "hidden";
      gsap.to(row, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: held
          ? {
              trigger: place,
              start: "center center",
              end: () => `+=${distance()}`,
              scrub: MOTION.scrub,
              // The section the row belongs to stays in view while the row passes.
              pin: place.parentElement as Element,
              invalidateOnRefresh: true,
            }
          : { trigger: place, start: "top bottom", end: "bottom top", scrub: MOTION.scrub, invalidateOnRefresh: true },
      });
      return () => {
        place.style.overflow = "";
      };
    });
    return () => media.revert();
  }, [engine, held]);

  return (
    <div
      ref={host}
      {...(label ? { tabIndex: 0, role: "region", "aria-label": label } : {})}
      className={`overflow-x-auto overscroll-x-contain ${className ?? ""}`}
    >
      <Track ref={track as never} className={`flex w-max ${trackClassName ?? ""}`}>
        {children}
      </Track>
    </div>
  );
}
