"use client";

import { type ReactNode, useEffect, useRef } from "react";

import { MOTION } from "@/lib/motion/tokens";

import { useMotion } from "./MotionProvider";

/**
 * A block that rises into place the first time it scrolls into view (plan
 * §30.4). It is visible by default: only a block still below the fold when
 * motion loads is hidden, and only with opacity, so it stays in the page for
 * screen readers and search. Nothing on screen is ever hidden, and with
 * motion reduced nothing moves.
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { engine } = useMotion();

  useEffect(() => {
    const element = ref.current;
    if (!engine || !element || engine.ScrollTrigger.isInViewport(element, 0.05)) return;
    const { gsap } = engine;
    const context = gsap.context(() => {
      gsap.from(element, {
        opacity: 0,
        y: MOTION.revealDistance,
        duration: MOTION.duration.reveal,
        ease: MOTION.ease.out,
        scrollTrigger: { trigger: element, start: "top 90%", once: true },
      });
    }, element);
    return () => context.revert();
  }, [engine]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
