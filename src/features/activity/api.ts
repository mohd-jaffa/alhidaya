import { and, count, desc, eq, inArray, notInArray, or, type SQL, sql } from "drizzle-orm";

import type { ActivityKind } from "@/constants/admin-routes";
import { ACTIVITY_PAGE_SIZE } from "@/constants/limits";
import { type OrderedCollection, type PageKey, SITE_DOCUMENT_KEY, TYPOGRAPHY_DOCUMENT_KEY } from "@/constants/sections";
import {
  AUDIT_ENTITIES,
  type AuditAction,
  type MediaKind,
  RECORD_COLLECTIONS,
  type RecordCollection,
} from "@/constants/statuses";
import { getDb } from "@/db/client";
import { applications, auditLog, authUser, enquiries, media, records } from "@/db/schema";
import type { ActivityQueryPayload } from "@/lib/validation";

/** What a change was made to, by its name where it has one (D96); an enquiry or an application never by a person's. */
export type ActivitySubject =
  | { type: "page"; page: PageKey }
  | { type: "order"; collection: OrderedCollection }
  | { type: "settings" }
  | { type: "typography" }
  | { type: "operations" }
  | { type: "record"; collection: RecordCollection; id: string; name: string | null }
  /** `kind` is null once the file is deleted. */
  | { type: "media"; kind: MediaKind | null; name: string | null }
  | { type: "enquiry" | "application"; id: string; exists: boolean }
  | { type: "account" };

/** What the nightly clean-up deleted (plan §18). */
export interface PurgeCounts {
  enquiries: number;
  applications: number;
  cvs: number;
}

/** One of the admin's changes as Activity shows it (D96): who, what and when, never a person's details. */
export interface ActivityEntry {
  id: string;
  createdAt: Date;
  /** The admin's name; null for what the site did itself, what was asked from the sign-in page, or an account since removed. */
  who: string | null;
  action: AuditAction;
  subject: ActivitySubject;
  /** The fields a change touched, by name: what changed, never what it held. */
  changed: string[];
  /** Where an enquiry or an application was moved, how its email went, or whether a job closed. */
  to: string | boolean | null;
  counts: PurgeCounts | null;
}

export interface ActivityPage {
  items: ActivityEntry[];
  total: number;
  page: number;
  pageSize: number;
}

/** The values Activity may show: each a status or a yes or no, never what a person sent. */
const SHOWN_VALUES = new Set(["status", "emailStatus", "closed", "archived"]);

const isCollection = (type: string): type is RecordCollection =>
  (RECORD_COLLECTIONS as readonly string[]).includes(type);

/** Which rows each kind holds (D96); the site's content (Settings) is a setting, its ordering content. */
const KINDS: Record<ActivityKind, () => SQL | undefined> = {
  CONTENT: () =>
    or(
      and(
        eq(auditLog.entityType, AUDIT_ENTITIES.documents),
        notInArray(auditLog.entityId, [SITE_DOCUMENT_KEY, TYPOGRAPHY_DOCUMENT_KEY]),
      ),
      inArray(auditLog.entityType, [...RECORD_COLLECTIONS, AUDIT_ENTITIES.media]),
    ),
  INBOX: () => inArray(auditLog.entityType, [AUDIT_ENTITIES.enquiry, AUDIT_ENTITIES.application]),
  SETTINGS: () =>
    or(
      and(
        eq(auditLog.entityType, AUDIT_ENTITIES.documents),
        inArray(auditLog.entityId, [SITE_DOCUMENT_KEY, TYPOGRAPHY_DOCUMENT_KEY]),
      ),
      eq(auditLog.entityType, AUDIT_ENTITIES.operations),
    ),
  SIGN_INS: () => eq(auditLog.entityType, AUDIT_ENTITIES.account),
};

type Row = {
  id: string;
  createdAt: Date;
  who: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  changes: unknown;
};

interface Names {
  records: Map<string, string | null>;
  media: Map<string, { kind: MediaKind; name: string | null }>;
  inbox: Set<string>;
}

/** The ids of one type of subject on this page, once each. */
const idsOf = (rows: Row[], matches: (type: string) => boolean) => [
  ...new Set(rows.filter((row) => matches(row.entityType) && row.entityId).map((row) => row.entityId!)),
];

/** The names of what this page's changes were made to, and which inbox items are still there: one round trip. */
async function namesOf(rows: Row[]): Promise<Names> {
  const db = getDb();
  const recordIds = idsOf(rows, isCollection);
  const mediaIds = idsOf(rows, (type) => type === AUDIT_ENTITIES.media);
  const enquiryIds = idsOf(rows, (type) => type === AUDIT_ENTITIES.enquiry);
  const applicationIds = idsOf(rows, (type) => type === AUDIT_ENTITIES.application);
  const [named, files, enquiriesLeft, applicationsLeft] = await Promise.all([
    recordIds.length > 0
      ? db
          .select({
            id: records.id,
            // A service's and a client's name, a job's title: the draft's, the latest the admin gave it.
            name: sql<string | null>`coalesce(${records.draft}->>'$.name.en', ${records.draft}->>'$.title.en')`,
          })
          .from(records)
          .where(inArray(records.id, recordIds))
      : [],
    mediaIds.length > 0
      ? db
          .select({ id: media.id, kind: media.kind, name: sql<string | null>`${media.alt}->>'$.en'` })
          .from(media)
          .where(inArray(media.id, mediaIds))
      : [],
    enquiryIds.length > 0
      ? db.select({ id: enquiries.id }).from(enquiries).where(inArray(enquiries.id, enquiryIds))
      : [],
    applicationIds.length > 0
      ? db.select({ id: applications.id }).from(applications).where(inArray(applications.id, applicationIds))
      : [],
  ]);
  return {
    records: new Map(named.map((row) => [row.id, row.name])),
    media: new Map(files.map((row) => [row.id, { kind: row.kind as MediaKind, name: row.name }])),
    inbox: new Set([...enquiriesLeft, ...applicationsLeft].map((row) => row.id)),
  };
}

function subjectOf({ entityType: type, entityId }: Row, names: Names): ActivitySubject {
  const id = entityId ?? "";
  if (type === AUDIT_ENTITIES.documents) {
    if (id === TYPOGRAPHY_DOCUMENT_KEY) return { type: "typography" };
    if (id === SITE_DOCUMENT_KEY) return { type: "settings" };
    const [prefix, key] = id.split(":");
    return prefix === "PAGE"
      ? { type: "page", page: key as PageKey }
      : { type: "order", collection: key as OrderedCollection };
  }
  if (isCollection(type)) return { type: "record", collection: type, id, name: names.records.get(id) ?? null };
  if (type === AUDIT_ENTITIES.media) {
    const file = names.media.get(id);
    return { type: "media", kind: file?.kind ?? null, name: file?.name ?? null };
  }
  if (type === AUDIT_ENTITIES.enquiry || type === AUDIT_ENTITIES.application) {
    return { type, id, exists: names.inbox.has(id) };
  }
  if (type === AUDIT_ENTITIES.operations) return { type: "operations" };
  return { type: "account" };
}

/** A row as Activity shows it: the fields it changed by name, a value only where it is a status. */
function entryOf(row: Row, names: Names): ActivityEntry {
  const changes = (row.changes ?? {}) as Record<string, unknown>;
  const changed = Object.keys(changes);
  const shown = changed.length === 1 && SHOWN_VALUES.has(changed[0]) ? changes[changed[0]] : null;
  const to = (shown as { to?: string | boolean } | null)?.to ?? null;
  const purged = row.action === "RETENTION_PURGE" ? (changes as unknown as PurgeCounts) : null;
  return {
    id: row.id,
    createdAt: row.createdAt,
    who: row.who,
    action: row.action as AuditAction,
    subject: subjectOf(row, names),
    changed: purged ? [] : changed,
    to,
    counts: purged && { enquiries: purged.enquiries, applications: purged.applications, cvs: purged.cvs },
  };
}

/**
 * Activity (D96, plan §36): the admin's changes newest first, of one kind or
 * all, a page at a time, with who made each, by name; two round trips. The
 * log keeps a year (AGENTS.md §11), so the list does too.
 */
export async function listActivity(query: ActivityQueryPayload): Promise<ActivityPage> {
  const where = query.kind ? KINDS[query.kind]() : undefined;
  const db = getDb();
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: auditLog.id,
        createdAt: auditLog.createdAt,
        who: authUser.name,
        action: auditLog.action,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
        changes: auditLog.changes,
      })
      .from(auditLog)
      .leftJoin(authUser, eq(auditLog.actorId, authUser.id))
      .where(where)
      .orderBy(desc(auditLog.createdAt), desc(auditLog.id))
      .limit(ACTIVITY_PAGE_SIZE)
      .offset((query.page - 1) * ACTIVITY_PAGE_SIZE),
    db.select({ total: count() }).from(auditLog).where(where),
  ]);
  const names = await namesOf(rows);
  return {
    items: rows.map((row) => entryOf(row, names)),
    total,
    page: query.page,
    pageSize: ACTIVITY_PAGE_SIZE,
  };
}
