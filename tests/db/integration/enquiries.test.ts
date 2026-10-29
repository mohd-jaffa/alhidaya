import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { FORM_RATE_LIMIT } from "@/constants/limits";
import { closeDb, getDb } from "@/db/client";
import { enquiries, enquiryNotes, rateLimits } from "@/db/schema";
import { type EnquirySubmission, submitEnquiry } from "@/features/enquiries/api";

/** A visitor of its own for each test, so no two share a rate limit. */
const ip = () => `visitor-${crypto.randomUUID()}`;
const at = new Date("2026-10-29T08:01:00Z");

const contact = (overrides: Partial<EnquirySubmission> = {}): EnquirySubmission => ({
  form: "CONTACT",
  name: "Mariam Ali",
  email: "mariam@example.com",
  phone: "+97455512345",
  fields: [
    { label: "Name", value: "Mariam Ali" },
    { label: "Message", value: "Do you have a nurse for my father at night?" },
  ],
  ...overrides,
});

const stored = async () => (await getDb().select({ id: enquiries.id }).from(enquiries)).length;

beforeAll(async () => {
  await getDb().delete(enquiries);
});

afterAll(async () => {
  await getDb().delete(enquiries);
  await getDb().delete(rateLimits);
  await closeDb();
});

describe("submitEnquiry, against the local MySQL", () => {
  it("stores the enquiry as sent, new, its email still to send", async () => {
    const id = await submitEnquiry(contact(), ip(), at);
    const [row] = await getDb().select().from(enquiries).where(eq(enquiries.id, id));
    expect(row).toMatchObject({
      form: "CONTACT",
      status: "NEW",
      emailStatus: "PENDING",
      name: "Mariam Ali",
      fields: contact().fields,
      createdAt: at,
    });
  });

  it("takes five a visitor sends on one form in ten minutes, refuses the sixth, and takes the next window's", async () => {
    const visitor = ip();
    const before = await stored();
    for (let count = 0; count < FORM_RATE_LIMIT.limit; count++) await submitEnquiry(contact(), visitor, at);
    await expect(submitEnquiry(contact(), visitor, at)).rejects.toMatchObject({
      code: "RATE_LIMITED",
      httpStatus: 429,
    });
    expect(await stored()).toBe(before + FORM_RATE_LIMIT.limit);

    await expect(submitEnquiry(contact({ form: "QUOTE" }), visitor, at)).resolves.toEqual(expect.any(String));
    await expect(submitEnquiry(contact(), visitor, new Date("2026-10-29T08:10:00Z"))).resolves.toEqual(
      expect.any(String),
    );
  });

  it("does not count a submission that failed to store", async () => {
    const visitor = ip();
    await expect(submitEnquiry(contact({ name: "x".repeat(101) }), visitor, at)).rejects.toThrow();
    for (let count = 0; count < FORM_RATE_LIMIT.limit; count++) await submitEnquiry(contact(), visitor, at);
  });

  it("lets the database refuse a form it does not know", async () => {
    await expect(submitEnquiry(contact({ form: "OTHER" as never }), ip(), at)).rejects.toThrow();
  });

  it("deletes an enquiry's notes with it", async () => {
    const id = await submitEnquiry(contact(), ip(), at);
    await getDb().insert(enquiryNotes).values({ enquiryId: id, body: "Called back." });
    await getDb().delete(enquiries).where(eq(enquiries.id, id));
    expect(await getDb().select().from(enquiryNotes).where(eq(enquiryNotes.enquiryId, id))).toEqual([]);
  });
});
