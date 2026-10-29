import type { MetadataRoute } from "next";

import { ROUTES } from "@/constants/routes";
import { publicSiteUrl } from "@/lib/env/public";

/** What search engines may read (plan §19): the public site, never the admin, the API or the kit. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: ROUTES.home, disallow: ["/admin", "/api", "/kit"] },
    sitemap: `${publicSiteUrl()}/sitemap.xml`,
  };
}
