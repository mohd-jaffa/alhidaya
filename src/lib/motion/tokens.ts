/**
 * Motion's values for GSAP (plan §30.4), equal to the CSS tokens in
 * src/app/globals.css, which a test keeps so: durations in seconds, and
 * GSAP's names for the same curves (`--ease-out`, cubic-bezier(0.16, 1, 0.3,
 * 1), is the exponential ease-out; `--ease-in-out`, cubic-bezier(0.65, 0,
 * 0.35, 1), the cubic in-out).
 */
export const MOTION = {
  duration: { press: 0.12, state: 0.2, reveal: 0.64, typewriter: 6 },
  typewriter: { typingShare: 0.34, deleteAt: 0.56, deleteShare: 0.34 },
  ease: { out: "expo.out", inOut: "power2.inOut" },
  /** How far a block rises as it is revealed, in pixels. */
  revealDistance: 24,
  /** How far apart the cards of a group arrive, in seconds (D97). */
  stagger: 0.08,
  /** How far apart a heading's words rise into place, in seconds (D129). */
  wordStagger: 0.055,
  /** Lenis's smoothing per frame: a short glide that follows the hand closely, never dragging behind it. */
  lerp: 0.16,
} as const;
