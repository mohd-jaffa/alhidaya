import type { ErrorMessageCode } from "@/constants/messages";

import { AppError, type ErrorKind } from "./AppError";

/**
 * A MySQL failure as one of the app's errors (AGENTS.md §10). The driver's own
 * text names tables, columns, constraints and sometimes values, so it never
 * reaches a person: each code the app understands maps to a catalogue code,
 * and anything else is internals.
 */
const MYSQL_ERRORS: Record<string, { kind: ErrorKind; code: ErrorMessageCode }> = {
  // A unique key already taken: a slug, an email.
  ER_DUP_ENTRY: { kind: "CONFLICT", code: "CONFLICT" },
  // Two writes to the same rows at once; the loser can simply try again.
  ER_LOCK_DEADLOCK: { kind: "CONFLICT", code: "CONFLICT" },
  ER_LOCK_WAIT_TIMEOUT: { kind: "CONFLICT", code: "CONFLICT" },
  // A reference to something gone, or something still referenced.
  ER_NO_REFERENCED_ROW_2: { kind: "CONFLICT", code: "CONFLICT" },
  ER_ROW_IS_REFERENCED_2: { kind: "CONFLICT", code: "CONFLICT" },
  // A CHECK the database enforces.
  ER_CHECK_CONSTRAINT_VIOLATED: { kind: "BUSINESS_RULE", code: "VALIDATION_ERROR" },
  // A value of the wrong shape or size that got past validation.
  ER_BAD_NULL_ERROR: { kind: "VALIDATION", code: "VALIDATION_ERROR" },
  ER_DATA_TOO_LONG: { kind: "VALIDATION", code: "VALIDATION_ERROR" },
  ER_TRUNCATED_WRONG_VALUE: { kind: "VALIDATION", code: "VALIDATION_ERROR" },
  ER_TRUNCATED_WRONG_VALUE_FOR_FIELD: { kind: "VALIDATION", code: "VALIDATION_ERROR" },
  ER_WARN_DATA_OUT_OF_RANGE: { kind: "VALIDATION", code: "VALIDATION_ERROR" },
  ER_INVALID_JSON_TEXT: { kind: "VALIDATION", code: "VALIDATION_ERROR" },
  // The database could not be reached or is full of connections: try again later.
  ECONNREFUSED: { kind: "NETWORK", code: "EXTERNAL_SERVICE_ERROR" },
  ECONNRESET: { kind: "NETWORK", code: "EXTERNAL_SERVICE_ERROR" },
  ETIMEDOUT: { kind: "NETWORK", code: "EXTERNAL_SERVICE_ERROR" },
  PROTOCOL_CONNECTION_LOST: { kind: "NETWORK", code: "EXTERNAL_SERVICE_ERROR" },
  ER_CON_COUNT_ERROR: { kind: "NETWORK", code: "EXTERNAL_SERVICE_ERROR" },
};

/**
 * The driver's error inside whatever wrapped it: Drizzle wraps a failed
 * query, keeping the driver's error as its cause.
 */
function driverCode(error: unknown): string | undefined {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current !== null && typeof current === "object"; depth++) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === "string") return code;
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}

/**
 * Anything a query threw, as an AppError. Every other code, a refused grant
 * included (the app's own rights are wrong, never the visitor's), is internals.
 */
export function fromDatabaseError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  const code = driverCode(error);
  const mapped = code === undefined ? undefined : MYSQL_ERRORS[code];
  return new AppError({ ...(mapped ?? { kind: "INTERNAL", code: "INTERNAL_ERROR" }), cause: error });
}
