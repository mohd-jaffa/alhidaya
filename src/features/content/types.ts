import type { PublishedJob } from "@/features/careers/api";
import type { PublishedClient } from "@/features/clients/api";
import type { SiteImage } from "@/features/media/types";
import type { PublishedService } from "@/features/services/api";
import type { SiteDocument } from "@/lib/validation";

/** What a page's sections read besides their own content (plan §7.2), each from its published copy. */
export interface SectionData {
  site: SiteDocument | null;
  services: readonly PublishedService[];
  jobs: readonly PublishedJob[];
  clients: readonly PublishedClient[];
  images: ReadonlyMap<string, SiteImage>;
}
