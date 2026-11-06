import { eq, inArray } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

import { closeDb, getDb } from "@/db/client";
import { auditLog, documents, media, records } from "@/db/schema";
import {
  createService,
  discardServiceDraft,
  discardServiceOrder,
  findPublishedService,
  getServiceForAdmin,
  listPublishedServices,
  listServicesForAdmin,
  publishService,
  publishServiceOrder,
  saveServiceDraft,
  saveServiceOrder,
  setServiceArchived,
} from "@/features/services/api";
import { saveRecordDraft } from "@/lib/content/records";
import { serviceFixture } from "@tests/support/fixtures/content";

const REQUEST = `req_services_admin_${crypto.randomUUID()}`;
const actor = { adminId: null, requestId: REQUEST };
const images: string[] = [];

async function image() {
  const id = crypto.randomUUID();
  images.push(id);
  await getDb()
    .insert(media)
    .values({ id, kind: "IMAGE", variants: [], width: 1600, height: 1067, bytes: 1, alt: { en: "A nurse" } });
  return id;
}

const tags = () => vi.mocked(revalidateTag).mock.calls.map(([tag]) => tag);
const clear = async () => {
  await getDb().delete(records);
  await getDb().delete(documents);
};

beforeAll(clear);
beforeEach(() => {
  vi.mocked(revalidateTag).mockClear();
});

afterAll(async () => {
  await clear();
  await getDb().delete(media).where(inArray(media.id, images));
  await getDb().delete(auditLog).where(eq(auditLog.requestId, REQUEST));
  await closeDb();
});

describe("the admin's services, against the local MySQL (D92)", () => {
  let elderly = "";
  let child = "";

  it("make a service as a draft, its photo known to the library, and refuse one the library does not hold", async () => {
    const photo = await image();
    const made = await createService(serviceFixture({ slug: "elderly-care", image: { mediaId: photo } }), actor);
    elderly = made.id;
    expect(made).toMatchObject({ publishedAt: null, archivedAt: null, unpublishedChanges: true });
    expect(made.draft.image).toEqual({ mediaId: photo });
    await expect(
      createService(serviceFixture({ slug: "no-photo", image: { mediaId: crypto.randomUUID() } }), actor),
    ).rejects.toMatchObject({ code: "IMAGE_NOT_FOUND" });
    expect(await listPublishedServices()).toEqual([]);
    expect((await listServicesForAdmin()).items).toEqual([
      expect.objectContaining({ id: elderly, publishedAt: null, unpublishedChanges: true }),
    ]);
  });

  it("publish a service at its address, then move it, the old address answering with where it went", async () => {
    const published = await publishService(elderly, actor);
    expect(published).toMatchObject({ unpublishedChanges: false, publishedAt: expect.any(Date) });
    expect(tags()).toEqual(expect.arrayContaining(["services", "service:elderly-care"]));

    await saveServiceDraft(elderly, serviceFixture({ slug: "care-for-older-people" }), actor);
    expect((await getServiceForAdmin(elderly)).unpublishedChanges).toBe(true);
    vi.mocked(revalidateTag).mockClear();
    await publishService(elderly, actor);
    expect(tags()).toEqual(
      expect.arrayContaining(["services", "service:elderly-care", "service:care-for-older-people"]),
    );
    expect(await findPublishedService("elderly-care")).toEqual({ movedTo: "care-for-older-people" });
  });

  it("refuse a save naming a photo the library does not hold, and a publish of a draft its checks refuse", async () => {
    await expect(
      saveServiceDraft(elderly, serviceFixture({ image: { mediaId: crypto.randomUUID() } }), actor),
    ).rejects.toMatchObject({ code: "IMAGE_NOT_FOUND" });
    await saveRecordDraft("SERVICES", elderly, { ...serviceFixture(), name: { en: "" } }, actor);
    await expect(publishService(elderly, actor)).rejects.toBeInstanceOf(ZodError);
    expect((await listPublishedServices()).map((service) => service.published.slug)).toEqual(["care-for-older-people"]);
    expect(await discardServiceDraft(elderly, actor)).toMatchObject({ unpublishedChanges: false });
  });

  it("refuse an address another service has, marking where it is typed", async () => {
    child = (await createService(serviceFixture({ name: { en: "Child care" }, slug: "care-for-older-people" }), actor))
      .id;
    await expect(publishService(child, actor)).rejects.toMatchObject({
      code: "SLUG_TAKEN",
      details: [{ path: "slug", message: expect.any(String) }],
    });
    await saveServiceDraft(child, serviceFixture({ name: { en: "Child care" }, slug: "child-care" }), actor);
    await publishService(child, actor);
  });

  it("keep a new order as a draft until it is published, and throw a draft order away", async () => {
    const list = await listServicesForAdmin();
    expect(list.items.map((item) => item.id)).toEqual([elderly, child]);
    expect(list.order).toEqual({ publishedAt: null, unpublishedChanges: false });

    const saved = await saveServiceOrder([child, crypto.randomUUID(), elderly], actor);
    expect(saved.items.map((item) => item.name)).toEqual(["Child care", "Home nursing care"]);
    expect(saved.order).toEqual({ publishedAt: null, unpublishedChanges: true });
    expect((await listPublishedServices()).map((service) => service.id)).toEqual([elderly, child]);

    vi.mocked(revalidateTag).mockClear();
    const published = await publishServiceOrder(actor);
    expect(published.order).toMatchObject({ unpublishedChanges: false, publishedAt: expect.any(Date) });
    expect(tags()).toEqual(["services"]);
    expect((await listPublishedServices()).map((service) => service.id)).toEqual([child, elderly]);

    await saveServiceOrder([elderly, child], actor);
    const discarded = await discardServiceOrder(actor);
    expect(discarded.items.map((item) => item.id)).toEqual([child, elderly]);
    expect(discarded.order.unpublishedChanges).toBe(false);
  });

  it("take a service off the site and put it back, the archived listed last", async () => {
    const archived = await setServiceArchived(child, true, actor);
    expect(archived.archivedAt).toEqual(expect.any(Date));
    expect(tags()).toEqual(expect.arrayContaining(["services", "service:child-care"]));
    expect((await listServicesForAdmin()).items.map((item) => [item.id, Boolean(item.archivedAt)])).toEqual([
      [elderly, false],
      [child, true],
    ]);
    expect((await listPublishedServices()).map((service) => service.id)).toEqual([elderly]);
    expect((await setServiceArchived(child, false, actor)).archivedAt).toBeNull();
    expect((await listPublishedServices()).map((service) => service.id)).toEqual([child, elderly]);
  });

  it("answer 404 for a service that is not there", async () => {
    await expect(getServiceForAdmin(crypto.randomUUID())).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
  });
});

it("keeps header button edits private until publish and rejects an unsafe saved destination", async () => {
  const item = await createService(serviceFixture({ slug: "button-care" }), actor);
  await publishService(item.id, actor);
  const buttons = [{ label: { en: "Contact us" }, href: "/contact" }];
  await saveServiceDraft(item.id, serviceFixture({ slug: "button-care", headerButtons: buttons }), actor);
  const before = await findPublishedService("button-care");
  expect(before && "record" in before ? before.record.published.headerButtons : null).toEqual([]);
  expect((await getServiceForAdmin(item.id)).draft.headerButtons).toEqual(buttons);
  await publishService(item.id, actor);
  const after = await findPublishedService("button-care");
  expect(after && "record" in after ? after.record.published.headerButtons : null).toEqual(buttons);
  await saveRecordDraft(
    "SERVICES",
    item.id,
    serviceFixture({ slug: "button-care", headerButtons: [{ label: { en: "Bad" }, href: "javascript:alert(1)" }] }),
    actor,
  );
  await expect(publishService(item.id, actor)).rejects.toBeInstanceOf(ZodError);
  const safe = await findPublishedService("button-care");
  expect(safe && "record" in safe ? safe.record.published.headerButtons : null).toEqual(buttons);
});
