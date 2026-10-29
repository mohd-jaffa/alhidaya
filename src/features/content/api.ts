import { pageDocumentKey, type PageKey } from "@/constants/sections";
import { readPublishedDocument } from "@/lib/content/documents";
import type { PageDocument } from "@/lib/validation";

/**
 * A page as the public sees it (plan §6, §7): the published copy only, with
 * its hidden sections left out; a page never published is null.
 */
export async function getPublishedPage(page: PageKey): Promise<PageDocument | null> {
  const document = await readPublishedDocument<PageDocument>(pageDocumentKey(page));
  return document ? { ...document, sections: document.sections.filter((section) => section.visible) } : null;
}
