import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

// Main's CI (.github/workflows/ci.yml, D207): only what protects main, sharded so it finishes well inside ten minutes.
// Read as text, like the release workflow's tests; the real timings are in the Actions list.
const ci = readFileSync(".github/workflows/ci.yml", "utf8");
const jobsSection = ci.slice(ci.indexOf("\njobs:\n"));
const e2e = jobsSection.slice(jobsSection.indexOf("\n  e2e:\n"), jobsSection.indexOf("\n  ready:\n"));

describe("main's CI", () => {
  it("runs on a push to main and on pull requests, and nothing else calls it", () => {
    const triggers = ci.slice(ci.indexOf("\non:\n"), ci.indexOf("\npermissions:"));
    expect(triggers).toMatch(/push:\n {4}branches: \[main\]\n {2}pull_request:\n/);
    expect(ci).not.toMatch(/workflow_call|inputs\./);
    expect(ci).toMatch(/^permissions:\n {2}contents: read\n/m);
  });

  it("keeps only the needed jobs: static gates, coverage at 100%, the build and the browser journeys", () => {
    const jobs = [...jobsSection.matchAll(/^ {2}([a-z][a-z0-9-]*):\n/gm)].map((match) => match[1]);
    expect(jobs).toEqual(["static", "coverage", "coverage-merge", "build", "e2e", "ready"]);
    // The report-only performance budgets and the development hydration check stay in the local `npm run verify`.
    expect(jobsSection).not.toMatch(/performance|hydration/i);
    expect(jobsSection).toContain("name: Unit and database coverage (100%)");
  });

  it("makes the one gate wait for every other job, so a job can never be forgotten", () => {
    expect(jobsSection).toContain("needs: [static, coverage, coverage-merge, build, e2e]");
    expect(jobsSection).toContain("if: always()");
  });

  it("runs every journey at the phone's width and the desktop's, in the shards it says it has", () => {
    const entries = [...e2e.matchAll(/- \{ project: (\w+), shard: (\d+), of: (\d+) \}/g)].map((match) => ({
      project: match[1],
      shard: Number(match[2]),
      of: Number(match[3]),
    }));
    for (const project of ["phone", "desktop"]) {
      const shards = entries.filter((entry) => entry.project === project);
      // Each project lists shards 1..n once, and every entry says the same n.
      expect(shards.length).toBeGreaterThanOrEqual(4);
      expect(shards.map((entry) => entry.shard)).toEqual(
        Array.from({ length: shards.length }, (_, index) => index + 1),
      );
      expect(new Set(shards.map((entry) => entry.of))).toEqual(new Set([shards.length]));
    }
    expect(entries.length).toBeLessThanOrEqual(20);
    expect(e2e).toContain("name: e2e ${{ matrix.project }} ${{ matrix.shard }}/${{ matrix.of }}");
    expect(e2e).toContain("fail-fast: false");
  });

  it("splits the shards by time with the script, never by Playwright's own count, and refuses an empty shard", () => {
    expect(e2e).toContain(
      '--project="${{ matrix.project }}" $(node scripts/e2e-shard.mjs "${{ matrix.project }}" ${{ matrix.shard }} ${{ matrix.of }})',
    );
    expect(e2e).not.toContain("--shard=");
  });

  it("caches the seed's converted images by everything that decides them, and tells the journeys where", () => {
    expect(e2e).toContain("path: .e2e-seed-cache");
    expect(e2e).toContain("E2E_SEED_CACHE: .e2e-seed-cache");
    const key = /key: e2e-seed-\$\{\{ hashFiles\(([^)]*)\) \}\}/.exec(e2e)?.[1] ?? "";
    for (const input of [
      "src/db/seed/photos/**",
      "src/features/media/**",
      "src/lib/storage/**",
      "drizzle/**",
      "package-lock.json",
    ]) {
      expect(key).toContain(input);
    }
    // The cache is in place before the journeys start.
    expect(e2e.lastIndexOf("path: .e2e-seed-cache")).toBeLessThan(e2e.indexOf("npm run test:e2e"));
  });

  it("caches Playwright's browser by its version, so a shard downloads it only when that changes", () => {
    expect(e2e).toContain('echo "version=$(npx playwright --version | cut -d\' \' -f2)" >> "$GITHUB_OUTPUT"');
    expect(e2e).toContain("path: ~/.cache/ms-playwright");
    expect(e2e).toContain("key: playwright-${{ runner.os }}-${{ steps.playwright.outputs.version }}");
    expect(e2e.indexOf("actions/cache@")).toBeLessThan(e2e.indexOf("npx playwright install"));
  });

  it("builds once and shares the build with every journey shard", () => {
    expect(e2e).toContain("needs: build");
    expect(jobsSection.match(/npm run build/g)).toHaveLength(1);
    expect(e2e).toContain("name: standalone");
  });

  it("pins every third-party action to a commit", () => {
    const uses = [...ci.matchAll(/^\s*(?:- )?uses: (\S+)/gm)].map((match) => match[1] ?? "");
    expect(uses.length).toBeGreaterThan(8);
    for (const action of uses) expect(action).toMatch(/^(\.\/\S+|[\w.-]+\/[\w.-]+@[0-9a-f]{40})$/);
  });
});
