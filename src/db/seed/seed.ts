import {
  type DocumentKey,
  orderingDocumentKey,
  PAGE_KEYS,
  pageDocumentKey,
  SITE_DOCUMENT_KEY,
} from "@/constants/sections";
import type { Actor } from "@/lib/content/actor";
import { readDocumentDraft, saveDocumentDraft } from "@/lib/content/documents";
import { createRecord, listRecordsForAdmin } from "@/lib/content/records";
import { dohaDay } from "@/lib/dates";
import {
  jobDocumentSchema,
  orderingDocumentSchema,
  pageDocumentSchema,
  serviceDocumentSchema,
  siteDocumentSchema,
} from "@/lib/validation";

import { SEED_SERVICES, SEED_SITE, seedJob, seedPages } from "./content";

export interface SeedResult {
  documents: DocumentKey[];
  services: number;
  jobs: number;
}

const SEED_ACTOR: Actor = { adminId: null, requestId: "seed" };

/**
 * Fills what is missing with the seed content (plan R1.8), as drafts: a page
 * or the site's content only when it has none, the services and the job only
 * when their collection is empty. Nothing is overwritten and nothing is
 * published; every document is checked by its schema first. Run by
 * `npm run db:seed`, for local development (AGENTS.md §13).
 */
export async function seedContent(actor: Actor = SEED_ACTOR, today: string = dohaDay()): Promise<SeedResult> {
  const result: SeedResult = { documents: [], services: 0, jobs: 0 };
  const saveIfMissing = async (key: DocumentKey, draft: unknown) => {
    if (await readDocumentDraft(key)) return;
    await saveDocumentDraft(key, draft, actor);
    result.documents.push(key);
  };

  const pages = seedPages();
  for (const page of PAGE_KEYS) await saveIfMissing(pageDocumentKey(page), pageDocumentSchema(page).parse(pages[page]));
  await saveIfMissing(SITE_DOCUMENT_KEY, siteDocumentSchema.parse(SEED_SITE));

  if ((await listRecordsForAdmin("SERVICES")).length === 0) {
    const ids: string[] = [];
    for (const service of SEED_SERVICES)
      ids.push(await createRecord("SERVICES", serviceDocumentSchema.parse(service), actor));
    await saveDocumentDraft(orderingDocumentKey("SERVICES"), orderingDocumentSchema.parse(ids), actor);
    result.documents.push(orderingDocumentKey("SERVICES"));
    result.services = ids.length;
  }

  if ((await listRecordsForAdmin("JOBS")).length === 0) {
    await createRecord("JOBS", jobDocumentSchema.parse(seedJob(today)), actor);
    result.jobs = 1;
  }
  return result;
}
