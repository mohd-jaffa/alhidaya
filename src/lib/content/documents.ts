import { and, eq, isNotNull, sql } from "drizzle-orm";

import type { DocumentKey } from "@/constants/sections";
import { getDb } from "@/db/client";
import { documents } from "@/db/schema";
import { logActionSafe } from "@/lib/audit/auditLog";
import { businessRuleError, notFoundError } from "@/lib/errors";

import type { Actor } from "./actor";
import { CACHE_TAGS, cachedRead } from "./cache";
import type { ContentView } from "./view";

/**
 * Keyed documents, a draft and a published copy each (plan §14, D58, D60).
 * The public site reads only `published`; the admin edits `draft`; Publish
 * copies one onto the other in a single statement, so a page is never half
 * published. Callers parse a draft with its schema before saving it.
 */

const publishedDocument = cachedRead(
  "document",
  async (key: DocumentKey) => {
    const [row] = await getDb()
      .select({ published: documents.published })
      .from(documents)
      .where(eq(documents.key, key));
    return row?.published ?? null;
  },
  (key) => [CACHE_TAGS.document(key)],
);

/** The published copy, or null: never the draft. Kept until a publish changes it (plan §22.1). */
export async function readPublishedDocument<T>(key: DocumentKey): Promise<T | null> {
  return (await publishedDocument(key)) as T | null;
}

/** What a request sees of a document (plan §14): the published copy, or in the admin's preview the draft. */
export async function readDocument<T>(key: DocumentKey, view: ContentView): Promise<T | null> {
  return view === "preview" ? ((await readDocumentDraft<T>(key))?.draft ?? null) : readPublishedDocument<T>(key);
}

export interface DraftView<T> {
  draft: T;
  published: T | null;
  publishedAt: Date | null;
  /** Whether the draft differs from what the public sees. */
  unpublishedChanges: boolean;
}

/** The admin's view: the draft, and what is published beside it. */
export async function readDocumentDraft<T>(key: DocumentKey): Promise<DraftView<T> | null> {
  const [row] = await getDb()
    .select({ draft: documents.draft, published: documents.published, publishedAt: documents.publishedAt })
    .from(documents)
    .where(eq(documents.key, key));
  if (!row) return null;
  return {
    draft: row.draft as T,
    published: row.published as T | null,
    publishedAt: row.publishedAt,
    unpublishedChanges: JSON.stringify(row.draft) !== JSON.stringify(row.published),
  };
}

/** Saves the draft; the public site is unchanged until Publish. */
export async function saveDocumentDraft(key: DocumentKey, draft: unknown, actor: Actor): Promise<void> {
  const at = new Date();
  await getDb()
    .insert(documents)
    .values({ key, draft, updatedBy: actor.adminId })
    .onDuplicateKeyUpdate({ set: { draft, updatedBy: actor.adminId, updatedAt: at } });
  await logActionSafe({
    actorId: actor.adminId,
    action: "UPDATE",
    entityType: "documents",
    entityId: key,
    requestId: actor.requestId,
  });
}

/** Publishes the draft as it is, in one statement, and answers when. */
export async function publishDocument(key: DocumentKey, actor: Actor): Promise<Date> {
  const at = new Date();
  const [result] = await getDb()
    .update(documents)
    .set({ published: sql`${documents.draft}`, publishedAt: at, updatedBy: actor.adminId, updatedAt: at })
    .where(eq(documents.key, key));
  if (result.affectedRows === 0) throw notFoundError("RECORD_NOT_FOUND");
  await logActionSafe({
    actorId: actor.adminId,
    action: "PUBLISH",
    entityType: "documents",
    entityId: key,
    requestId: actor.requestId,
  });
  return at;
}

/** Throws the draft away, back to what is published. */
export async function discardDocumentDraft(key: DocumentKey, actor: Actor): Promise<void> {
  const [result] = await getDb()
    .update(documents)
    .set({ draft: sql`${documents.published}`, updatedBy: actor.adminId, updatedAt: new Date() })
    .where(and(eq(documents.key, key), isNotNull(documents.published)));
  if (result.affectedRows === 0) throw businessRuleError("NOTHING_PUBLISHED");
  await logActionSafe({
    actorId: actor.adminId,
    action: "DISCARD_DRAFT",
    entityType: "documents",
    entityId: key,
    requestId: actor.requestId,
  });
}
