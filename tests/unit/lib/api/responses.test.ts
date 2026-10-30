// @vitest-environment node
import { describe, expect, it } from "vitest";

import { ERROR_MESSAGES } from "@/constants/messages";
import { buildErrorPayload, errorResponse, fileResponse, successResponse } from "@/lib/api/responses";
import { rateLimitError } from "@/lib/errors";

describe("the response envelope", () => {
  it("answers success with its data, uncached and named", async () => {
    const response = successResponse({ id: 1 }, "req_1", 201);
    expect(response.status).toBe(201);
    expect(response.headers.get("x-request-id")).toBe("req_1");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(await response.json()).toEqual({ success: true, data: { id: 1 } });
  });

  it("answers a failure with the catalogue's words and its status", async () => {
    const error = rateLimitError("RATE_LIMITED", { retryAfterSeconds: 600 });
    const response = errorResponse(error, "req_2");
    expect(response.status).toBe(429);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual(buildErrorPayload(error, "req_2"));
    expect(buildErrorPayload(error, "req_2")).toEqual({
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: ERROR_MESSAGES.RATE_LIMITED,
        requestId: "req_2",
        details: { retryAfterSeconds: 600 },
      },
    });
  });
});

describe("a private file", () => {
  it("is saved, never shown, kept by no one, its type never guessed, its name kept to safe characters", async () => {
    const response = fileResponse(
      { bytes: new Uint8Array([37, 80, 68, 70]), filename: 'cv "final".pdf', contentType: "application/pdf" },
      "req_3",
    );
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="cv__final_.pdf"');
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-request-id")).toBe("req_3");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([37, 80, 68, 70]));
  });
});
