import { writeFile } from "node:fs/promises";
import { swipe } from "@tests/support/touch";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { FONT_IDS, FONT_ROLES, FONT_STACKS } from "@/constants/typography";
import { SEED_CLIENTS } from "@/db/seed/clients";
import { SEED_SERVICES, SEED_SITE, seedPages } from "@/db/seed/content";
import { SEED_PHOTOS } from "@/db/seed/photos";
import { E2E_ORIGIN } from "@tests/support/e2e-app";

const sign = seedPages().HOME.sections[0];
if (sign.type !== "SIGN") throw new Error("Home opens with its sign");
const slides = sign.content.slides;

test("Home opens on its slides: the first headline, its words and its photo first, the controls beside (D128)", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveTitle(SEED_SITE.seo.title.en);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const hero = page.getByRole("region", { name: UI_TEXT.slidesLabel });
  await expect(page.getByRole("heading", { level: 1, name: slides[0].headline.en })).toBeVisible();
  await expect(hero.getByText(slides[0].text.en!)).toBeVisible();
  await expect(hero.getByRole("button")).toHaveCount(2);
  await expect(hero.getByRole("button", { name: UI_TEXT.previousSlide })).toBeVisible();
  await expect(hero.getByRole("button", { name: UI_TEXT.nextSlide })).toBeVisible();
  await expect(hero.locator(".slide-bar")).toHaveCount(slides.length);
  // The first slide's photograph, from the current site (D118), served in its made sizes and loaded first.
  const photo = hero.getByRole("img", { name: SEED_PHOTOS.currentHomeVisit.alt });
  await expect(photo).toHaveAttribute("fetchpriority", "high");
  await expect
    .poll(() => photo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth))
    .toBeGreaterThan(0);
  // No button at launch: the admin may give a slide one (D128).
  await expect(hero.getByRole("link")).toHaveCount(0);
});

test("the slides advance every three seconds with plain navigation chevrons and no count or pause", async ({
  page,
}) => {
  await page.goto("/");
  await page.mouse.move(0, 0);
  const hero = page.getByRole("region", { name: UI_TEXT.slidesLabel });
  await expect(hero.getByRole("button")).toHaveCount(2);
  await expect(hero.locator(".slide-photo[data-current] .slide-image")).toHaveCSS("animation-duration", "3s");
  await expect(hero.locator(".slide-bar[data-current] .slide-fill")).toHaveCSS("animation-duration", "3s");
  await expect(hero.getByText(/\d{2} \/ \d{2}/)).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1, name: slides[1].headline.en })).toBeVisible({ timeout: 4500 });
  const outgoing = hero.locator(".slide-photo[data-was] .slide-image");
  expect(await outgoing.evaluate((element) => getComputedStyle(element).animationPlayState)).toBe("paused");
  await expect
    .poll(() => hero.locator(".slide-photo[data-current]").evaluate((element) => getComputedStyle(element).clipPath))
    .toMatch(/^inset\(0px(?: 0(?:px|%)){0,3}\)$/);
  await expect(hero.getByRole("img")).toHaveCount(1);
});

test("hovering and clicking never stall automatic playback; deliberate keyboard focus can pause (D136)", async ({
  page,
}, testInfo) => {
  test.setTimeout(60_000);
  await page.goto("/");
  const hero = page.getByRole("region", { name: UI_TEXT.slidesLabel });
  await hero.hover();
  await hero.click({ position: { x: 20, y: 120 } });
  const image = hero.locator(".slide-photo[data-current] .slide-image");
  expect(await image.evaluate((element) => getComputedStyle(element).animationPlayState)).toBe("running");
  for (const slide of [...slides.slice(1), slides[0]]) {
    await expect(page.getByRole("heading", { level: 1, name: slide.headline.en })).toBeVisible({ timeout: 9000 });
  }
  // Return from the next tab stop with the keyboard: only this deliberate stop pauses the hero.
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(hero).toBeFocused();
  await expect.poll(() => image.evaluate((element) => getComputedStyle(element).animationPlayState)).toBe("paused");
  // Let the paused compositor frame commit before checking that it remains fixed.
  const frame = await image.evaluate(
    (element) =>
      new Promise<string>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(getComputedStyle(element).transform)));
      }),
  );
  await page.waitForTimeout(250);
  expect(await image.evaluate((element) => getComputedStyle(element).transform)).toBe(frame);
  await page.screenshot({ path: testInfo.outputPath("cinematic-hero.png"), fullPage: true });
  await page.keyboard.press("Tab");
  await expect(hero.getByRole("button", { name: UI_TEXT.previousSlide })).toBeFocused();
  await expect.poll(() => image.evaluate((element) => getComputedStyle(element).animationPlayState)).toBe("paused");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1, name: slides.at(-1)!.headline.en })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(hero.getByRole("button", { name: UI_TEXT.nextSlide })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1, name: slides[0].headline.en })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect.poll(() => image.evaluate((element) => getComputedStyle(element).animationPlayState)).toBe("running");
});

test("hero chevrons fit eight progress bars at every phone width and preserve the services clock", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(ROUTES.home);
  const progress = page.locator(".slide-progress");
  await progress.locator(':scope > [aria-hidden="true"]').evaluate((rails) => {
    while (rails.children.length < 8) {
      const rail = rails.firstElementChild!.cloneNode(true) as HTMLElement;
      rail.removeAttribute("data-current");
      rail.removeAttribute("data-done");
      rails.append(rail);
    }
  });
  for (const width of [320, 360, 390, 414, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const scale of ["100%", "200%"]) {
      await page.evaluate((size) => {
        document.documentElement.style.fontSize = size;
      }, scale);
      const box = await progress.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      for (const arrow of await progress.getByRole("button").all()) {
        const target = await arrow.boundingBox();
        expect(target!.width).toBeGreaterThanOrEqual(44);
        expect(target!.height).toBeGreaterThanOrEqual(44);
      }
      for (const rail of await progress.locator(".slide-bar").all())
        expect((await rail.boundingBox())!.width).toBeGreaterThan(1);
    }
  }
  const clocks = await page.evaluate(() => ({
    hero: getComputedStyle(document.querySelector(".slides-band")!).getPropertyValue("--duration-slide").trim(),
    pyramid: getComputedStyle(document.querySelector(".home-services-pyramid")!)
      .getPropertyValue("--duration-slide")
      .trim(),
  }));
  expect(clocks).toEqual({ hero: "3s", pyramid: "6s" });
});

test("Home follows Theme 6: About, the services row, the clients and the short quote (D129 – D133)", async ({
  page,
}) => {
  await page.goto("/");
  const about = page.locator("#about");
  await expect(about.getByRole("link", { name: UI_TEXT.readAboutUs })).toHaveAttribute("href", ROUTES.about);
  await expect(about.getByRole("listitem")).toHaveCount(3);

  const services = page.getByRole("region", { name: "What we do" });
  for (const service of SEED_SERVICES)
    await expect(services.locator(`a[href="${ROUTES.service(service.slug)}"]`)).toHaveAttribute(
      "href",
      ROUTES.service(service.slug),
    );
  await expect(services.getByRole("link", { name: UI_TEXT.allServices })).toHaveAttribute("href", ROUTES.services);

  // The current site's client logos, in its order (D118), each named once for a screen reader.
  const clients = page.locator("#clients");
  await clients.scrollIntoViewIfNeeded();
  for (const client of SEED_CLIENTS) await expect(clients.getByRole("button", { name: client.name })).toHaveCount(1);

  const quote = page.getByRole("region", { name: /Get a free quote/ });
  await expect(quote).toHaveCSS("background-color", "rgb(241, 246, 251)");
  await expect(quote.locator(".quote-contact-icon")).toHaveCount(3);
  await expect(quote.locator(".bg-card").filter({ has: page.locator("form") })).toHaveCount(1);
  await expect(quote.getByRole("textbox", { name: UI_TEXT.message })).toHaveAttribute(
    "placeholder",
    UI_TEXT.shortQuoteMessageHint,
  );
  await expect(quote.getByRole("button", { name: UI_TEXT.sendShortQuote })).toBeVisible();
  await expect(quote.getByRole("link", { name: new RegExp(SEED_SITE.contact.email) })).toHaveAttribute(
    "href",
    `mailto:${SEED_SITE.contact.email}`,
  );
});

test("Home services form the approved pyramid, retaining rear titles/links and moving every six seconds (D143)", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const section = page.getByRole("region", { name: "What we do" });
  await section.scrollIntoViewIfNeeded();
  const pyramid = section.locator(".home-services-pyramid");
  await expect(pyramid).toHaveAttribute("data-pyramid", "true");
  const current = () => pyramid.locator('li[data-current="true"]');
  await expect(current()).toContainText(SEED_SERVICES[2].name.en);
  const rear = pyramid.locator('li[aria-hidden="false"][data-current="false"]').first();
  await expect(rear.locator("a > span")).toBeVisible();
  expect(await rear.locator("img").evaluate((e) => Number(getComputedStyle(e).opacity))).toBeLessThan(1);
  expect(
    await current()
      .locator("img")
      .evaluate((e) => Number(getComputedStyle(e).opacity)),
  ).toBe(1);
  const arrow = section.getByRole("button", { name: UI_TEXT.nextServices });
  await arrow.click();
  await expect(current()).toContainText(SEED_SERVICES[3].name.en);
  await expect(current()).toContainText(SEED_SERVICES[4].name.en, { timeout: 8000 });
  await section.getByRole("button", { name: UI_TEXT.previousServices }).click();
  await expect(current()).toContainText(SEED_SERVICES[3].name.en);
  await page.screenshot({ path: testInfo.outputPath("home-services-pyramid.png"), fullPage: true });
  // A newly visible rear card fades in; inspect contrast after that transition settles.
  await expect
    .poll(() =>
      pyramid
        .locator('li[aria-hidden="false"]')
        .evaluateAll((cards) => cards.every((card) => getComputedStyle(card).opacity === "1")),
    )
    .toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const selected = await current().innerText();
  await page.waitForTimeout(6200);
  expect(await current().innerText()).toBe(selected);
  await arrow.click();
  await expect(current()).toContainText(SEED_SERVICES[4].name.en);
  await page.goto(ROUTES.services);
  await expect(page.locator(".home-services-pyramid")).toHaveCount(0);
});

test("Home retains three landscape pyramid layers within the site gutters, with centred bottom titles (D185)", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "one responsive composition and font matrix");
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const pyramid = page.locator(".home-services-pyramid[data-pyramid]");
  await expect(pyramid).toBeVisible();
  const results: { width: number; font: string; service: string }[] = [];
  for (const width of [320, 360, 390, 414, 640, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await pyramid.scrollIntoViewIfNeeded();
    for (const font of width < 768 ? FONT_IDS : [FONT_IDS[0]]) {
      await page.locator(".site-world").evaluate(
        async (world, { font, stack, roles }) => {
          for (const role of roles) (world as HTMLElement).style.setProperty(`--type-${role}`, stack);
          const variable = getComputedStyle(world).getPropertyValue(`--font-${font}`).split(",")[0].trim();
          await document.fonts.load(`600 16px ${variable}`);
          await document.fonts.load(`400 16px ${variable}`);
          await document.fonts.ready;
        },
        { font, stack: FONT_STACKS[font], roles: FONT_ROLES },
      );
      for (let step = 0; step < SEED_SERVICES.length; step++) {
        const current = pyramid.locator('li[data-current="true"]');
        const service = SEED_SERVICES[(step + 2) % SEED_SERVICES.length].name.en;
        await expect(current).toContainText(service);
        await expect(pyramid.locator('li[aria-hidden="false"]')).toHaveCount(3);
        const result = await pyramid.evaluate((root) => {
          const cards = [...root.querySelectorAll<HTMLElement>('li[aria-hidden="false"]')];
          const card = root.querySelector<HTMLElement>('li[data-current="true"] > a')!;
          const label = card.querySelector<HTMLElement>(".pyramid-service-name")!;
          const bounds = card.getBoundingClientRect();
          const words = label.getBoundingClientRect();
          const track = root.querySelector("ul")!.getBoundingClientRect();
          const container = root.getBoundingClientRect();
          const heading = root.querySelector("h2")!.getBoundingClientRect();
          return {
            overflow: document.documentElement.scrollWidth - innerWidth,
            visibleLayers: cards.filter((el) => {
              const box = el.getBoundingClientRect();
              return box.right > 0 && box.left < innerWidth;
            }).length,
            labelFits:
              words.left >= bounds.left &&
              words.right <= bounds.right &&
              words.top >= bounds.top &&
              words.bottom <= bounds.bottom,
            clippedWords: label.scrollWidth > label.clientWidth + 1 ? 1 : 0,
            touchTarget: bounds.width >= 44 && bounds.height >= 44,
            landscape: bounds.width > bounds.height,
            centred: Math.abs((bounds.left + bounds.right - track.left - track.right) / 2) < 1,
            bottomTitle: Math.abs(words.bottom - bounds.bottom) < 1 && getComputedStyle(label).textAlign === "center",
            noTitleArrow: card.querySelectorAll("svg").length === 0,
            modestTitle: Number.parseFloat(getComputedStyle(label).fontSize) <= 18,
            gutters:
              track.left >= heading.left - 1 && track.right <= container.right - (heading.left - container.left) + 1,
            rearAlignment: cards
              .filter((el) => el.dataset.current !== "true")
              .every((el) => {
                const box = el.getBoundingClientRect();
                return (
                  Math.abs((box.left + box.right - bounds.left - bounds.right) / 2) > 1 &&
                  box.top > bounds.top &&
                  box.bottom < bounds.bottom
                );
              }),
            rearSmaller: cards
              .filter((el) => el.dataset.current !== "true")
              .every((el) => el.getBoundingClientRect().width < bounds.width),
            rearFits: cards.every((el) => {
              const box = el.getBoundingClientRect();
              return box.left >= track.left - 1 && box.right <= track.right + 1 && box.bottom <= track.bottom;
            }),
          };
        });
        expect(result, `${width} / ${font} / ${service}`).toEqual({
          overflow: 0,
          visibleLayers: 3,
          labelFits: true,
          clippedWords: 0,
          touchTarget: true,
          landscape: true,
          centred: true,
          bottomTitle: true,
          noTitleArrow: true,
          modestTitle: true,
          gutters: true,
          rearAlignment: true,
          rearSmaller: true,
          rearFits: true,
        });
        results.push({ width, font, service });
        if (font === FONT_IDS[0] && step === 0)
          await pyramid.screenshot({ path: testInfo.outputPath(`pyramid-${width}.png`) });
        await pyramid.getByRole("button", { name: UI_TEXT.nextServices }).click();
      }
    }
  }
  await writeFile(testInfo.outputPath("pyramid-responsive-labels.json"), JSON.stringify(results, null, 2));
});

test("landscape service captions reflow without clipping with doubled phone text (D185)", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "one enlarged-text font matrix");
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  const pyramid = page.locator(".home-services-pyramid[data-pyramid]");
  await expect(pyramid).toBeVisible();
  for (const font of FONT_IDS) {
    await page.locator(".site-world").evaluate(
      async (world, { font, stack, roles }) => {
        for (const role of roles) (world as HTMLElement).style.setProperty(`--type-${role}`, stack);
        await document.fonts.load(
          `600 32px ${getComputedStyle(world).getPropertyValue(`--font-${font}`).split(",")[0].trim()}`,
        );
        await document.fonts.ready;
      },
      { font, stack: FONT_STACKS[font], roles: FONT_ROLES },
    );
    for (let step = 0; step < SEED_SERVICES.length; step++) {
      await pyramid.scrollIntoViewIfNeeded();
      const result = await pyramid.evaluate((root) => {
        const card = root.querySelector<HTMLElement>('li[data-current="true"] > a')!;
        const title = card.querySelector<HTMLElement>(".pyramid-service-name")!;
        const a = card.getBoundingClientRect(),
          t = title.getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          fits: t.top >= a.top - 1 && t.bottom <= a.bottom + 1 && title.scrollWidth <= title.clientWidth + 1,
          largeText: Number.parseFloat(getComputedStyle(title).fontSize) >= 32,
        };
      });
      expect(result, `${font} / ${step}`).toEqual({ overflow: 0, fits: true, largeText: true });
      await pyramid.getByRole("button", { name: UI_TEXT.nextServices }).click();
    }
  }
  expect((await new AxeBuilder({ page }).include(".home-services-pyramid").analyze()).violations).toEqual([]);
  // No published cards must not reserve an empty photo-sized block.
  await pyramid.locator("ul").evaluate((list) => list.replaceChildren());
  await expect(pyramid.locator("ul")).toBeHidden();
  await expect(page.getByRole("link", { name: UI_TEXT.allServices, exact: true })).toBeVisible();
});

test("the clients' rows run opposite ways, and a chosen logo stops its row until let go (D133)", async ({ page }) => {
  await page.goto("/");
  const clients = page.locator("#clients");
  await clients.scrollIntoViewIfNeeded();
  const [first, second] = [clients.locator(".logo-track").first(), clients.locator(".logo-track").nth(1)];
  const offset = (track: typeof first) =>
    track.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m41);
  const state = (track: typeof first) => track.evaluate((element) => getComputedStyle(element).animationPlayState);
  await page.mouse.move(0, 0);
  const before = await offset(first);
  await expect.poll(() => offset(first)).not.toBe(before);
  expect(await second.evaluate((element) => getComputedStyle(element).animationDirection)).toBe("reverse");

  const logo = clients.getByRole("button", { name: SEED_CLIENTS[0].name });
  await logo.evaluate((element: HTMLElement) => element.click());
  await expect(logo).toHaveAttribute("aria-pressed", "true");
  await page.mouse.move(0, 0);
  await expect.poll(() => state(first)).toBe("paused");
  await page.locator("footer").click({ position: { x: 5, y: 5 } });
  await expect(logo).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => state(first)).toBe("running");
});

test("the wheel scrolls Home to its very end: the page grows with its content while Lenis runs", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);
  // Lenis watches the page's size to know how far it may scroll: html must not stay the window's height.
  expect(await page.evaluate(() => document.documentElement.getBoundingClientRect().height)).toBeGreaterThan(
    await page.evaluate(() => window.innerHeight * 2),
  );
  await page.mouse.move(200, 300);
  for (let stroke = 0; stroke < 40; stroke++) await page.mouse.wheel(0, 800);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight - window.scrollY))
    .toBeLessThanOrEqual(2);
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("everything is in place: slides stay still until manually selected, and the rows stand in place", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);
    await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
    const hero = page.getByRole("region", { name: UI_TEXT.slidesLabel });
    await expect(hero.getByRole("button")).toHaveCount(2);
    await page.waitForTimeout(3500);
    await expect(page.getByRole("heading", { level: 1, name: slides[0].headline.en })).toBeVisible();
    await hero.getByRole("button", { name: UI_TEXT.previousSlide }).click();
    await expect(page.getByRole("heading", { level: 1, name: slides.at(-1)!.headline.en })).toBeVisible();
    await hero.getByRole("button", { name: UI_TEXT.nextSlide }).click();
    await expect(page.getByRole("heading", { level: 1, name: slides[0].headline.en })).toBeVisible();
    const style = (selector: string) =>
      page
        .locator(selector)
        .first()
        .evaluate((element) => getComputedStyle(element).animationName);
    expect(await style(".logo-track")).toBe("none");
    await expect(page.locator(".logo-copy").first()).toBeHidden();
  });
});

test("the navbar stays at the page top and never returns while reading farther down (D162)", async ({ page }) => {
  await page.goto("/");
  const header = page.getByRole("banner");
  await expect(header).toBeInViewport();
  await expect(header).toHaveCSS("position", "relative");
  await expect(page.getByRole("navigation", { name: "On this page" })).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, 1800));
  await expect(header).not.toBeInViewport();
  await page.evaluate(() => window.scrollTo(0, 1200));
  await expect(header).not.toBeInViewport();
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).toBeInViewport();
});

test("the menu's deep-blue pill slides to the page opened, then rests there (D134)", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The pill of pages shows from 1024 px; a phone has the menu.");
  await page.goto("/");
  const menu = page.getByRole("navigation", { name: UI_TEXT.mainNavigation });
  const about = menu.getByRole("link", { name: "About" });
  await about.click();
  await expect(about).toHaveAttribute("aria-current", "page");
  const pill = about.locator(".nav-pill");
  const moving = () => pill.evaluate((element) => getComputedStyle(element).transform);
  await expect.poll(moving, { intervals: [20] }).not.toBe("none");
  await expect.poll(moving).toBe("none");
  await expect(menu.locator(".nav-pill")).toHaveCount(1);
});

test("Home passes axe", async ({ page }) => {
  await page.goto("/");
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations).toEqual([]);
});

test("the site's own typeface loads, from the site itself (plan D108, §22.4)", async ({ page }) => {
  const fontRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "font") fontRequests.push(new URL(request.url()).host);
  });
  await page.goto("/");

  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((face) => face.status === "loaded").map((face) => face.family);
  });
  expect(loaded.some((family) => family.toLowerCase().replace(" ", "").includes("intertight"))).toBe(true);
  expect(fontRequests.length).toBeGreaterThan(0);
  expect(new Set(fontRequests)).toEqual(new Set([new URL(page.url()).host]));
});

test("the browser finds the site's icons (plan R2.2)", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveCount(1);
  await expect(page.locator('link[rel="icon"][href^="/favicon.ico"]')).toHaveCount(1);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);

  for (const [path, type] of [
    ["/favicon.ico", "image/x-icon"],
    ["/apple-icon.png", "image/png"],
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()["content-type"]).toContain(type);
  }
});

test("Home service links survive a missing enhancement script (D143)", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    hasTouch: testInfo.project.name === "phone",
    viewport: testInfo.project.use.viewport,
  });
  const page = await context.newPage();
  try {
    await page.goto(`${E2E_ORIGIN}/`);
    const section = page.getByRole("region", { name: "What we do" });
    for (const service of SEED_SERVICES)
      await expect(section.getByRole("link", { name: new RegExp(service.name.en) })).toHaveAttribute(
        "href",
        ROUTES.service(service.slug),
      );
    await expect(section.getByRole("button", { name: UI_TEXT.nextServices })).toBeHidden();
    await expect(section.getByRole("link", { name: UI_TEXT.allServices })).toHaveAttribute("href", ROUTES.services);
    if (testInfo.project.name === "phone") {
      const track = section.locator(".pyramid-track");
      await track.scrollIntoViewIfNeeded();
      const box = (await track.boundingBox())!;
      await swipe(page, { x: 300, y: box.y + box.height / 2 }, { x: 80, y: box.y + box.height / 2 }, 500);
      await expect.poll(() => track.evaluate((el) => Math.abs(el.scrollLeft))).toBeGreaterThan(30);
    }
  } finally {
    await context.close();
  }
});

test("a real touch swipe advances Home services and the next tap still opens its service (D143)", async ({
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "native touch is checked once");
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    baseURL: E2E_ORIGIN,
  });
  const page = await context.newPage();
  try {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const section = page.getByRole("region", { name: "What we do" });
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator(".home-services-pyramid")).toHaveAttribute("data-pyramid", "true");
    const current = section.locator('li[data-current="true"]');
    const bounds = await current.boundingBox();
    const y = bounds!.y + bounds!.height / 2;
    const cdp = await context.newCDPSession(page);
    // Cancelling and adding a second finger must not leave a stale horizontal gesture.
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 270, y, id: 1 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [
        { x: 270, y, id: 1 },
        { x: 100, y, id: 2 },
      ],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: 270, y, id: 1 },
        { x: 180, y, id: 2 },
      ],
    });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(current).toContainText(SEED_SERVICES[2].name.en);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 270, y }] });
    for (const x of [240, 210, 180, 150, 120])
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(current).toContainText(SEED_SERVICES[3].name.en);
    // D161: a vertical touch gesture over the custom carousel scrolls the page,
    // preserving the selected service instead of swallowing the page gesture.
    const selected = await current.textContent();
    const beforeScroll = await page.evaluate(() => scrollY);
    const touchBounds = (await current.boundingBox())!;
    const touchY = Math.min(700, touchBounds.y + touchBounds.height / 2);
    await swipe(page, { x: 195, y: touchY }, { x: 195, y: touchY - 150 }, 500);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(beforeScroll + 30);
    await expect(current).toHaveText(selected!);
    await current.scrollIntoViewIfNeeded();
    await current.getByRole("link").tap();
    await expect(page).toHaveURL(ROUTES.service(SEED_SERVICES[3].slug));
  } finally {
    await context.close();
  }
});
