import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { MediaClient } from "@/features/media/api.client";

afterEach(() => {
  vi.unstubAllGlobals();
});

const details = { alt: "A nurse", decorative: false, source: { provider: "", url: "", licence: "" } };

describe("MediaClient", () => {
  it("uploads a file beside its words, changes an image's words and deletes it, each at its endpoint", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json({ success: true, data: {} }));
    vi.stubGlobal("fetch", fetch);
    const file = new File(["x"], "nurse.jpg", { type: "image/jpeg" });
    await MediaClient.upload({ file, details });
    await MediaClient.update({ id: "m1", details });
    await MediaClient.remove("m1");
    expect(fetch.mock.calls.map(([url, init]) => [url, init?.method])).toEqual([
      [ADMIN_API_ROUTES.adminMedia, "POST"],
      [ADMIN_API_ROUTES.adminMediaItem("m1"), "PATCH"],
      [ADMIN_API_ROUTES.adminMediaItem("m1"), "DELETE"],
    ]);
    const form = fetch.mock.calls[0][1]?.body as FormData;
    expect([form.get("fields"), form.get("file")]).toEqual([JSON.stringify(details), expect.any(File)]);
    expect(fetch.mock.calls[1][1]?.body).toBe(JSON.stringify(details));
  });
});
