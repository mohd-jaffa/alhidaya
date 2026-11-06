import { defineConfig, devices } from "@playwright/test";

import journeys from "./playwright.config";

/** The same seeded, local-only standalone app as E2E; never a production origin. */
export default defineConfig({
  ...journeys,
  testDir: "tests/performance",
  outputDir: "test-results/performance",
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never", outputFolder: "playwright-report/performance" }]]
    : "list",
  timeout: 180_000,
  retries: 0,
  workers: 1,
  // Trace snapshots alter interaction timings under 4× CPU throttling. Lighthouse keeps its own report.
  use: { ...journeys.use, trace: "off" },
  projects: [
    {
      name: "mobile-performance",
      testMatch: "public.spec.ts",
      use: {
        ...devices["Pixel 5"],
        // Lighthouse attaches to this isolated test browser; the suite is serial.
        launchOptions: { args: ["--remote-debugging-port=9224"] },
      },
    },
    {
      name: "desktop-scroll-performance",
      testMatch: "scroll.spec.ts",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
});
