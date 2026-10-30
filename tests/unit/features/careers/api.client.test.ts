import { afterEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES } from "@/constants/routes";
import { ApplicationsClient, applicationsKey, CareersClient } from "@/features/careers/api.client";

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

describe("applicationsKey", () => {
  it("names a list by what differs from the inbox's defaults, always in one order", () => {
    expect(applicationsKey()).toBe(API_ROUTES.adminApplications);
    expect(applicationsKey({ page: 1, needsYou: false })).toBe(API_ROUTES.adminApplications);
    expect(applicationsKey({ needsYou: true })).toBe(`${API_ROUTES.adminApplications}?needsYou=true`);
    expect(applicationsKey({ page: 3, q: "5551 2345", status: "NEW", job: "general" })).toBe(
      `${API_ROUTES.adminApplications}?job=general&status=NEW&q=5551+2345&page=3`,
    );
  });
});

describe("the inbox's writes", () => {
  it("move an application, note it, send its HR email again and delete it, each at its endpoint", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json({ success: true, data: {} }));
    vi.stubGlobal("fetch", fetch);
    await ApplicationsClient.setStatus({ id: "a1", status: "SHORTLISTED" });
    await ApplicationsClient.addNote({ id: "a1", body: "Call on Sunday." });
    await ApplicationsClient.retryAlert("a1");
    await ApplicationsClient.remove("a1");
    expect(fetch.mock.calls.map(([url, init]) => [url, init?.method, init?.body])).toEqual([
      [API_ROUTES.adminApplication("a1"), "PATCH", JSON.stringify({ status: "SHORTLISTED" })],
      [API_ROUTES.adminApplicationNotes("a1"), "POST", JSON.stringify({ body: "Call on Sunday." })],
      [API_ROUTES.adminApplicationRetryMail("a1"), "POST", undefined],
      [API_ROUTES.adminApplication("a1"), "DELETE", undefined],
    ]);
  });
});
