import { expect, test } from "@playwright/test";

import { UI_TEXT } from "@/constants/messages";

/** The kit's behaviour in a real browser (plan R2.5, D64); axe runs on /kit in motion.spec.ts. */
const KIT = "/kit";

test("the dialog takes focus, closes on Escape and gives focus back to what opened it", async ({ page }) => {
  await page.goto(KIT);
  const opener = page.getByRole("button", { name: "Open a dialog" });
  await opener.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: "Before you send" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: UI_TEXT.close })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test("the file picker says which file was chosen and how big it is", async ({ page }) => {
  await page.goto(KIT);
  await page.getByLabel("CV").setInputFiles({
    name: "Mariam CV.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.alloc(820 * 1024),
  });
  await expect(page.getByText("Mariam CV.pdf · 820 kB")).toBeVisible();
  await expect(page.getByText(UI_TEXT.replaceFile)).toBeVisible();
});

test("a required field says so itself, and an optional one says so for everyone to see", async ({ page }) => {
  await page.goto(KIT);
  await expect(page.getByRole("textbox", { name: "Full name" })).toHaveAttribute("required", "");
  await expect(page.getByRole("combobox", { name: `Service (${UI_TEXT.optional})` })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Phone" })).toHaveAccessibleDescription(
    "A Qatar number, or one with its country code. Phone must be a Qatar number (8 digits) or start with a country code, like +44.",
  );
});
