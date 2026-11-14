// Which browser-journey spec files one CI shard runs (docs/RELEASE.md is not involved; plan D207):
//
//   node scripts/e2e-shard.mjs <project> <index> <total>      e.g. desktop 3 10
//
// Playwright's own `--shard` splits by test COUNT, so the heavy files landed together in one shard and set the
// length of the whole CI. This splits by TIME instead: every spec file goes, heaviest first, to the shard that is
// lightest so far, using the seconds measured on a CI run (tests/e2e/shard-weights.json; a file that is not listed
// counts as 10 s, so a new spec is never left out). The answer depends only on the files and the weights, so every
// shard computes the same split. It prints the files of shard <index>, one per argument, ready for `playwright test`.
// It stops with an error rather than print nothing: Playwright with no file runs EVERYTHING.
import fs from "node:fs";
import path from "node:path";

const UNLISTED_SECONDS = 10;

export function shardFiles(files, weights, index, total) {
  const bins = Array.from({ length: total }, () => ({ load: 0, files: [] }));
  const heaviestFirst = [...files].sort(
    (a, b) => (weights[b] ?? UNLISTED_SECONDS) - (weights[a] ?? UNLISTED_SECONDS) || a.localeCompare(b),
  );
  for (const file of heaviestFirst) {
    const lightest = bins.reduce((best, bin) => (bin.load < best.load ? bin : best));
    lightest.load += weights[file] ?? UNLISTED_SECONDS;
    lightest.files.push(file);
  }
  return bins[index - 1].files.sort();
}

function specFiles(folder) {
  return fs
    .readdirSync(folder, { recursive: true })
    .filter((name) => String(name).endsWith(".spec.ts"))
    .map((name) => path.join(folder, String(name)).split(path.sep).join("/"))
    .sort();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [project, indexText, totalText] = process.argv.slice(2);
  const index = Number(indexText);
  const total = Number(totalText);
  const table = JSON.parse(fs.readFileSync("tests/e2e/shard-weights.json", "utf8"));
  if (!table[project] || !Number.isInteger(index) || !Number.isInteger(total) || index < 1 || index > total) {
    console.error("Usage: node scripts/e2e-shard.mjs <phone|desktop> <index> <total>");
    process.exit(2);
  }
  const files = shardFiles(specFiles("tests/e2e"), table[project], index, total);
  if (files.length === 0) {
    console.error(
      `Shard ${index} of ${total} has no spec file: refusing to print nothing (Playwright would run everything).`,
    );
    process.exit(1);
  }
  console.log(files.join(" "));
}
