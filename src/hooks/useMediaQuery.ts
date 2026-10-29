import { useSyncExternalStore } from "react";

/**
 * Whether a media query matches, kept current as it changes (a visitor turns
 * on reduced motion, plugs in a mouse). The server, which cannot know,
 * answers `serverValue`.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
