import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Two projects (plan §34, AGENTS.md §24):
 *
 *   unit         tests/ except the integration and browser suites, in jsdom
 *                (`npm test`)
 *   integration  the app's data functions against the local MySQL in Docker
 *                (`npm run services:start`; `npm run test:integration`);
 *                tests/support/local-database.ts refuses any other database
 *
 * `npm run test:coverage` runs both and fails below 100% (D26). Pages and
 * layouts are composition only and are covered by the browser journeys.
 */
const alias = {
  "@tests": path.resolve(__dirname, "./tests"),
  "@": path.resolve(__dirname, "./src"),
};

export default defineConfig({
  test: {
    alias,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/app/**/layout.tsx", "src/app/**/page.tsx", "src/instrumentation.ts"],
      thresholds: { lines: 100, branches: 100, functions: 100, statements: 100 },
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          setupFiles: ["./tests/support/setup.ts"],
          // Every test lives under tests/: unit/ mirrors src/, db/ and contract/
          // hold what belongs to no one module. src/ holds only what ships.
          include: ["tests/**/*.test.{ts,tsx}"],
          exclude: ["tests/db/integration/**", "tests/e2e/**", "**/node_modules/**"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          environment: "node",
          include: ["tests/db/integration/**/*.test.ts"],
          globalSetup: ["./tests/support/local-database.ts"],
          // Each file writes its own rows; one at a time keeps them apart.
          fileParallelism: false,
          testTimeout: 30_000,
          hookTimeout: 60_000,
        },
      },
    ],
  },
});
