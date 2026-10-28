/**
 * Every vocabulary the database also knows (AGENTS.md §13): each list here is
 * the source of its table's CHECK, and a contract test keeps the two equal.
 */

/** What the admin's changes are recorded as (plan §16, AGENTS.md §11). */
export const AUDIT_ACTIONS = [
  "SIGN_IN",
  "SIGN_OUT",
  "PASSWORD_RESET_REQUESTED",
  "PASSWORD_CHANGED",
  "CREATE",
  "UPDATE",
  "PUBLISH",
  "DISCARD_DRAFT",
  "REORDER",
  "ARCHIVE",
  "DELETE",
  "STATUS_CHANGE",
  "NOTE_ADD",
  "CV_DOWNLOAD",
  "SETTINGS_CHANGE",
  "RETENTION_PURGE",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

/** Where a failure was met (plan §36). */
export const ERROR_SOURCES = ["SERVER", "API", "SCREEN", "CRON"] as const;
export type ErrorSource = (typeof ERROR_SOURCES)[number];
