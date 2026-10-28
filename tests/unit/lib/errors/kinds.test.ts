// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  AppError,
  authenticationError,
  authorizationError,
  businessRuleError,
  conflictError,
  externalServiceError,
  internalError,
  isAppError,
  notFoundError,
  rateLimitError,
  toAppError,
  validationError,
} from "@/lib/errors";

describe("the error factories", () => {
  it("pair each kind with its default code and status", () => {
    const cases: [AppError, string, number][] = [
      [validationError(), "VALIDATION_ERROR", 400],
      [authenticationError(), "AUTH_SESSION_REQUIRED", 401],
      [authorizationError(), "AUTH_PERMISSION_DENIED", 403],
      [notFoundError(), "NOT_FOUND", 404],
      [conflictError(), "CONFLICT", 409],
      [businessRuleError("VALIDATION_ERROR"), "VALIDATION_ERROR", 422],
      [rateLimitError(), "RATE_LIMITED", 429],
      [externalServiceError(), "EXTERNAL_SERVICE_ERROR", 502],
      [internalError(), "INTERNAL_ERROR", 500],
    ];
    for (const [error, code, status] of cases) {
      expect(error.code).toBe(code);
      expect(error.httpStatus).toBe(status);
    }
  });

  it("keep a given code, details and cause", () => {
    const cause = new Error("smtp down");
    const error = externalServiceError("NETWORK_UNREACHABLE", { host: "mail" }, cause);
    expect(error).toMatchObject({ code: "NETWORK_UNREACHABLE", details: { host: "mail" }, cause });
  });

  it("recognise their own errors and wrap anything else as internal", () => {
    const own = notFoundError();
    expect(isAppError(own)).toBe(true);
    expect(isAppError(new Error("x"))).toBe(false);
    expect(toAppError(own)).toBe(own);

    const thrown = new TypeError("boom");
    const wrapped = toAppError(thrown);
    expect(wrapped).toMatchObject({ kind: "INTERNAL", code: "INTERNAL_ERROR", cause: thrown });
  });
});
