// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import * as z from "zod";

const { captureError } = vi.hoisted(() => ({ captureError: vi.fn(async (capture: unknown) => void capture) }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError }));

import { createRequestId, normalizeApiError, readBody, readJson, readQuery, withApiHandler } from "@/lib/api/handler";
import { conflictError, internalError } from "@/lib/errors";
import { logger } from "@/lib/logger";

afterEach(() => {
  vi.restoreAllMocks();
  captureError.mockClear();
});

const post = (body: BodyInit | null, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api/enquiries?x=1", { method: "POST", body, headers });

describe("createRequestId", () => {
  it("keeps a plain id it is given and replaces anything that could forge a log line", () => {
    expect(createRequestId(new Headers({ "x-request-id": "req_abc-1" }))).toBe("req_abc-1");
    expect(createRequestId(new Headers({ "x-request-id": 'x" {"level":"info"}' }))).toMatch(/^req_[0-9a-f-]{36}$/);
    expect(createRequestId(new Headers({ "x-request-id": "a".repeat(65) }))).toMatch(/^req_/);
    expect(createRequestId()).toMatch(/^req_/);
  });
});

describe("readJson", () => {
  const schema = z.object({ name: z.string() });

  it("parses the body by its schema", async () => {
    expect(await readJson(post(JSON.stringify({ name: "A" })), schema)).toEqual({ name: "A" });
  });

  it("refuses a body that is not JSON", async () => {
    await expect(readJson(post("{nope"), schema)).rejects.toMatchObject({ code: "VALIDATION_INVALID_JSON" });
  });
});

describe("readQuery", () => {
  it("reads each parameter once, an empty one as absent", () => {
    const request = new Request("http://localhost/x?status=NEW&status=DONE&q=");
    expect(readQuery(request, z.object({ status: z.string(), q: z.string().optional() }))).toEqual({ status: "NEW" });
  });
});

describe("readBody", () => {
  const limit = { maxBytes: 4, tooLarge: "UPLOAD_TOO_LARGE" as const };

  it("reads a body within the limit", async () => {
    expect(Array.from(await readBody(post("abc"), limit))).toEqual([97, 98, 99]);
  });

  it("reads an empty body as empty", async () => {
    expect((await readBody(new Request("http://localhost/x"), limit)).byteLength).toBe(0);
  });

  it("refuses an honest oversized body before reading it", async () => {
    await expect(readBody(post("abcdef", { "content-length": "6" }), limit)).rejects.toMatchObject({
      code: "UPLOAD_TOO_LARGE",
    });
  });

  it("refuses a body whose declared length lies", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2, 3]));
        controller.enqueue(new Uint8Array([4, 5, 6]));
        controller.close();
      },
    });
    const request = new Request("http://localhost/x", {
      method: "POST",
      body: stream,
      headers: { "content-length": "2" },
      duplex: "half",
    } as RequestInit);
    await expect(readBody(request, limit)).rejects.toMatchObject({ code: "UPLOAD_TOO_LARGE" });
  });
});

describe("normalizeApiError", () => {
  it("keeps which field a schema refused", () => {
    const result = z.object({ email: z.string() }).safeParse({});
    const error = normalizeApiError(result.error);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.details).toEqual([{ path: "email", message: expect.any(String) }]);
  });
});

describe("withApiHandler", () => {
  it("answers success in the envelope, with the route's status", async () => {
    const response = await withApiHandler(post(null), async () => ({ ok: true }), { successStatus: 201 });
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ success: true, data: { ok: true } });
  });

  it("answers 200 by default", async () => {
    expect((await withApiHandler(post(null), async () => 1)).status).toBe(200);
  });

  it("passes a route's own response through", async () => {
    const file = new Response("pdf", { status: 200 });
    expect(await withApiHandler(post(null), async () => file)).toBe(file);
  });

  it("logs a refusal as a warning and answers in the envelope", async () => {
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => {});
    const response = await withApiHandler(post(null), async (context) => {
      context.adminId = "admin_1";
      throw conflictError("CONFLICT", { field: "slug" });
    });
    expect(response.status).toBe(409);
    expect(warn).toHaveBeenCalledWith(
      "API request refused",
      expect.objectContaining({ code: "CONFLICT", path: "/api/enquiries", adminId: "admin_1" }),
      expect.stringMatching(/^req_/),
    );
  });

  it("sends a fault to the error log with its cause, and never returns the cause", async () => {
    const response = await withApiHandler(post(null), async () => {
      throw new Error("ER_NO_SUCH_TABLE: Table 'alhidaya.secret' doesn't exist");
    });
    const body = await response.json();
    expect(response.status).toBe(500);
    expect(JSON.stringify(body)).not.toContain("secret");
    expect(captureError).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "API",
        message: "API request failed",
        reference: body.error.requestId,
        code: "INTERNAL_ERROR",
        error: expect.objectContaining({ message: expect.stringContaining("ER_NO_SUCH_TABLE") }),
        context: expect.objectContaining({ traceId: expect.any(String) }),
      }),
    );
  });

  it("logs the error itself when it has no cause", async () => {
    await withApiHandler(post(null), async () => {
      throw internalError();
    });
    expect(captureError.mock.calls[0][0]).toMatchObject({ error: expect.objectContaining({ name: "AppError" }) });
  });
});
