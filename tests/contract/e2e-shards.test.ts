import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

// scripts/e2e-shard.mjs decides which browser-journey spec files each CI shard runs (plan D207). A spec that no shard
// runs would pass CI by never being run, so the split is proved here against the files that are really there.
const ci = readFileSync(".github/workflows/ci.yml", "utf8");
const weights = JSON.parse(readFileSync("tests/e2e/shard-weights.json", "utf8")) as Record<
  string,
  Record<string, number>
>;
const specs = (readdirSync("tests/e2e", { recursive: true }) as string[])
  .map(String)
  .filter((name) => name.endsWith(".spec.ts"))
  .map((name) => `tests/e2e/${name}`)
  .sort();

const shardsOf = (project: string) =>
  [...ci.matchAll(new RegExp(`project: ${project}, shard: (\\d+), of: (\\d+)`, "g"))].map(
    (m) => [Number(m[1]), Number(m[2])] as const,
  );

function files(project: string, index: number, total: number): string[] {
  const result = spawnSync("node", ["scripts/e2e-shard.mjs", project, String(index), String(total)], {
    encoding: "utf8",
  });
  expect(result.status, result.stderr).toBe(0);
  return result.stdout.trim().split(" ");
}

describe("the E2E shards", () => {
  it.each(["phone", "desktop"])(
    "run every spec file exactly once at the %s, in every shard the workflow lists",
    (project) => {
      const shards = shardsOf(project);
      expect(shards.length).toBeGreaterThanOrEqual(4);
      const all = shards.flatMap(([index, total]) => files(project, index, total));
      expect(all.sort()).toEqual(specs);
    },
  );

  it("is the same answer every time, so every shard works from the same split", () => {
    expect(files("desktop", 3, 10)).toEqual(files("desktop", 3, 10));
  });

  it("gives a spec that is not in the weights a place all the same, so a new one is never left out", () => {
    // Today every spec is listed; the rule below holds for one that is not.
    expect(specs.filter((spec) => !(spec in weights.phone!) || !(spec in weights.desktop!))).toEqual([]);
    const result = spawnSync(
      "node",
      [
        "--input-type=module",
        "-e",
        `
      import { shardFiles } from "./scripts/e2e-shard.mjs";
      const files = ["a.spec.ts", "b.spec.ts", "new.spec.ts"];
      const weights = { "a.spec.ts": 50, "b.spec.ts": 40 };
      const placed = [1, 2].flatMap((index) => shardFiles(files, weights, index, 2));
      console.log(JSON.stringify(placed.sort()));
    `,
      ],
      { encoding: "utf8" },
    );
    expect(JSON.parse(result.stdout)).toEqual(["a.spec.ts", "b.spec.ts", "new.spec.ts"]);
  });

  it("keeps the weights honest: no stale file, and the heaviest spec shares its shard with nothing heavy", () => {
    for (const project of ["phone", "desktop"]) {
      for (const spec of Object.keys(weights[project]!)) expect(existsSync(spec), spec).toBe(true);
    }
    // The desktop's heaviest file is consistency.spec.ts; the split must not put it with another heavy one.
    const [index, total] = shardsOf("desktop").find(([shard, count]) =>
      files("desktop", shard, count).includes("tests/e2e/consistency.spec.ts"),
    ) ?? [0, 0];
    const alone = files("desktop", index, total);
    const load = alone.reduce((sum, spec) => sum + (weights.desktop![spec] ?? 10), 0);
    expect(load).toBeLessThanOrEqual(weights.desktop!["tests/e2e/consistency.spec.ts"]! + 10);
  });

  it("refuses an empty shard or a shard that does not exist, never printing nothing", () => {
    // 500 shards for about 40 files: the last cannot hold a file, and printing nothing would run every test.
    const last = spawnSync("node", ["scripts/e2e-shard.mjs", "desktop", "500", "500"], { encoding: "utf8" });
    expect(last.status).toBe(1);
    expect(last.stdout).toBe("");
    expect(last.stderr).toContain("refusing to print nothing");
    const wrong = spawnSync("node", ["scripts/e2e-shard.mjs", "desktop", "11", "10"], { encoding: "utf8" });
    expect(wrong.status).toBe(2);
    expect(wrong.stdout).toBe("");
  });
});
