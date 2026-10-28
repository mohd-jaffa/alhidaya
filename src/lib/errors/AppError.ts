import { type ErrorMessageCode, getErrorMessage } from "@/constants/messages";

/**
 * The one error class the app throws (AGENTS.md §10). Every failure a person
 * can reach is one of these: no ad hoc strings, no library error surfacing as
 * it is. It carries three things:
 *
 * - `code`    the catalogue code the API returns; its wording lives in
 *             src/constants/messages.ts, so the browser and the server agree.
 * - `kind`    the failure's family, which fixes the HTTP status.
 * - `traceId` the id the logs carry, so a report can find the request.
 *
 * Build one through the factories in ./kinds, so the kind and the status can
 * never disagree.
 */
export type ErrorKind =
  | "VALIDATION"
  | "AUTHENTICATION"
  | "AUTHORIZATION"
  | "NOT_FOUND"
  | "CONFLICT"
  | "BUSINESS_RULE"
  | "RATE_LIMITED"
  | "EXTERNAL_SERVICE"
  | "NETWORK"
  | "INTERNAL";

/** The HTTP status each kind answers with. */
export const KIND_STATUS: Record<ErrorKind, number> = {
  VALIDATION: 400,
  AUTHENTICATION: 401,
  AUTHORIZATION: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  BUSINESS_RULE: 422,
  RATE_LIMITED: 429,
  EXTERNAL_SERVICE: 502,
  NETWORK: 503,
  INTERNAL: 500,
};

/** What an error looks like once it has crossed the wire. */
export interface AppErrorShape {
  code: ErrorMessageCode;
  message: string;
  traceId: string;
}

export class AppError extends Error {
  readonly kind: ErrorKind;
  readonly code: ErrorMessageCode;
  readonly httpStatus: number;
  readonly traceId: string;
  readonly details?: unknown;
  readonly cause?: unknown;

  constructor(params: { kind: ErrorKind; code: ErrorMessageCode; details?: unknown; cause?: unknown }) {
    super(getErrorMessage(params.code));
    this.name = "AppError";
    this.kind = params.kind;
    this.code = params.code;
    this.httpStatus = KIND_STATUS[params.kind];
    this.traceId = crypto.randomUUID();
    this.details = params.details;
    this.cause = params.cause;
  }

  /** What is safe to send: never the cause, never the details of internals. */
  toJSON(): AppErrorShape {
    return { code: this.code, message: this.message, traceId: this.traceId };
  }
}
