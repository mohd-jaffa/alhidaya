// @vitest-environment node
import { describe, expect, it } from "vitest";

import { ERROR_MESSAGES } from "@/constants/messages";
import { AppError, KIND_STATUS } from "@/lib/errors";

describe("AppError", () => {
  it("takes its wording from the catalogue and its status from its kind", () => {
    const error = new AppError({ kind: "RATE_LIMITED", code: "RATE_LIMITED", details: { retryAfter: 60 } });
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("AppError");
    expect(error.message).toBe(ERROR_MESSAGES.RATE_LIMITED);
    expect(error.httpStatus).toBe(429);
    expect(error.details).toEqual({ retryAfter: 60 });
    expect(error.traceId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("gives every kind a status", () => {
    expect(KIND_STATUS).toMatchObject({ VALIDATION: 400, AUTHENTICATION: 401, INTERNAL: 500, NETWORK: 503 });
  });

  it("never sends its cause or details across the wire", () => {
    const error = new AppError({ kind: "INTERNAL", code: "INTERNAL_ERROR", details: "stack", cause: new Error("sql") });
    expect(JSON.parse(JSON.stringify(error))).toEqual({
      code: "INTERNAL_ERROR",
      message: ERROR_MESSAGES.INTERNAL_ERROR,
      traceId: error.traceId,
    });
  });
});
