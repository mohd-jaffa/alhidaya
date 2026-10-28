// @vitest-environment node
import { describe, expect, it } from "vitest";

import { ERROR_MESSAGES } from "@/constants/messages";
import { conflictError, fromDatabaseError } from "@/lib/errors";

/** What mysql2 throws: its own text names tables, keys and values. */
const driver = (code: string) =>
  Object.assign(new Error(`${code}: Duplicate entry 'jane@example.com' for key 'applications.email'`), { code });

describe("fromDatabaseError", () => {
  it("maps the codes the app understands", () => {
    expect(fromDatabaseError(driver("ER_DUP_ENTRY"))).toMatchObject({ kind: "CONFLICT", httpStatus: 409 });
    expect(fromDatabaseError(driver("ER_CHECK_CONSTRAINT_VIOLATED"))).toMatchObject({ kind: "BUSINESS_RULE" });
    expect(fromDatabaseError(driver("ER_DATA_TOO_LONG"))).toMatchObject({ kind: "VALIDATION" });
    expect(fromDatabaseError(driver("ECONNREFUSED"))).toMatchObject({ kind: "NETWORK", httpStatus: 503 });
  });

  it("finds the driver's error inside Drizzle's wrapper", () => {
    const wrapped = Object.assign(new Error("Failed query: insert into ..."), { cause: driver("ER_DUP_ENTRY") });
    expect(fromDatabaseError(wrapped)).toMatchObject({ kind: "CONFLICT", cause: wrapped });
  });

  it("treats a refused grant and anything unknown as internals", () => {
    expect(fromDatabaseError(driver("ER_TABLEACCESS_DENIED_ERROR"))).toMatchObject({ kind: "INTERNAL" });
    expect(fromDatabaseError(new Error("no code"))).toMatchObject({ kind: "INTERNAL" });
    expect(fromDatabaseError(Object.assign(new Error("odd"), { code: 1062 }))).toMatchObject({ kind: "INTERNAL" });
    expect(fromDatabaseError("text")).toMatchObject({ kind: "INTERNAL" });
  });

  it("never lets the driver's words through", () => {
    const error = fromDatabaseError(driver("ER_DUP_ENTRY"));
    expect(error.message).toBe(ERROR_MESSAGES.CONFLICT);
    expect(JSON.stringify(error)).not.toContain("jane@example.com");
  });

  it("passes the app's own errors through unchanged", () => {
    const own = conflictError();
    expect(fromDatabaseError(own)).toBe(own);
  });
});
