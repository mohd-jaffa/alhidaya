import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { closeDb, getDb } from "@/db/client";
import { auditLog, documents, records } from "@/db/schema";
import { getPublishedPageContent } from "@/features/content/api";
import { getPublishedServicePage } from "@/features/services/api";
import { publishDocument, readDocument, saveDocumentDraft } from "@/lib/content/documents";
import {
  createRecord,
  findRecord,
  listRecords,
  publishRecord,
  saveRecordDraft,
  setRecordArchived,
} from "@/lib/content/records";
import { clientFixture, pageFixture, serviceFixture, siteFixture } from "@tests/support/fixtures/content";

const REQUEST = `req_preview_${crypto.randomUUID()}`;
const actor = { adminId: null, requestId: REQUEST };
const en = <T>(value: T) => ({ en: value });

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

describe("the admin's preview, against the local MySQL (plan §14)", () => {
  it("reads a document's draft where the public reads its published copy", async () => {
    const page = pageFixture("ABOUT");
    await saveDocumentDraft("PAGE:ABOUT", page, actor);
    await publishDocument("PAGE:ABOUT", actor);
    const sign = page.sections[0];
    const draft = {
      ...page,
      sections: [{ ...sign, content: { ...sign.content, headline: en("A new headline") } }, ...page.sections.slice(1)],
    };
    await saveDocumentDraft("PAGE:ABOUT", draft, actor);

    expect(await readDocument("PAGE:ABOUT", "published")).toEqual(page);
    expect(await readDocument("PAGE:ABOUT", "preview")).toEqual(draft);
    expect(await readDocument("PAGE:TERMS", "preview")).toBeNull();

    const preview = await getPublishedPageContent("ABOUT", "preview");
    expect(preview?.document.sections[0]).toMatchObject({ content: { headline: en("A new headline") } });
  });

  it("shows every unarchived record as its draft reads, at the draft's address, published or not", async () => {
    const live = await createRecord("SERVICES", serviceFixture(), actor);
    await publishRecord("SERVICES", live, "home-nursing-care", actor);
    await saveRecordDraft(
      "SERVICES",
      live,
      serviceFixture({ name: en("Nursing at home"), slug: "nursing-at-home" }),
      actor,
    );
    const unpublished = await createRecord(
      "SERVICES",
      serviceFixture({ name: en("Wound care"), slug: "wound-care" }),
      actor,
    );
    const archived = await createRecord("SERVICES", serviceFixture({ slug: "old-care" }), actor);
    await setRecordArchived("SERVICES", archived, true, actor);

    const published = await listRecords("SERVICES", "published");
    expect(published.map((record) => record.slug)).toEqual(["home-nursing-care"]);
    expect(published[0].publishedAt).toBeInstanceOf(Date);

    const preview = await listRecords<ReturnType<typeof serviceFixture>>("SERVICES", "preview");
    expect(preview.map((record) => [record.id, record.slug, record.published.name.en]).toSorted()).toEqual(
      [
        [live, "nursing-at-home", "Nursing at home"],
        [unpublished, "wound-care", "Wound care"],
      ].toSorted(),
    );
    expect(preview.every((record) => record.publishedAt instanceof Date)).toBe(true);

    // A client's logo has no address of its own.
    const client = await createRecord("CLIENTS", clientFixture(), actor);
    expect(await listRecords("CLIENTS", "preview")).toEqual([expect.objectContaining({ id: client, slug: null })]);

    expect(await findRecord("SERVICES", "wound-care", "published")).toBeNull();
    expect(await findRecord("SERVICES", "wound-care", "preview")).toEqual({
      record: expect.objectContaining({ id: unpublished }),
    });
    expect(await findRecord("SERVICES", "home-nursing-care", "preview")).toBeNull();
    expect(await findRecord("SERVICES", "home-nursing-care", "published")).toEqual({
      record: expect.objectContaining({ id: live, publishedAt: expect.any(Date) }),
    });
  });

  it("previews a service's page with the site's draft beside it", async () => {
    await saveDocumentDraft("SITE", siteFixture(), actor);
    const page = await getPublishedServicePage("wound-care", "preview");
    expect(page && "service" in page ? [page.service.published.name.en, page.site?.contact.phone] : null).toEqual([
      "Wound care",
      "+97431306555",
    ]);
    expect(await getPublishedServicePage("wound-care")).toBeNull();
  });
});
