import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, vi } from "vitest";

// Testing Library's own cleanup is not registered automatically without
// globals, so each test would otherwise render on top of the one before.
afterEach(cleanup);

// Next's navigation hooks need a router; components only read from it in tests.
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// next/image needs Next's build to size and serve a file; in tests it is the
// plain image it renders, with the file's address as Vite gives it.
vi.mock("next/image", () => ({
  default: ({ src, alt, className }: { src: string | { src: string }; alt: string; className?: string }) =>
    createElement("img", { src: typeof src === "string" ? src : src.src, alt, className }),
}));
