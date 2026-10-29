import { sql } from "drizzle-orm";
import { check, index, int, json, mysqlTable, varchar } from "drizzle-orm/mysql-core";

import { TEXT_LIMITS, UPLOAD_LIMITS } from "@/constants/limits";
import { APPLICATION_STATUSES, CV_STATUSES, EMAIL_STATUSES } from "@/constants/statuses";
import { CV_TYPES } from "@/constants/uploads";

import { authUser } from "./auth";
import { id, idRef, oneOf, timestamps } from "./columns";
import { records } from "./content";
import type { SubmittedField } from "./enquiries";

/**
 * Job applications (plan §9): personal data (AGENTS.md §8), deleted with
 * their notes and CV when the retention period passes. The row is written
 * first; the CV is saved after it in the private CV folder, so `cv_key` is
 * set and `cv_status` says whether it was (plan §9.3). The job's title is kept
 * as applied for; a general application has no job.
 */
export const applications = mysqlTable(
  "applications",
  {
    id: id(),
    jobId: idRef("job_id").references(() => records.id, { onDelete: "set null" }),
    jobTitle: varchar("job_title", { length: TEXT_LIMITS.heading }),
    status: varchar("status", { length: 16 }).notNull().default("NEW"),
    name: varchar("name", { length: TEXT_LIMITS.name }).notNull(),
    email: varchar("email", { length: TEXT_LIMITS.email }).notNull(),
    phone: varchar("phone", { length: TEXT_LIMITS.phone }).notNull(),
    fields: json("fields").$type<SubmittedField[]>().notNull(),
    cvKey: varchar("cv_key", { length: TEXT_LIMITS.fileKey }),
    cvName: varchar("cv_name", { length: TEXT_LIMITS.fileName }).notNull(),
    cvType: varchar("cv_type", { length: 8 }).notNull(),
    cvBytes: int("cv_bytes", { unsigned: true }).notNull(),
    cvStatus: varchar("cv_status", { length: 16 }).notNull().default("PENDING"),
    emailStatus: varchar("email_status", { length: 8 }).notNull().default("PENDING"),
    ...timestamps,
  },
  (table) => [
    check("applications_status_check", oneOf("status", APPLICATION_STATUSES)),
    check("applications_cv_type_check", oneOf("cv_type", CV_TYPES)),
    check("applications_cv_bytes_check", sql.raw(`\`cv_bytes\` between 1 and ${UPLOAD_LIMITS.cvBytes}`)),
    check("applications_cv_status_check", oneOf("cv_status", CV_STATUSES)),
    check("applications_email_status_check", oneOf("email_status", EMAIL_STATUSES)),
    index("applications_created_at_idx").on(table.createdAt),
    index("applications_status_created_at_idx").on(table.status, table.createdAt),
    index("applications_job_id_idx").on(table.jobId, table.createdAt),
  ],
);

/** The team's internal notes on an application (plan §9.5); they go with it. */
export const applicationNotes = mysqlTable(
  "application_notes",
  {
    id: id(),
    applicationId: idRef("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    body: varchar("body", { length: TEXT_LIMITS.note }).notNull(),
    createdBy: idRef("created_by").references(() => authUser.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => [index("application_notes_application_id_idx").on(table.applicationId, table.createdAt)],
);
