import { eq, inArray } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { closeDb, getDb } from "@/db/client";
import { auditLog, documents, media } from "@/db/schema";
import {
  discardPageDraft,
  getPageForAdmin,
  listPagesForAdmin,
  pageFromParam,
  publishPage,
  savePageDraft,
} from "@/features/content/api";
import { readPublishedDocument, saveDocumentDraft } from "@/lib/content/documents";
import { pageFixture } from "@tests/support/fixtures/content";

const REQUEST = `req_pages_admin_${crypto.randomUUID()}`;
const actor = { adminId: null, requestId: REQUEST };
const images: string[] = [];

async function image() {
  const id = crypto.randomUUID();
  images.push(id);
  await getDb()
    .insert(media)
    .values({ id, kind: "IMAGE", variants: [], width: 1600, height: 1067, bytes: 1, alt: { en: "A photo" } });
  return id;
}

/** Home with its sign showing a photo. */
function homeWithPhoto(mediaId: string) {
  const page = pageFixture("HOME");
  const [sign, ...rest] = page.sections;
  return { ...page, sections: [{ ...sign, content: { ...sign.content, image: { mediaId } } }, ...rest] } as typeof page;
}

beforeAll(async () => {
  await getDb().delete(documents);
});

afterAll(async () => {
  await getDb().delete(documents);
  await getDb().delete(media).where(inArray(media.id, images));
  await getDb().delete(auditLog).where(eq(auditLog.requestId, REQUEST));
  await closeDb();
});

describe("the admin's pages, against the local MySQL", () => {
  it("name a page by its address, and nothing else", () => {
    expect(pageFromParam("privacy")).toBe("PRIVACY");
    expect(() => pageFromParam("blog")).toThrow(expect.objectContaining({ code: "RECORD_NOT_FOUND" }));
  });

  it("list the eight pages in order, none waiting before anything is saved", async () => {
    const pages = await listPagesForAdmin();
    expect(pages.map((state) => state.page)).toEqual([
      "HOME",
      "ABOUT",
      "SERVICES",
      "CAREERS",
      "CONTACT",
      "QUOTE",
      "PRIVACY",
      "TERMS",
    ]);
    expect(pages.every((state) => state.publishedAt === null && !state.unpublishedChanges)).toBe(true);
    await expect(getPageForAdmin("HOME")).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
  });

  it("save a draft with a photo the library holds, and refuse one it does not", async () => {
    const draft = homeWithPhoto(await image());
    const saved = await savePageDraft("HOME", draft, actor);
    expect(saved).toEqual({ page: "HOME", draft, publishedAt: null, unpublishedChanges: true });
    expect(await getPageForAdmin("HOME")).toEqual(saved);

    await expect(savePageDraft("HOME", homeWithPhoto(crypto.randomUUID()), actor)).rejects.toMatchObject({
      code: "IMAGE_NOT_FOUND",
    });
    expect((await getPageForAdmin("HOME")).draft).toEqual(draft);
    expect(await readPublishedDocument("PAGE:HOME")).toBeNull();
  });

  it("publish the saved draft and drop exactly that page's cached reads", async () => {
    const before = await getPageForAdmin("HOME");
    const { publishedAt } = await publishPage("HOME", actor);
    expect(await readPublishedDocument("PAGE:HOME")).toEqual(before.draft);
    expect(revalidateTag).toHaveBeenCalledWith("page:HOME", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledOnce();
    const [home] = await listPagesForAdmin();
    expect(home).toEqual({ page: "HOME", publishedAt, unpublishedChanges: false });
  });

  it("refuse to publish a draft the page's rules no longer allow, and keep the published copy", async () => {
    const published = await readPublishedDocument("PAGE:HOME");
    const broken = { ...pageFixture("HOME"), sections: pageFixture("QUOTE").sections };
    await saveDocumentDraft("PAGE:HOME", broken, actor);
    await expect(publishPage("HOME", actor)).rejects.toThrow();
    expect(await readPublishedDocument("PAGE:HOME")).toEqual(published);
    expect((await listPagesForAdmin())[0]).toMatchObject({ unpublishedChanges: true });
  });

  it("throw a draft away, back to what is published", async () => {
    const published = await readPublishedDocument("PAGE:HOME");
    expect(await discardPageDraft("HOME", actor)).toMatchObject({ draft: published, unpublishedChanges: false });
    await expect(discardPageDraft("ABOUT", actor)).rejects.toMatchObject({ code: "NOTHING_PUBLISHED" });
  });

  it("record each save, publish and discard in the audit trail", async () => {
    const rows = await getDb()
      .select({ action: auditLog.action, entityId: auditLog.entityId })
      .from(auditLog)
      .where(eq(auditLog.requestId, REQUEST));
    expect(rows.map((row) => row.action)).toEqual(expect.arrayContaining(["UPDATE", "PUBLISH", "DISCARD_DRAFT"]));
    expect(rows.every((row) => row.entityId === "PAGE:HOME")).toBe(true);
  });
});
