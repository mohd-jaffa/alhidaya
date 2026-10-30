import fs from "node:fs/promises";
import path from "node:path";

import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

import { SEED_SITE } from "@/db/seed/content";
import { closeDb, getDb } from "@/db/client";
import { auditLog, documents, errorLog, media } from "@/db/schema";
import { storeBrochure } from "@/features/media/api";
import {
  discardSiteDraft,
  getBrochureUrl,
  getSiteForAdmin,
  publishSite,
  saveSiteDraft,
  uploadBrochure,
} from "@/features/settings/api";
import { saveDocumentDraft } from "@/lib/content/documents";
import { getServerEnv } from "@/lib/env/server";

const REQUEST = `req_settings_admin_${crypto.randomUUID()}`;
const actor = { adminId: null, requestId: REQUEST };
const pdf = (words: string) => new TextEncoder().encode(`%PDF-1.7\n${words}\n%%EOF`);
const fileOf = (url: string) => path.join(getServerEnv().MEDIA_DIR, url.replace(`${getServerEnv().MEDIA_URL}/`, ""));
const exists = (file: string) =>
  fs.access(file).then(
    () => true,
    () => false,
  );

const clear = async () => {
  await getDb().delete(documents);
  await getDb().delete(media).where(eq(media.kind, "PDF"));
};

beforeAll(clear);

afterAll(async () => {
  for (const row of await getDb().select({ variants: media.variants }).from(media).where(eq(media.kind, "PDF")))
    for (const variant of row.variants) await fs.rm(path.join(getServerEnv().MEDIA_DIR, variant.key), { force: true });
  await clear();
  await getDb().delete(auditLog).where(eq(auditLog.requestId, REQUEST));
  await closeDb();
});

describe("the site's content for the admin, against the local MySQL and the media folder (D94)", () => {
  let first = { id: "", url: "" };

  it("answers 404 before the site has any content, and nothing at /brochure", async () => {
    await expect(getSiteForAdmin()).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
    expect(await getBrochureUrl()).toBeNull();
  });

  it("keeps an uploaded brochure, a PDF by its first bytes within its size, but shows it nowhere yet", async () => {
    first = await uploadBrochure(pdf("first"), actor);
    expect(first.url).toMatch(/\.pdf$/);
    expect(await exists(fileOf(first.url))).toBe(true);
    await expect(uploadBrochure(new TextEncoder().encode("<svg/>"), actor)).rejects.toMatchObject({
      code: "UPLOAD_TYPE_NOT_ALLOWED",
    });
    const huge = new Uint8Array(10 * 1024 * 1024 + 1);
    huge.set(pdf(""));
    await expect(uploadBrochure(huge, actor)).rejects.toMatchObject({ code: "UPLOAD_TOO_LARGE" });
  });

  it("removes the file it wrote when the row cannot be kept", async () => {
    const before = await fs.readdir(getServerEnv().MEDIA_DIR, { recursive: true });
    await expect(storeBrochure(pdf("orphan"), { adminId: crypto.randomUUID(), requestId: REQUEST })).rejects.toThrow();
    expect((await fs.readdir(getServerEnv().MEDIA_DIR, { recursive: true })).toSorted()).toEqual(before.toSorted());
  });

  it("saves the site's content with its brochure as a draft, refusing one the library does not hold", async () => {
    const saved = await saveSiteDraft({ ...SEED_SITE, brochure: { mediaId: first.id } }, actor);
    expect(saved).toMatchObject({ publishedAt: null, unpublishedChanges: true, brochure: { id: first.id } });
    await expect(
      saveSiteDraft({ ...SEED_SITE, brochure: { mediaId: crypto.randomUUID() } }, actor),
    ).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
    expect(await getBrochureUrl()).toBeNull();
  });

  it("publishes it: every page reads it afresh, and /brochure opens the brochure", async () => {
    vi.mocked(revalidateTag).mockClear();
    expect(await publishSite(actor)).toMatchObject({ unpublishedChanges: false, publishedAt: expect.any(Date) });
    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith("site", { expire: 0 });
    expect(await getBrochureUrl()).toBe(first.url);
  });

  it("deletes a brochure no copy names once a new one is published, its file with it", async () => {
    const unsaved = await uploadBrochure(pdf("never saved"), actor);
    const second = await uploadBrochure(pdf("second"), actor);
    await saveSiteDraft({ ...SEED_SITE, brochure: { mediaId: second.id } }, actor);
    await publishSite(actor);
    expect(await getBrochureUrl()).toBe(second.url);
    expect(await exists(fileOf(first.url))).toBe(false);
    expect(await exists(fileOf(unsaved.url))).toBe(false);
    expect(await exists(fileOf(second.url))).toBe(true);
  });

  it("refuses to publish a draft its checks refuse, and throws a draft away", async () => {
    await saveDocumentDraft("SITE", { ...SEED_SITE, name: { en: "" } }, actor);
    await expect(publishSite(actor)).rejects.toBeInstanceOf(ZodError);
    expect(await discardSiteDraft(actor)).toMatchObject({ unpublishedChanges: false, draft: { name: SEED_SITE.name } });
  });

  it("puts a brochure file that will not go in the error log", async () => {
    const broken = crypto.randomUUID();
    await getDb()
      .insert(media)
      .values({
        id: broken,
        kind: "PDF",
        variants: [{ key: "not a key", width: null, mime: "application/pdf", bytes: 1 }],
        bytes: 1,
      });
    await publishSite(actor);
    expect(await getDb().select().from(media).where(eq(media.id, broken))).toEqual([]);
    expect(await getDb().select({ id: errorLog.id }).from(errorLog).where(eq(errorLog.reference, broken))).toHaveLength(
      1,
    );
    await getDb().delete(errorLog).where(eq(errorLog.reference, broken));
  });

  it("answers a brochure with no file as none", async () => {
    const empty = crypto.randomUUID();
    await getDb().insert(media).values({ id: empty, kind: "PDF", variants: [], bytes: 0 });
    await saveDocumentDraft("SITE", { ...SEED_SITE, brochure: { mediaId: empty } }, actor);
    expect((await getSiteForAdmin()).brochure).toBeNull();
    await publishSite(actor);
    expect(await getBrochureUrl()).toBeNull();
  });

  it("publishes a site with no brochure: every kept PDF goes, and /brochure has nothing", async () => {
    await saveSiteDraft(SEED_SITE, actor);
    expect((await getSiteForAdmin()).brochure).toBeNull();
    await publishSite(actor);
    expect(await getDb().select().from(media).where(eq(media.kind, "PDF"))).toEqual([]);
    expect(await getBrochureUrl()).toBeNull();
  });
});
