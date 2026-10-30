import { sql } from "drizzle-orm";
import { check, index, json, mysqlTable, tinyint, varchar } from "drizzle-orm/mysql-core";

import { MAIL_RETRIES, TEXT_LIMITS } from "@/constants/limits";
import { EMAIL_STATUSES, ENQUIRY_STATUSES, FORM_KINDS } from "@/constants/statuses";

import { authUser } from "./auth";
import { id, idRef, instant, oneOf, timestamps } from "./columns";

/**
 * One answer as the visitor saw and gave it: the field's label at the time,
 * so a later change to a form never changes what was sent (plan §10.4).
 */
export interface SubmittedField {
  label: string;
  value: string;
}

/**
 * Quote and Contact submissions (plan §10): personal data (AGENTS.md §8),
 * deleted with their notes when the retention period passes. Name, email and
 * phone are columns for the inbox's search; every answer is in `fields`.
 */
export const enquiries = mysqlTable(
  "enquiries",
  {
    id: id(),
    form: varchar("form", { length: 8 }).notNull(),
    status: varchar("status", { length: 16 }).notNull().default("NEW"),
    name: varchar("name", { length: TEXT_LIMITS.name }).notNull(),
    email: varchar("email", { length: TEXT_LIMITS.email }).notNull(),
    phone: varchar("phone", { length: TEXT_LIMITS.phone }).notNull(),
    fields: json("fields").$type<SubmittedField[]>().notNull(),
    emailStatus: varchar("email_status", { length: 8 }).notNull().default("PENDING"),
    /** How often the mail-retry cron has sent its email again, and when it last did (D85). */
    emailRetries: tinyint("email_retries", { unsigned: true }).notNull().default(0),
    emailRetriedAt: instant("email_retried_at"),
    ...timestamps,
  },
  (table) => [
    check("enquiries_form_check", oneOf("form", FORM_KINDS)),
    check("enquiries_status_check", oneOf("status", ENQUIRY_STATUSES)),
    check("enquiries_email_status_check", oneOf("email_status", EMAIL_STATUSES)),
    check("enquiries_email_retries_check", sql.raw(`\`email_retries\` between 0 and ${MAIL_RETRIES.tries}`)),
    index("enquiries_created_at_idx").on(table.createdAt),
    index("enquiries_email_status_created_at_idx").on(table.emailStatus, table.createdAt),
    index("enquiries_status_created_at_idx").on(table.status, table.createdAt),
  ],
);

/** The team's internal notes on an enquiry (plan §10.5); they go with it. */
export const enquiryNotes = mysqlTable(
  "enquiry_notes",
  {
    id: id(),
    enquiryId: idRef("enquiry_id")
      .notNull()
      .references(() => enquiries.id, { onDelete: "cascade" }),
    body: varchar("body", { length: TEXT_LIMITS.note }).notNull(),
    createdBy: idRef("created_by").references(() => authUser.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => [index("enquiry_notes_enquiry_id_idx").on(table.enquiryId, table.createdAt)],
);
