import type { ErrorMessageCode } from "@/constants/messages";

import { AppError, type ErrorKind } from "./AppError";

/**
 * The failure families (AGENTS.md §10), as factories over the one AppError
 * class. A call site names the kind of failure and its catalogue code; the
 * status, the wording and the trace id follow, so no route has to remember
 * which number goes with which failure.
 */
function make(kind: ErrorKind) {
  return (code: ErrorMessageCode, details?: unknown, cause?: unknown) => new AppError({ kind, code, details, cause });
}

/** A request that does not satisfy its schema. */
export const validationError = (code: ErrorMessageCode = "VALIDATION_ERROR", details?: unknown) =>
  make("VALIDATION")(code, details);

/** No usable session: not signed in, or the session has expired. */
export const authenticationError = (code: ErrorMessageCode = "AUTH_SESSION_REQUIRED", details?: unknown) =>
  make("AUTHENTICATION")(code, details);

/** A caller who may not do this. */
export const authorizationError = (code: ErrorMessageCode = "AUTH_PERMISSION_DENIED", details?: unknown) =>
  make("AUTHORIZATION")(code, details);

/** A record that is not there, or not published, which reads the same to the public. */
export const notFoundError = (code: ErrorMessageCode = "NOT_FOUND", details?: unknown) =>
  make("NOT_FOUND")(code, details);

/** A clash with data that already exists: a duplicate slug, a stale write. */
export const conflictError = (code: ErrorMessageCode = "CONFLICT", details?: unknown) =>
  make("CONFLICT")(code, details);

/** A request that is well formed but a rule refuses. */
export const businessRuleError = (code: ErrorMessageCode, details?: unknown) => make("BUSINESS_RULE")(code, details);

/** Too many submissions or sign-in attempts in the window (plan §10.3, §26.4). */
export const rateLimitError = (code: ErrorMessageCode = "RATE_LIMITED", details?: unknown) =>
  make("RATE_LIMITED")(code, details);

/** A service the site depends on failed: mail, Turnstile. */
export const externalServiceError = (
  code: ErrorMessageCode = "EXTERNAL_SERVICE_ERROR",
  details?: unknown,
  cause?: unknown,
) => make("EXTERNAL_SERVICE")(code, details, cause);

/** Anything else. The cause is logged; the caller is told only that it failed. */
export const internalError = (code: ErrorMessageCode = "INTERNAL_ERROR", details?: unknown, cause?: unknown) =>
  make("INTERNAL")(code, details, cause);

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/** Any thrown value as an AppError; an unknown one keeps its cause for the log only. */
export function toAppError(error: unknown): AppError {
  return isAppError(error) ? error : internalError("INTERNAL_ERROR", undefined, error);
}
