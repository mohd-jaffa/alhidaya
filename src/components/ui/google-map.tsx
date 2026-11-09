"use client";
"use no memo";

import { useEffect, useRef } from "react";
import { MAP_SCROLL_IDLE_MS } from "@/constants/limits";
import { UI_TEXT } from "@/constants/messages";
import { googleSatelliteEmbed } from "@/lib/contact";

/** Google's own attribution stays visible inside the stable, lazy satellite frame (D179). */
export function GoogleMap({ query, pin }: { query: string; pin: { lat: number; lon: number } | null }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const source = googleSatelliteEmbed(query, pin);
  useEffect(() => {
    const frame = ref.current!;
    let timer: number | undefined;
    let visible = false;
    let loaded = false;
    const load = () => {
      window.clearTimeout(timer);
      loaded = true;
      frame.src = source;
      observer?.disconnect();
      window.removeEventListener("scroll", settle);
      frame.removeEventListener("focus", load);
    };
    const settle = () => {
      window.clearTimeout(timer);
      if (visible && !loaded) timer = window.setTimeout(load, MAP_SCROLL_IDLE_MS);
    };
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            settle();
          });
    window.addEventListener("scroll", settle, { passive: true });
    frame.addEventListener("focus", load);
    if (observer) observer.observe(frame);
    else load();
    return () => {
      window.clearTimeout(timer);
      observer?.disconnect();
      window.removeEventListener("scroll", settle);
      frame.removeEventListener("focus", load);
    };
  }, [source]);
  return (
    <div className="relative aspect-[3/2] min-h-map-min w-full min-w-0 overflow-hidden rounded-card bg-mist shadow-map">
      <iframe
        title={UI_TEXT.satelliteMap}
        ref={ref}
        data-src={source}
        width="600"
        height="400"
        className="absolute inset-0 size-full border-0"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
