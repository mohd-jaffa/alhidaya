import { closeDb } from "@/db/client";
import { publishSeed } from "@tests/support/published-seed";
import prepareLocalDatabase from "@tests/support/local-database";

/** Before the journeys: the local test database migrated, then the site published as at launch. */
export default async function globalSetup(): Promise<void> {
  await prepareLocalDatabase();
  try {
    await publishSeed();
  } finally {
    await closeDb();
  }
}
