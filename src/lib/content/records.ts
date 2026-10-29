import { and, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";

import type { RecordCollection } from "@/constants/statuses";
import { getDb } from "@/db/client";
import { records } from "@/db/schema";
import { newId } from "@/db/schema/columns";
import { logActionSafe } from "@/lib/audit/auditLog";
import { businessRuleError, conflictError, databaseErrorCode, fromDatabaseError, notFoundError } from "@/lib/errors";

import type { Actor } from "./actor";
import { CACHE_TAGS, cachedRead } from "./cache";
import type { ContentView } from "./view";

/**
 * Collection records, a draft and a published copy each (plan §14, D60):
 * services, jobs and client logos. The public site reads only published,
 * unarchived records; the admin edits drafts; Publish copies one onto the
 * other in one transaction, moving the web address when its slug changed.
 */

export interface PublishedRecord<T> {
  id: string;
  slug: string | null;
  published: T;
  publishedAt: Date;
}

const live = (collection: RecordCollection) =>
  and(eq(records.collection, collection), isNotNull(records.published), isNull(records.archivedAt));

/** A cached read answers dates as text; a record's are made dates again. */
const withDate = <T>(record: PublishedRecord<T>): PublishedRecord<T> => ({
  ...record,
  publishedAt: new Date(record.publishedAt),
});

const publishedRecords = cachedRead(
  "records",
  (collection: RecordCollection) =>
    getDb()
      .select({ id: records.id, slug: records.slug, published: records.published, publishedAt: records.publishedAt })
      .from(records)
      .where(live(collection)),
  (collection) => [CACHE_TAGS.collection(collection)],
);

/** Every published, unarchived record of a collection: never a draft. Kept until a publish changes it (plan §22.1). */
export async function listPublishedRecords<T>(collection: RecordCollection): Promise<PublishedRecord<T>[]> {
  return ((await publishedRecords(collection)) as PublishedRecord<T>[]).map(withDate);
}

/**
 * The admin's preview of a collection (plan §14): every unarchived record as
 * its draft reads, published or not, at the address the draft gives it.
 */
async function previewRecords<T>(collection: RecordCollection): Promise<PublishedRecord<T>[]> {
  const rows = await getDb()
    .select({
      id: records.id,
      slug: records.slug,
      draft: records.draft,
      publishedAt: records.publishedAt,
      updatedAt: records.updatedAt,
    })
    .from(records)
    .where(and(eq(records.collection, collection), isNull(records.archivedAt)));
  return rows.map((row) => ({
    id: row.id,
    slug: (row.draft as { slug?: string }).slug ?? row.slug,
    published: row.draft as T,
    publishedAt: row.publishedAt ?? row.updatedAt,
  }));
}

/** What a request sees of a collection (plan §14): the published records, or in the admin's preview the drafts. */
export function listRecords<T>(collection: RecordCollection, view: ContentView): Promise<PublishedRecord<T>[]> {
  return view === "preview" ? previewRecords<T>(collection) : listPublishedRecords<T>(collection);
}

/**
 * The published record at a web address, or where it moved to when the
 * address is one it had before (plan §8), or null.
 */
export async function findPublishedRecord<T>(
  collection: RecordCollection,
  slug: string,
): Promise<{ record: PublishedRecord<T> } | { movedTo: string } | null> {
  const found = (await publishedRecord(collection, slug)) as
    { record: PublishedRecord<T> } | { movedTo: string } | null;
  return found && "record" in found ? { record: withDate(found.record) } : found;
}

/**
 * What a request finds at a record's address (plan §14): the published record,
 * or where it moved to; in the admin's preview, the record whose draft has it.
 */
export async function findRecord<T>(
  collection: RecordCollection,
  slug: string,
  view: ContentView,
): Promise<{ record: PublishedRecord<T> } | { movedTo: string } | null> {
  if (view === "published") return findPublishedRecord<T>(collection, slug);
  const record = (await previewRecords<T>(collection)).find((candidate) => candidate.slug === slug);
  return record ? { record } : null;
}

const publishedRecord = cachedRead(
  "record",
  (collection: RecordCollection, slug: string) => findPublishedRecordUncached(collection, slug),
  (collection, slug) => [CACHE_TAGS.collection(collection), CACHE_TAGS.record(collection, slug)],
);

async function findPublishedRecordUncached(
  collection: RecordCollection,
  slug: string,
): Promise<{ record: PublishedRecord<unknown> } | { movedTo: string } | null> {
  const db = getDb();
  const [current] = await db
    .select({ id: records.id, slug: records.slug, published: records.published, publishedAt: records.publishedAt })
    .from(records)
    .where(and(live(collection), eq(records.slug, slug)));
  if (current) return { record: current as PublishedRecord<unknown> };

  const [moved] = await db
    .select({ slug: records.slug })
    .from(records)
    .where(and(live(collection), sql`json_contains(${records.previousSlugs}, ${JSON.stringify(slug)})`))
    .limit(1);
  return moved?.slug ? { movedTo: moved.slug } : null;
}

export interface AdminRecord<T> {
  id: string;
  slug: string | null;
  draft: T;
  published: T | null;
  publishedAt: Date | null;
  archivedAt: Date | null;
  updatedAt: Date;
  unpublishedChanges: boolean;
}

/** The admin's view of a collection: drafts, published and archived alike, newest change first. */
export async function listRecordsForAdmin<T>(collection: RecordCollection): Promise<AdminRecord<T>[]> {
  const rows = await getDb()
    .select({
      id: records.id,
      slug: records.slug,
      draft: records.draft,
      published: records.published,
      publishedAt: records.publishedAt,
      archivedAt: records.archivedAt,
      updatedAt: records.updatedAt,
    })
    .from(records)
    .where(eq(records.collection, collection))
    .orderBy(desc(records.updatedAt));
  return rows.map((row) => ({
    ...row,
    draft: row.draft as T,
    published: row.published as T | null,
    unpublishedChanges: JSON.stringify(row.draft) !== JSON.stringify(row.published),
  }));
}

/** Makes a record as a draft; nothing shows on the site until it is published. */
export async function createRecord(collection: RecordCollection, draft: unknown, actor: Actor): Promise<string> {
  const id = newId();
  await getDb().insert(records).values({ id, collection, draft, createdBy: actor.adminId, updatedBy: actor.adminId });
  await logActionSafe({
    actorId: actor.adminId,
    action: "CREATE",
    entityType: collection,
    entityId: id,
    requestId: actor.requestId,
  });
  return id;
}

/** Saves a record's draft; the public site is unchanged until Publish. */
export async function saveRecordDraft(
  collection: RecordCollection,
  id: string,
  draft: unknown,
  actor: Actor,
): Promise<void> {
  const [result] = await getDb()
    .update(records)
    .set({ draft, updatedBy: actor.adminId, updatedAt: new Date() })
    .where(and(eq(records.id, id), eq(records.collection, collection)));
  if (result.affectedRows === 0) throw notFoundError("RECORD_NOT_FOUND");
  await logActionSafe({
    actorId: actor.adminId,
    action: "UPDATE",
    entityType: collection,
    entityId: id,
    requestId: actor.requestId,
  });
}

/**
 * Publishes a record's draft under `slug` (null for client logos). When the
 * slug changes, the old one is kept so its address answers with a redirect;
 * a slug another record of the collection uses is refused.
 */
export async function publishRecord(
  collection: RecordCollection,
  id: string,
  slug: string | null,
  actor: Actor,
): Promise<Date> {
  const at = new Date();
  try {
    await getDb().transaction(async (tx) => {
      const [row] = await tx
        .select({ slug: records.slug, previousSlugs: records.previousSlugs })
        .from(records)
        .where(and(eq(records.id, id), eq(records.collection, collection)))
        .for("update");
      if (!row) throw notFoundError("RECORD_NOT_FOUND");
      const kept = row.slug && row.slug !== slug ? [...row.previousSlugs, row.slug] : row.previousSlugs;
      await tx
        .update(records)
        .set({
          published: sql`${records.draft}`,
          slug,
          previousSlugs: [...new Set(kept)].filter((previous) => previous !== slug),
          publishedAt: at,
          updatedBy: actor.adminId,
          updatedAt: at,
        })
        .where(eq(records.id, id));
    });
  } catch (error) {
    // Only the slug is unique among the columns written, so a duplicate is the slug.
    throw databaseErrorCode(error) === "ER_DUP_ENTRY" ? conflictError("SLUG_TAKEN") : fromDatabaseError(error);
  }
  await logActionSafe({
    actorId: actor.adminId,
    action: "PUBLISH",
    entityType: collection,
    entityId: id,
    requestId: actor.requestId,
  });
  return at;
}

/** Throws a record's draft away, back to what is published. */
export async function discardRecordDraft(collection: RecordCollection, id: string, actor: Actor): Promise<void> {
  const [result] = await getDb()
    .update(records)
    .set({ draft: sql`${records.published}`, updatedBy: actor.adminId, updatedAt: new Date() })
    .where(and(eq(records.id, id), eq(records.collection, collection), isNotNull(records.published)));
  if (result.affectedRows === 0) throw businessRuleError("NOTHING_PUBLISHED");
  await logActionSafe({
    actorId: actor.adminId,
    action: "DISCARD_DRAFT",
    entityType: collection,
    entityId: id,
    requestId: actor.requestId,
  });
}

/** Takes a record off the site, or puts it back; its history stays (plan §8). */
export async function setRecordArchived(
  collection: RecordCollection,
  id: string,
  archived: boolean,
  actor: Actor,
): Promise<void> {
  const at = new Date();
  const [result] = await getDb()
    .update(records)
    .set({ archivedAt: archived ? at : null, updatedBy: actor.adminId, updatedAt: at })
    .where(and(eq(records.id, id), eq(records.collection, collection)));
  if (result.affectedRows === 0) throw notFoundError("RECORD_NOT_FOUND");
  await logActionSafe({
    actorId: actor.adminId,
    action: archived ? "ARCHIVE" : "UPDATE",
    entityType: collection,
    entityId: id,
    changes: archived ? null : { archived: { from: true, to: false } },
    requestId: actor.requestId,
  });
}
