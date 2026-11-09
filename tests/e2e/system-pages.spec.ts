import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { UI_TEXT } from "@/constants/messages";
import { settleAnimations } from "@tests/support/animations";

test("an address the site does not have answers 404 with the not-found sign, inside the site's frame", async ({
  page,
}) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: UI_TEXT.notFoundHeadline })).toBeVisible();
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

  await page.getByRole("main").getByRole("link", { name: UI_TEXT.home }).click();
  await expect(page).toHaveURL("/");
});

test("the not-found page passes axe", async ({ page }) => {
  await page.goto("/missing/deeper/still");
  // The sign's words rise in as the page opens; contrast is judged once they have.
  await settleAnimations(page);
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations).toEqual([]);
});
