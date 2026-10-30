import { eq, inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ACTIVITY_PAGE_SIZE } from "@/constants/limits";
import { AUDIT_ENTITIES } from "@/constants/statuses";
import { closeDb, getDb } from "@/db/client";
import { auditLog, authUser, enquiries, media, rateLimits, records } from "@/db/schema";
import { listActivity } from "@/features/activity/api";
import { createAdmin } from "@/features/auth/createAdmin";
import { submitEnquiry } from "@/features/enquiries/api";

/**
 * Activity against the local MySQL (R6.8, D96): the admin's changes newest
 * first, of one kind or all, 50 at a time, each with who made it and what it
 * was made to by name, and never a person's details.
 */
const RUN = crypto.randomUUID().slice(0, 8);
const REQUEST = `req_activity_${RUN}`;
const EMAIL = `activity-${RUN}@example.com`;
// Far ahead of every other row, so this file's rows are the newest and come first.
const BASE = new Date("2090-01-01T08:00:00Z").getTime() + Math.floor(Math.random() * 1_000_000) * 60_000;
const at = (minute: number) => new Date(BASE + minute * 60_000);
const id = () => crypto.randomUUID();

let adminId: string;
const ids = {
  service: id(),
  job: id(),
  client: id(),
  goneRecord: id(),
  image: id(),
  pdf: id(),
  goneImage: id(),
  enquiry: "",
  goneEnquiry: id(),
  goneApplication: id(),
};

type Row = typeof auditLog.$inferInsert;
const row = (minute: number, entry: Omit<Row, "createdAt" | "requestId">): Row => ({
  actorId: adminId,
  ...entry,
  createdAt: at(minute),
  requestId: REQUEST,
});

beforeAll(async () => {
  const db = getDb();
  adminId = (await createAdmin({ email: EMAIL, name: "Fatima", password: "a long activity password" })).id;
  await db.insert(records).values([
    { id: ids.service, collection: "SERVICES", draft: { name: { en: "Elderly care" } } },
    { id: ids.job, collection: "JOBS", draft: { title: { en: "Registered nurse" } } },
    { id: ids.client, collection: "CLIENTS", draft: { name: { en: "Doha Clinic" } } },
  ]);
  await db.insert(media).values([
    {
      id: ids.image,
      kind: "IMAGE",
      variants: [],
      width: 10,
      height: 10,
      bytes: 1,
      alt: { en: "A nurse at a bedside" },
    },
    { id: ids.pdf, kind: "PDF", variants: [], bytes: 1, alt: null },
  ]);
  ids.enquiry = await submitEnquiry(
    {
      form: "CONTACT",
      name: "Omar Haddad",
      email: "omar@example.com",
      phone: "+97455512345",
      fields: [{ label: "Message", value: "A nurse at night?" }],
    },
    `activity-${RUN}`,
    new Date(),
  );
});

afterAll(async () => {
  const db = getDb();
  await db.delete(auditLog).where(eq(auditLog.requestId, REQUEST));
  await db.delete(records).where(inArray(records.id, [ids.service, ids.job, ids.client]));
  await db.delete(media).where(inArray(media.id, [ids.image, ids.pdf]));
  await db.delete(enquiries).where(eq(enquiries.id, ids.enquiry));
  await db.delete(rateLimits);
  await db.delete(authUser).where(eq(authUser.email, EMAIL));
  await closeDb();
});

describe("listActivity (D96)", () => {
  it("lists the changes newest first, who made each and what it was made to, never a person's details", async () => {
    const { documents, operations, account, enquiry, application } = AUDIT_ENTITIES;
    await getDb()
      .insert(auditLog)
      .values([
        row(1, { action: "SIGN_IN", entityType: account, entityId: adminId }),
        row(2, { action: "PUBLISH", entityType: documents, entityId: "PAGE:HOME" }),
        row(3, { action: "UPDATE", entityType: documents, entityId: "ORDER:SERVICES" }),
        row(4, { action: "PUBLISH", entityType: documents, entityId: "SITE" }),
        row(5, { action: "CREATE", entityType: "SERVICES", entityId: ids.service }),
        row(6, {
          action: "STATUS_CHANGE",
          entityType: "JOBS",
          entityId: ids.job,
          changes: { closed: { from: false, to: true } },
        }),
        row(7, { action: "ARCHIVE", entityType: "CLIENTS", entityId: ids.client }),
        row(8, { action: "UPDATE", entityType: "SERVICES", entityId: ids.goneRecord }),
        row(9, { action: "CREATE", entityType: AUDIT_ENTITIES.media, entityId: ids.image }),
        row(10, { action: "CREATE", entityType: AUDIT_ENTITIES.media, entityId: ids.pdf }),
        row(11, { action: "DELETE", entityType: AUDIT_ENTITIES.media, entityId: ids.goneImage }),
        row(12, {
          action: "STATUS_CHANGE",
          entityType: enquiry,
          entityId: ids.enquiry,
          changes: { status: { from: "NEW", to: "RESOLVED" } },
        }),
        row(13, { action: "DELETE", entityType: enquiry, entityId: ids.goneEnquiry }),
        row(14, { action: "CV_DOWNLOAD", entityType: application, entityId: ids.goneApplication }),
        row(15, {
          action: "SETTINGS_CHANGE",
          entityType: operations,
          entityId: "SITE",
          changes: { enquiriesTo: { from: ["info@alhidaya.qa"], to: ["care-desk@alhidaya.qa"] } },
        }),
        row(16, {
          actorId: null,
          action: "RETENTION_PURGE",
          entityType: operations,
          entityId: null,
          changes: { enquiries: 2, applications: 1, cvs: 3, filesNotDeleted: 0 },
        }),
        row(17, { actorId: null, action: "PASSWORD_RESET_REQUESTED", entityType: account }),
      ]);

    const { items, page, pageSize } = await listActivity({ page: 1 });
    expect([page, pageSize]).toEqual([1, ACTIVITY_PAGE_SIZE]);
    const mine = items.filter((item) => item.createdAt >= at(1));
    expect(mine.map((item) => item.createdAt)).toEqual([...Array(17).keys()].map((minute) => at(17 - minute)));
    const [reset, purge, settings, cv, goneEnquiry, moved, goneImage, pdf, image, goneRecord, client, job, service] =
      mine;
    const [site, order, home, signIn] = mine.slice(-4);

    expect(signIn).toMatchObject({ who: "Fatima", action: "SIGN_IN", subject: { type: "account" } });
    expect(home.subject).toEqual({ type: "page", page: "HOME" });
    expect(order.subject).toEqual({ type: "order", collection: "SERVICES" });
    expect(site.subject).toEqual({ type: "settings" });
    expect(service.subject).toEqual({ type: "record", collection: "SERVICES", id: ids.service, name: "Elderly care" });
    expect(job).toMatchObject({
      subject: { type: "record", collection: "JOBS", name: "Registered nurse" },
      changed: ["closed"],
      to: true,
    });
    expect(client.subject).toMatchObject({ name: "Doha Clinic" });
    expect(goneRecord.subject).toMatchObject({ type: "record", name: null });
    expect(image.subject).toEqual({ type: "media", kind: "IMAGE", name: "A nurse at a bedside" });
    expect(pdf.subject).toEqual({ type: "media", kind: "PDF", name: null });
    expect(goneImage.subject).toEqual({ type: "media", kind: null, name: null });
    expect(moved).toMatchObject({
      subject: { type: "enquiry", id: ids.enquiry, exists: true },
      changed: ["status"],
      to: "RESOLVED",
    });
    expect(goneEnquiry.subject).toEqual({ type: "enquiry", id: ids.goneEnquiry, exists: false });
    expect(cv.subject).toEqual({ type: "application", id: ids.goneApplication, exists: false });
    expect(settings).toMatchObject({ subject: { type: "operations" }, changed: ["enquiriesTo"], to: null });
    expect(purge).toMatchObject({
      who: null,
      changed: [],
      counts: { enquiries: 2, applications: 1, cvs: 3 },
    });
    expect(reset).toMatchObject({ who: null, subject: { type: "account" }, counts: null });

    // What a recipient was changed to, and who sent the enquiry, never leave the server.
    const said = JSON.stringify(mine);
    for (const personal of ["care-desk@alhidaya.qa", "info@alhidaya.qa", "Omar", "omar@example.com"]) {
      expect(said).not.toContain(personal);
    }
  });

  it("filters by kind: content, the inbox, settings, sign-ins", async () => {
    const kinds = async (kind: "CONTENT" | "INBOX" | "SETTINGS" | "SIGN_INS") =>
      (await listActivity({ kind, page: 1 })).items
        .filter((item) => item.createdAt >= at(1))
        .map((item) => item.subject.type)
        .toReversed();
    expect(await kinds("CONTENT")).toEqual([
      "page",
      "order",
      "record",
      "record",
      "record",
      "record",
      "media",
      "media",
      "media",
    ]);
    expect(await kinds("INBOX")).toEqual(["enquiry", "enquiry", "application"]);
    expect(await kinds("SETTINGS")).toEqual(["settings", "operations", "operations"]);
    expect(await kinds("SIGN_INS")).toEqual(["account", "account"]);
  });

  it("shows 50 a page, and counts them all", async () => {
    await getDb()
      .insert(auditLog)
      .values(
        [...Array(ACTIVITY_PAGE_SIZE).keys()].map((minute) =>
          row(100 + minute, { action: "SIGN_OUT", entityType: AUDIT_ENTITIES.account, entityId: adminId }),
        ),
      );
    const first = await listActivity({ kind: "SIGN_INS", page: 1 });
    const second = await listActivity({ kind: "SIGN_INS", page: 2 });
    expect(first.items).toHaveLength(ACTIVITY_PAGE_SIZE);
    expect(first.items.every((item) => item.action === "SIGN_OUT")).toBe(true);
    expect(second.items.slice(0, 2).map((item) => item.action)).toEqual(["PASSWORD_RESET_REQUESTED", "SIGN_IN"]);
    expect(first.total).toBe(second.total);
    expect(first.total).toBeGreaterThanOrEqual(ACTIVITY_PAGE_SIZE + 2);
  });
});
