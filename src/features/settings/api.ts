import { SITE_DOCUMENT_KEY } from "@/constants/sections";
import { readPublishedDocument } from "@/lib/content/documents";
import type { SiteDocument } from "@/lib/validation";

/** The site's published content (plan §13): contact details, links, SEO defaults, the brochure. */
export function getPublishedSite(): Promise<SiteDocument | null> {
  return readPublishedDocument<SiteDocument>(SITE_DOCUMENT_KEY);
}
