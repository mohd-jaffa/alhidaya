// Fills a local database with the current site's content, rewritten, as
// drafts for approval (plan R1.8, D6):
//
//   npm run db:seed
//
// Only what is missing is written, so the admin's work is never overwritten,
// and nothing is published. Local development only (AGENTS.md §13): it
// refuses unless the site's address is this machine's.
import { existsSync } from "node:fs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const site = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://alhidaya.qa");
if (!["localhost", "127.0.0.1"].includes(site.hostname)) {
  console.error("The seed runs only for a local site (NEXT_PUBLIC_SITE_URL on localhost). Nothing was written.");
  process.exit(1);
}

const { seedContent } = await import("../src/db/seed/seed");
const { closeDb } = await import("../src/db/client");
try {
  const { documents, services, jobs } = await seedContent();
  console.log(
    documents.length + services + jobs === 0
      ? "Nothing was missing; nothing was written."
      : `Seeded as drafts: ${documents.join(", ") || "no documents"}; ${services} services; ${jobs} job.`,
  );
} finally {
  await closeDb();
}
