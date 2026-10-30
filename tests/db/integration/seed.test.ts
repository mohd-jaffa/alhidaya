import { eq, inArray, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { closeDb, getDb } from "@/db/client";
import { auditLog, documents, media, records } from "@/db/schema";
import { SEED_SERVICES } from "@/db/seed/content";
import { SEED_PHOTOS } from "@/db/seed/photos";
import { importSeedPhotos, seedContent } from "@/db/seed/seed";
import { deleteMediaFile } from "@/lib/storage/media";
import { readDocumentDraft, readPublishedDocument, saveDocumentDraft } from "@/lib/content/documents";
import { listPublishedRecords, listRecordsForAdmin } from "@/lib/content/records";
import type { PageDocument, ServiceDocument } from "@/lib/validation";
import { pageFixture } from "@tests/support/fixtures/content";

const REQUEST = `req_seed_${crypto.randomUUID()}`;
const actor = { adminId: null, requestId: REQUEST };

const SOURCES = Object.values(SEED_PHOTOS).map((photo) => photo.source.url);
const seedPhotoRows = () =>
  getDb()
    .select({ id: media.id, variants: media.variants, alt: media.alt, source: media.source })
    .from(media)
    .where(inArray(sql`json_unquote(json_extract(${media.source}, '$.url'))`, SOURCES));

async function clearContent() {
  await getDb().delete(documents);
  await getDb().delete(records);
  // The seed's photographs too, files and rows, so each run stores them afresh.
  for (const row of await seedPhotoRows()) {
    await Promise.all(row.variants.map((variant) => deleteMediaFile(variant.key)));
    await getDb().delete(media).where(eq(media.id, row.id));
  }
}

beforeAll(clearContent);

afterAll(async () => {
  await clearContent();
  await getDb().delete(auditLog).where(eq(auditLog.requestId, REQUEST));
  await closeDb();
});

describe("seedContent, against the local MySQL", () => {
  it(
    "fills what is missing as drafts, leaving a page that has one alone, and publishes nothing",
    { timeout: 120_000 },
    async () => {
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
        photos: Object.keys(SEED_PHOTOS).length,
      });
      expect(await readDocumentDraft("PAGE:TERMS")).toMatchObject({ draft: own });

      const services = await listRecordsForAdmin<ServiceDocument>("SERVICES");
      const order = await readDocumentDraft<string[]>("ORDER:SERVICES");
      const slugs = order?.draft.map((id) => services.find((service) => service.id === id)?.draft.slug);
      expect(slugs).toEqual(SEED_SERVICES.map((service) => service.slug));
      expect(await listRecordsForAdmin("JOBS")).toEqual([
        expect.objectContaining({ published: null, draft: expect.objectContaining({ postedOn: "2026-10-29" }) }),
      ]);

      // The pages show the photographs, each kept with its words and where it came from.
      const photos = await seedPhotoRows();
      expect(photos.map((row) => row.alt?.en).toSorted()).toEqual(
        Object.values(SEED_PHOTOS)
          .map((photo) => photo.alt)
          .toSorted(),
      );
      expect(photos.every((row) => row.source?.licence === "Unsplash License" && row.variants.length > 0)).toBe(true);
      const home = (await readDocumentDraft<PageDocument>("PAGE:HOME"))?.draft;
      const sign = home?.sections[0];
      const hero = photos.find((row) => row.source?.url === SEED_PHOTOS.heroNurse.source.url);
      expect(sign?.type === "SIGN" ? sign.content.image : null).toEqual({ mediaId: hero?.id });
      // Each service shows its own photograph (D102).
      const elderly = photos.find((row) => row.source?.url === SEED_PHOTOS.elderlyCare.source.url);
      expect(services.find((service) => service.draft.slug === "elderly-care")?.draft.image).toEqual({
        mediaId: elderly?.id,
      });
      expect(services.every((service) => service.draft.image !== null)).toBe(true);

      expect(await readPublishedDocument("PAGE:HOME")).toBeNull();
      expect(await readPublishedDocument("SITE")).toBeNull();
      expect(await listPublishedRecords("SERVICES")).toEqual([]);
    },
  );

  it("writes nothing the second time", async () => {
    expect(await seedContent(actor)).toEqual({ documents: [], services: 0, jobs: 0, photos: 0 });
    expect(await listRecordsForAdmin("SERVICES")).toHaveLength(8);
  });

  it("keeps each photograph once, finding it again by where it came from", async () => {
    const again = await importSeedPhotos();
    expect(again.stored).toBe(0);
    expect(Object.values(again.refs).every((ref) => ref !== null)).toBe(true);
    expect(await seedPhotoRows()).toHaveLength(Object.keys(SEED_PHOTOS).length);
  });
});
