import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { SEED_SERVICES, seedPages } from "@/db/seed/content";

test("About reserves its opening title before the font arrives (D160)", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "the observed font rewrap is at the desktop heading width");
  await page.emulateMedia({ reducedMotion: "reduce" });
  let release!: () => void;
  const fontGate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/*.woff2", async (route) => {
    await fontGate;
    await route.continue();
  });
  try {
    await page.goto(ROUTES.about, { waitUntil: "domcontentloaded" });
    const opening = page.locator(".opening-blend");
    const before = (await opening.boundingBox())!;
    release();
    await page.evaluate(() => document.fonts.ready);
    const after = (await opening.boundingBox())!;
    expect(Math.abs(after.height - before.height)).toBeLessThan(1);
  } finally {
    release();
  }
});

test("the approved photo/header blend preserves the coloured logo and clear navigation on all three pages (D158)", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of [
    ROUTES.home,
    ROUTES.about,
    ROUTES.services,
    ROUTES.service("home-nursing-care"),
    ROUTES.service("school-nurse-staffing"),
  ]) {
    await page.goto(route);
    const opening = page.locator(".opening-blend");
    await expect(opening).toHaveCount(1);
    const photo = opening.locator("img").first();
    await expect(photo).toHaveAttribute("sizes", "100vw");
    const header = page.locator(".site-header");
    const logo = header.locator("img").first();
    await expect(logo).toBeVisible();
    expect(await logo.getAttribute("src")).not.toContain("logo-white");
    const fade = await opening
      .locator(".slides-band > div:last-child, :scope.opening-blend--page > div:last-child")
      .evaluate((e) => getComputedStyle(e).maskImage);
    expect(fade).toContain("linear-gradient");
    await expect(header).toHaveCSS("background-color", "rgb(252, 253, 254)");
    const headerBox = (await header.boundingBox())!;
    const openingBox = (await opening.boundingBox())!;
    expect(Math.abs(headerBox.y - openingBox.y)).toBeLessThan(1);
    const photoBox = (await photo.boundingBox())!;
    expect(photoBox.width).toBe(testInfo.project.use.viewport!.width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  await page.goto(ROUTES.contact);
  await expect(page.locator(".opening-blend")).toHaveCount(0);
});

test("mobile menu WhatsApp and Call tiles sit side by side, each number on one line, at every phone width (D159, D167)", async ({
  page,
}) => {
  for (const width of [320, 360, 390, 414]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(ROUTES.home);
    await page.getByRole("button", { name: UI_TEXT.menu, exact: true }).click();
    const menu = page.getByRole("dialog", { name: UI_TEXT.menu });
    // Measure once the sheet and its rows have settled (D167), not while they move.
    await menu.evaluate((sheet) => Promise.all(sheet.getAnimations({ subtree: true }).map((a) => a.finished)));
    const whatsapp = menu.getByRole("link", { name: new RegExp(`^${UI_TEXT.whatsappUs}`) });
    const call = menu.getByRole("link", { name: new RegExp(`^${UI_TEXT.callUs}`) });
    for (const tile of [whatsapp, call]) {
      await expect(tile).toBeInViewport();
      const box = (await tile.boundingBox())!;
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      for (const text of await tile.locator("span > span").all())
        expect(await text.evaluate((e) => e.scrollWidth <= e.clientWidth + 1), `${width}`).toBe(true);
      // Normal-size numbers fit on one line; enlarged text is allowed to reflow.
      expect(
        await tile
          .locator("span > span")
          .last()
          .evaluate((e) => {
            const range = document.createRange();
            range.selectNodeContents(e);
            return range.getClientRects().length;
          }),
      ).toBe(1);
    }
    expect((await whatsapp.boundingBox())!.y).toBe((await call.boundingBox())!.y);
    await expect(whatsapp.locator("use")).toHaveCount(1);
    await expect(menu).not.toContainText("24/7");
    // Launch test content has no brochure; its unchanged fallback stays available.
    await expect(menu.getByRole("link", { name: UI_TEXT.requestQuote, exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  }
});

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
  await expect(page.getByRole("region", { name: "What we stand for" }).getByRole("article")).toHaveCount(3);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("Mission and Vision settle as distinct panels, with readable statements and masked headings (D137)", async ({
  page,
}, testInfo) => {
  await page.goto(ROUTES.about);
  const mission = page.getByRole("article", { name: UI_TEXT.mission });
  const vision = page.getByRole("article", { name: UI_TEXT.vision });
  await mission.scrollIntoViewIfNeeded();
  for (const panel of [mission, vision]) {
    await panel.scrollIntoViewIfNeeded();
    await expect.poll(() => panel.evaluate((element) => getComputedStyle(element).opacity)).toBe("1");
    await expect
      .poll(() => panel.locator("[data-mission-statement]").evaluate((element) => getComputedStyle(element).opacity))
      .toBe("1");
    await expect
      .poll(() =>
        panel
          .locator("[data-word]")
          .first()
          .evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m42),
      )
      .toBe(0);
  }
  expect(await mission.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(
    await vision.evaluate((element) => getComputedStyle(element).backgroundColor),
  );
  await page.locator("#mission").screenshot({ path: testInfo.outputPath("mission-vision.png") });
});

test("Services lists every service together as compact cards on pastel green, and passes axe (D150)", async ({
  page,
}) => {
  await page.goto(ROUTES.services);
  await expect(page.getByRole("heading", { level: 1, name: headline("SERVICES") })).toBeVisible();
  const index = page.getByRole("region", { name: "All services" });
  await expect(index).toHaveCSS("background-color", "rgb(238, 245, 226)");
  await expect(index.getByRole("list")).toHaveCount(1);
  await expect(index.getByText("For families", { exact: true })).toHaveCount(0);
  await expect(index.getByText("For hospitals, clinics & schools", { exact: true })).toHaveCount(0);
  await expect(index.locator(".aspect-\\[3\\/4\\]")).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Talk to us" })).toHaveCSS("background-color", "rgb(241, 246, 251)");
  for (const service of SEED_SERVICES) await expect(index.getByRole("link", { name: service.name.en })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("a family service opens with its photo, WhatsApp and a call, and leads on to the others", async ({ page }) => {
  await page.goto(ROUTES.services);
  await page.getByRole("region", { name: "All services" }).getByRole("link", { name: "Home nursing care" }).click();
  await expect(page).toHaveURL(ROUTES.service("home-nursing-care"));
  await expect(page).toHaveTitle(/^Home nursing care · /);

  const sign = page.locator("#start");
  await expect(sign.getByRole("heading", { level: 1, name: "Home nursing care" })).toBeVisible();
  await expect(sign.getByRole("link")).toHaveCount(0);
  await expect(page.getByRole("region", { name: UI_TEXT.aboutService })).toBeVisible();
  await expect(sign.getByRole("img")).toBeVisible();
  const others = page.getByRole("region", { name: UI_TEXT.otherServices });
  const relatedLinks = others.getByRole("listitem").getByRole("link");
  await expect(relatedLinks).toHaveCount(3);
  await expect(others).toHaveCSS("background-color", "rgb(238, 245, 226)");
  const allowed = SEED_SERVICES.filter((s) => s.slug !== "home-nursing-care").map((s) => ROUTES.service(s.slug));
  const hrefs = await relatedLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(new Set(hrefs).size).toBe(3);
  expect(hrefs.every((href) => allowed.includes(href!))).toBe(true);
  await expect(others.getByRole("link", { name: UI_TEXT.allServices })).toHaveAttribute("href", ROUTES.services);
  await expect(others.getByText("For families", { exact: true })).toHaveCount(0);
  await expect(others.getByRole("link", { name: "Home nursing care" })).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("a staffing service asks for a quote with the service already chosen; an unknown one is not found", async ({
  page,
}) => {
  await page.goto(ROUTES.service("school-nurse-staffing"));
  await expect(page.locator("#start").getByRole("link")).toHaveCount(0);
  const related = page.getByRole("region", { name: UI_TEXT.otherServices }).getByRole("listitem").getByRole("link");
  await expect(related).toHaveCount(3);
  const links = await related.evaluateAll((items) => items.map((item) => item.getAttribute("href")));
  expect(new Set(links).size).toBe(3);
  expect(links).not.toContain(ROUTES.service("school-nurse-staffing"));
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
  const message = page.getByRole("region", { name: "Send us a message" });
  await expect(message.getByText("Retaj Building, Bin Naifaa 80")).toBeVisible();
  await expect(message.getByRole("link", { name: UI_TEXT.openInMaps })).toHaveAttribute(
    "href",
    /^https:\/\/www\.google\.com\/maps\//,
  );
  await expect(message.getByTitle(UI_TEXT.satelliteMap)).toBeVisible();
  await expect(message.getByTitle(UI_TEXT.satelliteMap)).toHaveAttribute(
    "src",
    /https:\/\/maps\.google\.com\/maps\?.*t=k.*output=embed/,
  );
  await expect(message).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("Request a Quote opens on its sign above the form's place, and passes axe (plan §6.8)", async ({ page }) => {
  const form = seedPages().QUOTE.sections[1];
  if (form.type !== "FORM") throw new Error("the quote page holds its form");
  await page.goto(ROUTES.quote);
  await expect(page).toHaveTitle(new RegExp(`^${PAGE_NAMES.QUOTE} · `));
  await expect(page.getByRole("heading", { level: 1, name: "Tell us the care you need" })).toBeVisible();
  await expect(page.getByRole("region", { name: form.content.heading.en })).toBeVisible();
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

test("Contact keeps Reach us and places the map/office left of its white form on green (D152)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(ROUTES.contact);
  const opening = page.locator("#start");
  const reach = page.getByRole("region", { name: "Reach us" });
  const message = page.getByRole("region", { name: "Send us a message" });
  await expect(opening).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(opening.getByRole("img")).toHaveCount(0);
  await expect(reach).toHaveCSS("background-color", "rgb(15, 100, 172)");
  await expect(message).toHaveCSS("background-color", "rgb(15, 100, 172)");
  await expect(message.locator(".contact-message-panel")).toHaveCSS("background-color", "rgb(238, 245, 226)");
  const [office, form] = await message.locator(".contact-message-layout > div").all();
  const officeBox = await office.boundingBox(),
    formBox = await form.boundingBox();
  if (page.viewportSize()!.width >= 1024) expect(formBox!.x).toBeGreaterThan(officeBox!.x + officeBox!.width);
  else expect(formBox!.y).toBeGreaterThan(officeBox!.y + officeBox!.height);
  await expect(form).toHaveCSS("background-color", "rgb(252, 253, 254)");
  await expect(office.getByRole("heading", { name: UI_TEXT.visitOffice })).toBeVisible();
  await expect(office.getByTitle(UI_TEXT.satelliteMap)).toBeVisible();
  const name = await message.getByRole("textbox", { name: UI_TEXT.yourName, exact: true }).boundingBox();
  const phone = await message.getByRole("textbox", { name: UI_TEXT.phone, exact: true }).boundingBox();
  if (page.viewportSize()!.width >= 640) expect(Math.abs(name!.y - phone!.y)).toBeLessThan(1);
  else expect(phone!.y).toBeGreaterThan(name!.y);
  await expect(message.getByRole("textbox", { name: UI_TEXT.phone, exact: true })).toHaveAttribute(
    "placeholder",
    UI_TEXT.phonePlaceholder,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("Contact satellite frame fits phones, tablets, laptops and doubled text (D179)", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one responsive map matrix");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const rows = [];
  for (const width of [320, 360, 390, 414, 640, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(ROUTES.contact);
    for (const scale of ["100%", "200%"]) {
      await page.evaluate((size) => {
        document.documentElement.style.fontSize = size;
      }, scale);
      const frame = page.getByTitle(UI_TEXT.satelliteMap);
      const box = await frame.boundingBox();
      rows.push({ width, scale, box });
      expect(box!.width).toBeGreaterThanOrEqual(200);
      expect(box!.height).toBeGreaterThanOrEqual(200);
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      await expect(frame.locator("..")).not.toHaveCSS("box-shadow", "none");
      await expect(page.getByRole("banner")).toHaveCSS("background-color", "rgb(252, 253, 254)");
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  }
  await testInfo.attach("satellite-layouts", { body: JSON.stringify(rows, null, 2), contentType: "application/json" });
});

test("Contact types, holds, deletes fully, and retypes without moving the heading; reduced motion stays whole (D147)", async ({
  page,
}) => {
  await page.goto(ROUTES.contact);
  const writer = page.locator(".typewriter");
  await expect(writer).toHaveAttribute("data-typing", "true");
  const initial = await writer.boundingBox();
  const count = await writer.locator("[data-type-letter]").count();
  const sample = async (time: number) =>
    writer.evaluate((root, at) => {
      root.getAnimations({ subtree: true }).forEach((a) => {
        a.pause();
        a.currentTime = at;
      });
      return [...root.querySelectorAll("[data-type-letter]")].filter((e) => getComputedStyle(e).opacity === "1").length;
    }, time);
  expect(await sample(30)).toBe(0);
  expect(await sample(3000)).toBe(count);
  const deleting = await sample(4300);
  expect(deleting).toBeGreaterThan(0);
  expect(deleting).toBeLessThan(count);
  expect(await sample(5700)).toBe(0);
  const typing = await sample(6900);
  expect(typing).toBeGreaterThan(0);
  expect(typing).toBeLessThan(count);
  const after = await writer.boundingBox();
  expect(after!.height).toBe(initial!.height);
  expect(after!.width).toBe(initial!.width);
  await writer.evaluate((root) => root.getAnimations({ subtree: true }).forEach((a) => a.play()));
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  await expect(writer).toHaveAttribute("data-typing", "false");
  await expect
    .poll(() => writer.evaluate((root) => root.getAnimations({ subtree: true }).every((a) => a.playState === "paused")))
    .toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(writer).not.toHaveAttribute("data-typing");
  expect(await writer.evaluate((root) => root.getAnimations({ subtree: true }).length)).toBe(0);
  expect(
    await writer
      .locator("[data-type-letter]")
      .evaluateAll((letters) => letters.every((e) => getComputedStyle(e).opacity === "1")),
  ).toBe(true);
});

test("Mission and Vision lift on hover or focus, with a static reduced-motion highlight (D149)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(ROUTES.home);
  await page.getByRole("contentinfo").getByRole("link", { name: PAGE_NAMES.ABOUT, exact: true }).click();
  await expect(page).toHaveURL(ROUTES.about);
  for (const name of [UI_TEXT.mission, UI_TEXT.vision]) {
    const panel = page.getByRole("article", { name, exact: true });
    await panel.scrollIntoViewIfNeeded();
    if (await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)) {
      await panel.hover();
      await expect.poll(() => panel.evaluate((e) => getComputedStyle(e).translate)).toBe("0px -12px 24px");
      await expect.poll(() => panel.evaluate((e) => getComputedStyle(e).scale)).toBe("1.035");
    }
    await page.mouse.move(0, 0);
    await page.keyboard.press("Tab");
    await panel.focus();
    await expect.poll(() => panel.evaluate((e) => getComputedStyle(e).translate)).toBe("0px -12px 24px");
    await expect.poll(() => panel.evaluate((e) => getComputedStyle(e).rotate)).not.toBe("none");
    await expect
      .poll(() => panel.locator(".mission-sheen").evaluate((e) => getComputedStyle(e, "::before").animationName))
      .toBe("mission-card-sweep");
    const emblem = panel.locator(".mission-emblem");
    await expect(emblem.locator("svg")).toHaveCSS(
      "animation-name",
      name === UI_TEXT.mission ? "mission-cross-turn" : "vision-globe-turn",
    );
    await expect
      .poll(() => emblem.evaluate((e) => getComputedStyle(e, "::before").animationName))
      .toBe("mission-highlight");
    await expect(emblem.locator("[data-art-part]").nth(1)).toHaveCSS(
      "animation-name",
      name === UI_TEXT.mission ? "mission-cross-arm" : "vision-ring-unfold",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(() => panel.evaluate((e) => getComputedStyle(e).translate)).toBe("none");
    await expect.poll(() => panel.evaluate((e) => getComputedStyle(e, "::after").opacity)).toBe("1");
    await expect(emblem.locator("svg")).toHaveCSS("animation-name", "none");
    await panel.evaluate((e) => (e as HTMLElement).blur());
    await page.emulateMedia({ reducedMotion: "no-preference" });
  }
});

test("every WhatsApp action uses the standard brand mark and the floating shortcut is green (D154)", async ({
  page,
}) => {
  await page.goto(ROUTES.contact);
  const floating = page.getByRole("link", { name: UI_TEXT.whatsappButton, exact: true });
  await expect(floating).toHaveCSS("background-color", "rgb(37, 211, 102)");
  await expect(floating.locator('use[href="/brand/whatsapp.svg#mark"]')).toHaveCount(1);
  // Reach us keeps the mark beside its channel label, above the linked number.
  await expect(
    page.getByRole("term").filter({ hasText: UI_TEXT.whatsapp }).locator('use[href="/brand/whatsapp.svg#mark"]'),
  ).toHaveCount(1);
  const actions = page.locator('a.group[href*="wa.me"]');
  for (const action of await actions.all()) {
    await expect(action.locator('use[href="/brand/whatsapp.svg#mark"]')).toHaveCount(1);
  }
  const asset = await page.request.get("/brand/whatsapp.svg");
  expect(asset.ok()).toBe(true);
  expect(await asset.text()).toContain("Font Awesome");
  await page.goto(ROUTES.home);
  await expect(page.locator('.home-quote a[href*="wa.me"] use[href="/brand/whatsapp.svg#mark"]')).toHaveCount(1);
});
