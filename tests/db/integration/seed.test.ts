import { eq, inArray, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { closeDb, getDb } from "@/db/client";
import { auditLog, documents, media, records } from "@/db/schema";
import { SEED_CLIENTS } from "@/db/seed/clients";
import { SEED_SERVICES } from "@/db/seed/content";
import { SEED_PHOTOS } from "@/db/seed/photos";
import { importSeedPhotos, seedContent } from "@/db/seed/seed";
import { deleteMediaFile } from "@/lib/storage/media";
import { readDocumentDraft, readPublishedDocument, saveDocumentDraft } from "@/lib/content/documents";
import { listPublishedRecords, listRecordsForAdmin } from "@/lib/content/records";
import type { ClientDocument, PageDocument, ServiceDocument } from "@/lib/validation";
import { pageFixture } from "@tests/support/fixtures/content";

const REQUEST = `req_seed_${crypto.randomUUID()}`;
const actor = { adminId: null, requestId: REQUEST };

// The seed's images: its photographs and the current site's client logos (D118).
const IMAGES = [...Object.values(SEED_PHOTOS), ...SEED_CLIENTS.map((client) => ({ ...client, alt: client.name }))];
const SOURCES = IMAGES.map((image) => image.source.url);
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
          "TYPOGRAPHY",
          "ORDER:SERVICES",
          "ORDER:CLIENTS",
        ],
        services: 8,
        jobs: 1,
        clients: SEED_CLIENTS.length,
        photos: IMAGES.length,
      });
      expect(await readDocumentDraft("PAGE:TERMS")).toMatchObject({ draft: own });

      const services = await listRecordsForAdmin<ServiceDocument>("SERVICES");
      const order = await readDocumentDraft<string[]>("ORDER:SERVICES");
      const slugs = order?.draft.map((id) => services.find((service) => service.id === id)?.draft.slug);
      expect(slugs).toEqual(SEED_SERVICES.map((service) => service.slug));
      expect(await listRecordsForAdmin("JOBS")).toEqual([
        expect.objectContaining({ published: null, draft: expect.objectContaining({ postedOn: "2026-10-29" }) }),
      ]);

      // Every image is in the library, each kept with its words and where it came from.
      const photos = await seedPhotoRows();
      expect(photos.map((row) => [row.alt?.en, row.source]).toSorted()).toEqual(
        IMAGES.map((image) => [image.alt, image.source]).toSorted(),
      );
      expect(photos.every((row) => row.variants.length > 0)).toBe(true);
      const home = (await readDocumentDraft<PageDocument>("PAGE:HOME"))?.draft;
      const sign = home?.sections[0];
      // Home's first slide shows the current site's first slide photograph (D128).
      const hero = photos.find((row) => row.source?.url === SEED_PHOTOS.currentHomeVisit.source.url);
      expect(sign?.type === "SIGN" ? sign.content.slides[0].image : null).toEqual({ mediaId: hero?.id });
      // Each service shows the current site's own photograph (D102, D118).
      const elderly = photos.find((row) => row.source?.url === SEED_PHOTOS.currentHelpingUp.source.url);
      expect(services.find((service) => service.draft.slug === "elderly-care")?.draft.image).toEqual({
        mediaId: elderly?.id,
      });
      expect(services.every((service) => service.draft.image !== null)).toBe(true);

      // The current site's client logos, as drafts in its order, each with its logo (D118).
      const clients = await listRecordsForAdmin<ClientDocument>("CLIENTS");
      const clientOrder = (await readDocumentDraft<string[]>("ORDER:CLIENTS"))?.draft;
      const named = clientOrder?.map((id) => clients.find((client) => client.id === id)?.draft);
      expect(named?.map((client) => client?.name.en)).toEqual(SEED_CLIENTS.map((client) => client.name));
      const logo = photos.find((row) => row.source?.url === SEED_CLIENTS[0].source.url);
      expect(named?.[0]?.logo).toEqual({ mediaId: logo?.id });
      expect(await listPublishedRecords("CLIENTS")).toEqual([]);

      expect(await readPublishedDocument("PAGE:HOME")).toBeNull();
      expect(await readPublishedDocument("SITE")).toBeNull();
      expect(await listPublishedRecords("SERVICES")).toEqual([]);
    },
  );

  it("writes nothing the second time", async () => {
    expect(await seedContent(actor)).toEqual({ documents: [], services: 0, jobs: 0, clients: 0, photos: 0 });
    expect(await listRecordsForAdmin("SERVICES")).toHaveLength(8);
  });

  it("writes the client logos again once there are none, their images found in the library", async () => {
    await getDb().delete(records).where(eq(records.collection, "CLIENTS"));
    await getDb().delete(documents).where(eq(documents.key, "ORDER:CLIENTS"));
    expect(await seedContent(actor)).toEqual({
      documents: ["ORDER:CLIENTS"],
      services: 0,
      jobs: 0,
      clients: SEED_CLIENTS.length,
      photos: 0,
    });
  });

  it("keeps each photograph once, finding it again by where it came from", async () => {
    const again = await importSeedPhotos();
    expect(again.stored).toBe(0);
    expect(Object.values(again.refs).every((ref) => ref !== null)).toBe(true);
    expect(await seedPhotoRows()).toHaveLength(IMAGES.length);
  });
});
