import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { SEED_SITE } from "@/db/seed/content";
import { SiteClient } from "@/features/settings/api.client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SiteClient", () => {
  it("saves, publishes and discards the site's content, and uploads a brochure, each at its endpoint", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json({ success: true, data: {} }));
    vi.stubGlobal("fetch", fetch);
    await SiteClient.save(SEED_SITE);
    await SiteClient.publish();
    await SiteClient.discard();
    await SiteClient.uploadBrochure(new File(["%PDF-1.7"], "brochure.pdf", { type: "application/pdf" }));
    expect(fetch.mock.calls.map(([url, init]) => [url, init?.method])).toEqual([
      [ADMIN_API_ROUTES.adminSite, "PUT"],
      [ADMIN_API_ROUTES.adminSitePublish, "POST"],
      [ADMIN_API_ROUTES.adminSiteDiscard, "POST"],
      [ADMIN_API_ROUTES.adminSiteBrochure, "POST"],
    ]);
    const form = fetch.mock.calls[3][1]?.body as FormData;
    expect([form.get("fields"), form.get("file")]).toEqual(["{}", expect.any(File)]);
  });
});
