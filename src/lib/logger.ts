type LogLevel = "info" | "warn" | "error";

/** Credentials and connection strings: never logged (AGENTS.md §9). */
const SECRET_KEY_PATTERN =
  /(authorization|cookie|password|passwd|secret|token|session|api[_-]?key|credential|database[_-]?url|dsn)/i;

/**
 * Whatever could name or reach a visitor, an applicant or their CV: never
 * logged either (AGENTS.md §8). Matched by key, so a log line keeps its ids,
 * codes and paths and loses anything personal.
 */
const PERSONAL_KEY_PATTERN =
  /(name|phone|mobile|whatsapp|email|address|message|note|cv|resume|licen[cs]e|nationality|location|birth|(^|_)ip($|_)|ipaddress)/i;

function isSensitiveKey(key: string): boolean {
  return SECRET_KEY_PATTERN.test(key) || PERSONAL_KEY_PATTERN.test(key);
}

export function redactSensitive(value: unknown, depth = 0): unknown {
  if (depth > 8) return "[MaxDepth]";
  if (Array.isArray(value)) return value.map((item) => redactSensitive(item, depth + 1));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        isSensitiveKey(key) ? "[Redacted]" : redactSensitive(nested, depth + 1),
      ]),
    );
  }
  return value;
}

/**
 * One JSON line per event, to the app's log on the server (plan §36): the
 * request id ties it to the error a person was shown, and its context is
 * redacted before it is written.
 */
function writeLog(level: LogLevel, message: string, context?: unknown, requestId?: string) {
  const line = JSON.stringify({
    level,
    message,
    requestId,
    context: context === undefined ? undefined : redactSensitive(context),
    timestamp: new Date().toISOString(),
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const logger = {
  info: (message: string, context?: unknown, requestId?: string) => writeLog("info", message, context, requestId),
  warn: (message: string, context?: unknown, requestId?: string) => writeLog("warn", message, context, requestId),
  error: (message: string, context?: unknown, requestId?: string) => writeLog("error", message, context, requestId),
};
