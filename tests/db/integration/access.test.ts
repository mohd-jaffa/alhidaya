import { eq, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PAGE_KEYS, pageDocumentKey } from "@/constants/sections";
import { closeDb, getDb } from "@/db/client";
import { auditLog, documents, records } from "@/db/schema";
import { findPublishedJob, listPublishedJobs } from "@/features/careers/api";
import { listPublishedClients } from "@/features/clients/api";
import { getPublishedPage } from "@/features/content/api";
import { findPublishedService, listPublishedServices } from "@/features/services/api";
import { getPublishedSite } from "@/features/settings/api";
import { publishDocument, saveDocumentDraft } from "@/lib/content/documents";
import { createRecord, publishRecord, saveRecordDraft, setRecordArchived } from "@/lib/content/records";
import { databaseErrorCode } from "@/lib/errors";
import {
  clientFixture,
  jobFixture,
  pageFixture,
  section,
  serviceFixture,
  siteFixture,
} from "@tests/support/fixtures/content";

const REQUEST = `req_access_${crypto.randomUUID()}`;
const actor = { adminId: null, requestId: REQUEST };
/** Written only into drafts, hidden sections and archived records: no public read may return it. */
const SECRET = "UNPUBLISHED-ONLY";
const secret = { en: SECRET };

async function clearContent() {
  await getDb().delete(documents);
  await getDb().delete(records);
}

/** A record published once, then changed in its draft only. */
async function publishedThenEdited(
  collection: "SERVICES" | "JOBS" | "CLIENTS",
  published: object,
  edited: object,
  slug: string | null,
) {
  const id = await createRecord(collection, published, actor);
  await publishRecord(collection, id, slug, actor);
  await saveRecordDraft(collection, id, edited, actor);
  return id;
}

beforeAll(async () => {
  await clearContent();

  for (const page of PAGE_KEYS) {
    const published = pageFixture(page);
    const hidden = { ...section("RICH_TEXT", false), content: { heading: secret, body: [] } };
    const withHidden = { ...published, sections: [...published.sections, hidden] };
    // Each published page carries a hidden section holding the secret; the public read leaves it out.
    await saveDocumentDraft(pageDocumentKey(page), withHidden, actor);
    await publishDocument(pageDocumentKey(page), actor);
    await saveDocumentDraft(
      pageDocumentKey(page),
      { ...published, seo: { title: secret, description: secret } },
      actor,
    );
  }
  await saveDocumentDraft("SITE", siteFixture(), actor);
  await publishDocument("SITE", actor);
  await saveDocumentDraft("SITE", siteFixture({ name: secret }), actor);

  await publishedThenEdited("SERVICES", serviceFixture(), serviceFixture({ name: secret }), "home-nursing-care");
  await createRecord("SERVICES", serviceFixture({ slug: "draft-only", name: secret }), actor);
  const archived = await publishedThenEdited(
    "SERVICES",
    serviceFixture({ slug: "archived", name: secret }),
    serviceFixture({ name: secret }),
    "archived",
  );
  await setRecordArchived("SERVICES", archived, true, actor);

  await publishedThenEdited("JOBS", jobFixture(), jobFixture({ title: secret }), "registered-general-nurse-home-care");
  await createRecord("JOBS", jobFixture({ slug: "draft-only", title: secret }), actor);

  await publishedThenEdited("CLIENTS", clientFixture(), clientFixture({ name: secret }), null);
  await createRecord("CLIENTS", clientFixture({ name: secret }), actor);
});

afterAll(async () => {
  await clearContent();
  await getDb().delete(auditLog).where(eq(auditLog.requestId, REQUEST));
  await closeDb();
});

describe("what the public can reach, against the local MySQL", () => {
  it("is only ever the published copy: never a draft, a hidden section or an archived record", async () => {
    const everything = await Promise.all([
      ...PAGE_KEYS.map((page) => getPublishedPage(page)),
      getPublishedSite(),
      listPublishedServices(),
      findPublishedService("home-nursing-care"),
      findPublishedService("draft-only"),
      findPublishedService("archived"),
      listPublishedJobs(),
      findPublishedJob("registered-general-nurse-home-care"),
      findPublishedJob("draft-only"),
      listPublishedClients(),
    ]);

    expect(JSON.stringify(everything)).not.toContain(SECRET);
    // And the reads are not empty: each returned what was published.
    expect(everything.slice(0, PAGE_KEYS.length).every((page) => page !== null)).toBe(true);
    expect(await listPublishedServices()).toHaveLength(1);
    expect(await listPublishedJobs()).toHaveLength(1);
    expect(await listPublishedClients()).toHaveLength(1);
    expect(await getPublishedSite()).toEqual(siteFixture());
    expect(await findPublishedService("draft-only")).toBeNull();
    expect(await findPublishedService("archived")).toBeNull();
  });
});

describe("the app's own database user (plan §26.1)", () => {
  it("reads and writes data but can never change the schema", async () => {
    const db = getDb();
    for (const statement of [
      sql`create table access_probe (id int)`,
      sql`alter table records add column access_probe int`,
      sql`drop table audit_log`,
      sql`create index access_probe on records (created_at)`,
      sql`grant select on enquiries to current_user()`,
    ]) {
      const refusal = await db.execute(statement).then(
        () => null,
        (error: unknown) => error,
      );
      expect(databaseErrorCode(refusal)).toMatch(/_DENIED_ERROR$/);
    }
  });
});
