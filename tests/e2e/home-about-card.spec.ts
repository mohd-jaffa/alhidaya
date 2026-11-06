import { writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { FONT_IDS, FONT_ROLES, FONT_STACKS } from "@/constants/typography";
import { seedPages } from "@/db/seed/content";

const intro = seedPages().HOME.sections.find((section) => section.type === "INTRO")!;

test("Home's three About points share one responsive card without tick marks", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "one complete Home card matrix");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(ROUTES.home);
  const region = page.getByRole("region", { name: intro.content.heading.en });
  const list = region.getByRole("list");
  await expect(list.getByRole("listitem")).toHaveCount(3);
  await expect(list.locator("svg")).toHaveCount(0);
  const rows = [];
  for (const width of [320, 360, 390, 414, 640, 768, 844, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const font of FONT_IDS) {
      await page.locator(".site-world").evaluate(
        (world, { roles, family }) => {
          for (const role of roles) (world as HTMLElement).style.setProperty(`--type-${role}`, family);
        },
        { roles: FONT_ROLES, family: FONT_STACKS[font] },
      );
      await page.evaluate(() => document.fonts.ready);
      const boxes = await list.getByRole("listitem").evaluateAll((items) =>
        items.map((item) => ({
          x: item.getBoundingClientRect().x,
          y: item.getBoundingClientRect().y,
          width: item.getBoundingClientRect().width,
          overflow: item.scrollWidth - item.clientWidth,
        })),
      );
      if (width >= 768) {
        expect(Math.max(...boxes.map((box) => box.y)) - Math.min(...boxes.map((box) => box.y))).toBeLessThan(1);
        expect(boxes[1].x).toBeGreaterThan(boxes[0].x);
        expect(boxes[2].x).toBeGreaterThan(boxes[1].x);
      } else {
        expect(boxes[1].y).toBeGreaterThan(boxes[0].y);
        expect(boxes[2].y).toBeGreaterThan(boxes[1].y);
      }
      expect(boxes.every((box) => box.overflow <= 1)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      rows.push({ width, font, boxes });
    }
    const card = await list.boundingBox();
    const more = await region.getByRole("link", { name: UI_TEXT.readAboutUs }).boundingBox();
    expect(more!.y).toBeGreaterThanOrEqual(card!.y + card!.height);
    if ([390, 768, 1440].includes(width)) {
      await region.scrollIntoViewIfNeeded();
      await region.screenshot({ path: info.outputPath(`home-about-${width}.png`) });
    }
  }
  await writeFile(info.outputPath("home-about-card-layouts.json"), JSON.stringify(rows, null, 2));
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
