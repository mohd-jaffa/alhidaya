/**
 * The site's fixed bounds (AGENTS.md §21), each the one place its number lives.
 * A bound the database also enforces is written to match its CHECK.
 */

const MB = 1024 * 1024;

/** Beyond this desktop header capacity, reuse the existing full menu (D142). */
export const HEADER_NAVIGATION_LIMITS = { links: 5, characters: 42 } as const;

/** How long each kind of text may be, in characters. */
export const TEXT_LIMITS = {
  name: 100,
  email: 254,
  phone: 24,
  line: 200,
  message: 2000,
  label: 60,
  heading: 120,
  lede: 300,
  paragraph: 2000,
  item: 200,
  slug: 80,
  seoTitle: 70,
  seoDescription: 160,
  /** A section's longer text: a mission, the institutions' words, the jobs list's introduction. */
  sectionText: 600,
  valueTitle: 80,
  department: 80,
  /** What an image shows, for those who cannot see it (plan §15). */
  alt: 250,
  url: 500,
  fileName: 255,
  /** A stored file's key: its month folder and generated name. */
  fileKey: 160,
  note: 2000,
  /** Cloudflare's Turnstile tokens are at most 2048 characters. */
  turnstileToken: 2048,
} as const;

/** Years of nursing experience, as the application form takes them (plan §9.2). */
export const EXPERIENCE_YEARS = { min: 0, max: 50 } as const;

/** How many of a repeated thing a document may hold (plan §7.2, §8, §9.1, §13). */
export const LIST_LIMITS = {
  sections: 20,
  richBlocks: 60,
  values: 6,
  included: 12,
  serviceButtons: 2,
  jobPoints: 20,
  navigation: 10,
  footerColumns: 4,
  footerLinks: 10,
  social: 6,
  addressLines: 6,
  recipients: 5,
  ordering: 200,
  /** Home's slides (D128). */
  slides: 8,
} as const;

/** The approved compact related-service section shows up to three distinct published services. */
export const RELATED_SERVICE_COUNT = 3;

/** How many rows an admin inbox shows a page (plan §9.5, §10.5), and how much of an answer a row shows. */
export const INBOX_PAGE_SIZE = 25;

/** How many of the admin's changes Activity shows a page (D96). */
export const ACTIVITY_PAGE_SIZE = 50;
export const INBOX_SUMMARY_LENGTH = 160;

/** Upload limits (plan §9.2, §12, §15, D52): firm, checked before the file is read. */
export const UPLOAD_LIMITS = {
  cvBytes: 5 * MB,
  imageBytes: 10 * MB,
  brochureBytes: 10 * MB,
  /** The largest width an image is kept at; the original is discarded (plan §15). */
  imageMaxWidth: 2400,
  /** The most pixels an image may decode to: the server has 1 GB of memory (plan §21.1). */
  imageMaxPixels: 40_000_000,
} as const;

/** Room in an application's body for its fields beside the CV (plan §9.2): read whole, never more. */
export const APPLICATION_FIELDS_BYTES = 64 * 1024;

/** Room in an image upload's body for its words beside the file (D93). */
export const MEDIA_FIELDS_BYTES = 16 * 1024;

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

/**
 * How long the server waits on the mail server (plan §17): to connect, for
 * its greeting, and between replies. A mail server that does not answer is a
 * failed send, marked for Retry, never a request left hanging.
 */
export const MAIL_TIMEOUTS_MS = { connection: 10_000, greeting: 10_000, socket: 30_000 } as const;

/**
 * A CV's save is tried this many times while the applicant waits, the pause
 * between tries growing each time (D84); then nothing is kept and they are
 * asked to send it again.
 */
export const CV_SAVE_RETRIES = { tries: 3, pauseMs: 250 } as const;

/**
 * An enquiry alert or HR email not sent is sent again by the mail-retry cron
 * (D85): every 10 minutes, up to 3 more tries. One still marked as sending
 * this long after it arrived was never sent; and a run takes at most so many
 * of each kind, so it ends well within its cron's time.
 */
export const MAIL_RETRIES = { tries: 3, pendingAfterMs: 10 * 60_000, perRun: 10 } as const;

/** How long the server waits for Cloudflare to check a form's token (plan §10.3). */
export const TURNSTILE_VERIFY_MS = 10_000;

/** Public form submissions per form per visitor (plan §10.3, Q16). */
export const FORM_RATE_LIMIT = { limit: 5, windowMinutes: 10 } as const;

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

/** How often the signed-in admin may try their current password to change it (D115): enough for slips, not for guessing. */
export const PASSWORD_CHANGE_RATE_LIMIT = { limit: 10, windowMinutes: 60 } as const;

/** How long an admin session lasts, and how often it is extended while in use. */
export const ADMIN_SESSION = { hours: 8, refreshMinutes: 60 } as const;

/** How long the logs are kept (plan §36): server failures a month, the admin's changes a year. */
export const LOG_KEEP_DAYS = { errors: 30, audit: 365 } as const;

/** Physical image coordinates, stored per placement as whole percentages. */
export const FOCAL_POINT_LIMITS = { min: 0, max: 100, center: 50, step: 1 } as const;

/** How much of a failure the error log keeps, per field. */
export const ERROR_LOG_LIMITS = { message: 300, path: 500, detail: 2000, stack: 8000 } as const;
