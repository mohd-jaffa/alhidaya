import { AppError, externalServiceError } from "@/lib/errors";

/**
 * A mail server's failure as a person is told it: the outside service's,
 * never in the server's own words (AGENTS.md §10), with its error kept as the
 * cause for the log. An app error (mail not set up) is said as itself.
 */
export function asMailFailure(error: unknown): AppError {
  return error instanceof AppError ? error : externalServiceError("EXTERNAL_SERVICE_ERROR", undefined, error);
}
