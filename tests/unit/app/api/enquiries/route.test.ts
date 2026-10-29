// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { authorizationError } from "@/lib/errors";
import { stubServerEnv } from "@tests/support/env";

const receiveEnquiry = vi.fn(async () => "enquiry-id");
vi.mock("@/features/enquiries/api", () => ({ receiveEnquiry }));
const verifyTurnstile = vi.fn<(token: string) => Promise<void>>(async () => {});
vi.mock("@/lib/turnstile/verify", () => ({ verifyTurnstile }));
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
  your_reference: "",
  turnstileToken: "token-from-cloudflare",
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
    expect(verifyTurnstile).toHaveBeenCalledWith("token-from-cloudflare");
    expect(receiveEnquiry).toHaveBeenCalledWith(
      expect.objectContaining({ form: "CONTACT", email: "mariam@example.com", phone: "+97455512345" }),
      "203.0.113.9",
    );
  });

  it("answers a filled trap as taken and keeps nothing, asking Cloudflare nothing (plan §10.3)", async () => {
    stubServerEnv();
    const response = await POST(call({ form: "nonsense", your_reference: "https://spam.example" }));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ success: true, data: { received: true } });
    expect(verifyTurnstile).not.toHaveBeenCalled();
    expect(receiveEnquiry).not.toHaveBeenCalled();
  });

  it("keeps nothing Cloudflare does not confirm was sent by a person", async () => {
    stubServerEnv();
    verifyTurnstile.mockRejectedValueOnce(authorizationError("BOT_CHECK_FAILED"));
    const refused = await POST(call(contact));
    expect(refused.status).toBe(403);
    expect(await refused.json()).toMatchObject({ error: { code: "BOT_CHECK_FAILED" } });
    expect(receiveEnquiry).not.toHaveBeenCalled();

    // Without a token there is nothing to ask Cloudflare about.
    const tokenless = await POST(call({ ...contact, turnstileToken: "" }));
    expect(tokenless.status).toBe(400);
    expect(verifyTurnstile).toHaveBeenCalledOnce();
  });

  it("refuses another site's form, and a form that does not pass its schema, before anything is kept", async () => {
    stubServerEnv();
    expect((await POST(call(contact, "https://evil.example"))).status).toBe(403);
    const refused = await POST(call({ ...contact, email: "mariam" }));
    expect(refused.status).toBe(400);
    expect(await refused.json()).toMatchObject({
      error: { code: "VALIDATION_ERROR", details: [{ path: "email", message: expect.any(String) }] },
    });
    expect(verifyTurnstile).not.toHaveBeenCalled();
    expect(receiveEnquiry).not.toHaveBeenCalled();
  });
});
