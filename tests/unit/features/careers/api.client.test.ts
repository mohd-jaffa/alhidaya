import { afterEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES } from "@/constants/routes";
import { CareersClient } from "@/features/careers/api.client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CareersClient", () => {
  it("sends what was typed as one JSON part, and the CV as a file beside it", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      Response.json({ success: true, data: { received: true } }, { status: 201 }),
    );
    vi.stubGlobal("fetch", fetch);
    const cv = new File(["%PDF-1.7"], "cv.pdf", { type: "application/pdf" });
    await expect(CareersClient.apply({ name: "Mariam", consent: true, cv })).resolves.toEqual({ received: true });
    const [url, init] = fetch.mock.calls[0];
    expect([url, init?.method]).toEqual([API_ROUTES.applications, "POST"]);
    const form = init?.body as FormData;
    expect(form.get("fields")).toBe(JSON.stringify({ name: "Mariam", consent: true }));
    expect(form.get("cv")).toBeInstanceOf(File);
  });

  it("sends no file when none was picked, for the route to say so", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json({ success: true, data: {} }));
    vi.stubGlobal("fetch", fetch);
    await CareersClient.apply({ name: "Mariam", cv: null });
    const form = fetch.mock.calls[0][1]?.body as FormData;
    expect([form.get("fields"), form.has("cv")]).toEqual([JSON.stringify({ name: "Mariam" }), false]);
  });
});
