import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { closeDb, getDb } from "@/db/client";
import { auditLog, documents, records } from "@/db/schema";
import { SEED_SERVICES } from "@/db/seed/content";
import { seedContent } from "@/db/seed/seed";
import { readDocumentDraft, readPublishedDocument, saveDocumentDraft } from "@/lib/content/documents";
import { listPublishedRecords, listRecordsForAdmin } from "@/lib/content/records";
import type { ServiceDocument } from "@/lib/validation";
import { pageFixture } from "@tests/support/fixtures/content";

const REQUEST = `req_seed_${crypto.randomUUID()}`;
const actor = { adminId: null, requestId: REQUEST };

async function clearContent() {
  await getDb().delete(documents);
  await getDb().delete(records);
}

beforeAll(clearContent);

afterAll(async () => {
  await clearContent();
  await getDb().delete(auditLog).where(eq(auditLog.requestId, REQUEST));
  await closeDb();
});

describe("seedContent, against the local MySQL", () => {
  it("fills what is missing as drafts, leaving a page that has one alone, and publishes nothing", async () => {
    const own = pageFixture("TERMS");
    await saveDocumentDraft("PAGE:TERMS", own, actor);

    const result = await seedContent(actor, "2026-10-29");
    expect(result).toEqual({
      documents: [
        "PAGE:HOME",
        "PAGE:ABOUT",
        "PAGE:SERVICES",
        "PAGE:CAREERS",
        "PAGE:CONTACT",
        "PAGE:QUOTE",
        "PAGE:PRIVACY",
        "SITE",
        "ORDER:SERVICES",
      ],
      services: 8,
      jobs: 1,
    });
    expect(await readDocumentDraft("PAGE:TERMS")).toMatchObject({ draft: own });

    const services = await listRecordsForAdmin<ServiceDocument>("SERVICES");
    const order = await readDocumentDraft<string[]>("ORDER:SERVICES");
    const slugs = order?.draft.map((id) => services.find((service) => service.id === id)?.draft.slug);
    expect(slugs).toEqual(SEED_SERVICES.map((service) => service.slug));
    expect(await listRecordsForAdmin("JOBS")).toEqual([
      expect.objectContaining({ published: null, draft: expect.objectContaining({ postedOn: "2026-10-29" }) }),
    ]);

    expect(await readPublishedDocument("PAGE:HOME")).toBeNull();
    expect(await readPublishedDocument("SITE")).toBeNull();
    expect(await listPublishedRecords("SERVICES")).toEqual([]);
  });

  it("writes nothing the second time", async () => {
    expect(await seedContent(actor)).toEqual({ documents: [], services: 0, jobs: 0 });
    expect(await listRecordsForAdmin("SERVICES")).toHaveLength(8);
  });
});
