/** The visitor asked their system for less motion (plan §30.4): no smoothing, no scrubbing, no reveals. */
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * A mouse or trackpad that hovers: the wheel scrolling Lenis smooths. Touch
 * screens keep the platform's own scrolling (plan §30.4).
 */
export const WHEEL_QUERY = "(hover: hover) and (pointer: fine)";
