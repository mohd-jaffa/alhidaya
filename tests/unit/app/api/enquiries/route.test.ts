// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const receiveEnquiry = vi.fn(async () => "enquiry-id");
vi.mock("@/features/enquiries/api", () => ({ receiveEnquiry }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const { POST } = await import("@/app/api/enquiries/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const contact = {
  form: "CONTACT",
  name: "Mariam Ali",
  phone: "5551 2345",
  email: "Mariam@Example.com",
  message: "A nurse at night?",
  consent: true,
};

const call = (body: unknown, origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/enquiries", {
    method: "POST",
    headers: { origin, "x-forwarded-for": "203.0.113.9" },
    body: JSON.stringify(body),
  });

describe("POST /api/enquiries", () => {
  it("takes a form from the site's own pages, read by its schema, and answers nothing about it", async () => {
    stubServerEnv();
    const response = await POST(call(contact));
    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ success: true, data: { received: true } });
    expect(receiveEnquiry).toHaveBeenCalledWith(
      expect.objectContaining({ form: "CONTACT", email: "mariam@example.com", phone: "+97455512345" }),
      "203.0.113.9",
    );
  });

  it("refuses another site's form, and a form that does not pass its schema, before anything is kept", async () => {
    stubServerEnv();
    expect((await POST(call(contact, "https://evil.example"))).status).toBe(403);
    const refused = await POST(call({ ...contact, email: "mariam" }));
    expect(refused.status).toBe(400);
    expect(await refused.json()).toMatchObject({
      error: { code: "VALIDATION_ERROR", details: [{ path: "email", message: expect.any(String) }] },
    });
    expect(receiveEnquiry).not.toHaveBeenCalled();
  });
});
