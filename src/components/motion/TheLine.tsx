"use client";

import { useEffect, useRef, useState } from "react";

import { UI_TEXT } from "@/constants/messages";
import { MOTION } from "@/lib/motion/tokens";

import { useMotion } from "./MotionProvider";

export interface Station {
  /** The section's element id. */
  id: string;
  label: string;
}

/** Which of the three lines the page follows (plan §30.1). */
export type LineTone = "sky" | "deep" | "leaf";

const TONES = {
  sky: { fill: "bg-sky", passed: "border-sky", current: "border-sky bg-sky" },
  deep: { fill: "bg-deep", passed: "border-deep", current: "border-deep bg-deep" },
  leaf: { fill: "bg-leaf", passed: "border-leaf", current: "border-leaf bg-leaf" },
} as const;

/** A section becomes the current station when its top reaches this share of the viewport. */
const ARRIVAL = 0.45;

/** Where each station sits along the line: the share of the page's scroll at which its section arrives. */
function measure(stations: readonly Station[]): Record<string, number> {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  return Object.fromEntries(
    stations.map(({ id }) => {
      const section = document.getElementById(id);
      if (!section || scrollable <= 0) return [id, 0];
      const arrives = section.getBoundingClientRect().top + window.scrollY - ARRIVAL * window.innerHeight;
      return [id, Math.min(1, Math.max(0, arrives / scrollable))];
    }),
  );
}

/**
 * The signature (plan §30.1): the page's line. On a wide screen it runs down
 * the margin, a station for each section, drawing onward with the scroll
 * while the "You are here" marker travels it; each station is a link to its
 * section. On a phone it is a slim progress line under the header, naming the
 * current station. Which station is current never depends on motion; with
 * motion reduced (or not yet loaded) the line is simply drawn in full.
 */
export function TheLine({ stations, tone }: { stations: readonly Station[]; tone: LineTone }) {
  const { engine } = useMotion();
  const [crossing, setCrossing] = useState(stations[0]?.id ?? "");
  const [atEnd, setAtEnd] = useState(false);
  const [at, setAt] = useState<Record<string, number>>({});
  const track = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const colours = TONES[tone];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setCrossing(entry.target.id);
      },
      { rootMargin: `-${ARRIVAL * 100}% 0px -${100 - ARRIVAL * 100}% 0px` },
    );
    for (const { id } of stations) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, [stations]);

  // A last section too short to reach the arrival line still becomes current once the page is read to its end.
  useEffect(() => {
    const end = document.createElement("div");
    end.setAttribute("aria-hidden", "true");
    end.className = "h-px";
    document.body.append(end);
    const observer = new IntersectionObserver(([entry]) => setAtEnd(entry.isIntersecting));
    observer.observe(end);
    return () => {
      observer.disconnect();
      end.remove();
    };
  }, []);

  useEffect(() => {
    const update = () => setAt(measure(stations));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, [stations]);

  useEffect(() => {
    if (!engine) return;
    const { gsap } = engine;
    const scroll = { start: 0, end: "max", scrub: MOTION.scrub, invalidateOnRefresh: true };
    const context = gsap.context(() => {
      gsap.fromTo(fill.current, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: scroll });
      gsap.fromTo(progress.current, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: scroll });
      gsap.fromTo(
        marker.current,
        { y: 0 },
        { y: () => track.current?.clientHeight ?? 0, ease: "none", scrollTrigger: scroll },
      );
    });
    return () => context.revert();
  }, [engine]);

  const current = atEnd ? (stations.at(-1)?.id ?? crossing) : crossing;
  const position = (id: string) => at[id] ?? 0;
  const currentLabel = stations.find((station) => station.id === current)?.label;

  return (
    <>
      <nav
        aria-label={UI_TEXT.onThisPage}
        className="fixed top-(--line-rail-top) bottom-(--line-rail-bottom) start-(--line-rail-start) z-(--z-header) hidden w-(--line-station) xl:block"
      >
        <div ref={track} className="absolute inset-0">
          <div className="absolute inset-y-0 start-(--line-rail-centre) w-(--line-width) rounded-full bg-rule" />
          <div
            ref={fill}
            data-line-fill=""
            className={`absolute inset-y-0 start-(--line-rail-centre) w-(--line-width) origin-top rounded-full ${colours.fill}`}
          />
          <ol>
            {stations.map(({ id, label }) => {
              const state =
                id === current
                  ? colours.current
                  : position(id) < position(current)
                    ? colours.passed
                    : "border-rule bg-ground";
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={id === current ? "location" : undefined}
                    className={`absolute start-0 size-(--line-station) -translate-y-1/2 rounded-full border-(length:--line-width) ${state}`}
                    style={{ top: `${position(id) * 100}%` }}
                  >
                    <span className="sr-only">{label}</span>
                  </a>
                </li>
              );
            })}
          </ol>
          <div
            ref={marker}
            aria-hidden="true"
            data-line-marker=""
            className={`pointer-events-none absolute start-0 top-0 size-(--line-station) -translate-y-1/2 rounded-full border-(length:--line-width) border-navy bg-ground ${engine ? "" : "hidden"}`}
          />
        </div>
      </nav>

      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-(--header-height) z-(--z-header) border-b border-rule bg-ground xl:hidden"
      >
        <p className="flex items-center gap-2 px-gutter py-2 text-small font-semibold">
          <span className={`size-2.5 rounded-full ${colours.fill}`} />
          <span className="text-ink-2">{UI_TEXT.youAreHere}</span>
          <span>{currentLabel}</span>
        </p>
        <div ref={progress} data-line-progress="" className={`h-1 ltr:origin-left rtl:origin-right ${colours.fill}`} />
      </div>
    </>
  );
}
