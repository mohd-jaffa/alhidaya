// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { UPLOAD_LIMITS } from "@/constants/limits";
import { authorizationError } from "@/lib/errors";
import { stubServerEnv } from "@tests/support/env";

const CV = new Uint8Array([37, 80, 68, 70]);
const receiveApplication = vi.fn(async () => ({ id: "application-id", cvStatus: "STORED", cv: CV }));
const sendApplicationAlert = vi.fn<(id: string, cv: Uint8Array) => Promise<string>>(async () => "SENT");
vi.mock("@/features/careers/api", () => ({ receiveApplication, sendApplicationAlert }));
const verifyTurnstile = vi.fn<(token: string) => Promise<void>>(async () => {});
vi.mock("@/lib/turnstile/verify", () => ({ verifyTurnstile }));
const captureError = vi.fn();
vi.mock("@/lib/audit/errorLog", () => ({ captureError }));

/** Next's `after`, as a test runs it: the task kept, to run once the answer is out. */
const later: (() => Promise<void>)[] = [];
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (task: () => Promise<void>) => void later.push(task),
}));

const { POST } = await import("@/app/api/applications/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  later.length = 0;
});

const fields = {
  jobId: "",
  name: "Mariam Ali",
  email: "Mariam@Example.com",
  phone: "5551 2345",
  whereNow: "IN_QATAR",
  mophLicence: "IN_PROGRESS",
  dataflow: "DONE",
  prometric: "NOT_YET",
  experienceYears: "4",
  note: "",
  consent: true,
  your_reference: "",
  turnstileToken: "token-from-cloudflare",
};

const pdf = () => new File(["%PDF-1.7 a CV"], "Mariam CV.pdf", { type: "application/pdf" });

function body(values: unknown, cv: File | null = pdf()): FormData {
  const form = new FormData();
  form.set("fields", JSON.stringify(values));
  if (cv) form.set("cv", cv);
  return form;
}

const call = (form: BodyInit, { origin = "http://localhost:3000", headers = {} } = {}) =>
  new Request("http://localhost:3000/api/applications", {
    method: "POST",
    headers: { origin, "x-forwarded-for": "203.0.113.9", ...headers },
    body: form,
  });

describe("POST /api/applications", () => {
  it("takes an application and its CV from the site's own pages, read by its schema, and answers nothing about it", async () => {
    stubServerEnv();
    const response = await POST(call(body(fields)));
    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ success: true, data: { received: true } });
    expect(verifyTurnstile).toHaveBeenCalledWith("token-from-cloudflare");
    expect(receiveApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        jobId: null,
        email: "mariam@example.com",
        phone: "+97455512345",
        experienceYears: 4,
        note: null,
        cv: expect.objectContaining({ name: "Mariam CV.pdf" }),
      }),
      "203.0.113.9",
    );
  });

  it("sends the HR email with the CV as received once the applicant has their answer, and logs a failure to record it", async () => {
    stubServerEnv();
    await POST(call(body(fields)));
    expect(sendApplicationAlert).not.toHaveBeenCalled();
    expect(later).toHaveLength(1);
    await later[0]();
    expect(sendApplicationAlert).toHaveBeenCalledWith("application-id", CV);

    sendApplicationAlert.mockRejectedValueOnce(new Error("database gone"));
    await later[0]();
    expect(captureError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Application alert not recorded", reference: expect.stringMatching(/^req_/) }),
    );
  });

  it("answers a filled trap as taken and keeps nothing, asking Cloudflare nothing (plan §10.3)", async () => {
    stubServerEnv();
    const response = await POST(call(body({ your_reference: "https://spam.example" }, null)));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ success: true, data: { received: true } });
    expect(verifyTurnstile).not.toHaveBeenCalled();
    expect(receiveApplication).not.toHaveBeenCalled();
    expect(later).toHaveLength(0);
  });

  it("keeps nothing Cloudflare does not confirm was sent by a person", async () => {
    stubServerEnv();
    verifyTurnstile.mockRejectedValueOnce(authorizationError("BOT_CHECK_FAILED"));
    const refused = await POST(call(body(fields)));
    expect(refused.status).toBe(403);
    expect(await refused.json()).toMatchObject({ error: { code: "BOT_CHECK_FAILED" } });
    expect(receiveApplication).not.toHaveBeenCalled();
  });

  it("refuses another site's application, and one without its CV, before anything is kept", async () => {
    stubServerEnv();
    expect((await POST(call(body(fields), { origin: "https://evil.example" }))).status).toBe(403);
    const refused = await POST(call(body(fields, null)));
    expect(refused.status).toBe(400);
    expect(await refused.json()).toMatchObject({
      error: { code: "VALIDATION_ERROR", details: [{ path: "cv", message: expect.any(String) }] },
    });
    expect(verifyTurnstile).not.toHaveBeenCalled();
    expect(receiveApplication).not.toHaveBeenCalled();
  });

  it("refuses a body larger than a CV and its fields before reading it, and one that is not a form", async () => {
    stubServerEnv();
    const large = await POST(call(body(fields), { headers: { "content-length": String(UPLOAD_LIMITS.cvBytes * 2) } }));
    expect(large.status).toBe(400);
    expect(await large.json()).toMatchObject({ error: { code: "UPLOAD_TOO_LARGE" } });
    const unread = await POST(call(JSON.stringify(fields), { headers: { "content-type": "application/json" } }));
    expect(await unread.json()).toMatchObject({ error: { code: "VALIDATION_INVALID_JSON" } });
    expect(receiveApplication).not.toHaveBeenCalled();
  });
});
