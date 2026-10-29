import { cache } from "react";

import { SITE_DOCUMENT_KEY } from "@/constants/sections";
import { readDocument } from "@/lib/content/documents";
import type { ContentView } from "@/lib/content/view";
import type { SiteDocument } from "@/lib/validation";

/**
 * The site's published content (plan §13): contact details, links, SEO
 * defaults, the brochure; the draft in the admin's preview. Read once a request.
 */
export const getPublishedSite = cache((view: ContentView = "published"): Promise<SiteDocument | null> =>
  readDocument<SiteDocument>(SITE_DOCUMENT_KEY, view),
);
