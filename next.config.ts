import type { NextConfig } from "next";

import { version } from "./package.json";
import { OLD_SITE_REDIRECTS } from "./src/constants/redirects";

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  // Built once on GitHub and served by Passenger on the client's cPanel (plan §35.3):
  // the standalone folder runs without installing node_modules on the server.
  output: "standalone",
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
