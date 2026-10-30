"use client";

import { Fragment, useEffect, useRef } from "react";

import { IconChip } from "@/components/ui/icon-chip";
import type { SectionPictogram } from "@/constants/sections";

import { useMotion } from "./MotionProvider";

export interface StatementPart {
  text: string;
  /** The darker words; the rest are the quiet grey. */
  strong: boolean;
  pictogram: SectionPictogram | null;
}

/**
 * A statement read as it scrolls (plan §30.1, D97): its darker phrases turn
 * from the quiet grey to navy one word after another with the scroll, the
 * rest staying grey, an icon chip after a phrase that has one. Each darker
 * word is its grey self with its navy self over it, and only the navy fades,
 * so every word always meets its contrast (WCAG 1.4.3, large type). By
 * default the navy shows; only a statement still below the fold when motion
 * loads has it faded first, and it follows the scroll, so nothing moves on its
 * own.
 */
export function StatementWords({ parts, className }: { parts: readonly StatementPart[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { engine } = useMotion();

  useEffect(() => {
    const element = ref.current;
    if (!engine || !element || engine.ScrollTrigger.isInViewport(element, 0.1)) return;
    const { gsap } = engine;
    const context = gsap.context(() => {
      gsap.fromTo(
        element.querySelectorAll("[data-ink]"),
        { opacity: 0 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: element, start: "top 85%", end: "bottom 50%", scrub: true },
        },
      );
    }, element);
    return () => context.revert();
  }, [engine]);

  return (
    <p ref={ref} className={className}>
      {parts.map((part, at) => (
        <Fragment key={at}>
          {part.text
            .split(/\s+/)
            .filter(Boolean)
            .map((word, w) => (
              <Fragment key={w}>
                {part.strong ? (
                  <span className="relative text-ink-soft">
                    {word}
                    <span data-ink="" aria-hidden="true" className="absolute inset-0 text-navy">
                      {word}
                    </span>
                  </span>
                ) : (
                  <span className="text-ink-soft">{word}</span>
                )}{" "}
              </Fragment>
            ))}
          {part.pictogram ? (
            <>
              <IconChip name={part.pictogram} size="inline" />{" "}
            </>
          ) : null}
        </Fragment>
      ))}
    </p>
  );
}
