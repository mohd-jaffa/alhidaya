import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { DEFAULT_TYPOGRAPHY } from "@/constants/typography";
import { closeDb, getDb } from "@/db/client";
import { auditLog, documents } from "@/db/schema";
import {
  getPublishedTypography,
  getTypographyForAdmin,
  saveTypographyDraft,
  publishTypography,
  discardTypographyDraft,
} from "@/features/settings/typography";
import { listActivity } from "@/features/activity/api";
import { saveDocumentDraft, readDocumentDraft, readPublishedDocument } from "@/lib/content/documents";

const actor = { adminId: null, requestId: `req_typography_${crypto.randomUUID()}` };
const clear = async () => {
  await getDb().delete(documents);
};
beforeAll(clear);
afterAll(async () => {
  await clear();
  await getDb().delete(auditLog).where(eq(auditLog.requestId, actor.requestId));
  await closeDb();
});
describe("typography independent draft/publish", () => {
  it("uses the current face before the new document exists; admin reports the missing document", async () => {
    expect(await getPublishedTypography()).toEqual(DEFAULT_TYPOGRAPHY);
    expect(await getPublishedTypography("preview")).toEqual(DEFAULT_TYPOGRAPHY);
    await expect(getTypographyForAdmin()).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
  });
  it("saves only a draft, preview sees it, visitors keep the default", async () => {
    const draft = { roles: { ...DEFAULT_TYPOGRAPHY.roles, h1: "manrope" as const } };
    expect(await saveTypographyDraft(draft, actor)).toMatchObject({
      draft,
      publishedAt: null,
      unpublishedChanges: true,
    });
    expect(await getPublishedTypography("preview")).toEqual(draft);
    expect(await getPublishedTypography()).toEqual(DEFAULT_TYPOGRAPHY);
    await expect(discardTypographyDraft(actor)).rejects.toMatchObject({ code: "NOTHING_PUBLISHED" });
  });
  it("publishes fonts alone, revalidates only typography and records a readable Settings activity", async () => {
    await saveDocumentDraft("SITE", { unrelated: "draft" }, actor);
    vi.mocked(revalidateTag).mockClear();
    expect(await publishTypography(actor)).toMatchObject({ unpublishedChanges: false, publishedAt: expect.any(Date) });
    expect((await getPublishedTypography()).roles.h1).toBe("manrope");
    expect(vi.mocked(revalidateTag).mock.calls).toEqual([["typography", { expire: 0 }]]);
    expect(await readPublishedDocument("SITE")).toBeNull();
    expect((await readDocumentDraft("SITE"))?.draft).toEqual({ unrelated: "draft" });
    const settings = await listActivity({ page: 1, kind: "SETTINGS" });
    expect(settings.items.some((item) => item.subject.type === "typography" && item.action === "PUBLISH")).toBe(true);
    const content = await listActivity({ page: 1, kind: "CONTENT" });
    expect(content.items.some((item) => item.subject.type === "typography")).toBe(false);
  });
  it("rejects corrupt persisted drafts on publish and discards them without changing the published copy", async () => {
    await saveDocumentDraft("TYPOGRAPHY", { roles: { h1: "url(evil)" } }, actor);
    await expect(publishTypography(actor)).rejects.toThrow();
    expect((await getPublishedTypography()).roles.h1).toBe("manrope");
    expect(await discardTypographyDraft(actor)).toMatchObject({
      unpublishedChanges: false,
      draft: { roles: { h1: "manrope" } },
    });
  });
});
