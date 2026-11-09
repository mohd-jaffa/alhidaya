// The gates as CI runs them, using only the example's local test services and isolated files.
// `--fast` (the pre-push hook, D195) stops after the static, security and 100%-coverage gates; the
// browser gates (E2E, development hydration, performance) then run in CI, in parallel. The full run
// stays `npm run verify`, and is the only automatic place the performance budgets are strict.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";

if (Number(process.versions.node.split(".")[0]) !== 22) throw new Error("Verification requires Node 22.");
const sample = parseEnv(fs.readFileSync(".env.example", "utf8"));
const database = new URL(sample.TEST_DATABASE_URL);
const migrator = new URL(sample.TEST_MIGRATION_DATABASE_URL);
if (
  database.protocol !== "mysql:" ||
  !["127.0.0.1", "localhost"].includes(database.hostname) ||
  !database.pathname.endsWith("_test") ||
  !database.port ||
  migrator.protocol !== database.protocol ||
  migrator.host !== database.host ||
  migrator.pathname !== database.pathname ||
  sample.DATABASE_URL === sample.TEST_DATABASE_URL
)
  throw new Error("Verification requires the example's separate local test database.");
const env = {
  ...process.env,
  ...sample,
  CI: "true",
  DATABASE_URL: sample.TEST_DATABASE_URL,
  MIGRATION_DATABASE_URL: sample.TEST_MIGRATION_DATABASE_URL,
  MEDIA_DIR: path.resolve(".data/verify-media"),
  CV_DIR: path.resolve(".data/verify-cvs"),
};
function run(command, args) {
  console.log(`\nVerify: ${command} ${args.join(" ")}`);
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code, signal) =>
      code === 0 ? resolve() : reject(new Error(`${command} failed (${signal ?? code}).`)),
    );
  });
}
// Wait for all independent checks even if one fails; none writes the test DB.
const checks = await Promise.allSettled([
  run("npm", ["run", "lint"]),
  run("npm", ["run", "format:check"]),
  run("npm", ["run", "typecheck"]),
  run("npm", ["audit", "--audit-level=high"]),
  run("npm", ["run", "audit:shipped"]),
]);
if (checks.some((check) => check.status === "rejected")) throw new Error("An independent verification gate failed.");
await run("docker", ["compose", "up", "-d", "--wait"]);
await run("npm", ["run", "test:coverage", "--", "--maxWorkers=1"]);
if (process.argv.includes("--fast")) {
  console.log("\nFast verification gates passed. Run `npm run verify` for the browser gates; CI runs them too.");
  process.exit(0);
}
await run("npm", ["run", "build"]);
await run("npx", ["playwright", "install", "chromium"]);
// These seed the same isolated test DB, so keep them serial locally. CI isolates each job.
await run("npm", ["run", "test:e2e"]);
// Keep development hydration independent of stale incremental state from earlier edits.
fs.rmSync(".next/dev", { recursive: true, force: true });
await run("npm", ["run", "test:hydration"]);
await run("npm", ["run", "test:performance"]);
console.log("\nAll verification gates passed.");
