import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { ServicesClient } from "@/features/services/api.client";
import { serviceFixture } from "@tests/support/fixtures/content";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ServicesClient", () => {
  it("makes, saves, publishes, discards and archives a service, and saves, publishes and discards the order", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json({ success: true, data: { ok: true } }));
    vi.stubGlobal("fetch", fetch);
    const document = serviceFixture();
    await ServicesClient.create(document);
    await ServicesClient.save({ id: "s1", document });
    await ServicesClient.publish("s1");
    await ServicesClient.discard("s1");
    await ServicesClient.setArchived({ id: "s1", archived: true });
    await ServicesClient.saveOrder(["s2", "s1"]);
    await ServicesClient.publishOrder();
    await ServicesClient.discardOrder();
    expect(fetch.mock.calls.map(([url, init]) => [url, init?.method, init?.body])).toEqual([
      [ADMIN_API_ROUTES.adminServices, "POST", JSON.stringify(document)],
      [ADMIN_API_ROUTES.adminService("s1"), "PUT", JSON.stringify(document)],
      [ADMIN_API_ROUTES.adminServicePublish("s1"), "POST", undefined],
      [ADMIN_API_ROUTES.adminServiceDiscard("s1"), "POST", undefined],
      [ADMIN_API_ROUTES.adminServiceArchive("s1"), "POST", JSON.stringify({ archived: true })],
      [ADMIN_API_ROUTES.adminServiceOrder, "PUT", JSON.stringify(["s2", "s1"])],
      [ADMIN_API_ROUTES.adminServiceOrderPublish, "POST", undefined],
      [ADMIN_API_ROUTES.adminServiceOrderDiscard, "POST", undefined],
    ]);
  });
});
