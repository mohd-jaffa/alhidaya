"use client";

import { useEffect, useRef } from "react";

import { MOTION } from "@/lib/motion/tokens";

import { useMotion } from "./MotionProvider";

/** A figure that is a whole number with words after it ("8", "25k", "10k+"), as its number and its words; anything else, none. */
export function countable(value: string): { number: number; rest: string } | null {
  const match = /^(\d{1,6})(\D*)$/.exec(value);
  return match ? { number: Number(match[1]), rest: match[2] } : null;
}

/**
 * A counter's figure (plan §30.1, D97, D99): a whole number counts up once
 * from nothing the first time it scrolls into view; any other figure ("24/7")
 * stands as written. A screen reader is told the figure once, as written.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { engine } = useMotion();

  useEffect(() => {
    const count = countable(value);
    const element = ref.current;
    if (!engine || !element || !count || engine.ScrollTrigger.isInViewport(element, 0.1)) return;
    const { gsap } = engine;
    const shown = { number: 0 };
    const context = gsap.context(() => {
      gsap.to(shown, {
        number: count.number,
        duration: MOTION.duration.count,
        ease: MOTION.ease.out,
        snap: { number: 1 },
        onUpdate: () => {
          element.textContent = `${shown.number}${count.rest}`;
        },
        scrollTrigger: { trigger: element, start: "top 90%", once: true },
      });
    }, element);
    return () => {
      context.revert();
      element.textContent = value;
    };
  }, [engine, value]);

  return (
    <span className={className}>
      <span className="sr-only">{value}</span>
      <span ref={ref} aria-hidden="true">
        {value}
      </span>
    </span>
  );
}
