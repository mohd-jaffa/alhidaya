"use client";

import { usePathname } from "next/navigation";
import { createContext, startTransition, type ReactNode, use, useEffect, useRef, useState } from "react";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { loadMotionEngine, type MotionEngine, type SmoothScroll } from "@/lib/motion/engine";
import { REDUCED_MOTION_QUERY, WHEEL_QUERY } from "@/lib/motion/preferences";

interface MotionState {
  /** GSAP and ScrollTrigger once loaded; null before, and whenever motion is reduced. */
  engine: MotionEngine | null;
}

const MotionContext = createContext<MotionState>({ engine: null });

/** The site's motion, for the components that move (plan §30.4). */
export function useMotion(): MotionState {
  return use(MotionContext);
}

/** Runs `callback` when the browser is idle after the page has painted. */
function whenIdle(callback: () => void): () => void {
  // Safari has no idle callback; a timeout after the paint does the same job there.
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(callback, { timeout: 2000 });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = window.setTimeout(callback, 1);
  return () => window.clearTimeout(handle);
}

/**
 * The public site's motion (plan §30.4, D29). After the first paint it loads
 * GSAP, ScrollTrigger and Lenis; Lenis smooths a wheel's scrolling, never a
 * touch screen's. Reduced motion loads none of it. A new page starts at its
 * top with every trigger measured afresh, and once the fonts and images have
 * settled everything is measured again.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const reduced = useMediaQuery(REDUCED_MOTION_QUERY);
  const wheel = useMediaQuery(WHEEL_QUERY);
  const [engine, setEngine] = useState<MotionEngine | null>(null);
  const smooth = useRef<SmoothScroll | null>(null);
  const pathname = usePathname();
  const shown = useRef(pathname);

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    const cancelIdle = whenIdle(() => {
      loadMotionEngine().then(
        (loaded) => {
          if (!cancelled) startTransition(() => setEngine(loaded));
        },
        // Motion only enhances: if it cannot load, the page is already whole.
        () => undefined,
      );
    });
    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, [reduced]);

  const active = reduced ? null : engine;

  useEffect(() => {
    if (!active || !wheel) return;
    const scroll = active.startSmoothScroll(active);
    smooth.current = scroll;
    return () => {
      scroll.stop();
      smooth.current = null;
    };
  }, [active, wheel]);

  useEffect(() => {
    if (shown.current === pathname) return;
    shown.current = pathname;
    smooth.current?.toTop();
    active?.ScrollTrigger.refresh();
  }, [pathname, active]);

  useEffect(() => {
    if (!active) return;
    const refresh = () => active.ScrollTrigger.refresh();
    void document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh, { once: true });
    return () => window.removeEventListener("load", refresh);
  }, [active]);

  useEffect(() => active?.mountPageMotion(), [active, pathname]);

  return <MotionContext value={{ engine: active }}>{children}</MotionContext>;
}
