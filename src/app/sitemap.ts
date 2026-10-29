import type { MetadataRoute } from "next";
import { connection } from "next/server";

import { listPublicPaths } from "@/features/content/api";
import { publicSiteUrl } from "@/lib/env/public";

/** The site's pages for search engines (plan §19), from what is published when it is asked for. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const site = publicSiteUrl();
  return (await listPublicPaths()).map(({ path, modified }) => ({
    url: `${site}${path === "/" ? "" : path}`,
    ...(modified ? { lastModified: modified } : {}),
  }));
}
