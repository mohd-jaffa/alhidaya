/**
 * The site's fixed bounds (AGENTS.md §21), each the one place its number lives.
 * A bound the database also enforces is written to match its CHECK.
 */

const MB = 1024 * 1024;

/** How long each kind of text may be, in characters. */
export const TEXT_LIMITS = {
  name: 100,
  email: 254,
  phone: 24,
  line: 200,
  message: 2000,
} as const;

/** Upload limits (plan §9.2, §12, §15, D52): firm, checked before the file is read. */
export const UPLOAD_LIMITS = {
  cvBytes: 5 * MB,
  imageBytes: 10 * MB,
  brochureBytes: 10 * MB,
  /** The largest width an image is kept at; the original is discarded (plan §15). */
  imageMaxWidth: 2400,
} as const;

/** The 1 GB disk, shared out (plan §21.2, D51): an upload past its budget is refused. */
export const DISK_BUDGETS = {
  mediaBytes: 250 * MB,
  cvBytes: 250 * MB,
  /** The admin overview warns from this share of a budget. */
  warnAtPercent: 80,
} as const;

/** Retention and CV expiry, in days: the admin's range and the default until set (D24, D52, Q8). */
export const RETENTION_DAYS = { min: 1, max: 365, default: 180 } as const;
export const CV_EXPIRY_DAYS = { min: 1, max: 365, default: 180 } as const;

/** Public form submissions per form per visitor (plan §10.3, Q16). */
export const FORM_RATE_LIMIT = { submissions: 5, windowMinutes: 10 } as const;

/** The admin's sign-in lockout (plan §26.4). */
export const SIGN_IN_LOCKOUT = { failedAttempts: 5, lockMinutes: 15 } as const;

/**
 * Every failed sign-in takes at least this long, so a wrong password and an
 * unknown email cannot be told apart by how quickly they are refused.
 */
export const SIGN_IN_FAILURE_MIN_MS = 800;

/** Password-reset requests: per IP, and per email so the admin's inbox is never flooded. */
export const RESET_RATE_LIMITS = {
  ip: { limit: 10, windowMinutes: 60 },
  email: { limit: 3, windowMinutes: 60 },
} as const;

/** How long a password-reset link works; it works once (plan §26.4). */
export const PASSWORD_RESET_MINUTES = 30;

/** The admin's password (plan §26.4): long rather than clever. */
export const PASSWORD_LENGTH = { min: 12, max: 128 } as const;

/** How long an admin session lasts, and how often it is extended while in use. */
export const ADMIN_SESSION = { hours: 8, refreshMinutes: 60 } as const;

/** How long the logs are kept (plan §36): server failures a month, the admin's changes a year. */
export const LOG_KEEP_DAYS = { errors: 30, audit: 365 } as const;

/** How much of a failure the error log keeps, per field. */
export const ERROR_LOG_LIMITS = { message: 300, path: 500, detail: 2000, stack: 8000 } as const;
