/**
 * Every vocabulary the database also knows (AGENTS.md §13): each list here is
 * the source of its table's CHECK, and a contract test keeps the two equal.
 * The few only a form knows say so.
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

/**
 * What an audit row is about (plan §36): its table, or for a service, a job
 * or a client logo its collection (RECORD_COLLECTIONS). Activity sorts the
 * rows into kinds by it (D96).
 */
export const AUDIT_ENTITIES = {
  documents: "documents",
  media: "media",
  enquiry: "enquiry",
  application: "application",
  operations: "site_operations",
  account: "auth_user",
} as const;

/** Where a failure was met (plan §36). */
export const ERROR_SOURCES = ["SERVER", "API", "SCREEN", "CRON"] as const;
export type ErrorSource = (typeof ERROR_SOURCES)[number];

/** Who a service is for, which sets its line on the site (plan §8, D31). */
export const AUDIENCES = ["FAMILIES", "INSTITUTIONS"] as const;
export type Audience = (typeof AUDIENCES)[number];
/** Each audience as the site names it over its services (D105, D111). */
export const AUDIENCE_LABELS: Record<Audience, string> = {
  FAMILIES: "For families",
  INSTITUTIONS: "For hospitals, clinics & schools",
};

/** A job's terms (plan §9.1). */
export const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];
export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: "Full time",
  PART_TIME: "Part time",
  CONTRACT: "Contract",
};

/** The collections kept as records (plan D60). */
export const RECORD_COLLECTIONS = ["SERVICES", "JOBS", "CLIENTS"] as const;
export type RecordCollection = (typeof RECORD_COLLECTIONS)[number];

/** What a media file is (plan §15). */
export const MEDIA_KINDS = ["IMAGE", "PDF"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

/** The two forms (plan §10, D15). */
export const FORM_KINDS = ["QUOTE", "CONTACT"] as const;
export type FormKind = (typeof FORM_KINDS)[number];

/**
 * The Quote form's choices (plan §10.1): who the care is for, and how the
 * visitor would like to hear back. Only the form knows them: an enquiry keeps
 * the words the visitor chose (§10.4), so the database has no CHECK for them.
 */
export const CARE_FOR = ["FAMILY", "HOSPITAL", "CLINIC", "SCHOOL", "OTHER"] as const;
export type CareFor = (typeof CARE_FOR)[number];
export const CARE_FOR_LABELS: Record<CareFor, string> = {
  FAMILY: "My family",
  HOSPITAL: "A hospital",
  CLINIC: "A clinic",
  SCHOOL: "A school",
  OTHER: "Other",
};

export const CONTACT_METHODS = ["WHATSAPP", "CALL", "EMAIL"] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];
export const CONTACT_METHOD_LABELS: Record<ContactMethod, string> = {
  WHATSAPP: "WhatsApp",
  CALL: "A phone call",
  EMAIL: "Email",
};

/**
 * The application form's choices (plan §9.2): where the nurse is, and how far
 * along Qatar's licensing (the MOPH licence, Dataflow's check of their
 * papers, the Prometric exam). Only the form knows them: an application keeps
 * the words the applicant chose, so the database has no CHECK for them.
 */
export const WHERE_NOW = ["IN_QATAR", "OUTSIDE_QATAR"] as const;
export type WhereNow = (typeof WHERE_NOW)[number];
export const WHERE_NOW_LABELS: Record<WhereNow, string> = {
  IN_QATAR: "In Qatar",
  OUTSIDE_QATAR: "Outside Qatar",
};

export const MOPH_LICENCE = ["HAVE", "IN_PROGRESS", "NOT_YET"] as const;
export type MophLicence = (typeof MOPH_LICENCE)[number];
export const MOPH_LICENCE_LABELS: Record<MophLicence, string> = {
  HAVE: "I have one",
  IN_PROGRESS: "In progress",
  NOT_YET: "Not yet",
};

export const DATAFLOW = ["DONE", "NOT_YET"] as const;
export type Dataflow = (typeof DATAFLOW)[number];
export const DATAFLOW_LABELS: Record<Dataflow, string> = {
  DONE: "Done",
  NOT_YET: "Not yet",
};

export const PROMETRIC = ["PASSED", "NOT_YET"] as const;
export type Prometric = (typeof PROMETRIC)[number];
export const PROMETRIC_LABELS: Record<Prometric, string> = {
  PASSED: "Passed",
  NOT_YET: "Not yet",
};

/** Social networks the footer may link (plan §13). */
export const SOCIAL_NETWORKS = ["INSTAGRAM", "FACEBOOK", "LINKEDIN", "X", "YOUTUBE"] as const;
export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];
export const SOCIAL_NETWORK_LABELS: Record<SocialNetwork, string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  LINKEDIN: "LinkedIn",
  X: "X",
  YOUTUBE: "YouTube",
};

/** Where an enquiry stands in the inbox (plan §10.5). */
export const ENQUIRY_STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];
export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  NEW: "New",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
};

/** Where an application stands in the inbox (plan §9.5). */
export const APPLICATION_STATUSES = ["NEW", "IN_REVIEW", "SHORTLISTED", "CLOSED"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  NEW: "New",
  IN_REVIEW: "In review",
  SHORTLISTED: "Shortlisted",
  CLOSED: "Closed",
};

/** Whether a submission's alert email went; one not sent shows in the inbox with Retry (plan §9.3, §10.4). */
export const EMAIL_STATUSES = ["PENDING", "SENT", "NOT_SENT"] as const;
export type EmailStatus = (typeof EMAIL_STATUSES)[number];
export const EMAIL_STATUS_LABELS: Record<EmailStatus, string> = {
  PENDING: "Sending",
  SENT: "Sent",
  NOT_SENT: "Not sent",
};

/** Where an application's CV is (plan §9.3, §9.4): saved after the row, kept until it expires. */
export const CV_STATUSES = ["PENDING", "STORED", "NOT_STORED", "EXPIRED"] as const;
export type CvStatus = (typeof CV_STATUSES)[number];
export const CV_STATUS_LABELS: Record<CvStatus, string> = {
  PENDING: "Saving",
  STORED: "Kept",
  NOT_STORED: "Not stored",
  EXPIRED: "Expired",
};
