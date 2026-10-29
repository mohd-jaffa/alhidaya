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

/** Who a service is for, which sets its line on the site (plan §8, D31). */
export const AUDIENCES = ["FAMILIES", "INSTITUTIONS"] as const;
export type Audience = (typeof AUDIENCES)[number];

/** A job's terms (plan §9.1). */
export const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

/** The collections kept as records (plan D60). */
export const RECORD_COLLECTIONS = ["SERVICES", "JOBS", "CLIENTS"] as const;
export type RecordCollection = (typeof RECORD_COLLECTIONS)[number];

/** What a media file is (plan §15). */
export const MEDIA_KINDS = ["IMAGE", "PDF"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

/** The two forms (plan §10, D15). */
export const FORM_KINDS = ["QUOTE", "CONTACT"] as const;
export type FormKind = (typeof FORM_KINDS)[number];

/** Social networks the footer may link (plan §13). */
export const SOCIAL_NETWORKS = ["INSTAGRAM", "FACEBOOK", "LINKEDIN", "X", "YOUTUBE"] as const;
export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];

/** Where an enquiry stands in the inbox (plan §10.5). */
export const ENQUIRY_STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

/** Where an application stands in the inbox (plan §9.5). */
export const APPLICATION_STATUSES = ["NEW", "IN_REVIEW", "SHORTLISTED", "CLOSED"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

/** Whether a submission's alert email went; one not sent shows in the inbox with Retry (plan §9.3, §10.4). */
export const EMAIL_STATUSES = ["PENDING", "SENT", "NOT_SENT"] as const;
export type EmailStatus = (typeof EMAIL_STATUSES)[number];

/** Where an application's CV is (plan §9.3, §9.4): saved after the row, kept until it expires. */
export const CV_STATUSES = ["PENDING", "STORED", "NOT_STORED", "EXPIRED"] as const;
export type CvStatus = (typeof CV_STATUSES)[number];
