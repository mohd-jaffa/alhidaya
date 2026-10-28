import { ERROR_MESSAGES, type ErrorMessageCode } from "@/constants/messages";

import { AppError } from "./AppError";

/**
 * The message to show for a failure. An AppError, or an error the API client
 * built from the server's answer, already speaks the site's words, so its
 * message is shown. Anything else (a dropped connection's TypeError, a
 * library's own error) is internals no visitor should read, so the catalogue's
 * text for what was being attempted is shown instead (AGENTS.md §10).
 */
export function errorMessage(error: unknown, fallback: ErrorMessageCode = "INTERNAL_ERROR"): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error && error.name === "ApiError" && error.message) return error.message;
  return ERROR_MESSAGES[fallback];
}
