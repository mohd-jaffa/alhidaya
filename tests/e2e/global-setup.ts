import { rm } from "node:fs/promises";

import { closeDb } from "@/db/client";
import { publishSeed } from "@tests/support/published-seed";
import prepareLocalDatabase from "@tests/support/local-database";
import { restoreSeedImages, saveSeedImages } from "@tests/support/seed-cache";

/**
 * Before the journeys: the local test database migrated, then the site
 * published as at launch. The app keeps its cached reads on disk, across
 * restarts (plan D76); they are cleared first, so reads cached from a
 * database since reset (the integration tests reset it) never meet this one.
 * The app has read no content yet: it waits on robots.txt alone.
 */
export default async function globalSetup(): Promise<void> {
  await rm(".next/standalone/.next/cache", { recursive: true, force: true });
  await prepareLocalDatabase();
  // In CI the seed's images come from the cache when an earlier run kept them (tests/support/seed-cache.ts).
  const restored = await restoreSeedImages();
  try {
    await publishSeed();
    if (!restored) await saveSeedImages();
  } finally {
    await closeDb();
  }
}
