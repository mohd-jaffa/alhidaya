"use client";

import { type ReactNode, useEffect, useRef } from "react";

import { MOTION } from "@/lib/motion/tokens";

import { useMotion } from "./MotionProvider";

/**
 * A heading whose words rise into place from behind their line the first time
 * it scrolls into view (D129). Visible by default: only a heading still below
 * the fold when motion loads moves, and with motion reduced nothing does.
 */
export function RiseWordsMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { engine } = useMotion();

  useEffect(() => {
    const element = ref.current;
    if (!engine || !element || engine.ScrollTrigger.isInViewport(element, 0.05)) return;
    const { gsap } = engine;
    const context = gsap.context(() => {
      gsap.from(element.querySelectorAll("[data-word]"), {
        yPercent: 110,
        duration: MOTION.duration.reveal,
        stagger: MOTION.wordStagger,
        ease: MOTION.ease.out,
        scrollTrigger: { trigger: element, start: "top 90%", once: true },
      });
    }, element);
    return () => context.revert();
  }, [engine]);

  return <span ref={ref}>{children}</span>;
}
