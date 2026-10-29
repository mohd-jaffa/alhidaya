// @vitest-environment node
import { describe, expect, it } from "vitest";

import { ERROR_MESSAGES } from "@/constants/messages";
import { conflictError, databaseErrorCode, fromDatabaseError, referencesMissingRow } from "@/lib/errors";

/** What mysql2 throws: its own text names tables, keys and values. */
const driver = (code: string) =>
  Object.assign(new Error(`${code}: Duplicate entry 'jane@example.com' for key 'applications.email'`), { code });

describe("fromDatabaseError", () => {
  it("maps the codes the app understands", () => {
    expect(fromDatabaseError(driver("ER_DUP_ENTRY"))).toMatchObject({ kind: "CONFLICT", httpStatus: 409 });
    expect(fromDatabaseError(driver("ER_CHECK_CONSTRAINT_VIOLATED"))).toMatchObject({ kind: "BUSINESS_RULE" });
    expect(fromDatabaseError(driver("ER_DATA_TOO_LONG"))).toMatchObject({ kind: "VALIDATION" });
    expect(fromDatabaseError(driver("ECONNREFUSED"))).toMatchObject({ kind: "NETWORK", httpStatus: 503 });
    for (const code of [
      "ER_NO_REFERENCED_ROW",
      "ER_NO_REFERENCED_ROW_2",
      "ER_ROW_IS_REFERENCED",
      "ER_ROW_IS_REFERENCED_2",
    ]) {
      expect(fromDatabaseError(driver(code))).toMatchObject({ kind: "CONFLICT" });
    }
  });

  it("knows a write that points at a row that is not there, however MySQL words it", () => {
    const wrapped = (code: string) => Object.assign(new Error("Failed query"), { cause: driver(code) });
    expect(referencesMissingRow(wrapped("ER_NO_REFERENCED_ROW"))).toBe(true);
    expect(referencesMissingRow(driver("ER_NO_REFERENCED_ROW_2"))).toBe(true);
    expect(referencesMissingRow(driver("ER_ROW_IS_REFERENCED_2"))).toBe(false);
    expect(referencesMissingRow(new Error("no code"))).toBe(false);
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

describe("databaseErrorCode", () => {
  it("reads the driver's code, wrapped or not", () => {
    expect(databaseErrorCode(driver("ER_DUP_ENTRY"))).toBe("ER_DUP_ENTRY");
    expect(databaseErrorCode(new Error("Failed query", { cause: driver("ER_DATA_TOO_LONG") }))).toBe(
      "ER_DATA_TOO_LONG",
    );
    expect(databaseErrorCode(new Error("no code"))).toBeUndefined();
    expect(databaseErrorCode(null)).toBeUndefined();
  });
});
