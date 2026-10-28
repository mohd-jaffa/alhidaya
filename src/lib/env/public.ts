/**
 * What the browser may know of the environment: Next writes `NEXT_PUBLIC_*`
 * values into the page when it is built.
 */
export function publicSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "";
}

/** The site's version, which the build takes from package.json (next.config.ts). */
export function publicAppVersion(): string {
  return process.env.NEXT_PUBLIC_APP_VERSION ?? "";
}
