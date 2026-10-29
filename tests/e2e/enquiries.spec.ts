import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { eq } from "drizzle-orm";

import { ERROR_MESSAGES, UI_TEXT, VALIDATION_MESSAGES } from "@/constants/messages";
import { API_ROUTES, ROUTES } from "@/constants/routes";
import { closeDb, getDb } from "@/db/client";
import { enquiries } from "@/db/schema";
import { HONEYPOT_FIELD } from "@/lib/api/honeypot";
import { TURNSTILE_FIELD } from "@/lib/turnstile/endpoints";

/**
 * The Quote and Contact forms (plan §10, R4.1, R4.2): each mistake beside its
 * field, the thanks in place of the form, and nothing typed lost when a send
 * fails. Turnstile runs on Cloudflare's test keys, which always pass, and the
 * server checks each token with Cloudflare. Each journey is a visitor of its
 * own, so the rate limit (§10.3) never mixes them up.
 */
test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 250) + 1}` });
});

test.afterAll(async () => {
  await closeDb();
});

/** A text field by its exact label: "Phone" is not "A phone call", "Message" not "Send us a message". */
const field = (page: Page, label: string) => page.getByRole("textbox", { name: label, exact: true });

/** Cloudflare's token in the form: the check, loaded when the visitor reached in, has passed. */
const checked = (page: Page) => expect(page.locator(`input[name="${TURNSTILE_FIELD}"]`)).toHaveValue(/.+/);

const stored = async (email: string) =>
  getDb()
    .select({ form: enquiries.form, name: enquiries.name, phone: enquiries.phone, fields: enquiries.fields })
    .from(enquiries)
    .where(eq(enquiries.email, email));

async function fillContact(page: Page, email: string) {
  await field(page, UI_TEXT.yourName).fill("Mariam Ali");
  await field(page, UI_TEXT.phone).fill("5551 2345");
  await field(page, UI_TEXT.email).fill(email);
  await field(page, UI_TEXT.message).fill("Do you have a nurse for my father at night?");
  await page.getByRole("checkbox", { name: new RegExp(UI_TEXT.consent) }).check();
}

test("the Contact form shows each mistake beside its field, then takes the message (plan §10.2)", async ({ page }) => {
  const email = `contact-${crypto.randomUUID()}@example.com`;
  await page.goto(ROUTES.contact);
  const form = page.locator("form");

  await form.getByRole("button", { name: UI_TEXT.sendMessage }).click();
  await expect(field(page, UI_TEXT.yourName)).toBeFocused();
  await expect(field(page, UI_TEXT.yourName)).toHaveAccessibleDescription(
    VALIDATION_MESSAGES.required(UI_TEXT.yourName),
  );
  await expect(form.getByText(VALIDATION_MESSAGES.consent)).toBeVisible();
  expect((await new AxeBuilder({ page }).include("form").analyze()).violations).toEqual([]);

  await fillContact(page, email);
  // A mistake fixed clears as it is fixed.
  await expect(form.getByText(VALIDATION_MESSAGES.required(UI_TEXT.yourName))).toHaveCount(0);
  await checked(page);
  await form.getByRole("button", { name: UI_TEXT.sendMessage }).click();

  const thanks = page.getByRole("group", { name: UI_TEXT.messageSent });
  await expect(thanks).toBeFocused();
  await expect(thanks.getByRole("link", { name: UI_TEXT.whatsapp })).toHaveAttribute("href", /^https:\/\/wa\.me\//);
  await expect(page.locator("form")).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  expect(await stored(email)).toEqual([
    {
      form: "CONTACT",
      name: "Mariam Ali",
      phone: "+97455512345",
      fields: [
        { label: UI_TEXT.yourName, value: "Mariam Ali" },
        { label: UI_TEXT.phone, value: "+97455512345" },
        { label: UI_TEXT.email, value: email },
        { label: UI_TEXT.message, value: "Do you have a nurse for my father at night?" },
        { label: UI_TEXT.consent, value: UI_TEXT.consentGiven },
      ],
    },
  ]);
});

test("the Quote form starts on the service the visitor came from, and keeps the words they chose (plan §10.1)", async ({
  page,
}) => {
  const email = `quote-${crypto.randomUUID()}@example.com`;
  await page.goto(ROUTES.quoteFor("school-nurse-staffing"));
  await expect(page.getByRole("combobox", { name: UI_TEXT.service })).toHaveValue("school-nurse-staffing");

  await field(page, UI_TEXT.yourName).fill("Omar Haddad");
  await field(page, `${UI_TEXT.organisation} (${UI_TEXT.optional})`).fill("Doha Primary School");
  await page.getByRole("radio", { name: "A school" }).check();
  await field(page, UI_TEXT.phone).fill("+44 20 7946 0958");
  await field(page, UI_TEXT.email).fill(email);
  await page.getByRole("radio", { name: "Email", exact: true }).check();
  await field(page, UI_TEXT.message).fill("Two school nurses from January.");
  await page.getByRole("checkbox", { name: new RegExp(UI_TEXT.consent) }).check();
  expect((await new AxeBuilder({ page }).include("form").analyze()).violations).toEqual([]);
  await checked(page);
  await page.getByRole("button", { name: UI_TEXT.sendQuote }).click();

  await expect(page.getByRole("group", { name: UI_TEXT.quoteSent })).toBeFocused();
  const [enquiry] = await stored(email);
  expect(enquiry.form).toBe("QUOTE");
  expect(enquiry.fields).toEqual(
    expect.arrayContaining([
      { label: UI_TEXT.organisation, value: "Doha Primary School" },
      { label: UI_TEXT.careFor, value: "A school" },
      { label: UI_TEXT.service, value: expect.stringMatching(/school/i) },
      { label: UI_TEXT.phone, value: "+442079460958" },
      { label: UI_TEXT.contactMethod, value: "Email" },
    ]),
  );
});

test("an address naming no published service starts the Quote form on not sure yet", async ({ page }) => {
  await page.goto(ROUTES.quoteFor("no-such-service"));
  await expect(page.getByRole("combobox", { name: UI_TEXT.service })).toHaveValue("");
});

test("a send that fails says so, gives its reference, and keeps everything typed (plan §30.3)", async ({ page }) => {
  await page.route(API_ROUTES.enquiries, (route) =>
    route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        error: { code: "EXTERNAL_SERVICE_ERROR", message: ERROR_MESSAGES.EXTERNAL_SERVICE_ERROR, requestId: "req_e2e" },
      }),
    }),
  );
  await page.goto(ROUTES.contact);
  await fillContact(page, "kept@example.com");
  await checked(page);
  await page.getByRole("button", { name: UI_TEXT.sendMessage }).click();

  const alert = page.getByRole("alert").filter({ hasText: UI_TEXT.messageNotSent });
  await expect(alert).toContainText(UI_TEXT.messageNotSent);
  await expect(alert).toContainText(ERROR_MESSAGES.EXTERNAL_SERVICE_ERROR);
  await expect(alert).toContainText("req_e2e");
  await expect(field(page, UI_TEXT.email)).toHaveValue("kept@example.com");
  await expect(field(page, UI_TEXT.message)).toHaveValue("Do you have a nurse for my father at night?");
});

test("a form that comes back with the trap filled is thanked and thrown away (plan §10.3)", async ({ page }) => {
  const email = `trap-${crypto.randomUUID()}@example.com`;
  await page.goto(ROUTES.contact);
  await fillContact(page, email);
  // What a bot does: fill every field it finds, the hidden one too.
  await page.locator(`input[name="${HONEYPOT_FIELD}"]`).evaluate((input: HTMLInputElement, value) => {
    input.value = value;
  }, "https://spam.example");
  await checked(page);
  await page.getByRole("button", { name: UI_TEXT.sendMessage }).click();
  await expect(page.getByRole("group", { name: UI_TEXT.messageSent })).toBeVisible();
  expect(await stored(email)).toEqual([]);
});
