import { defineConfig } from "@playwright/test";

import journeys from "./playwright.config";

const server = Array.isArray(journeys.webServer) ? journeys.webServer[0] : journeys.webServer;

/** Detailed attribute mismatches are only reported by React's development build (D180). */
export default defineConfig({
  ...journeys,
  globalSetup: "./tests/e2e/hydration-setup.ts",
  testMatch: "hydration.spec.ts",
  grep: /public hydration/,
  outputDir: "test-results/hydration-development",
  use: { ...journeys.use, baseURL: "http://localhost:3000" },
  webServer: {
    ...server,
    command: "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3000",
    url: "http://localhost:3000/robots.txt",
    env: {
      ...server?.env,
      PORT: "3000",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    },
  },
});
