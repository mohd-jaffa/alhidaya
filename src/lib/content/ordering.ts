import { type OrderedCollection, orderingDocumentKey } from "@/constants/sections";
import { orderingDocumentSchema } from "@/lib/validation/schemas/site";

import type { Actor } from "./actor";
import { publishedTags, revalidateContent } from "./cache";
import { discardDocumentDraft, publishDocument, readDocumentDraft, saveDocumentDraft } from "./documents";
import { type AdminRecord, listRecordsForAdmin } from "./records";

/**
 * Records in their published order (plan D59): those the order names first, as
 * it names them; any it does not name yet after, oldest published first, so a
 * new record still shows before the order is published again.
 */
export function inOrder<T extends { id: string; publishedAt: Date }>(items: T[], order: readonly string[] | null): T[] {
  const position = new Map((order ?? []).map((id, index) => [id, index]));
  return [...items].sort((a, b) => {
    const left = position.get(a.id) ?? Number.POSITIVE_INFINITY;
    const right = position.get(b.id) ?? Number.POSITIVE_INFINITY;
    if (left !== right) return left - right;
    return a.publishedAt.getTime() - b.publishedAt.getTime() || a.id.localeCompare(b.id);
  });
}

/** Where a collection's order stands (D92): published when, and whether a new one waits. */
export interface OrderState {
  publishedAt: Date | null;
  unpublishedChanges: boolean;
}

/**
 * A collection's records for the admin in the order its draft gives (D92),
 * the archived after the rest, and where the order stands. A record not in
 * the order yet goes after those it names, as on the site (D59).
 */
export async function listInDraftOrder<T>(
  collection: OrderedCollection,
): Promise<{ records: AdminRecord<T>[]; order: OrderState }> {
  const [records, order] = await Promise.all([
    listRecordsForAdmin<T>(collection),
    readDocumentDraft<string[]>(orderingDocumentKey(collection)),
  ]);
  const ordered = inOrder(
    records.map((record) => ({ record, id: record.id, publishedAt: record.publishedAt ?? record.updatedAt })),
    order?.draft ?? null,
  ).map(({ record }) => record);
  return {
    records: [...ordered.filter((record) => !record.archivedAt), ...ordered.filter((record) => record.archivedAt)],
    order: { publishedAt: order?.publishedAt ?? null, unpublishedChanges: order?.unpublishedChanges ?? false },
  };
}

/** Saves a collection's order as a draft (D92): the ids it holds, as the admin set them; any other id is left out. */
export async function saveOrderDraft(
  collection: OrderedCollection,
  ids: readonly string[],
  actor: Actor,
): Promise<void> {
  const known = new Set((await listRecordsForAdmin(collection)).map((record) => record.id));
  await saveDocumentDraft(
    orderingDocumentKey(collection),
    ids.filter((id) => known.has(id)),
    actor,
  );
}

/** Publishes a collection's order (D92), checked as it goes live; every list of it on the site follows. */
export async function publishOrder(collection: OrderedCollection, actor: Actor): Promise<void> {
  const key = orderingDocumentKey(collection);
  await publishDocument(key, actor, (draft) => orderingDocumentSchema.parse(draft));
  revalidateContent(publishedTags({ document: key }));
}

/** Throws a collection's draft order away, back to the published one. */
export async function discardOrderDraft(collection: OrderedCollection, actor: Actor): Promise<void> {
  await discardDocumentDraft(orderingDocumentKey(collection), actor);
}
