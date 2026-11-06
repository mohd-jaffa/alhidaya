"use client";

import { type ReactNode, useEffect, useRef } from "react";

import { useMotion } from "@/components/motion/MotionProvider";
import { MOTION } from "@/lib/motion/tokens";

/** The paired statements arrive as a composition: panel, masked heading, then words (D137). */
export function MissionPanels({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { engine } = useMotion();

  useEffect(() => {
    const element = ref.current;
    if (!engine || !element) return;
    const { gsap, ScrollTrigger } = engine;
    const context = gsap.context(() => {
      element.querySelectorAll<HTMLElement>("[data-mission-panel]").forEach((panel, at) => {
        if (ScrollTrigger.isInViewport(panel, 0.05)) return;
        const timing = { duration: MOTION.duration.reveal, ease: MOTION.ease.out };
        const timeline = gsap.timeline({
          delay: at * MOTION.stagger,
          scrollTrigger: { trigger: panel, start: "top 85%", once: true },
        });
        timeline.from(panel, { ...timing, opacity: 0, y: MOTION.revealDistance });
        panel.querySelectorAll<SVGGElement>("[data-art-part]").forEach((part, order) => {
          timeline.from(
            part,
            {
              ...timing,
              opacity: 0,
              x: Number(part.dataset.fromX ?? 0),
              y: Number(part.dataset.fromY ?? 0),
              scale: 0.5,
              transformOrigin: "50% 50%",
            },
            order * MOTION.stagger,
          );
        });
        timeline
          .from(
            panel.querySelector("[data-mission-rule]"),
            { ...timing, scaleX: 0, transformOrigin: "center" },
            MOTION.stagger,
          )
          .from(
            panel.querySelectorAll("[data-word]"),
            { ...timing, yPercent: 110, stagger: MOTION.wordStagger },
            MOTION.stagger * 3,
          )
          .from(
            panel.querySelector("[data-mission-statement]"),
            { ...timing, opacity: 0, y: MOTION.revealDistance / 2 },
            MOTION.stagger * 6,
          );
      });
    }, element);
    return () => context.revert();
  }, [engine]);

  return (
    <div ref={ref} className="grid gap-5 md:grid-cols-2 lg:gap-6">
      {children}
    </div>
  );
}
