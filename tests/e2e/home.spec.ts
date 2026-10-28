import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { UI_TEXT } from "@/constants/messages";

test("Home names the company and passes axe", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(UI_TEXT.siteName);
  await expect(page.getByRole("heading", { level: 1, name: UI_TEXT.siteName })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations).toEqual([]);
});
