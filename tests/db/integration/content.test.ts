import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { closeDb, getDb } from "@/db/client";
import { auditLog, documents, OPERATIONS_ID, records, siteOperations } from "@/db/schema";
import {
  discardDocumentDraft,
  publishDocument,
  readDocumentDraft,
  readPublishedDocument,
  saveDocumentDraft,
} from "@/lib/content/documents";
import { DEFAULT_OPERATIONS, getOperations, updateOperations } from "@/lib/content/operations";
import {
  createRecord,
  discardRecordDraft,
  findPublishedRecord,
  listPublishedRecords,
  listRecordsForAdmin,
  publishRecord,
  saveRecordDraft,
  setRecordArchived,
} from "@/lib/content/records";
import { pageFixture, serviceFixture } from "@tests/support/fixtures/content";

const REQUEST = `req_content_${crypto.randomUUID()}`;
const actor = { adminId: null, requestId: REQUEST };

async function clearContent() {
  const db = getDb();
  await db.delete(documents);
  await db.delete(records);
  await db.delete(siteOperations);
}

const actions = async () =>
  (await getDb().select({ action: auditLog.action }).from(auditLog).where(eq(auditLog.requestId, REQUEST))).map(
    (row) => row.action,
  );

beforeAll(clearContent);

afterAll(async () => {
  await clearContent();
  await getDb().delete(auditLog).where(eq(auditLog.requestId, REQUEST));
  await closeDb();
});

describe("documents, against the local MySQL", () => {
  it("keep a saved draft from the public until it is published", async () => {
    const first = pageFixture("HOME");
    expect(await readPublishedDocument("PAGE:HOME")).toBeNull();
    expect(await readDocumentDraft("PAGE:HOME")).toBeNull();

    await saveDocumentDraft("PAGE:HOME", first, actor);
    expect(await readPublishedDocument("PAGE:HOME")).toBeNull();
    expect(await readDocumentDraft("PAGE:HOME")).toMatchObject({
      draft: first,
      published: null,
      publishedAt: null,
      unpublishedChanges: true,
    });

    const at = await publishDocument("PAGE:HOME", actor);
    expect(await readPublishedDocument("PAGE:HOME")).toEqual(first);
    expect(await readDocumentDraft("PAGE:HOME")).toMatchObject({ publishedAt: at, unpublishedChanges: false });
  });

  it("show the published copy while the next draft is worked on, and throw that draft away on request", async () => {
    const published = await readPublishedDocument("PAGE:HOME");
    await saveDocumentDraft("PAGE:HOME", pageFixture("HOME"), actor);
    expect(await readPublishedDocument("PAGE:HOME")).toEqual(published);
    expect(await readDocumentDraft("PAGE:HOME")).toMatchObject({ unpublishedChanges: true });

    await discardDocumentDraft("PAGE:HOME", actor);
    expect(await readDocumentDraft("PAGE:HOME")).toMatchObject({ draft: published, unpublishedChanges: false });
  });

  it("refuse to publish what does not exist, or to discard a draft with nothing published behind it", async () => {
    await expect(publishDocument("PAGE:ABOUT", actor)).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
    await saveDocumentDraft("PAGE:ABOUT", pageFixture("ABOUT"), actor);
    await expect(discardDocumentDraft("PAGE:ABOUT", actor)).rejects.toMatchObject({ code: "NOTHING_PUBLISHED" });
  });

  it("refuse a key the code does not know", async () => {
    await expect(saveDocumentDraft("PAGE:BLOG" as never, {}, actor)).rejects.toThrow();
  });

  it("record every change in the audit trail", async () => {
    expect(await actions()).toEqual(expect.arrayContaining(["UPDATE", "PUBLISH", "DISCARD_DRAFT"]));
  });

  it("persists placement coordinates in draft/published JSON without leaking or losing them on discard", async () => {
    const first = pageFixture("PRIVACY");
    const sign = first.sections.find((section) => section.type === "SIGN")!;
    sign.content.image = { mediaId: crypto.randomUUID(), focalPoint: { x: 10, y: 90 } };
    await saveDocumentDraft("PAGE:PRIVACY", first, actor);
    await publishDocument("PAGE:PRIVACY", actor);
    const next = structuredClone(first);
    const nextSign = next.sections.find((section) => section.type === "SIGN")!;
    nextSign.content.image!.focalPoint = { x: 80, y: 20 };
    await saveDocumentDraft("PAGE:PRIVACY", next, actor);
    expect(await readPublishedDocument("PAGE:PRIVACY")).toEqual(first);
    expect((await readDocumentDraft("PAGE:PRIVACY"))?.draft).toEqual(next);
    await discardDocumentDraft("PAGE:PRIVACY", actor);
    expect((await readDocumentDraft("PAGE:PRIVACY"))?.draft).toEqual(first);
  });
});

describe("records, against the local MySQL", () => {
  it("show nothing until a record is published, then only the published copy", async () => {
    const id = await createRecord("SERVICES", serviceFixture(), actor);
    expect(await listPublishedRecords("SERVICES")).toEqual([]);
    expect(await listRecordsForAdmin("SERVICES")).toEqual([
      expect.objectContaining({ id, published: null, unpublishedChanges: true }),
    ]);

    await publishRecord("SERVICES", id, "home-nursing-care", actor);
    await saveRecordDraft("SERVICES", id, serviceFixture({ summary: { en: "A new summary." } }), actor);

    const [published] = await listPublishedRecords("SERVICES");
    expect(published).toMatchObject({ id, slug: "home-nursing-care", published: serviceFixture() });
    expect(await findPublishedRecord("SERVICES", "home-nursing-care")).toEqual({ record: published });
    expect(await findPublishedRecord("JOBS", "home-nursing-care")).toBeNull();

    const [admin] = await listRecordsForAdmin("SERVICES");
    expect(admin).toMatchObject({ id, unpublishedChanges: true, draft: { summary: { en: "A new summary." } } });

    await discardRecordDraft("SERVICES", id, actor);
    const [discarded] = await listRecordsForAdmin("SERVICES");
    expect(discarded).toMatchObject({ unpublishedChanges: false, draft: serviceFixture() });
  });

  it("keep an old web address answering with where the record moved", async () => {
    const id = await createRecord("SERVICES", serviceFixture({ slug: "elderly-care" }), actor);
    await publishRecord("SERVICES", id, "elderly-care", actor);
    await publishRecord("SERVICES", id, "elderly-care", actor);
    await publishRecord("SERVICES", id, "elder-care", actor);
    expect(await findPublishedRecord("SERVICES", "elderly-care")).toEqual({ movedTo: "elder-care" });

    await publishRecord("SERVICES", id, "senior-care", actor);
    await publishRecord("SERVICES", id, "elderly-care", actor);
    const [row] = await getDb()
      .select({ slug: records.slug, previousSlugs: records.previousSlugs })
      .from(records)
      .where(eq(records.id, id));
    expect(row).toEqual({ slug: "elderly-care", previousSlugs: ["elder-care", "senior-care"] });
    expect(await findPublishedRecord("SERVICES", "never-used")).toBeNull();
  });

  it("refuse a slug another record of the collection has, and a slug too long for its column", async () => {
    const id = await createRecord("SERVICES", serviceFixture(), actor);
    await expect(publishRecord("SERVICES", id, "home-nursing-care", actor)).rejects.toMatchObject({
      code: "SLUG_TAKEN",
      httpStatus: 409,
    });
    await expect(publishRecord("SERVICES", id, "a".repeat(81), actor)).rejects.toMatchObject({ kind: "VALIDATION" });
    expect(await listPublishedRecords("SERVICES")).toHaveLength(2);
  });

  it("refuse records that do not exist, or that belong to another collection", async () => {
    const missing = crypto.randomUUID();
    const [service] = await listPublishedRecords("SERVICES");
    await expect(saveRecordDraft("SERVICES", missing, {}, actor)).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
    await expect(publishRecord("JOBS", service.id, "x", actor)).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
    await expect(setRecordArchived("SERVICES", missing, true, actor)).rejects.toMatchObject({
      code: "RECORD_NOT_FOUND",
    });
    const draftOnly = await createRecord("JOBS", {}, actor);
    await expect(discardRecordDraft("JOBS", draftOnly, actor)).rejects.toMatchObject({ code: "NOTHING_PUBLISHED" });
  });

  it("take an archived record off the site without losing it, and put it back", async () => {
    const id = await createRecord("CLIENTS", { name: { en: "A client" } }, actor);
    await publishRecord("CLIENTS", id, null, actor);
    await setRecordArchived("CLIENTS", id, true, actor);
    expect(await listPublishedRecords("CLIENTS")).toEqual([]);
    expect(await listRecordsForAdmin("CLIENTS")).toEqual([
      expect.objectContaining({ id, archivedAt: expect.any(Date) }),
    ]);

    await setRecordArchived("CLIENTS", id, false, actor);
    expect(await listPublishedRecords("CLIENTS")).toEqual([expect.objectContaining({ id, slug: null })]);
    expect(await actions()).toEqual(expect.arrayContaining(["CREATE", "ARCHIVE"]));
  });
});

describe("operations, against the local MySQL", () => {
  it("start from the defaults, then keep what the admin set, recording what changed", async () => {
    expect(await getOperations()).toEqual(DEFAULT_OPERATIONS);

    const next = { ...DEFAULT_OPERATIONS, retentionDays: 90 };
    await updateOperations(next, actor);
    expect(await getOperations()).toEqual(next);
    await updateOperations({ ...next, cvExpiryDays: 30 }, actor);
    expect(await getOperations()).toEqual({ ...next, cvExpiryDays: 30 });

    const changes = await getDb()
      .select({ changes: auditLog.changes })
      .from(auditLog)
      .where(eq(auditLog.entityId, OPERATIONS_ID));
    expect(changes.map((row) => row.changes)).toEqual(
      expect.arrayContaining([
        { retentionDays: { from: DEFAULT_OPERATIONS.retentionDays, to: 90 } },
        { cvExpiryDays: { from: DEFAULT_OPERATIONS.cvExpiryDays, to: 30 } },
      ]),
    );
  });

  it("let the database refuse a retention outside its bounds", async () => {
    await expect(
      getDb().update(siteOperations).set({ retentionDays: 0 }).where(eq(siteOperations.id, OPERATIONS_ID)),
    ).rejects.toThrow();
    await expect(
      getDb()
        .insert(siteOperations)
        .values({ ...DEFAULT_OPERATIONS, id: "second" }),
    ).rejects.toThrow();
  });
});
