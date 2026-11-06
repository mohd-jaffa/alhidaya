"use client";
"use no memo"; // Server-drawn slots change only on navigation; avoid compiler cache code in the public budget.

import { type ReactNode, useEffect, useRef } from "react";

/** Home alone: server-drawn cards, enhanced after paint; a scrollable row if motion cannot load. */
export function HomeServicesPyramid({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false;
    let stop: (() => void) | undefined;
    void import("@/lib/motion/services-pyramid").then(
      ({ mountServicesPyramid }) => {
        if (!disposed) stop = mountServicesPyramid(ref.current!);
      },
      () => undefined,
    );
    return () => {
      disposed = true;
      stop?.();
    };
  }, []);

  return (
    <div ref={ref} className="home-services-pyramid mx-auto grid w-full max-w-site gap-9 px-gutter">
      {children}
    </div>
  );
}
