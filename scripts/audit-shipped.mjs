// What ships may carry no known vulnerability at moderate or above (plan D55).
//
// "What ships" is every package the app can load at runtime: its production
// dependencies and, through the lockfile, everything they need, wherever the
// bundler puts it (Turbopack compiles most packages into its own server
// chunks, so the build's node_modules does not list them). Development tools
// are left out, and so are optional peers nothing in that set installs as a
// dependency: Better Auth names drizzle-kit as one, which drags the migration
// tool (and its old esbuild) into npm's own production view although it never
// reaches the server.
//
//   node scripts/audit-shipped.mjs                     npm audit, now
//   node scripts/audit-shipped.mjs --report <file>     a saved `npm audit --json`
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { parseArgs } from "node:util";

const BLOCKING = new Set(["moderate", "high", "critical"]);
const { values } = parseArgs({ options: { report: { type: "string" } } });

/** The packages reachable at runtime, by name, walked through the lockfile as Node resolves them. */
function runtimeClosure() {
  const { packages } = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
  const resolve = (from, name) => {
    for (let dir = from; ; dir = dir.slice(0, Math.max(0, dir.lastIndexOf("/node_modules/")))) {
      const candidate = `${dir ? `${dir}/` : ""}node_modules/${name}`;
      if (packages[candidate]) return candidate;
      if (!dir) return undefined;
    }
  };
  const seen = new Set();
  const names = new Set();
  const visit = (path) => {
    if (!path || seen.has(path)) return;
    seen.add(path);
    const entry = packages[path];
    names.add(path.slice(path.lastIndexOf("node_modules/") + "node_modules/".length));
    const optionalPeers = entry.peerDependenciesMeta ?? {};
    const needs = [
      ...Object.keys(entry.dependencies ?? {}),
      ...Object.keys(entry.optionalDependencies ?? {}),
      ...Object.keys(entry.peerDependencies ?? {}).filter((name) => !optionalPeers[name]?.optional),
    ];
    for (const name of needs) visit(resolve(path, name));
  };
  for (const name of Object.keys(packages[""].dependencies ?? {})) visit(resolve("", name));
  return names;
}

function auditReport() {
  if (values.report) return fs.readFileSync(values.report, "utf8");
  try {
    return execFileSync("npm", ["audit", "--json"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch (failure) {
    // npm audit exits non-zero when it finds anything; its report is still on stdout.
    return failure.stdout;
  }
}

const shipped = runtimeClosure();
const vulnerabilities = JSON.parse(auditReport()).vulnerabilities ?? {};
const blocking = Object.entries(vulnerabilities).filter(
  ([name, finding]) => BLOCKING.has(finding.severity) && shipped.has(name),
);

for (const [name, finding] of blocking) console.error(`Ships with a ${finding.severity} vulnerability: ${name}`);
if (blocking.length > 0) process.exit(1);
console.log(`No known vulnerability at moderate or above in the ${shipped.size} packages that ship.`);
