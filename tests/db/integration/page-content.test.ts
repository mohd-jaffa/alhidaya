import { eq, inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { closeDb, getDb } from "@/db/client";
import { auditLog, documents, media, records } from "@/db/schema";
import { getPageMetadata, getPageShareImage, getPublishedPageContent, listPublicPaths } from "@/features/content/api";
import { publishDocument, saveDocumentDraft } from "@/lib/content/documents";
import { createRecord, publishRecord } from "@/lib/content/records";
import {
  clientFixture,
  jobFixture,
  pageFixture,
  section,
  serviceFixture,
  siteFixture,
} from "@tests/support/fixtures/content";

const REQUEST = `req_page_content_${crypto.randomUUID()}`;
const actor = { adminId: null, requestId: REQUEST };
const images: string[] = [];

async function clearContent() {
  await getDb().delete(documents);
  await getDb().delete(records);
}

async function image() {
  const id = crypto.randomUUID();
  images.push(id);
  await getDb()
    .insert(media)
    .values({
      id,
      kind: "IMAGE",
      variants: [{ key: "2026-10/abcdefghij-w640.webp", width: 640, mime: "image/webp", bytes: 1 }],
      width: 1600,
      height: 1067,
      bytes: 1,
      alt: { en: "A photo" },
    });
  return id;
}

async function publishedPage(key: "HOME" | "CAREERS" | "PRIVACY" | "QUOTE", page: unknown) {
  await saveDocumentDraft(`PAGE:${key}`, page, actor);
  await publishDocument(`PAGE:${key}`, actor);
}

async function published(collection: "SERVICES" | "JOBS" | "CLIENTS", draft: unknown, slug: string | null) {
  await publishRecord(collection, await createRecord(collection, draft, actor), slug, actor);
}

beforeAll(clearContent);

afterAll(async () => {
  await clearContent();
  await getDb().delete(media).where(inArray(media.id, images));
  await getDb().delete(auditLog).where(eq(auditLog.requestId, REQUEST));
  await closeDb();
});

describe("a page with everything it shows, against the local MySQL", () => {
  it("is null until the page is published", async () => {
    expect(await getPublishedPageContent("HOME")).toBeNull();
  });

  it("titles a page that is not published yet with its name and the site's description", async () => {
    expect(await getPageMetadata("HOME")).toMatchObject({
      title: { absolute: "Al Hidaya Health Care Services" },
      description: expect.stringContaining("Nursing care at home"),
      alternates: { canonical: "/" },
    });
    expect(await getPageMetadata("ABOUT")).toMatchObject({ title: "About", openGraph: { title: "About" } });
  });

  it("reads Home with the site, its services, jobs and clients, and the images its sections show", async () => {
    const photo = await image();
    const logo = await image();
    await published("SERVICES", serviceFixture(), "home-nursing-care");
    await published("JOBS", jobFixture(), "registered-general-nurse-home-care");
    await published("CLIENTS", clientFixture({ logo: { mediaId: logo } }), null);
    await saveDocumentDraft("SITE", siteFixture(), actor);
    await publishDocument("SITE", actor);

    const home = pageFixture("HOME");
    const sign = home.sections[0];
    const withPhoto = { ...sign, content: { ...sign.content, image: { mediaId: photo } } } as typeof sign;
    await publishedPage("HOME", { ...home, sections: [withPhoto, ...home.sections.slice(1), section("CLIENTS")] });

    const content = await getPublishedPageContent("HOME");
    expect(content?.document.sections).toHaveLength(5);
    expect(content?.data.site?.contact.phone).toBe("+97431306555");
    expect(content?.data.services).toHaveLength(1);
    expect(content?.data.jobs).toHaveLength(1);
    expect(content?.data.clients).toHaveLength(1);
    expect([...(content?.data.images.keys() ?? [])].toSorted()).toEqual([photo, logo].toSorted());
  });

  it("reads only what a page's sections may show: jobs for Careers, nothing more for Privacy", async () => {
    await publishedPage("CAREERS", pageFixture("CAREERS"));
    const careers = await getPublishedPageContent("CAREERS");
    expect(careers?.data).toMatchObject({ services: [], clients: [] });
    expect(careers?.data.jobs).toHaveLength(1);
    expect(careers?.data.images.size).toBe(0);

    await publishedPage("PRIVACY", pageFixture("PRIVACY"));
    expect((await getPublishedPageContent("PRIVACY"))?.data).toMatchObject({ services: [], jobs: [], clients: [] });

    // A page with a form reads the services, for the Quote form's choice (plan §10.1).
    await publishedPage("QUOTE", pageFixture("QUOTE"));
    const quote = await getPublishedPageContent("QUOTE");
    expect(quote?.data).toMatchObject({ jobs: [], clients: [] });
    expect(quote?.data.services).toHaveLength(1);
  });

  it("lists every public page for search engines: the fixed pages, the services and the open jobs", async () => {
    await published(
      "JOBS",
      jobFixture({ slug: "closed-job", postedOn: "2020-01-01", closesOn: "2020-02-01" }),
      "closed-job",
    );
    const paths = await listPublicPaths();
    expect(paths.slice(0, 8).map((entry) => entry.path)).toEqual([
      "/",
      "/about",
      "/services",
      "/careers",
      "/contact",
      "/request-a-quote",
      "/privacy",
      "/terms",
    ]);
    expect(paths.slice(8)).toEqual([
      { path: "/services/home-nursing-care", modified: expect.any(Date) },
      { path: "/careers/registered-general-nurse-home-care", modified: expect.any(Date) },
    ]);
  });

  it("titles a page with the admin's SEO words, else its name; Home with the site's own title", async () => {
    expect(await getPageMetadata("HOME")).toMatchObject({
      title: { absolute: "Al Hidaya Health Care Services" },
      description: "Nursing care in Doha.",
      openGraph: { title: "Al Hidaya Health Care Services", url: "/" },
    });
    const privacy = pageFixture("PRIVACY");
    await publishedPage("PRIVACY", {
      ...privacy,
      seo: { title: { en: "How we use your details" }, description: { en: "What we keep." } },
    });
    expect(await getPageMetadata("PRIVACY")).toMatchObject({
      title: "How we use your details",
      description: "What we keep.",
      alternates: { canonical: "/privacy" },
    });
    await publishedPage("HOME", {
      ...pageFixture("HOME"),
      seo: { title: { en: "Nurses at home in Doha" }, description: { en: null } },
    });
    expect(await getPageMetadata("HOME")).toMatchObject({ title: "Nurses at home in Doha" });
  });

  it("draws a page's share picture from its sign, or its name before it is published", async () => {
    for (const page of ["HOME", "TERMS"] as const) {
      const image = await getPageShareImage(page);
      expect(image.headers.get("content-type")).toBe("image/png");
    }
  });
  it("reads the services' photos and every face Home's sections name, at any depth (D97, D102)", async () => {
    await clearContent();
    const servicePhoto = await image();
    const face = await image();
    await published("SERVICES", serviceFixture({ image: { mediaId: servicePhoto } }), "home-nursing-care");
    const home = pageFixture("HOME");
    const families = section("FOR_FAMILIES");
    const institutions = section("FOR_INSTITUTIONS");
    const withFace = {
      ...institutions,
      content: {
        ...institutions.content,
        team: { title: { en: "Team" }, text: { en: null }, avatars: [{ mediaId: face }] },
      },
    } as typeof institutions;
    await publishedPage("HOME", { ...home, sections: [home.sections[0], withFace, families] });

    const content = await getPublishedPageContent("HOME");
    expect([...(content?.data.images.keys() ?? [])].toSorted()).toEqual([servicePhoto, face].toSorted());
  });
});
