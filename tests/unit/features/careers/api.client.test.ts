import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { ApplicationsClient, applicationsKey, JobsClient } from "@/features/careers/api.client";
import { jobFixture } from "@tests/support/fixtures/content";

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

describe("JobsClient", () => {
  it("makes, saves, publishes, discards, archives and closes a job, each at its endpoint", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json({ success: true, data: {} }));
    vi.stubGlobal("fetch", fetch);
    const document = jobFixture();
    await JobsClient.create(document);
    await JobsClient.save({ id: "j1", document });
    await JobsClient.publish("j1");
    await JobsClient.discard("j1");
    await JobsClient.setArchived({ id: "j1", archived: false });
    await JobsClient.setClosed({ id: "j1", closed: true });
    expect(fetch.mock.calls.map(([url, init]) => [url, init?.method, init?.body])).toEqual([
      [ADMIN_API_ROUTES.adminJobs, "POST", JSON.stringify(document)],
      [ADMIN_API_ROUTES.adminJob("j1"), "PUT", JSON.stringify(document)],
      [ADMIN_API_ROUTES.adminJobPublish("j1"), "POST", undefined],
      [ADMIN_API_ROUTES.adminJobDiscard("j1"), "POST", undefined],
      [ADMIN_API_ROUTES.adminJobArchive("j1"), "POST", JSON.stringify({ archived: false })],
      [ADMIN_API_ROUTES.adminJobClose("j1"), "POST", JSON.stringify({ closed: true })],
    ]);
  });
});
