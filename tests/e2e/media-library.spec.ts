import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { like } from "drizzle-orm";
import sharp from "sharp";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { UPLOAD_LIMITS } from "@/constants/limits";
import { closeDb, getDb } from "@/db/client";
import { authUser } from "@/db/schema";
import { createAdmin } from "@/features/auth/createAdmin";
import type { LibraryImageItem } from "@/features/media/types";

import { E2E_ORIGIN } from "@tests/support/e2e-app";

/**
 * The media library through the built app (R6.5, D93): the library and an
 * image in use, axe at both widths; and, once, an image uploaded, described
 * anew and deleted, its files with it.
 */
const PASSWORD = "a long media password";
const RUN = crypto.randomUUID().slice(0, 8);

test.afterAll(async () => {
  await getDb()
    .delete(authUser)
    .where(like(authUser.email, `media-${RUN}-%`));
  await closeDb();
});

async function signIn(page: Page) {
  const email = `media-${RUN}-${crypto.randomUUID().slice(0, 6)}@example.com`;
  await createAdmin({ email, name: "Fatima", password: PASSWORD });
  const answer = await page.request.post(ADMIN_API_ROUTES.adminSession, {
    data: { email, password: PASSWORD },
    headers: { origin: E2E_ORIGIN },
  });
  expect(answer.status()).toBe(200);
}

const axe = async (page: Page) => expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

test("the upload endpoint refuses disguised programs, forged image signatures and oversized files", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "server security has no viewport-specific behaviour");
  const details = JSON.stringify({
    alt: "Rejected upload test",
    decorative: false,
    source: { provider: "", url: "", licence: "" },
  });
  const post = (buffer: Buffer) =>
    page.request.post(ADMIN_API_ROUTES.adminMedia, {
      headers: { origin: E2E_ORIGIN },
      multipart: { fields: details, file: { name: "image.png", mimeType: "image/png", buffer } },
    });
  // Authentication is checked before untrusted file processing.
  expect((await post(Buffer.from("MZ harmless executable-signature fixture"))).status()).toBe(401);
  await signIn(page);
  const library = async () =>
    (await (await page.request.get(ADMIN_API_ROUTES.adminMedia)).json()).data as LibraryImageItem[];
  const before = (await library()).map((image) => image.id).sort();
  const jpeg = await sharp({ create: { width: 20, height: 20, channels: 3, background: "#ffffff" } })
    .jpeg()
    .toBuffer();
  for (const buffer of [
    Buffer.from("MZ harmless executable-signature fixture"),
    Buffer.from("<?php echo 'harmless upload fixture'; ?>"),
    Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><script>invalid</script></svg>'),
    Buffer.from("%PDF-1.7 not an image"),
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    jpeg.subarray(0, Math.floor(jpeg.length * 0.75)),
  ]) {
    const response = await post(buffer);
    expect(response.status()).toBe(400);
    expect((await response.json()).error.code).toBe("UPLOAD_TYPE_NOT_ALLOWED");
  }
  const oversizedImage = Buffer.alloc(UPLOAD_LIMITS.imageBytes + 1);
  jpeg.copy(oversizedImage);
  const response = await post(oversizedImage);
  expect(response.status()).toBe(400);
  expect((await response.json()).error.code).toBe("UPLOAD_TOO_LARGE");
  for (const [buffer, code] of [
    [Buffer.from("MZ harmless executable-signature fixture"), "UPLOAD_TYPE_NOT_ALLOWED"],
    [Buffer.concat([Buffer.from("%PDF-1.7\n"), Buffer.alloc(UPLOAD_LIMITS.brochureBytes)]), "UPLOAD_TOO_LARGE"],
  ] as const) {
    const brochure = await page.request.post(ADMIN_API_ROUTES.adminSiteBrochure, {
      headers: { origin: E2E_ORIGIN },
      multipart: { fields: "{}", file: { name: "brochure.pdf", mimeType: "application/pdf", buffer } },
    });
    expect(brochure.status()).toBe(400);
    expect((await brochure.json()).error.code).toBe(code);
  }
  expect((await library()).map((image) => image.id).sort()).toEqual(before);
});

test("Media shows the library, and an image in use says where and offers no Delete", async ({ page }) => {
  await signIn(page);
  await page.goto(ADMIN_ROUTES.media);
  await expect(page.getByRole("heading", { level: 1, name: ADMIN_TEXT.media })).toBeVisible();
  const used = page
    .getByRole("main")
    .getByRole("button", { name: /Used in/ })
    .first();
  await expect(used).toBeVisible();
  await axe(page);

  await used.click();
  const details = page.getByRole("dialog");
  await expect(details.getByRole("heading", { name: ADMIN_TEXT.usedIn })).toBeVisible();
  await expect(details.getByText(ADMIN_TEXT.inUseNote)).toBeVisible();
  await expect(details.getByRole("button", { name: ADMIN_TEXT.delete })).toHaveCount(0);
  await axe(page);
});

test("an image is uploaded, described anew and deleted (D93)", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one image uploaded once is enough");
  const alt = `A test photograph ${RUN}`;
  await signIn(page);
  await page.goto(ADMIN_ROUTES.media);
  try {
    await page.getByRole("button", { name: ADMIN_TEXT.uploadImage }).click();
    const upload = page.getByRole("dialog", { name: ADMIN_TEXT.uploadImage });
    const buffer = await sharp({ create: { width: 900, height: 600, channels: 3, background: "#33a0da" } })
      .jpeg()
      .toBuffer();
    await upload.getByLabel(ADMIN_TEXT.imageFile).setInputFiles({ name: "photo.jpg", mimeType: "image/jpeg", buffer });
    await upload.getByRole("textbox", { name: ADMIN_TEXT.altText }).fill(alt);
    await axe(page);
    await upload.getByRole("button", { name: ADMIN_TEXT.upload }).click();
    await expect(page.getByText(ADMIN_TEXT.uploaded)).toBeVisible();

    await page.getByRole("button", { name: new RegExp(alt) }).click();
    const details = page.getByRole("dialog", { name: alt });
    await expect(details.getByText(ADMIN_TEXT.imageSize(900, 600))).toBeVisible();
    await expect(details.getByText(ADMIN_TEXT.notUsed)).toBeVisible();
    await details.getByRole("textbox", { name: ADMIN_TEXT.altText }).fill(`${alt}, described anew`);
    await details.getByRole("button", { name: ADMIN_TEXT.saveDetails }).click();
    await expect(details.getByText(ADMIN_TEXT.detailsSaved)).toBeVisible();

    await details.getByRole("button", { name: ADMIN_TEXT.delete }).click();
    await page
      .getByRole("dialog", { name: ADMIN_TEXT.deleteImageTitle })
      .getByRole("button", { name: ADMIN_TEXT.delete })
      .click();
    await expect(page.getByRole("button", { name: new RegExp(alt) })).toHaveCount(0);
  } finally {
    // Gone through the app whatever happened, its files with it.
    const library = (await (await page.request.get(ADMIN_API_ROUTES.adminMedia)).json()) as {
      data: LibraryImageItem[];
    };
    for (const image of library.data.filter((item) => item.alt.includes(RUN))) {
      await page.request.delete(ADMIN_API_ROUTES.adminMediaItem(image.id), { headers: { origin: E2E_ORIGIN } });
    }
  }
});
