import { sql } from "drizzle-orm";
import { boolean, check, index, int, json, mysqlTable, smallint, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

import { CV_EXPIRY_DAYS, RETENTION_DAYS } from "@/constants/limits";
import { DOCUMENT_KEYS } from "@/constants/sections";
import { MEDIA_KINDS, RECORD_COLLECTIONS } from "@/constants/statuses";

import { authUser } from "./auth";
import { emptyList, id, idRef, instant, oneOf, timestamps } from "./columns";

const admin = (name: string) => idRef(name).references(() => authUser.id, { onDelete: "set null" });

/**
 * Keyed documents (plan D58, D60): each page with its sections in order, the
 * site's content, and each ordering. The public site reads `published` only;
 * `draft` is the admin's until Publish copies it across in one write.
 */
export const documents = mysqlTable(
  "documents",
  {
    key: varchar("key", { length: 32 }).primaryKey(),
    draft: json("draft").notNull(),
    published: json("published"),
    publishedAt: instant("published_at"),
    updatedBy: admin("updated_by"),
    ...timestamps,
  },
  () => [check("documents_key_check", oneOf("key", DOCUMENT_KEYS))],
);

/**
 * Collections (plan D60): services, jobs and client logos, each a draft and a
 * published copy. `slug` is the published one, unique within its collection;
 * a slug it had before answers with a redirect (plan §8). An archived record
 * leaves the public site but keeps its history.
 */
export const records = mysqlTable(
  "records",
  {
    id: id(),
    collection: varchar("collection", { length: 16 }).notNull(),
    slug: varchar("slug", { length: 80 }),
    previousSlugs: json("previous_slugs").$type<string[]>().notNull().$defaultFn(emptyList),
    draft: json("draft").notNull(),
    published: json("published"),
    publishedAt: instant("published_at"),
    archivedAt: instant("archived_at"),
    createdBy: admin("created_by"),
    updatedBy: admin("updated_by"),
    ...timestamps,
  },
  (table) => [
    check("records_collection_check", oneOf("collection", RECORD_COLLECTIONS)),
    uniqueIndex("records_collection_slug_unique").on(table.collection, table.slug),
    index("records_collection_archived_idx").on(table.collection, table.archivedAt),
  ],
);

/** One made size of an uploaded image, or the PDF itself (plan §15). */
export interface MediaVariant {
  key: string;
  width: number | null;
  mime: string;
  bytes: number;
}

/**
 * Uploaded files (plan §15): images in their made sizes (the original is not
 * kept), and the brochure. Alt text is required unless the image is marked
 * decorative; a stock image keeps where it came from (plan Q11).
 */
export const media = mysqlTable(
  "media",
  {
    id: id(),
    kind: varchar("kind", { length: 8 }).notNull(),
    variants: json("variants").$type<MediaVariant[]>().notNull(),
    width: int("width", { unsigned: true }),
    height: int("height", { unsigned: true }),
    bytes: int("bytes", { unsigned: true }).notNull(),
    alt: json("alt").$type<{ en: string } | null>(),
    decorative: boolean("decorative").notNull().default(false),
    source: json("source").$type<{ provider: string; url: string; licence: string } | null>(),
    createdBy: admin("created_by"),
    ...timestamps,
  },
  (table) => [check("media_kind_check", oneOf("kind", MEDIA_KINDS)), index("media_created_at_idx").on(table.createdAt)],
);

/**
 * How the site runs (plan §13): who receives each form's emails, and how long
 * enquiries, applications and CVs are kept. One row; it takes effect on save.
 */
export const siteOperations = mysqlTable(
  "site_operations",
  {
    id: varchar("id", { length: 16 }).primaryKey(),
    enquiriesTo: json("enquiries_to").$type<string[]>().notNull(),
    applicationsTo: json("applications_to").$type<string[]>().notNull(),
    retentionDays: smallint("retention_days", { unsigned: true }).notNull(),
    cvExpiryDays: smallint("cv_expiry_days", { unsigned: true }).notNull(),
    updatedBy: admin("updated_by"),
    ...timestamps,
  },
  () => [
    check("site_operations_one_row", sql`\`id\` = 'operations'`),
    check(
      "site_operations_retention_check",
      sql.raw(`\`retention_days\` between ${RETENTION_DAYS.min} and ${RETENTION_DAYS.max}`),
    ),
    check(
      "site_operations_cv_expiry_check",
      sql.raw(`\`cv_expiry_days\` between ${CV_EXPIRY_DAYS.min} and ${CV_EXPIRY_DAYS.max}`),
    ),
  ],
);

/** The one row's id. */
export const OPERATIONS_ID = "operations";
