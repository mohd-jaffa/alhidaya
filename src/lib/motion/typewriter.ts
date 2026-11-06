import { MOTION } from "./tokens";

/** Native opacity animations, on the deferred public motion path; no React updates or extra frame loop. */
export function mountTypewriters(): () => void {
  const cleanups = Array.from(document.querySelectorAll<HTMLElement>(".typewriter"), (element) => {
    const letters = Array.from(element.querySelectorAll<HTMLElement>("[data-type-letter]"));
    const timing = { duration: MOTION.duration.typewriter * 1000, iterations: Infinity };
    const animations = letters.flatMap((letter, index) => {
      const at = ((index + 1) / letters.length) * MOTION.typewriter.typingShare;
      const deleting =
        MOTION.typewriter.deleteAt + ((letters.length - index) / letters.length) * MOTION.typewriter.deleteShare;
      const last = index === letters.length - 1;
      const next = last ? deleting : ((index + 2) / letters.length) * MOTION.typewriter.typingShare;
      const caret = [
        { opacity: 0, offset: 0, easing: "steps(1, end)" },
        { opacity: 1, offset: at, easing: "steps(1, end)" },
        { opacity: 0, offset: next, easing: "steps(1, end)" },
      ];
      if (!last)
        caret.push(
          { opacity: 1, offset: deleting - MOTION.typewriter.deleteShare / letters.length, easing: "steps(1, end)" },
          { opacity: 0, offset: deleting, easing: "steps(1, end)" },
        );
      caret.push({ opacity: 0, offset: 1, easing: "steps(1, end)" });
      return [
        letter.animate(
          [
            { opacity: 0, offset: 0, easing: "steps(1, end)" },
            { opacity: 1, offset: at },
            { opacity: 1, offset: deleting, easing: "steps(1, start)" },
            { opacity: 0, offset: 1 },
          ],
          timing,
        ),
        letter.querySelector<HTMLElement>("[data-type-caret]")!.animate(caret, timing),
      ];
    });
    let visible = false;
    const sync = () => {
      const playing = visible && !document.hidden;
      element.dataset.typing = String(playing);
      for (const animation of animations) {
        if (playing) animation.play();
        else animation.pause();
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.1 },
    );
    sync();
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      animations.forEach((animation) => animation.cancel());
      delete element.dataset.typing;
    };
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}
