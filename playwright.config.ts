import { existsSync } from "node:fs";
import path from "node:path";

import { defineConfig, devices } from "@playwright/test";

import { LOCAL_DATABASE } from "./tests/support/local-database";

/**
 * The browser journeys (plan §34, AGENTS.md §24): the built standalone app, the
 * same folder Passenger runs on the client's server, at a phone's width and a
 * desktop's, with axe on every page.
 *
 *   npm run build && npm run test:e2e
 *
 * The app runs on its own port, and only ever against the local test
 * database, which the global setup migrates, seeds and publishes as the site
 * would be at launch: the journeys write rows of their own.
 */
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const databaseUrl = process.env.TEST_DATABASE_URL;
if (databaseUrl === undefined || !LOCAL_DATABASE.test(databaseUrl)) {
  throw new Error("The journeys run only against the local MySQL (TEST_DATABASE_URL), never a server.");
}
// The app, the global setup and the journeys all read DATABASE_URL.
process.env.DATABASE_URL = databaseUrl;
// The standalone server runs from its own folder, so the folders it shares with the global setup are absolute.
const MEDIA_DIR = path.resolve(process.env.MEDIA_DIR ?? "public/media");
const CV_DIR = path.resolve(process.env.CV_DIR ?? ".data/cvs");
Object.assign(process.env, { MEDIA_DIR, CV_DIR });

const PORT = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  // Phone first, desktop just as well (PRODUCT.md): every journey runs at both.
  projects: [
    { name: "phone", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: "node .next/standalone/server.js",
    // KIT_PREVIEW serves /kit, where the motion system and the kit are tested (plan D64).
    env: { PORT: String(PORT), HOSTNAME: "127.0.0.1", KIT_PREVIEW: "true", SERVE_MEDIA: "true", MEDIA_DIR, CV_DIR },
    // Ready once it answers what reads no content: the global setup publishes the seed after
    // this, and a page read before it would keep "nothing published" in the app's data cache.
    url: `http://localhost:${PORT}/robots.txt`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
