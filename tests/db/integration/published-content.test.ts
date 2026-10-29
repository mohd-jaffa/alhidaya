import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { closeDb, getDb } from "@/db/client";
import { auditLog, documents, records } from "@/db/schema";
import { findPublishedJob, listPublishedJobs } from "@/features/careers/api";
import { listPublishedClients } from "@/features/clients/api";
import { getPublishedPage } from "@/features/content/api";
import { findPublishedService, listPublishedServices } from "@/features/services/api";
import { getPublishedSite } from "@/features/settings/api";
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

const REQUEST = `req_published_${crypto.randomUUID()}`;
const actor = { adminId: null, requestId: REQUEST };

async function clearContent() {
  await getDb().delete(documents);
  await getDb().delete(records);
}

async function published(collection: "SERVICES" | "JOBS" | "CLIENTS", draft: unknown, slug: string | null) {
  const id = await createRecord(collection, draft, actor);
  await publishRecord(collection, id, slug, actor);
  return id;
}

beforeAll(clearContent);

afterAll(async () => {
  await clearContent();
  await getDb().delete(auditLog).where(eq(auditLog.requestId, REQUEST));
  await closeDb();
});

describe("the public site's reads, against the local MySQL", () => {
  it("read a page's published copy only, without its hidden sections", async () => {
    expect(await getPublishedPage("ABOUT")).toBeNull();

    const page = pageFixture("ABOUT");
    const hidden = section("VALUES", false);
    await saveDocumentDraft("PAGE:ABOUT", { ...page, sections: [...page.sections, hidden] }, actor);
    expect(await getPublishedPage("ABOUT")).toBeNull();

    await publishDocument("PAGE:ABOUT", actor);
    expect(await getPublishedPage("ABOUT")).toEqual(page);
  });

  it("list services in the published order, new ones after it", async () => {
    const first = await published("SERVICES", serviceFixture({ slug: "first" }), "first");
    const second = await published("SERVICES", serviceFixture({ slug: "second" }), "second");
    const third = await published("SERVICES", serviceFixture({ slug: "third" }), "third");
    await createRecord("SERVICES", serviceFixture({ slug: "draft" }), actor);

    const ids = async () => (await listPublishedServices()).map((service) => service.id);
    const unordered = await ids();
    expect(unordered.toSorted()).toEqual([first, second, third].toSorted());

    await saveDocumentDraft("ORDER:SERVICES", [third, first], actor);
    expect(await ids()).toEqual(unordered);
    await publishDocument("ORDER:SERVICES", actor);
    expect(await ids()).toEqual([third, first, second]);

    expect(await findPublishedService("second")).toEqual({ record: expect.objectContaining({ id: second }) });
    expect(await findPublishedService("draft")).toBeNull();
  });

  it("list jobs open first, newest first, closing at the end of their day in Doha", async () => {
    const lastDay = await published(
      "JOBS",
      jobFixture({ slug: "last-day", postedOn: "2026-09-01", closesOn: "2026-10-29" }),
      "last-day",
    );
    const newest = await published("JOBS", jobFixture({ slug: "newest", postedOn: "2026-10-20" }), "newest");
    const closed = await published(
      "JOBS",
      jobFixture({ slug: "closed", postedOn: "2026-10-25", closesOn: "2026-10-28" }),
      "closed",
    );

    // 20:30 UTC is 23:30 in Doha, still the 29th; 21:00 UTC is midnight there, the 30th.
    const evening = new Date("2026-10-29T20:30:00Z");
    const jobs = await listPublishedJobs(evening);
    expect(jobs.map((job) => [job.id, job.open])).toEqual([
      [newest, true],
      [lastDay, true],
      [closed, false],
    ]);

    const nextDay = new Date("2026-10-29T21:00:00Z");
    expect(await findPublishedJob("last-day", nextDay)).toEqual({ record: expect.objectContaining({ open: false }) });
    expect(await findPublishedJob("closed")).toEqual({ record: expect.objectContaining({ open: false }) });
    expect((await listPublishedJobs()).length).toBe(3);

    await publishRecord("JOBS", newest, "newest-nurse", actor);
    expect(await findPublishedJob("newest")).toEqual({ movedTo: "newest-nurse" });
    expect(await findPublishedJob("missing")).toBeNull();
  });

  it("list client logos in the published order", async () => {
    const first = await published("CLIENTS", clientFixture(), null);
    const second = await published("CLIENTS", clientFixture(), null);
    await saveDocumentDraft("ORDER:CLIENTS", [second, first], actor);
    await publishDocument("ORDER:CLIENTS", actor);
    expect((await listPublishedClients()).map((client) => client.id)).toEqual([second, first]);
  });

  it("read the site's published content only", async () => {
    expect(await getPublishedSite()).toBeNull();
    await saveDocumentDraft("SITE", siteFixture(), actor);
    expect(await getPublishedSite()).toBeNull();
    await publishDocument("SITE", actor);
    expect(await getPublishedSite()).toEqual(siteFixture());
  });
});
