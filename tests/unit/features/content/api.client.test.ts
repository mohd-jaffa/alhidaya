import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { PagesClient } from "@/features/content/api.client";
import { pageFixture } from "@tests/support/fixtures/content";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PagesClient", () => {
  it("saves a page's draft whole, publishes it and discards it, each at its own address", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json({ success: true, data: { ok: true } }));
    vi.stubGlobal("fetch", fetch);
    const document = pageFixture("TERMS");
    await PagesClient.save({ page: "TERMS", document });
    await PagesClient.publish("TERMS");
    await PagesClient.discard("TERMS");
    expect(fetch.mock.calls.map(([url, init]) => [url, init?.method])).toEqual([
      [ADMIN_API_ROUTES.adminPage("TERMS"), "PUT"],
      [ADMIN_API_ROUTES.adminPagePublish("TERMS"), "POST"],
      [ADMIN_API_ROUTES.adminPageDiscard("TERMS"), "POST"],
    ]);
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual(document);
  });
});
