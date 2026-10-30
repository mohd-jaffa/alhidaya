import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { ApplicationsClient, applicationsKey } from "@/features/careers/api.client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("applicationsKey", () => {
  it("names a list by what differs from the inbox's defaults, always in one order", () => {
    expect(applicationsKey()).toBe(ADMIN_API_ROUTES.adminApplications);
    expect(applicationsKey({ page: 1, needsYou: false })).toBe(ADMIN_API_ROUTES.adminApplications);
    expect(applicationsKey({ needsYou: true })).toBe(`${ADMIN_API_ROUTES.adminApplications}?needsYou=true`);
    expect(applicationsKey({ page: 3, q: "5551 2345", status: "NEW", job: "general" })).toBe(
      `${ADMIN_API_ROUTES.adminApplications}?job=general&status=NEW&q=5551+2345&page=3`,
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
      [ADMIN_API_ROUTES.adminApplication("a1"), "PATCH", JSON.stringify({ status: "SHORTLISTED" })],
      [ADMIN_API_ROUTES.adminApplicationNotes("a1"), "POST", JSON.stringify({ body: "Call on Sunday." })],
      [ADMIN_API_ROUTES.adminApplicationRetryMail("a1"), "POST", undefined],
      [ADMIN_API_ROUTES.adminApplication("a1"), "DELETE", undefined],
    ]);
  });
});
