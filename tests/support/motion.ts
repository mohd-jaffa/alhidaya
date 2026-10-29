import { vi } from "vitest";

import type { MotionEngine } from "@/lib/motion/engine";

/** A stand-in for GSAP, ScrollTrigger and Lenis that records what the code asks of them. */
export function fakeEngine({ inViewport = false } = {}) {
  const revert = vi.fn();
  const gsap = {
    context: vi.fn((build: () => void) => {
      build();
      return { revert };
    }),
    from: vi.fn(),
    fromTo: vi.fn(),
    registerPlugin: vi.fn(),
    ticker: { add: vi.fn(), remove: vi.fn(), lagSmoothing: vi.fn() },
  };
  const ScrollTrigger = { update: vi.fn(), refresh: vi.fn(), isInViewport: vi.fn(() => inViewport) };
  const stopListening = vi.fn();
  const lenises: {
    options: unknown;
    on: ReturnType<typeof vi.fn>;
    raf: ReturnType<typeof vi.fn>;
    scrollTo: ReturnType<typeof vi.fn>;
    destroy: ReturnType<typeof vi.fn>;
  }[] = [];
  class Lenis {
    on = vi.fn(() => stopListening);
    raf = vi.fn();
    scrollTo = vi.fn();
    destroy = vi.fn();
    constructor(public options: unknown) {
      lenises.push(this);
    }
  }
  const engine = { gsap, ScrollTrigger, Lenis } as unknown as MotionEngine;
  return { engine, gsap, ScrollTrigger, Lenis, lenises, revert, stopListening };
}

/** window.matchMedia answering from `matches`, which a test may change, telling listeners as a browser would. */
export function mockMedia(matches: Record<string, boolean>) {
  const listeners = new Map<string, Set<() => void>>();
  window.matchMedia = vi.fn((query: string) => ({
    matches: matches[query] ?? false,
    media: query,
    addEventListener: (_: string, listener: () => void) => {
      listeners.set(query, (listeners.get(query) ?? new Set()).add(listener));
    },
    removeEventListener: (_: string, listener: () => void) => listeners.get(query)?.delete(listener),
  })) as unknown as typeof window.matchMedia;
  return {
    set(query: string, value: boolean) {
      matches[query] = value;
      for (const listener of listeners.get(query) ?? []) listener();
    },
    listening: (query: string) => listeners.get(query)?.size ?? 0,
  };
}

/** IntersectionObserver and ResizeObserver stand-ins: tests call what the page would have. */
export function mockObservers() {
  const intersections: {
    callback: IntersectionObserverCallback;
    options?: IntersectionObserverInit;
    observed: Element[];
    disconnect: ReturnType<typeof vi.fn>;
  }[] = [];
  const resizes: { callback: () => void; disconnect: ReturnType<typeof vi.fn> }[] = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observed: Element[] = [];
      disconnect = vi.fn();
      constructor(
        public callback: IntersectionObserverCallback,
        public options?: IntersectionObserverInit,
      ) {
        intersections.push(this);
      }
      observe(element: Element) {
        this.observed.push(element);
      }
    },
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      disconnect = vi.fn();
      constructor(public callback: () => void) {
        resizes.push(this);
      }
      observe() {}
    },
  );
  return { intersections, resizes };
}
