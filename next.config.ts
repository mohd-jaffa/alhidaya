import type { NextConfig } from "next";

import { version } from "./package.json";

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  // Built once on GitHub and served by Passenger on the client's cPanel (plan §35.3):
  // the standalone folder runs without installing node_modules on the server.
  output: "standalone",
  // Every error report can name the build it came from.
  env: { NEXT_PUBLIC_APP_VERSION: version },
};

export default nextConfig;
