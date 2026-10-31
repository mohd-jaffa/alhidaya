import type { NextConfig } from "next";

import { version } from "./package.json";
import { OLD_SITE_REDIRECTS } from "./src/constants/redirects";

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  // Built once on GitHub and served by Passenger on the client's cPanel (plan §35.3):
  // the standalone folder runs without installing node_modules on the server.
  output: "standalone",
  experimental: {
    // Published content is cached in memory only (D119): Next remembers a publish's revalidated tags in
    // memory alone, so a read kept on disk would come back stale after a restart (Passenger restarts an
    // idle app); in memory, a restart starts empty and reads the database afresh.
    isrFlushToDisk: false,
  },
  // The dev server serves its own files to the site's address too, not only localhost: a tunnel set as
  // NEXT_PUBLIC_SITE_URL for testers (D127). The production build ignores it.
  allowedDevOrigins: process.env.NEXT_PUBLIC_SITE_URL ? [new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname] : [],
  // Every error report can name the build it came from.
  env: { NEXT_PUBLIC_APP_VERSION: version },
  // The share pictures read the typeface from disk (plan §19), so the standalone folder carries it.
  outputFileTracingIncludes: { "/**/opengraph-image": ["./src/assets/fonts/inter-tight/share/*.woff"] },
  // The current site's addresses, moved for good (plan §5.3): 301, as the old site's links expect.
  async redirects() {
    return OLD_SITE_REDIRECTS.map((redirect) => ({ ...redirect, statusCode: 301 as const }));
  },
};

export default nextConfig;
