import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

// scripts/check-deploy-output.mjs stands between a build and the client's server (plan §35.3): a release holds
// what runs the site and nothing else.
const script = "scripts/check-deploy-output.mjs";
let folder: string;

function put(relative: string, content = "x"): void {
  const file = join(folder, relative);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

function run(...args: string[]): { status: number | null; output: string } {
  const result = spawnSync("node", [script, ...args, folder], { encoding: "utf8" });
  return { status: result.status, output: result.stdout + result.stderr };
}

beforeEach(() => {
  folder = mkdtempSync(join(tmpdir(), "alhidaya-release-"));
  // The smallest release that can run.
  put("server.js");
  put("package.json", "{}");
  put(".next/static/chunk.js");
  put("public/brand/logo.svg");
  put("node_modules/pkg/index.js");
});

afterEach(() => rmSync(folder, { recursive: true, force: true }));

describe("release folder check", () => {
  it("passes a clean release", () => {
    const { status, output } = run();
    expect(status).toBe(0);
    expect(output).toContain("The release folder is clean");
  });

  it.each([
    [".env", "an environment file"],
    [".env.production", "an environment file"],
    ["config/server.pem", "a key or certificate"],
    [".next/server/app/page.js.map", "a source map"],
    ["node_modules/pkg/index.js.map", "a source map"],
    ["src/lib/storage/media.ts", "TypeScript source"],
    ["app/page.tsx", "TypeScript source"],
    ["tests/unit/a.test.ts", "TypeScript source"],
    [".git/config", "a .git folder"],
    [".gitignore", "Git data"],
    ["docs/RELEASE.md", "a docs folder"],
    ["backups/2026/home.tar.gz", "a backups folder"],
    ["public/media/2026-10/photo.webp", "an uploads folder"],
  ])("refuses %s", (relative, reason) => {
    put(relative);
    const { status, output } = run();
    expect(status).toBe(1);
    expect(output).toContain(relative.split("/")[0]);
    expect(output).toContain(reason);
  });

  it("refuses a release that cannot run", () => {
    rmSync(join(folder, "server.js"));
    const { status, output } = run();
    expect(status).toBe(1);
    expect(output).toContain("server.js is missing from the release");
  });

  it("leaves a third party's own tests and type declarations alone", () => {
    put("node_modules/pkg/index.d.ts");
    put("node_modules/pkg/index.test.js");
    put("node_modules/pkg/tests/a.js");
    expect(run().status).toBe(0);
  });

  it("prunes source maps, traced source and the build's own media folder, then passes", () => {
    put(".next/server/app/page.js.map");
    put("node_modules/pkg/index.js.map");
    put("src/lib/storage/media.ts");
    put("public/media/.htaccess");
    const { status, output } = run("--prune");
    expect(status).toBe(0);
    expect(output).toContain("after pruning");
    expect(existsSync(join(folder, ".next/server/app/page.js.map"))).toBe(false);
    expect(existsSync(join(folder, "src/lib/storage/media.ts"))).toBe(false);
    expect(existsSync(join(folder, "public/media"))).toBe(false);
    expect(existsSync(join(folder, "server.js"))).toBe(true);
  });

  it("never prunes a secret away: an env file still fails the release", () => {
    put(".env.production", "SECRET=1");
    const { status } = run("--prune");
    expect(status).toBe(1);
    expect(existsSync(join(folder, ".env.production"))).toBe(true);
  });

  it("explains its usage for a folder that is not there", () => {
    const result = spawnSync("node", [script, join(folder, "missing")], { encoding: "utf8" });
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("Usage:");
  });
});
