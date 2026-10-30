import type { PublishedJob } from "@/features/careers/api";
import type { PublishedClient } from "@/features/clients/api";
import type { SiteImage } from "@/features/media/types";
import type { PublishedService } from "@/features/services/api";
import type { SiteDocument } from "@/lib/validation";

import type { PageDraft, PageState } from "./api";

/** What a page's sections read besides their own content (plan §7.2), each from its published copy. */
export interface SectionData {
  site: SiteDocument | null;
  services: readonly PublishedService[];
  jobs: readonly PublishedJob[];
  clients: readonly PublishedClient[];
  images: ReadonlyMap<string, SiteImage>;
}

/** A date as it crosses the wire: text, made a date again where it is shown. */
type Wired<T> = { [K in keyof T]: T[K] extends Date | null ? Exclude<T[K], Date> | string : T[K] };

/** A page in the admin's list (D88), as its endpoint answers it. */
export type PageStateItem = Wired<PageState>;

/** A page opened in the admin's editor, as its endpoint answers it. */
export type PageDraftItem = Wired<PageDraft>;
