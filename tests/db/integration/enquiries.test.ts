import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { FORM_RATE_LIMIT } from "@/constants/limits";
import { UI_TEXT, VALIDATION_MESSAGES } from "@/constants/messages";
import { closeDb, getDb } from "@/db/client";
import { auditLog, enquiries, enquiryNotes, rateLimits, records } from "@/db/schema";
import { type EnquirySubmission, receiveEnquiry, submitEnquiry } from "@/features/enquiries/api";
import { createRecord, publishRecord } from "@/lib/content/records";
import { enquirySchema } from "@/lib/validation";
import { serviceFixture } from "@tests/support/fixtures/content";

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

const REQUEST = `req_enquiries_${crypto.randomUUID()}`;
const actor = { adminId: null, requestId: REQUEST };

beforeAll(async () => {
  await getDb().delete(enquiries);
  await getDb().delete(records);
  // One published service, and one only drafted, which no visitor can choose.
  await publishRecord(
    "SERVICES",
    await createRecord(
      "SERVICES",
      serviceFixture({ name: { en: "School nurse staffing" }, slug: "school-nurse-staffing" }),
      actor,
    ),
    "school-nurse-staffing",
    actor,
  );
  await createRecord("SERVICES", serviceFixture({ slug: "draft-service" }), actor);
});

afterAll(async () => {
  await getDb().delete(enquiries);
  await getDb().delete(rateLimits);
  await getDb().delete(records);
  await getDb().delete(auditLog).where(eq(auditLog.requestId, REQUEST));
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

const quote = (service: string) =>
  enquirySchema.parse({
    form: "QUOTE",
    name: "Omar Haddad",
    organisation: "",
    careFor: "SCHOOL",
    service,
    phone: "+44 20 7946 0958",
    email: "omar@example.com",
    contactMethod: "WHATSAPP",
    message: "Two school nurses from January.",
    consent: true,
  });

describe("receiveEnquiry, against the local MySQL", () => {
  it("keeps a Quote with each answer as the visitor saw it: labels, a choice's words, the service's name", async () => {
    const id = await receiveEnquiry(quote("school-nurse-staffing"), ip(), at);
    const [row] = await getDb().select().from(enquiries).where(eq(enquiries.id, id));
    expect(row).toMatchObject({
      form: "QUOTE",
      name: "Omar Haddad",
      email: "omar@example.com",
      phone: "+442079460958",
    });
    expect(row.fields).toEqual([
      { label: UI_TEXT.yourName, value: "Omar Haddad" },
      { label: UI_TEXT.careFor, value: "A school" },
      { label: UI_TEXT.service, value: "School nurse staffing" },
      { label: UI_TEXT.phone, value: "+442079460958" },
      { label: UI_TEXT.email, value: "omar@example.com" },
      { label: UI_TEXT.contactMethod, value: "WhatsApp" },
      { label: UI_TEXT.message, value: "Two school nurses from January." },
      { label: UI_TEXT.consent, value: UI_TEXT.consentGiven },
    ]);
  });

  it("keeps a Quote with no service chosen, and a Contact message with its four answers", async () => {
    const [noService] = await getDb()
      .select({ fields: enquiries.fields })
      .from(enquiries)
      .where(eq(enquiries.id, await receiveEnquiry(quote(""), ip(), at)));
    expect(noService.fields.map((field) => field.label)).not.toContain(UI_TEXT.service);

    const contactId = await receiveEnquiry(
      enquirySchema.parse({
        form: "CONTACT",
        name: "Mariam Ali",
        phone: "5551 2345",
        email: "mariam@example.com",
        message: "A nurse at night?",
        consent: true,
      }),
      ip(),
      at,
    );
    const [contactRow] = await getDb()
      .select({ fields: enquiries.fields })
      .from(enquiries)
      .where(eq(enquiries.id, contactId));
    expect(contactRow.fields.map((field) => field.label)).toEqual([
      UI_TEXT.yourName,
      UI_TEXT.phone,
      UI_TEXT.email,
      UI_TEXT.message,
      UI_TEXT.consent,
    ]);
  });

  it("refuses a service the site does not show, beside the service field, keeping nothing", async () => {
    const before = await stored();
    for (const slug of ["draft-service", "no-such-service"]) {
      await expect(receiveEnquiry(quote(slug), ip(), at)).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
        httpStatus: 400,
        details: [{ path: "service", message: VALIDATION_MESSAGES.service }],
      });
    }
    expect(await stored()).toBe(before);
  });
});
