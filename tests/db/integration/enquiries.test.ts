import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { FORM_RATE_LIMIT, INBOX_PAGE_SIZE } from "@/constants/limits";
import { UI_TEXT, VALIDATION_MESSAGES } from "@/constants/messages";
import { closeDb, getDb } from "@/db/client";
import { auditLog, authUser, enquiries, enquiryNotes, errorLog, rateLimits, records } from "@/db/schema";
import {
  addEnquiryNote,
  type EnquirySubmission,
  getEnquiry,
  listEnquiries,
  receiveEnquiry,
  retryEnquiryAlert,
  sendEnquiryAlert,
  setEnquiryStatus,
  submitEnquiry,
} from "@/features/enquiries/api";
import { getOperations } from "@/lib/content/operations";
import { createRecord, publishRecord } from "@/lib/content/records";
import { deleteMail, mailText, searchMail, waitForMail } from "@tests/support/mailpit";
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
  await deleteMail((await searchMail(`subject:"${ALERT_NAME}"`)).map((message) => message.ID));
  await getDb().delete(errorLog).where(eq(errorLog.message, "Enquiry alert email not sent"));
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
    turnstileToken: "token-from-cloudflare",
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
      // A Qatar number reads as people write it; any other as stored.
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
        turnstileToken: "token-from-cloudflare",
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

/** A name of its own, so this file's alerts are found in Mailpit and nobody else's. */
const ALERT_NAME = `Alert ${crypto.randomUUID().slice(0, 8)}`;

const contactFor = (name: string) =>
  enquirySchema.parse({
    form: "CONTACT",
    name,
    phone: "5551 2345",
    email: "mariam@example.com",
    message: "A nurse at night?\nFrom Sunday.",
    consent: true,
    turnstileToken: "token-from-cloudflare",
  });

const emailStatus = async (id: string) =>
  (await getDb().select({ status: enquiries.emailStatus }).from(enquiries).where(eq(enquiries.id, id)))[0].status;

describe("the enquiry's alert, through Mailpit (plan §10.4, §17)", () => {
  it("goes to the enquiries recipients, answered straight to the visitor, with every answer, and is marked sent", async () => {
    const id = await receiveEnquiry(contactFor(ALERT_NAME), ip(), at);
    expect(await emailStatus(id)).toBe("PENDING");
    expect(await sendEnquiryAlert(id)).toBe("SENT");
    expect(await emailStatus(id)).toBe("SENT");

    const [message] = await waitForMail(`subject:"New message from ${ALERT_NAME}"`);
    const { enquiriesTo } = await getOperations();
    expect(message.To.map((to) => to.Address)).toEqual(enquiriesTo);
    expect(message.ReplyTo).toEqual([expect.objectContaining({ Address: "mariam@example.com" })]);
    // SMTP carries lines ended CRLF.
    const text = (await mailText(message.ID)).replaceAll("\r\n", "\n");
    expect(text).toContain(`${UI_TEXT.phone}:\n+974 5551 2345`);
    expect(text).toContain(`${UI_TEXT.message}:\nA nurse at night?\nFrom Sunday.`);
    expect(text).toContain(`/admin/enquiries/${id}`);
  });

  it("keeps the enquiry when the mail server cannot be reached: marked not sent, logged without anything personal", async () => {
    const id = await receiveEnquiry(contactFor(`${ALERT_NAME} unsent`), ip(), at);
    vi.stubEnv("SMTP_PORT", "9");
    try {
      expect(await sendEnquiryAlert(id)).toBe("NOT_SENT");
    } finally {
      vi.unstubAllEnvs();
    }
    expect(await emailStatus(id)).toBe("NOT_SENT");
    const [logged] = await getDb()
      .select({ context: errorLog.context, detail: errorLog.detail, stack: errorLog.stack })
      .from(errorLog)
      .where(eq(errorLog.message, "Enquiry alert email not sent"));
    expect(logged.context).toEqual({ enquiryId: id });
    expect(JSON.stringify(logged)).not.toContain("mariam@example.com");
    expect(JSON.stringify(logged)).not.toContain(ALERT_NAME);
  });

  it("is sent again by the admin's Retry, recorded, and never twice once it went", async () => {
    const id = await receiveEnquiry(contactFor(`${ALERT_NAME} retried`), ip(), at);
    await getDb().update(enquiries).set({ emailStatus: "NOT_SENT" }).where(eq(enquiries.id, id));
    expect(await retryEnquiryAlert(id, actor)).toBe("SENT");
    expect(await emailStatus(id)).toBe("SENT");
    const [entry] = await getDb()
      .select({ action: auditLog.action, changes: auditLog.changes })
      .from(auditLog)
      .where(eq(auditLog.entityId, id));
    expect(entry).toEqual({ action: "UPDATE", changes: { emailStatus: { from: "NOT_SENT", to: "SENT" } } });

    await expect(retryEnquiryAlert(id, actor)).rejects.toMatchObject({ code: "EMAIL_ALREADY_SENT", httpStatus: 422 });
  });

  it("answers not found for an enquiry that is gone", async () => {
    const gone = crypto.randomUUID();
    await expect(sendEnquiryAlert(gone)).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
    await expect(retryEnquiryAlert(gone, actor)).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
  });
});

describe("the enquiries inbox, against the local MySQL (plan §10.5)", () => {
  /** An inbox of its own: the table emptied, then these enquiries, a minute apart, oldest first. */
  async function inbox(...entries: Partial<EnquirySubmission>[]) {
    await getDb().delete(enquiries);
    const ids: string[] = [];
    for (const [index, entry] of entries.entries()) {
      ids.push(await submitEnquiry(contact(entry), ip(), new Date(at.getTime() + index * 60_000)));
    }
    return ids;
  }

  it("lists newest first, by form and by status, with how many there are in all", async () => {
    const [first, second, third] = await inbox({ form: "QUOTE" }, { form: "CONTACT" }, { form: "QUOTE" });
    await setEnquiryStatus(first, "RESOLVED", actor);

    const all = await listEnquiries({ q: null, page: 1 });
    expect(all.items.map((item) => item.id)).toEqual([third, second, first]);
    expect(all).toMatchObject({ total: 3, page: 1, pageSize: INBOX_PAGE_SIZE });
    expect(all.items[0]).toEqual({
      id: third,
      form: "QUOTE",
      status: "NEW",
      emailStatus: "PENDING",
      name: "Mariam Ali",
      email: "mariam@example.com",
      phone: "+97455512345",
      createdAt: expect.any(Date),
    });

    expect((await listEnquiries({ form: "QUOTE", q: null, page: 1 })).items.map((item) => item.id)).toEqual([
      third,
      first,
    ]);
    const resolved = await listEnquiries({ status: "RESOLVED", q: null, page: 1 });
    expect(resolved.items.map((item) => item.id)).toEqual([first]);
    expect(resolved.total).toBe(1);
  });

  it("finds by name, email or phone however it was typed; a search's % and _ mean themselves", async () => {
    const [omar, aisha, percent] = await inbox(
      { name: "Omar Haddad", email: "omar@school.qa", phone: "+97433334444" },
      { name: "Aisha Rahman", email: "aisha_r@example.com", phone: "+447700900123" },
      { name: "100% Care Ltd", email: "care@example.com" },
    );
    const found = async (q: string) => (await listEnquiries({ q, page: 1 })).items.map((item) => item.id);
    expect(await found("omar")).toEqual([omar]);
    expect(await found("SCHOOL.QA")).toEqual([omar]);
    expect(await found("3333 4444")).toEqual([omar]);
    expect(await found("+44 7700")).toEqual([aisha]);
    expect(await found("a_r")).toEqual([aisha]);
    expect(await found("%")).toEqual([percent]);
    expect(await found("_")).toEqual([aisha]);
    expect(await found("12")).toEqual([]);
  });

  it("gives the inbox a page at a time", async () => {
    await inbox(...Array.from({ length: INBOX_PAGE_SIZE + 2 }, () => ({})));
    const second = await listEnquiries({ q: null, page: 2 });
    expect(second.items).toHaveLength(2);
    expect(second.total).toBe(INBOX_PAGE_SIZE + 2);
    expect((await listEnquiries({ q: null, page: 3 })).items).toEqual([]);
  });

  it("opens an enquiry with every answer as sent and its notes oldest first, each by its admin", async () => {
    const [id] = await inbox({});
    const admin = crypto.randomUUID();
    await getDb()
      .insert(authUser)
      .values({ id: admin, name: "Fatima (admin)", email: `inbox-${admin}@alhidaya.qa`, emailVerified: true });
    try {
      const first = await addEnquiryNote(id, "Called back; no answer.", { adminId: admin, requestId: REQUEST });
      expect(first).toEqual({
        id: expect.any(String),
        body: "Called back; no answer.",
        author: "Fatima (admin)",
        createdAt: expect.any(Date),
      });
      await addEnquiryNote(id, "Visit booked for Sunday.", actor);

      const enquiry = await getEnquiry(id);
      expect(enquiry).toMatchObject({ id, form: "CONTACT", status: "NEW", fields: contact().fields });
      expect(enquiry.notes.map((note) => [note.body, note.author])).toEqual([
        ["Called back; no answer.", "Fatima (admin)"],
        ["Visit booked for Sunday.", null],
      ]);

      // The audit trail says a note was added, never what it says (AGENTS.md §8).
      const entries = await getDb()
        .select({ action: auditLog.action, changes: auditLog.changes, summary: auditLog.summary })
        .from(auditLog)
        .where(eq(auditLog.entityId, id));
      expect(entries).toEqual([
        { action: "NOTE_ADD", changes: null, summary: null },
        { action: "NOTE_ADD", changes: null, summary: null },
      ]);
    } finally {
      await getDb().delete(authUser).where(eq(authUser.id, admin));
    }
  });

  it("moves an enquiry along, recorded from and to, and records nothing when nothing changes", async () => {
    const [id] = await inbox({});
    await setEnquiryStatus(id, "IN_PROGRESS", actor);
    await setEnquiryStatus(id, "IN_PROGRESS", actor);
    expect((await getEnquiry(id)).status).toBe("IN_PROGRESS");
    const entries = await getDb()
      .select({ action: auditLog.action, changes: auditLog.changes })
      .from(auditLog)
      .where(eq(auditLog.entityId, id));
    expect(entries).toEqual([{ action: "STATUS_CHANGE", changes: { status: { from: "NEW", to: "IN_PROGRESS" } } }]);
  });

  it("keeps the database's last word on a note: one longer than its column is refused as invalid", async () => {
    const [id] = await inbox({});
    await expect(addEnquiryNote(id, "x".repeat(2001), actor)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      httpStatus: 400,
    });
    expect((await getEnquiry(id)).notes).toEqual([]);
  });

  it("answers not found for an enquiry that is gone, whatever is asked of it", async () => {
    const gone = crypto.randomUUID();
    await expect(getEnquiry(gone)).rejects.toMatchObject({ code: "RECORD_NOT_FOUND", httpStatus: 404 });
    await expect(setEnquiryStatus(gone, "RESOLVED", actor)).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
    await expect(addEnquiryNote(gone, "Note", actor)).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
  });
});
