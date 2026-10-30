import fs from "node:fs/promises";
import path from "node:path";

import { eq, inArray } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES } from "@/constants/admin-routes";
import { closeDb, getDb } from "@/db/client";
import { auditLog, documents, errorLog, media, records } from "@/db/schema";
import {
  deleteImage,
  getImageForAdmin,
  listImagesForAdmin,
  updateImageDetails,
  uploadImage,
} from "@/features/media/api";
import { saveDocumentDraft } from "@/lib/content/documents";
import { createRecord } from "@/lib/content/records";
import { getServerEnv } from "@/lib/env/server";
import { clientFixture, pageFixture, serviceFixture } from "@tests/support/fixtures/content";

const REQUEST = `req_media_admin_${crypto.randomUUID()}`;
const actor = { adminId: null, requestId: REQUEST };
const ids: string[] = [];

const jpeg = async () =>
  new Uint8Array(
    await sharp({ create: { width: 640, height: 400, channels: 3, background: "#1f6fb2" } })
      .jpeg()
      .toBuffer(),
  );
const exists = (key: string) =>
  fs.access(path.join(getServerEnv().MEDIA_DIR, key)).then(
    () => true,
    () => false,
  );
const clear = async () => {
  await getDb().delete(documents);
  await getDb().delete(records);
};

beforeAll(clear);

afterAll(async () => {
  await clear();
  await getDb().delete(media).where(inArray(media.id, ids));
  await getDb().delete(auditLog).where(eq(auditLog.requestId, REQUEST));
  await closeDb();
});

describe("the media library for the admin, against the local MySQL and the media folder (D93)", () => {
  let nurse = "";

  it("uploads an image with what it shows and where it came from, and one marked decorative", async () => {
    const source = { provider: "Pexels", url: null, licence: "Pexels License" };
    const image = await uploadImage(await jpeg(), { alt: "A nurse at home", decorative: false, source }, actor);
    nurse = image.id;
    ids.push(nurse);
    expect(image).toMatchObject({ alt: "A nurse at home", decorative: false, source, width: 640, usedIn: [] });
    expect(image.bytes).toBeGreaterThan(0);

    const pattern = await uploadImage(await jpeg(), { alt: null, decorative: true, source: null }, actor);
    ids.push(pattern.id);
    expect(pattern).toMatchObject({ alt: "", decorative: true, source: null });
    expect((await listImagesForAdmin()).map((listed) => listed.id).slice(0, 2)).toEqual([pattern.id, nurse]);
  });

  it("names every place that uses an image, drafts, published copies and archived records alike", async () => {
    const ref = { mediaId: nurse };
    const home = pageFixture("HOME");
    const [sign, ...rest] = home.sections;
    await saveDocumentDraft(
      "PAGE:HOME",
      { ...home, sections: [{ ...sign, content: { ...sign.content, image: ref } }, ...rest] },
      actor,
    );
    await saveDocumentDraft("SITE", { brochure: ref }, actor);
    await saveDocumentDraft("ORDER:SERVICES", [nurse], actor);
    const service = await createRecord("SERVICES", serviceFixture({ name: { en: "Elderly care" }, image: ref }), actor);
    const client = await createRecord("CLIENTS", clientFixture({ name: { en: "" }, logo: ref }), actor);
    const job = await createRecord("JOBS", { title: { en: "A job" }, note: ref }, actor);
    const nameless = await createRecord("JOBS", { note: ref }, actor);

    expect((await getImageForAdmin(nurse)).usedIn).toEqual(
      expect.arrayContaining([
        { label: `${ADMIN_TEXT.pages} · Home`, href: ADMIN_ROUTES.page("HOME") },
        { label: ADMIN_TEXT.settings, href: ADMIN_ROUTES.settings },
        { label: `${ADMIN_TEXT.services} · Elderly care`, href: ADMIN_ROUTES.service(service) },
        { label: `${ADMIN_TEXT.clients} · ${ADMIN_TEXT.unnamed}`, href: ADMIN_ROUTES.client(client) },
        { label: `${ADMIN_TEXT.jobs} · A job`, href: ADMIN_ROUTES.job(job) },
        { label: `${ADMIN_TEXT.jobs} · ${ADMIN_TEXT.unnamed}`, href: ADMIN_ROUTES.job(nameless) },
      ]),
    );
    expect((await getImageForAdmin(nurse)).usedIn).toHaveLength(6);
  });

  it("refuses to delete an image in use, naming each place, and keeps its files", async () => {
    await expect(deleteImage(nurse, actor)).rejects.toMatchObject({
      code: "MEDIA_IN_USE",
      details: expect.arrayContaining([{ label: ADMIN_TEXT.settings, href: ADMIN_ROUTES.settings }]),
    });
    const [row] = await getDb().select({ variants: media.variants }).from(media).where(eq(media.id, nurse));
    for (const variant of row.variants) expect(await exists(variant.key)).toBe(true);
  });

  it("changes an image's words, and every page reads them afresh", async () => {
    vi.mocked(revalidateTag).mockClear();
    const changed = await updateImageDetails(
      nurse,
      { alt: "A nurse and a patient", decorative: false, source: null },
      actor,
    );
    expect(changed).toMatchObject({ alt: "A nurse and a patient", source: null });
    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith("media", { expire: 0 });
    expect((await updateImageDetails(nurse, { alt: null, decorative: true, source: null }, actor)).alt).toBe("");
    await expect(
      updateImageDetails(crypto.randomUUID(), { alt: "x", decorative: false, source: null }, actor),
    ).rejects.toMatchObject({
      code: "RECORD_NOT_FOUND",
    });
  });

  it("deletes an image nothing uses, its files with it", async () => {
    await clear();
    const [row] = await getDb().select({ variants: media.variants }).from(media).where(eq(media.id, nurse));
    expect(await deleteImage(nurse, actor)).toEqual({ deleted: true });
    expect(await getDb().select().from(media).where(eq(media.id, nurse))).toEqual([]);
    for (const variant of row.variants) expect(await exists(variant.key)).toBe(false);
    await expect(getImageForAdmin(nurse)).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
    await expect(deleteImage(nurse, actor)).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
  });

  it("puts a file that will not go in the error log, the image gone all the same", async () => {
    const broken = crypto.randomUUID();
    ids.push(broken);
    await getDb()
      .insert(media)
      .values({
        id: broken,
        kind: "IMAGE",
        variants: [{ key: "not a key the app made", width: 480, mime: "image/webp", bytes: 1 }],
        width: 480,
        height: 300,
        bytes: 1,
        alt: { en: "Broken" },
      });
    await deleteImage(broken, actor);
    const logged = await getDb().select({ id: errorLog.id }).from(errorLog).where(eq(errorLog.reference, broken));
    expect(logged).toHaveLength(1);
    await getDb().delete(errorLog).where(eq(errorLog.reference, broken));
  });

  it("records each upload, change and delete in the audit trail", async () => {
    const rows = await getDb()
      .select({ action: auditLog.action, entityType: auditLog.entityType })
      .from(auditLog)
      .where(eq(auditLog.requestId, REQUEST));
    expect(rows.filter((row) => row.entityType === "media").map((row) => row.action)).toEqual(
      expect.arrayContaining(["CREATE", "UPDATE", "DELETE"]),
    );
  });
});
