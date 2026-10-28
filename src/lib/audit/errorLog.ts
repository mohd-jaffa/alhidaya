import { ERROR_LOG_LIMITS } from "@/constants/limits";
import type { ErrorSource } from "@/constants/statuses";
import { getDb } from "@/db/client";
import { errorLog } from "@/db/schema";
import { logger, redactSensitive } from "@/lib/logger";

/** One failure, as the code that met it describes it. */
export interface ErrorCapture {
  /** What failed, in words: the line the server's output carries. */
  message: string;
  /** Where it happened; the server's own work unless said. */
  source?: ErrorSource;
  /** The thrown value, when there is one: its message and stack are kept. */
  error?: unknown;
  /** What the person was shown to quote: a request's id, or a page's digest. */
  reference?: string;
  code?: string;
  kind?: string;
  httpStatus?: number;
  method?: string;
  path?: string;
  adminId?: string | null;
  /** Anything else that helps; redacted as the logger redacts it. */
  context?: Record<string, unknown>;
}

function clip(value: string | undefined, max: number): string | null {
  if (value === undefined) return null;
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/** A thrown value's own message and stack: an Error's, or the value itself written out. */
function describe(error: unknown): { detail?: string; stack?: string } {
  if (error === undefined) return {};
  if (error instanceof Error) return { detail: error.message, stack: error.stack };
  if (typeof error === "string") return { detail: error };
  try {
    return { detail: JSON.stringify(error) };
  } catch {
    return { detail: String(error) };
  }
}

/**
 * The central error logger (plan §36): what failed on the server goes to the
 * server's output and to `error_log`, which only the admin's activity screen
 * reads, and is kept a month. The context is redacted by key, so nothing
 * personal reaches it (AGENTS.md §8).
 *
 * It never throws: whatever failed has already failed, and a log that cannot
 * be written must not become a second failure. What it could not write is
 * still in the output.
 */
export async function captureError(capture: ErrorCapture): Promise<void> {
  const { message, source = "SERVER", error, reference, context, ...where } = capture;
  const { detail, stack } = describe(error);
  logger.error(message, { source, ...where, ...context, detail }, reference);

  try {
    await getDb()
      .insert(errorLog)
      .values({
        source,
        message: clip(message, ERROR_LOG_LIMITS.message) as string,
        reference: reference ?? null,
        code: where.code ?? null,
        kind: where.kind ?? null,
        httpStatus: where.httpStatus ?? null,
        method: where.method ?? null,
        path: clip(where.path, ERROR_LOG_LIMITS.path),
        adminId: where.adminId ?? null,
        detail: clip(detail, ERROR_LOG_LIMITS.detail),
        stack: clip(stack, ERROR_LOG_LIMITS.stack),
        context: context === undefined ? null : redactSensitive(context),
      });
  } catch (thrown) {
    logger.error(
      "Error log not written",
      { reason: thrown instanceof Error ? thrown.message : String(thrown) },
      reference,
    );
  }
}
