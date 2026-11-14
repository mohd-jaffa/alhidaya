// Checks a release folder before it is uploaded to the client's server (plan §35.3, docs/RELEASE.md):
//
//   node scripts/check-deploy-output.mjs [--prune] <folder>      (the folder is the standalone build)
//
// A release must hold what runs the site and nothing else: no environment or key files, no source maps,
// no TypeScript source, no tests, docs, Git data or uploads. `--prune` first removes what the build or Next's file
// tracing drags in by accident (source maps, the .ts files traced from fs calls, public/media), then the check runs, so the
// folder that is uploaded is exactly the folder that passed. Exits 1 and lists every offender otherwise.
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const prune = args.includes("--prune");
const root = args.find((arg) => !arg.startsWith("--"));
if (!root || !fs.existsSync(root)) {
  console.error("Usage: node scripts/check-deploy-output.mjs [--prune] <folder>");
  process.exit(2);
}

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? [full, ...walk(full)] : [full];
  });
const rel = (file) => path.relative(root, file).split(path.sep).join("/");
const inNodeModules = (file) => rel(file).split("/").includes("node_modules");

// Never part of a release, wherever they sit.
const FORBIDDEN_NAMES = [
  [/^\.env(\..*)?$/, "an environment file"],
  [/\.(pem|key|p12|pfx)$/i, "a key or certificate"],
  [/\.map$/, "a source map"],
  [/\.(test|spec)\.[cm]?[jt]sx?$/, "a test"],
  [/^\.git(ignore|attributes|hub)?$/, "Git data"],
];
// Source: TypeScript outside node_modules (declaration files are types only, and harmless).
const isSource = (file) => /\.(ts|tsx|mts|cts)$/.test(file) && !/\.d\.[cm]?ts$/.test(file) && !inNodeModules(file);
// Whole folders that must not be in a release.
const FORBIDDEN_DIRS = [
  ".git",
  ".github",
  "tests",
  "docs",
  "coverage",
  "playwright-report",
  "test-results",
  ".impeccable",
  "backups",
  "release-content",
];

if (prune) {
  // The build itself writes public/media/.htaccess when it prepares the media folder; the server makes its own.
  fs.rmSync(path.join(root, "public", "media"), { recursive: true, force: true });
  for (const file of walk(root)) {
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) continue;
    if (file.endsWith(".map") || isSource(file)) fs.rmSync(file);
  }
}

const offences = [];
for (const file of walk(root)) {
  const name = path.basename(file);
  const stat = fs.lstatSync(file);
  if (stat.isDirectory()) {
    if (FORBIDDEN_DIRS.includes(name) && !inNodeModules(file)) offences.push(`${rel(file)}/ is a ${name} folder`);
    if (name === "media" && rel(file) === "public/media")
      offences.push("public/media is an uploads folder (uploads are never built in)");
    continue;
  }
  for (const [pattern, what] of FORBIDDEN_NAMES) {
    // Third-party packages ship their own tests and maps; only maps and secrets matter inside node_modules.
    if (
      pattern.test(name) &&
      (!inNodeModules(file) ||
        what === "a source map" ||
        what === "an environment file" ||
        what === "a key or certificate")
    ) {
      offences.push(`${rel(file)} is ${what}`);
    }
  }
  if (isSource(file)) offences.push(`${rel(file)} is TypeScript source`);
}

// What a runnable release must hold.
for (const required of ["server.js", "package.json", ".next/static", "public"]) {
  if (!fs.existsSync(path.join(root, required))) offences.push(`${required} is missing from the release`);
}

if (offences.length) {
  console.error(`The release folder is not clean (${offences.length}):`);
  for (const offence of offences.slice(0, 50)) console.error(`  ${offence}`);
  if (offences.length > 50) console.error(`  … and ${offences.length - 50} more`);
  process.exit(1);
}
console.log(
  `The release folder is clean${prune ? " (after pruning)" : ""}: no secrets, source maps, source, tests or uploads.`,
);
