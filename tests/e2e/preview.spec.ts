import { expect, test } from "@playwright/test";
import { like } from "drizzle-orm";

import { UI_TEXT } from "@/constants/messages";
import { API_ROUTES, ROUTES } from "@/constants/routes";
import { closeDb, getDb } from "@/db/client";
import { authUser } from "@/db/schema";
import { createAdmin } from "@/features/auth/createAdmin";
import { discardDocumentDraft, publishDocument, readDocumentDraft, saveDocumentDraft } from "@/lib/content/documents";
import type { PageDocument } from "@/lib/validation";

const ACTOR = { adminId: null, requestId: "e2e-preview" };
const EMAIL = `preview-${crypto.randomUUID()}@example.com`;
const PASSWORD = "a long preview password";
const ORIGIN = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").origin;

/** A copy of a page with its sign's headline changed. */
async function withHeadline(key: "PAGE:ABOUT" | "PAGE:TERMS", headline: string): Promise<PageDocument> {
  const page = (await readDocumentDraft<PageDocument>(key))?.draft;
  if (!page) throw new Error(`${key} is seeded`);
  const [sign, ...rest] = page.sections;
  return {
    ...page,
    sections: [{ ...sign, content: { ...sign.content, headline: { en: headline } } } as typeof sign, ...rest],
  };
}

test.describe.configure({ mode: "serial" });

test.afterAll(async () => {
  await discardDocumentDraft("PAGE:ABOUT", ACTOR);
  await getDb().delete(authUser).where(like(authUser.email, "preview-%@example.com"));
  await closeDb();
});

test("the admin's preview shows drafts under its bar, unindexed; the public never sees them (plan §14)", async ({
  page,
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one admin session is enough");
  await createAdmin({ email: EMAIL, name: "Preview", password: PASSWORD });
  await saveDocumentDraft("PAGE:ABOUT", await withHeadline("PAGE:ABOUT", "A draft the public must not see"), ACTOR);

  // Without the admin's session, there is no way in.
  expect((await page.request.get(`${API_ROUTES.preview}?path=${ROUTES.about}`, { maxRedirects: 0 })).status()).toBe(
    401,
  );

  const signIn = await page.request.post(API_ROUTES.adminSession, {
    data: { email: EMAIL, password: PASSWORD },
    headers: { origin: ORIGIN },
  });
  expect(signIn.status()).toBe(200);

  await page.goto(`${API_ROUTES.preview}?path=${encodeURIComponent(ROUTES.about)}`);
  await expect(page).toHaveURL(ROUTES.about);
  await expect(page.getByRole("heading", { level: 1, name: "A draft the public must not see" })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: UI_TEXT.previewBar })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

  const visitor = await browser.newPage();
  await visitor.goto(ROUTES.about);
  await expect(visitor.getByRole("heading", { level: 1 })).not.toHaveText("A draft the public must not see");
  await expect(visitor.getByText(UI_TEXT.previewBar)).toHaveCount(0);
  await visitor.close();

  await page.getByRole("link", { name: UI_TEXT.previewExit }).click();
  await expect(page).toHaveURL(ROUTES.home);
  await page.goto(ROUTES.about);
  await expect(page.getByRole("heading", { level: 1 })).not.toHaveText("A draft the public must not see");
  await expect(page.getByText(UI_TEXT.previewBar)).toHaveCount(0);
});

test("a published page's content is kept until a publish revalidates it (plan §22.1, D76)", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "the data cache is the server's");
  await page.goto(ROUTES.terms);
  const shown = await page.getByRole("heading", { level: 1 }).textContent();
  const original = (await readDocumentDraft<PageDocument>("PAGE:TERMS"))?.draft;

  // Published straight into the database, as no admin publish does: nothing revalidates, so the page keeps its copy.
  await saveDocumentDraft("PAGE:TERMS", await withHeadline("PAGE:TERMS", "Changed behind the cache"), ACTOR);
  await publishDocument("PAGE:TERMS", ACTOR);
  try {
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(shown ?? "");
  } finally {
    await saveDocumentDraft("PAGE:TERMS", original, ACTOR);
    await publishDocument("PAGE:TERMS", ACTOR);
  }
});
