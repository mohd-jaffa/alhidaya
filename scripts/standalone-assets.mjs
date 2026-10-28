// The standalone server serves `public/` and `.next/static` only when they sit
// beside it (Next's output docs), so every build copies them in: the journeys
// run the folder exactly as Passenger will on the client's server (plan §35.3).
import fs from "node:fs";

const STANDALONE = ".next/standalone";

if (!fs.existsSync(STANDALONE)) {
  console.error(`${STANDALONE} is missing: run next build with output "standalone" first.`);
  process.exit(1);
}

// `public/` may be empty, and git keeps no empty folder.
if (fs.existsSync("public")) fs.cpSync("public", `${STANDALONE}/public`, { recursive: true });
fs.cpSync(".next/static", `${STANDALONE}/.next/static`, { recursive: true });
console.log("Copied public/ and .next/static into the standalone build.");
