import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import type LenisType from "lenis";

import { MOTION } from "./tokens";

export interface MotionEngine {
  gsap: typeof GsapType;
  ScrollTrigger: typeof ScrollTriggerType;
  Lenis: typeof LenisType;
}

/**
 * GSAP, ScrollTrigger and Lenis, fetched only once the page has painted and
 * only on the public site (plan §30.4): the first paint never waits for
 * motion, and the admin never loads it.
 */
export async function loadMotionEngine(): Promise<MotionEngine> {
  const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
    import("lenis"),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger, Lenis };
}

export interface SmoothScroll {
  /** Jumps to the top at once: a new page starts at its beginning. */
  toTop(): void;
  stop(): void;
}

/**
 * Lenis smoothing the wheel, driven by GSAP's ticker so the page has one
 * animation frame loop, with ScrollTrigger reading every scroll it makes.
 * Whenever ScrollTrigger measures the page again (a section held in place
 * adds its length), Lenis measures it too, so it always scrolls to the end.
 */
export function startSmoothScroll({ gsap, ScrollTrigger, Lenis }: MotionEngine): SmoothScroll {
  const lenis = new Lenis({ autoRaf: false, lerp: MOTION.lerp, smoothWheel: true, syncTouch: false, anchors: true });
  const stopListening = lenis.on("scroll", ScrollTrigger.update);
  const measure = () => lenis.resize();
  ScrollTrigger.addEventListener("refresh", measure);
  const tick = (seconds: number) => lenis.raf(seconds * 1000);
  gsap.ticker.add(tick);
  // A dropped frame is caught up at once rather than smoothed over, so the line never lags the page.
  gsap.ticker.lagSmoothing(0);
  return {
    toTop: () => lenis.scrollTo(0, { immediate: true, force: true }),
    stop: () => {
      ScrollTrigger.removeEventListener("refresh", measure);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      stopListening();
      lenis.destroy();
    },
  };
}
