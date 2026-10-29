import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { auditLog, documents, records } from "@/db/schema";
import { seedContent } from "@/db/seed/seed";
import { publishDocument } from "@/lib/content/documents";
import { listRecordsForAdmin, publishRecord } from "@/lib/content/records";

const ACTOR = { adminId: null, requestId: "e2e-seed" };

/**
 * The site as it would be at launch, for the browser journeys: the seed
 * written afresh and every draft of it published. Test databases only.
 */
export async function publishSeed(): Promise<void> {
  const db = getDb();
  await db.delete(documents);
  await db.delete(records);
  await db.delete(auditLog).where(eq(auditLog.requestId, ACTOR.requestId));

  const { documents: keys } = await seedContent(ACTOR);
  for (const collection of ["SERVICES", "JOBS"] as const) {
    for (const record of await listRecordsForAdmin<{ slug: string }>(collection)) {
      await publishRecord(collection, record.id, record.draft.slug, ACTOR);
    }
  }
  for (const key of keys) await publishDocument(key, ACTOR);
}
