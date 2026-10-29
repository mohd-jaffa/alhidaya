import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { SEED_SERVICES, seedPages } from "@/db/seed/content";

const headline = (page: "ABOUT" | "SERVICES") => {
  const sign = seedPages()[page].sections[0];
  if (sign.type !== "SIGN") throw new Error("a page opens with its sign");
  return sign.content.headline.en;
};

test("About tells who the company is, its mission, vision and values, and passes axe (plan §6.2)", async ({ page }) => {
  await page.goto(ROUTES.about);
  await expect(page).toHaveTitle(new RegExp(`^${PAGE_NAMES.ABOUT} · `));
  await expect(page.getByRole("heading", { level: 1, name: headline("ABOUT") })).toBeVisible();
  await expect(page.getByRole("region", { name: "Who we are" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: UI_TEXT.mission })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: UI_TEXT.vision })).toBeVisible();
  await expect(page.getByRole("region", { name: "What we stand for" }).getByRole("listitem")).toHaveCount(3);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("Services lists every service on its line, and passes axe (plan §6.3)", async ({ page }) => {
  await page.goto(ROUTES.services);
  await expect(page.getByRole("heading", { level: 1, name: headline("SERVICES") })).toBeVisible();
  const index = page.getByRole("region", { name: "All services" });
  for (const service of SEED_SERVICES) await expect(index.getByRole("link", { name: service.name.en })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("a family service opens on its sky sign with WhatsApp and a call, and leads on to its line", async ({ page }) => {
  await page.goto(ROUTES.services);
  await page.getByRole("region", { name: "All services" }).getByRole("link", { name: "Home nursing care" }).click();
  await expect(page).toHaveURL(ROUTES.service("home-nursing-care"));
  await expect(page).toHaveTitle(/^Home nursing care · /);

  const sign = page.locator("#start");
  await expect(sign.getByRole("heading", { level: 1, name: "Home nursing care" })).toBeVisible();
  await expect(sign.getByRole("link", { name: UI_TEXT.call })).toHaveAttribute("href", "tel:+97431306555");
  await expect(page.getByRole("region", { name: UI_TEXT.aboutService })).toBeVisible();
  await expect(page.locator("#line").getByRole("link", { name: "Elderly care" })).toBeVisible();
  await expect(page.locator("#line").getByRole("link", { name: "Home nursing care" })).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("a staffing service asks for a quote with the service already chosen; an unknown one is not found", async ({
  page,
}) => {
  await page.goto(ROUTES.service("school-nurse-staffing"));
  await expect(page.locator("#start").getByRole("link", { name: UI_TEXT.requestQuote })).toHaveAttribute(
    "href",
    ROUTES.quoteFor("school-nurse-staffing"),
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  const missing = await page.goto(ROUTES.service("no-such-service"));
  expect(missing?.status()).toBe(404);
});

test("Contact lists every way to reach the company and the way to the office, and passes axe (plan §6.7)", async ({
  page,
}) => {
  await page.goto(ROUTES.contact);
  await expect(page).toHaveTitle(new RegExp(`^${PAGE_NAMES.CONTACT} · `));
  const details = page.getByRole("region", { name: "Reach us" });
  await expect(details.getByRole("link", { name: "+974 3130 6555" })).toHaveCount(2);
  await expect(details.getByRole("link", { name: "info@alhidaya.qa" })).toHaveAttribute(
    "href",
    "mailto:info@alhidaya.qa",
  );
  await expect(details.getByText("Retaj Building, Bin Naifaa 80")).toBeVisible();
  await expect(details.getByRole("link", { name: UI_TEXT.openInMaps })).toHaveAttribute(
    "href",
    /^https:\/\/www\.google\.com\/maps\//,
  );
  await expect(page.getByRole("region", { name: "Send us a message" })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("Request a Quote opens on its sign above the form's place, and passes axe (plan §6.8)", async ({ page }) => {
  await page.goto(ROUTES.quote);
  await expect(page).toHaveTitle(new RegExp(`^${PAGE_NAMES.QUOTE} · `));
  await expect(page.getByRole("heading", { level: 1, name: "Tell us the care you need" })).toBeVisible();
  await expect(page.getByRole("region", { name: UI_TEXT.requestQuote })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

for (const [route, key, heading] of [
  [ROUTES.privacy, "PRIVACY", "What we collect"],
  [ROUTES.terms, "TERMS", "Quotes and care"],
] as const) {
  test(`${PAGE_NAMES[key]} reads as the admin wrote it, and passes axe (plan §6.9)`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveTitle(new RegExp(`^${PAGE_NAMES[key]} · `));
    await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}
