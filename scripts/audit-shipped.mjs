// What ships may carry no known vulnerability at moderate or above (plan D55).
// "What ships" is the standalone build Passenger runs on the server, not the
// whole dependency tree: a development tool that an optional peer drags into
// npm's production view (drizzle-kit, through better-auth) never reaches it.
// So this compares npm's audit with the packages actually inside the build.
// Run after `npm run build`.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SHIPPED = ".next/standalone/node_modules";
const BLOCKING = new Set(["moderate", "high", "critical"]);

if (!fs.existsSync(SHIPPED)) {
  console.error(`${SHIPPED} is missing: run npm run build first.`);
  process.exit(1);
}

/** Every package name inside the build, scoped ones included. */
function shippedPackages(dir) {
  const names = new Set();
  const walk = (folder) => {
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
      const full = path.join(folder, entry.name);
      if (entry.name.startsWith("@")) {
        walk(full);
        continue;
      }
      const manifest = path.join(full, "package.json");
      if (fs.existsSync(manifest)) {
        names.add(JSON.parse(fs.readFileSync(manifest, "utf8")).name);
        const nested = path.join(full, "node_modules");
        if (fs.existsSync(nested)) walk(nested);
      }
    }
  };
  walk(dir);
  return names;
}

function auditReport() {
  try {
    return execFileSync("npm", ["audit", "--json"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch (failure) {
    // npm audit exits non-zero when it finds anything; its report is still on stdout.
    return failure.stdout;
  }
}

const shipped = shippedPackages(SHIPPED);
const vulnerabilities = JSON.parse(auditReport()).vulnerabilities ?? {};
const blocking = Object.entries(vulnerabilities).filter(
  ([name, finding]) => BLOCKING.has(finding.severity) && shipped.has(name),
);

for (const [name, finding] of blocking) console.error(`Ships with a ${finding.severity} vulnerability: ${name}`);
if (blocking.length > 0) process.exit(1);
console.log(`No known vulnerability at moderate or above in the ${shipped.size} packages that ship.`);
