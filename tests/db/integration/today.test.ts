import { eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { INBOX_PAGE_SIZE } from "@/constants/limits";
import { closeDb, getDb } from "@/db/client";
import { applications, enquiries, rateLimits } from "@/db/schema";
import { applicationSummaries, submitApplication } from "@/features/careers/api";
import { enquirySummaries, submitEnquiry } from "@/features/enquiries/api";
import { listArrivals } from "@/lib/inbox/arrivals";

const ip = () => `today-${crypto.randomUUID()}`;
const at = (minute: number) => new Date(Date.UTC(2026, 9, 30, 8, minute));
const sources = { enquiry: enquirySummaries, application: applicationSummaries };

const enquiry = (minute: number, name = "Omar Haddad") =>
  submitEnquiry(
    {
      form: "CONTACT",
      name,
      email: "omar@example.com",
      phone: "+97455512345",
      fields: [{ label: "Message", value: "A nurse at night?" }],
    },
    ip(),
    at(minute),
  );

const application = async (minute: number, name = "Mariam Ali") =>
  (
    await submitApplication(
      {
        jobId: null,
        name,
        email: "mariam@example.com",
        phone: "+97455512345",
        fields: [{ label: "Years of nursing experience", value: "4" }],
        cv: { name: "cv.pdf", type: "pdf", bytes: 1200 },
      },
      ip(),
      at(minute),
    )
  ).id;

beforeEach(async () => {
  await getDb().delete(enquiries);
  await getDb().delete(applications);
});

afterAll(async () => {
  await getDb().delete(enquiries);
  await getDb().delete(applications);
  await getDb().delete(rateLimits);
  await closeDb();
});

describe("Today, against the local MySQL (D81)", () => {
  it("lists enquiries and applications as one stream, newest first, each as its own inbox shows it", async () => {
    const first = await enquiry(1);
    const second = await application(2);
    const third = await enquiry(3, "Fatima Al-Kuwari");
    const today = await listArrivals({ needsYou: false, page: 1 }, sources);
    expect(today.items.map((item) => [item.kind, item.id])).toEqual([
      ["enquiry", third],
      ["application", second],
      ["enquiry", first],
    ]);
    expect(today).toMatchObject({ total: 3, page: 1, pageSize: INBOX_PAGE_SIZE });
    expect(today.items[1]).toMatchObject({ name: "Mariam Ali", jobTitle: null, cvStatus: "PENDING" });
    expect(today.items[0]).toMatchObject({ name: "Fatima Al-Kuwari", summary: "A nurse at night?" });
  });

  it("shows only what needs the admin: new, or its email to the team not sent", async () => {
    const handled = await enquiry(1);
    const unsent = await application(2);
    const fresh = await enquiry(3);
    const reviewed = await application(4);
    await getDb().update(enquiries).set({ status: "RESOLVED" }).where(eq(enquiries.id, handled));
    await getDb()
      .update(applications)
      .set({ status: "IN_REVIEW", emailStatus: "NOT_SENT" })
      .where(eq(applications.id, unsent));
    await getDb().update(applications).set({ status: "CLOSED" }).where(eq(applications.id, reviewed));
    const today = await listArrivals({ needsYou: true, page: 1 }, sources);
    expect(today.items.map((item) => item.id)).toEqual([fresh, unsent]);
    expect(today.total).toBe(2);
  });

  it("pages the stream, and leaves out an arrival deleted between its two reads", async () => {
    const ids: string[] = [];
    for (let minute = 0; minute < INBOX_PAGE_SIZE + 2; minute++) {
      ids.push(minute % 2 === 0 ? await enquiry(minute) : await application(minute));
    }
    const second = await listArrivals({ needsYou: false, page: 2 }, sources);
    expect(second.items.map((item) => item.id)).toEqual([ids[1], ids[0]]);
    expect(second.total).toBe(INBOX_PAGE_SIZE + 2);

    const gone = await listArrivals({ needsYou: false, page: 2 }, { ...sources, application: async () => [] });
    expect(gone.items.map((item) => item.id)).toEqual([ids[0]]);
    expect((await listArrivals({ needsYou: false, page: 3 }, sources)).items).toEqual([]);
  });

  it("is empty when nothing has arrived", async () => {
    expect(await listArrivals({ needsYou: true, page: 1 }, sources)).toEqual({
      items: [],
      total: 0,
      page: 1,
      pageSize: INBOX_PAGE_SIZE,
    });
  });
});
