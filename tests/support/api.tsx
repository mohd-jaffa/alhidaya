import type { ReactNode } from "react";
import { SWRConfig } from "swr";
import { vi } from "vitest";

/** What a stubbed endpoint answers: its data, or a refusal in the API's envelope. */
export type Answer =
  { data?: unknown } | { status: number; error: { code: string; message: string; requestId?: string } };

/**
 * The API as an admin screen meets it (AGENTS.md §14): each request handed
 * to `answer` by method, address and body, and answered in the envelope.
 */
export function stubApi(answer: (method: string, url: string, body: unknown) => Answer) {
  const fetch = vi.fn(async (url: string, init?: RequestInit) => {
    const method = init?.method ?? "GET";
    const body = typeof init?.body === "string" ? JSON.parse(init.body) : undefined;
    const result = answer(method, url, body);
    return "status" in result
      ? Response.json({ success: false, error: result.error }, { status: result.status })
      : Response.json({ success: true, data: result.data ?? null });
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

/** A cache of its own for each test, so no read leaks from one to the next. */
export function WithSWR({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>;
}

/** The browser's modal dialog, which jsdom leaves out. */
export function stubDialogs() {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}
