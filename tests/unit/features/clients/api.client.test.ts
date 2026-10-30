import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { ClientsClient } from "@/features/clients/api.client";
import { clientFixture } from "@tests/support/fixtures/content";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ClientsClient", () => {
  it("adds, saves, publishes, discards and archives a logo, and saves, publishes and discards the order", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json({ success: true, data: {} }));
    vi.stubGlobal("fetch", fetch);
    const document = clientFixture();
    await ClientsClient.create(document);
    await ClientsClient.save({ id: "c1", document });
    await ClientsClient.publish("c1");
    await ClientsClient.discard("c1");
    await ClientsClient.setArchived({ id: "c1", archived: true });
    await ClientsClient.saveOrder(["c2", "c1"]);
    await ClientsClient.publishOrder();
    await ClientsClient.discardOrder();
    expect(fetch.mock.calls.map(([url, init]) => [url, init?.method, init?.body])).toEqual([
      [ADMIN_API_ROUTES.adminClients, "POST", JSON.stringify(document)],
      [ADMIN_API_ROUTES.adminClient("c1"), "PUT", JSON.stringify(document)],
      [ADMIN_API_ROUTES.adminClientPublish("c1"), "POST", undefined],
      [ADMIN_API_ROUTES.adminClientDiscard("c1"), "POST", undefined],
      [ADMIN_API_ROUTES.adminClientArchive("c1"), "POST", JSON.stringify({ archived: true })],
      [ADMIN_API_ROUTES.adminClientOrder, "PUT", JSON.stringify(["c2", "c1"])],
      [ADMIN_API_ROUTES.adminClientOrderPublish, "POST", undefined],
      [ADMIN_API_ROUTES.adminClientOrderDiscard, "POST", undefined],
    ]);
  });
});
