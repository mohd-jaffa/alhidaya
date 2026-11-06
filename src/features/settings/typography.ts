import { cache } from "react";

import { TYPOGRAPHY_DOCUMENT_KEY } from "@/constants/sections";
import { DEFAULT_TYPOGRAPHY } from "@/constants/typography";
import type { Actor } from "@/lib/content/actor";
import { publishedTags, revalidateContent } from "@/lib/content/cache";
import {
  discardDocumentDraft,
  publishDocument,
  readDocument,
  readDocumentDraft,
  saveDocumentDraft,
} from "@/lib/content/documents";
import type { ContentView } from "@/lib/content/view";
import { notFoundError } from "@/lib/errors";
import { typographySchema, type TypographyPayload } from "@/lib/validation/schemas/typography";

/** Cached published content only; draft reads are confined to authenticated draft mode. */
export const getPublishedTypography = cache(
  async (view: ContentView = "published"): Promise<TypographyPayload> =>
    (await readDocument<TypographyPayload>(TYPOGRAPHY_DOCUMENT_KEY, view)) ?? DEFAULT_TYPOGRAPHY,
);

export interface TypographyDraft {
  draft: TypographyPayload;
  publishedAt: Date | null;
  unpublishedChanges: boolean;
}

export async function getTypographyForAdmin(): Promise<TypographyDraft> {
  const item = await readDocumentDraft<TypographyPayload>(TYPOGRAPHY_DOCUMENT_KEY);
  if (!item) throw notFoundError("RECORD_NOT_FOUND");
  return { draft: item.draft, publishedAt: item.publishedAt, unpublishedChanges: item.unpublishedChanges };
}

export async function saveTypographyDraft(draft: TypographyPayload, actor: Actor): Promise<TypographyDraft> {
  await saveDocumentDraft(TYPOGRAPHY_DOCUMENT_KEY, draft, actor);
  return getTypographyForAdmin();
}

/** Independent from SITE: publishing fonts cannot publish a pending Settings edit. */
export async function publishTypography(actor: Actor): Promise<TypographyDraft> {
  await publishDocument(TYPOGRAPHY_DOCUMENT_KEY, actor, (draft) => typographySchema.parse(draft));
  revalidateContent(publishedTags({ document: TYPOGRAPHY_DOCUMENT_KEY }));
  return getTypographyForAdmin();
}

export async function discardTypographyDraft(actor: Actor): Promise<TypographyDraft> {
  await discardDocumentDraft(TYPOGRAPHY_DOCUMENT_KEY, actor);
  return getTypographyForAdmin();
}
