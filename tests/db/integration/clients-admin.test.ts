import { eq, inArray } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

import { closeDb, getDb } from "@/db/client";
import { auditLog, documents, media, records } from "@/db/schema";
import {
  createClient,
  discardClientDraft,
  discardClientOrder,
  getClientForAdmin,
  listClientsForAdmin,
  listPublishedClients,
  publishClient,
  publishClientOrder,
  saveClientDraft,
  saveClientOrder,
  setClientArchived,
} from "@/features/clients/api";
import { createRecord, saveRecordDraft } from "@/lib/content/records";
import { clientFixture } from "@tests/support/fixtures/content";

const REQUEST = `req_clients_admin_${crypto.randomUUID()}`;
const actor = { adminId: null, requestId: REQUEST };
const images: string[] = [];

async function logo() {
  const id = crypto.randomUUID();
  images.push(id);
  await getDb()
    .insert(media)
    .values({
      id,
      kind: "IMAGE",
      variants: [{ key: "2026-10/logoabcdef-w480.webp", width: 480, mime: "image/webp", bytes: 1 }],
      width: 480,
      height: 240,
      bytes: 1,
      alt: { en: "A hospital's logo" },
    });
  return { mediaId: id };
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

describe("the admin's client logos, against the local MySQL (D92)", () => {
  let hospital = "";
  let clinic = "";

  it("add a logo as a draft, its image known to the library, and list it with its logo to show", async () => {
    const made = await createClient(clientFixture({ name: { en: "Doha Hospital" }, logo: await logo() }), actor);
    hospital = made.id;
    expect(made).toMatchObject({ publishedAt: null, unpublishedChanges: true });
    await expect(createClient(clientFixture(), actor)).rejects.toMatchObject({ code: "IMAGE_NOT_FOUND" });
    const [listed] = (await listClientsForAdmin()).items;
    expect(listed).toMatchObject({ id: hospital, name: "Doha Hospital", url: null, logo: { width: 480 } });
    expect(await listPublishedClients()).toEqual([]);
    // A logo that has left the library shows none, rather than one that shifts the row.
    const lost = await createRecord("CLIENTS", clientFixture({ name: { en: "Lost logo" } }), actor);
    expect((await listClientsForAdmin()).items.find((item) => item.id === lost)?.logo).toBeNull();
    await getDb().delete(records).where(eq(records.id, lost));
  });

  it("publish a logo, and refuse a draft its checks refuse, keeping the published copy", async () => {
    expect(await publishClient(hospital, actor)).toMatchObject({ unpublishedChanges: false });
    expect(tags()).toEqual(["clients"]);
    expect((await listPublishedClients()).map((client) => client.id)).toEqual([hospital]);

    await saveRecordDraft("CLIENTS", hospital, { ...clientFixture(), name: { en: "" } }, actor);
    await expect(publishClient(hospital, actor)).rejects.toBeInstanceOf(ZodError);
    expect(await discardClientDraft(hospital, actor)).toMatchObject({ unpublishedChanges: false });
    await expect(
      saveClientDraft(hospital, clientFixture({ logo: { mediaId: crypto.randomUUID() } }), actor),
    ).rejects.toMatchObject({ code: "IMAGE_NOT_FOUND" });
    expect(
      (await saveClientDraft(hospital, clientFixture({ name: { en: "Doha Hospital" }, logo: await logo() }), actor))
        .unpublishedChanges,
    ).toBe(true);
  });

  it("keep a new order as a draft until it is published, and throw one away", async () => {
    clinic = (await createClient(clientFixture({ name: { en: "A clinic" }, logo: await logo() }), actor)).id;
    await publishClient(clinic, actor);
    expect((await saveClientOrder([clinic, hospital], actor)).order.unpublishedChanges).toBe(true);
    expect((await listPublishedClients()).map((client) => client.id)).toEqual([hospital, clinic]);
    vi.mocked(revalidateTag).mockClear();
    await publishClientOrder(actor);
    expect(tags()).toEqual(["clients"]);
    expect((await listPublishedClients()).map((client) => client.id)).toEqual([clinic, hospital]);
    await saveClientOrder([hospital, clinic], actor);
    expect((await discardClientOrder(actor)).items.map((client) => client.id)).toEqual([clinic, hospital]);
  });

  it("take a logo off the site and put it back", async () => {
    expect((await setClientArchived(clinic, true, actor)).archivedAt).toEqual(expect.any(Date));
    expect(tags()).toEqual(["clients"]);
    expect((await listPublishedClients()).map((client) => client.id)).toEqual([hospital]);
    expect((await listClientsForAdmin()).items.map((client) => client.id)).toEqual([hospital, clinic]);
    expect((await setClientArchived(clinic, false, actor)).archivedAt).toBeNull();
    await expect(getClientForAdmin(crypto.randomUUID())).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
  });
});
