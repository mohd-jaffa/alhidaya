// @vitest-environment node
import { describe, expect, it } from "vitest";

import { ERROR_MESSAGES } from "@/constants/messages";
import { buildErrorPayload, errorResponse, successResponse } from "@/lib/api/responses";
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
