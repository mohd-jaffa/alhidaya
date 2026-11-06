import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import type LenisType from "lenis";

export interface MotionEngine {
  gsap: typeof GsapType;
  ScrollTrigger: typeof ScrollTriggerType;
  Lenis: typeof LenisType;
  mountPageMotion: () => () => void;
  startSmoothScroll: (engine: MotionEngine) => SmoothScroll;
}

/**
 * GSAP, ScrollTrigger and Lenis, fetched only once the page has painted and
 * only on the public site (plan §30.4): the first paint never waits for
 * motion, and the admin never loads it.
 */
export async function loadMotionEngine(): Promise<MotionEngine> {
  const [{ gsap }, { ScrollTrigger }, { default: Lenis }, { mountTypewriters, startSmoothScroll }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
    import("lenis"),
    import("./smooth-scroll"),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger, Lenis, mountPageMotion: mountTypewriters, startSmoothScroll };
}

export interface SmoothScroll {
  /** Jumps to the top at once: a new page starts at its beginning. */
  toTop(): void;
  stop(): void;
}
