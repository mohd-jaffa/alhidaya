import { revalidateTag, unstable_cache } from "next/cache";

import type { DocumentKey } from "@/constants/sections";
import type { RecordCollection } from "@/constants/statuses";

/**
 * How published content is cached (plan §22.1, D76): every page still renders
 * on the server per request, so it works without JavaScript and a missing
 * page answers 404, but its database reads are kept until a publish changes
 * them. Each read carries the tags of what it shows; Publish revalidates
 * exactly those, and the next visitor gets fresh content.
 */
const COLLECTION_TAGS: Record<RecordCollection, string> = { SERVICES: "services", JOBS: "jobs", CLIENTS: "clients" };
const RECORD_TAGS: Record<RecordCollection, string> = { SERVICES: "service", JOBS: "job", CLIENTS: "client" };

export const CACHE_TAGS = {
  /** A page, the site's content, or an order (an order changes its collection's lists). */
  document: (key: DocumentKey): string =>
    key === "SITE"
      ? "site"
      : key.startsWith("PAGE:")
        ? `page:${key.slice(5)}`
        : COLLECTION_TAGS[key.slice(6) as RecordCollection],
  collection: (collection: RecordCollection): string => COLLECTION_TAGS[collection],
  record: (collection: RecordCollection, slug: string): string => `${RECORD_TAGS[collection]}:${slug}`,
  media: "media",
};

/** A published read kept until one of its tags is revalidated; `key` names the read, its arguments complete it. */
export function cachedRead<A extends (string | number)[], R>(
  key: string,
  read: (...args: A) => Promise<R>,
  tags: (...args: A) => string[],
): (...args: A) => Promise<R> {
  return (...args) => unstable_cache(() => read(...args), [key, ...args.map(String)], { tags: tags(...args) })();
}

/**
 * After a publish (plan §14): the tagged reads are dropped, so the next
 * request reads afresh; stale content is never served. Called by the admin's
 * publish route, inside the app (R6).
 */
export function revalidateContent(tags: readonly string[]): void {
  for (const tag of new Set(tags)) revalidateTag(tag, { expire: 0 });
}

/** What a publish changes: the document's tag, or the collection's and the record's at each of its addresses. */
export function publishedTags(
  target: { document: DocumentKey } | { collection: RecordCollection; slugs: readonly (string | null)[] },
): string[] {
  if ("document" in target) return [CACHE_TAGS.document(target.document)];
  return [
    CACHE_TAGS.collection(target.collection),
    ...target.slugs.flatMap((slug) => (slug ? [CACHE_TAGS.record(target.collection, slug)] : [])),
  ];
}
