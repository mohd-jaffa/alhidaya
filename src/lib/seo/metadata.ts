import { publicSiteUrl } from "@/lib/env/public";

/** The site's own address, which every canonical and share address is made from (plan §19); none if it is not set. */
export function siteMetadataBase(): URL | undefined {
  const url = publicSiteUrl();
  return url ? new URL(url) : undefined;
}
