import { afterEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES } from "@/constants/routes";
import { EnquiriesClient } from "@/features/enquiries/api.client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("EnquiriesClient", () => {
  it("sends what was typed, named by its form, to the enquiries endpoint", async () => {
    const fetch = vi.fn(async () => Response.json({ success: true, data: { received: true } }, { status: 201 }));
    vi.stubGlobal("fetch", fetch);
    await expect(EnquiriesClient.submit("QUOTE", { name: "Omar", consent: true })).resolves.toEqual({
      received: true,
    });
    expect(fetch).toHaveBeenCalledWith(
      API_ROUTES.enquiries,
      expect.objectContaining({ method: "POST", body: JSON.stringify({ name: "Omar", consent: true, form: "QUOTE" }) }),
    );
  });
});
