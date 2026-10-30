import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { EnquiriesClient, enquiriesKey } from "@/features/enquiries/api.client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("enquiriesKey", () => {
  it("names a list by what differs from the inbox's defaults, always in one order", () => {
    expect(enquiriesKey()).toBe(ADMIN_API_ROUTES.adminEnquiries);
    expect(enquiriesKey({ page: 1, needsYou: false })).toBe(ADMIN_API_ROUTES.adminEnquiries);
    expect(enquiriesKey({ needsYou: true })).toBe(`${ADMIN_API_ROUTES.adminEnquiries}?needsYou=true`);
    expect(enquiriesKey({ page: 3, q: "5551 2345", status: "NEW", form: "QUOTE" })).toBe(
      `${ADMIN_API_ROUTES.adminEnquiries}?form=QUOTE&status=NEW&q=5551+2345&page=3`,
    );
  });
});

describe("the inbox's writes", () => {
  it("move an enquiry, note it, send its alert again and delete it, each at its endpoint", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json({ success: true, data: {} }));
    vi.stubGlobal("fetch", fetch);
    await EnquiriesClient.setStatus({ id: "e1", status: "RESOLVED" });
    await EnquiriesClient.addNote({ id: "e1", body: "Called back." });
    await EnquiriesClient.retryAlert("e1");
    await EnquiriesClient.remove("e1");
    expect(
      fetch.mock.calls.map(([url, init]) => [(init as RequestInit).method, url, (init as RequestInit).body]),
    ).toEqual([
      ["PATCH", ADMIN_API_ROUTES.adminEnquiry("e1"), JSON.stringify({ status: "RESOLVED" })],
      ["POST", ADMIN_API_ROUTES.adminEnquiryNotes("e1"), JSON.stringify({ body: "Called back." })],
      ["POST", ADMIN_API_ROUTES.adminEnquiryRetryMail("e1"), undefined],
      ["DELETE", ADMIN_API_ROUTES.adminEnquiry("e1"), undefined],
    ]);
  });
});
