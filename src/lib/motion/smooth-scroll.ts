import type { MotionEngine, SmoothScroll } from "./engine";
import { MOTION } from "./tokens";
export { mountTypewriters } from "./typewriter";

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
