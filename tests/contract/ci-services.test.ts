import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const action = readFileSync(".github/actions/services/action.yml", "utf8");
const command = action.split("run: |\n")[1].replace(/^ {8}/gm, "");

describe("CI service startup", () => {
  it.each([
    { failures: 0, attempts: 1, status: 0, delays: "", services: "" },
    { failures: 2, attempts: 3, status: 0, delays: "10\n20\n", services: "" },
    { failures: 9, attempts: 3, status: 1, delays: "10\n20\n", services: "" },
    { failures: 1, attempts: 2, status: 0, delays: "10\n", services: "mysql" },
  ])(
    "bounds retries and preserves the result after $failures failures (services: '$services')",
    ({ failures, attempts, status, delays, services }) => {
      const folder = mkdtempSync(join(tmpdir(), "alhidaya-ci-services-"));
      try {
        writeFileSync(join(folder, "count"), "0");
        writeFileSync(join(folder, "delays"), "");
        writeFileSync(
          join(folder, "docker"),
          '#!/bin/sh\ncount=$(cat "$PROBE_COUNT")\ncount=$((count + 1))\necho "$count" > "$PROBE_COUNT"\necho "$*" >> "$PROBE_ARGS"\n[ "$count" -gt "$PROBE_FAILURES" ]\n',
          { mode: 0o700 },
        );
        writeFileSync(join(folder, "sleep"), '#!/bin/sh\necho "$1" >> "$PROBE_DELAYS"\n', { mode: 0o700 });
        const result = spawnSync("bash", ["-e", "-c", command], {
          env: {
            ...process.env,
            PATH: `${folder}:${process.env.PATH}`,
            PROBE_COUNT: join(folder, "count"),
            PROBE_ARGS: join(folder, "args"),
            PROBE_DELAYS: join(folder, "delays"),
            PROBE_FAILURES: String(failures),
            SERVICES: services,
          },
          encoding: "utf8",
        });
        expect(result.status).toBe(status);
        expect(Number(readFileSync(join(folder, "count"), "utf8"))).toBe(attempts);
        expect(readFileSync(join(folder, "delays"), "utf8")).toBe(delays);
        expect(readFileSync(join(folder, "args"), "utf8")).toBe(
          `compose up -d --wait${services ? ` ${services}` : ""}\n`.repeat(attempts),
        );
      } finally {
        rmSync(folder, { recursive: true });
      }
    },
  );
});
