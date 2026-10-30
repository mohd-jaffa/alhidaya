import { eq, inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { closeDb, getDb } from "@/db/client";
import { auditLog, documents, media, records } from "@/db/schema";
import { getPublishedServicePage, getServiceMetadata, getServiceShareImage } from "@/features/services/api";
import { publishDocument, saveDocumentDraft } from "@/lib/content/documents";
import { createRecord, publishRecord, saveRecordDraft } from "@/lib/content/records";
import { serviceFixture, siteFixture } from "@tests/support/fixtures/content";

const REQUEST = `req_service_page_${crypto.randomUUID()}`;
const actor = { adminId: null, requestId: REQUEST };
const en = <T>(value: T) => ({ en: value });
const photo = crypto.randomUUID();

async function clearContent() {
  await getDb().delete(documents);
  await getDb().delete(records);
}

async function published(draft: ReturnType<typeof serviceFixture>) {
  const id = await createRecord("SERVICES", draft, actor);
  await publishRecord("SERVICES", id, draft.slug, actor);
  return id;
}

beforeAll(async () => {
  await clearContent();
  await getDb()
    .insert(media)
    .values({
      id: photo,
      kind: "IMAGE",
      variants: [{ key: "2026-10/abcdefghij-w640.webp", width: 640, mime: "image/webp", bytes: 1 }],
      width: 1600,
      height: 1067,
      bytes: 1,
      alt: { en: "A nurse at home" },
    });
});

afterAll(async () => {
  await clearContent();
  await getDb()
    .delete(media)
    .where(inArray(media.id, [photo]));
  await getDb().delete(auditLog).where(eq(auditLog.requestId, REQUEST));
  await closeDb();
});

describe("a service's page, against the local MySQL", () => {
  it("reads the service with the site's numbers, the others for its audience only, and their photos", async () => {
    const home = await published(serviceFixture({ image: { mediaId: photo } }));
    const elderly = await published(
      serviceFixture({ name: en("Elderly care"), slug: "elderly-care", image: { mediaId: photo } }),
    );
    await published(
      serviceFixture({ name: en("School nurse staffing"), slug: "school-nurse-staffing", audience: "INSTITUTIONS" }),
    );
    await saveDocumentDraft("SITE", siteFixture(), actor);
    await publishDocument("SITE", actor);

    const page = await getPublishedServicePage("home-nursing-care");
    if (!page || "movedTo" in page) throw new Error("the service is published");
    expect(page.service.id).toBe(home);
    expect(page.related.map((service) => service.id)).toEqual([elderly]);
    expect(page.site?.contact.phone).toBe("+97431306555");
    expect(page.images.get(photo)?.alt).toBe("A nurse at home");

    const gone = crypto.randomUUID();
    await published(serviceFixture({ name: en("Palliative care"), slug: "palliative-care", image: { mediaId: gone } }));
    const photoGone = await getPublishedServicePage("palliative-care");
    expect(photoGone && "service" in photoGone ? photoGone.images.has(gone) : "missing").toBe(false);

    const staffing = await getPublishedServicePage("school-nurse-staffing");
    expect(staffing && "service" in staffing ? [staffing.related, staffing.images.size] : null).toEqual([[], 0]);
  });

  it("answers where a renamed service moved to, and nothing for an address it never had", async () => {
    const [record] = await getDb().select({ id: records.id }).from(records).where(eq(records.slug, "elderly-care"));
    await saveRecordDraft(
      "SERVICES",
      record.id,
      serviceFixture({ name: en("Elderly care"), slug: "care-for-older-people" }),
      actor,
    );
    await publishRecord("SERVICES", record.id, "care-for-older-people", actor);

    expect(await getPublishedServicePage("elderly-care")).toEqual({ movedTo: "care-for-older-people" });
    expect(await getPublishedServicePage("no-such-service")).toBeNull();
  });

  it("titles the page with the admin's SEO words, or the service's own", async () => {
    expect(await getServiceMetadata("home-nursing-care")).toMatchObject({
      title: "Home nursing care",
      description: "Qualified nurses at home.",
      alternates: { canonical: "/services/home-nursing-care" },
      openGraph: { title: "Home nursing care", url: "/services/home-nursing-care" },
    });
    const [record] = await getDb()
      .select({ id: records.id })
      .from(records)
      .where(eq(records.slug, "school-nurse-staffing"));
    await saveRecordDraft(
      "SERVICES",
      record.id,
      serviceFixture({
        name: en("School nurse staffing"),
        slug: "school-nurse-staffing",
        audience: "INSTITUTIONS",
        seo: { title: en("School nurses in Qatar"), description: en("A nurse for your school.") },
      }),
      actor,
    );
    await publishRecord("SERVICES", record.id, "school-nurse-staffing", actor);
    expect(await getServiceMetadata("school-nurse-staffing")).toMatchObject({
      title: "School nurses in Qatar",
      description: "A nurse for your school.",
    });
    expect(await getServiceMetadata("elderly-care")).toEqual({});
    expect(await getServiceMetadata("no-such-service")).toEqual({});
  });

  it("draws a service's share picture on its line's sign, and the services' own for an address it does not have", async () => {
    for (const slug of ["home-nursing-care", "school-nurse-staffing", "elderly-care", "no-such-service"]) {
      const image = await getServiceShareImage(slug);
      expect(image.headers.get("content-type"), slug).toBe("image/png");
    }
  });
});
