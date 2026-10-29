import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  type DocumentKey,
  orderingDocumentKey,
  PAGE_KEYS,
  pageDocumentKey,
  SITE_DOCUMENT_KEY,
} from "@/constants/sections";
import { findImageBySource, storeImage } from "@/features/media/api";
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
import { NO_PHOTOS, SEED_PHOTOS, type SeedPhoto, type SeedPhotoRefs } from "./photos";

export interface SeedResult {
  documents: DocumentKey[];
  services: number;
  jobs: number;
  /** The photographs stored this time; one kept before is used again. */
  photos: number;
}

const PHOTOS = path.join(process.cwd(), "src/db/seed/photos");

/**
 * The seed's photographs as images (plan D75): each made into its sizes
 * through the step every upload takes, with its words and source, or the one
 * kept from that source before.
 */
export async function importSeedPhotos(): Promise<{ refs: SeedPhotoRefs; stored: number }> {
  const refs: SeedPhotoRefs = { ...NO_PHOTOS };
  let stored = 0;
  for (const name of Object.keys(SEED_PHOTOS) as SeedPhoto[]) {
    const { file, alt, source } = SEED_PHOTOS[name];
    let id = await findImageBySource(source.url);
    if (!id) {
      const bytes = new Uint8Array(await readFile(path.join(PHOTOS, file)));
      id = await storeImage({ bytes, alt, source, createdBy: null });
      stored += 1;
    }
    refs[name] = { mediaId: id };
  }
  return { refs, stored };
}

const SEED_ACTOR: Actor = { adminId: null, requestId: "seed" };

/**
 * Fills what is missing with the seed content (plan R1.8), as drafts: a page
 * or the site's content only when it has none, the services and the job only
 * when their collection is empty; the pages with their photographs (D75). Nothing is overwritten and nothing is
 * published; every document is checked by its schema first. Run by
 * `npm run db:seed`, for local development (AGENTS.md §13).
 */
export async function seedContent(actor: Actor = SEED_ACTOR, today: string = dohaDay()): Promise<SeedResult> {
  const result: SeedResult = { documents: [], services: 0, jobs: 0, photos: 0 };
  const saveIfMissing = async (key: DocumentKey, draft: unknown) => {
    if (await readDocumentDraft(key)) return;
    await saveDocumentDraft(key, draft, actor);
    result.documents.push(key);
  };

  // The photographs are needed only for pages still to be written.
  const unwritten = await Promise.all(PAGE_KEYS.map(async (page) => !(await readDocumentDraft(pageDocumentKey(page)))));
  let photos = NO_PHOTOS;
  if (unwritten.some(Boolean)) {
    const imported = await importSeedPhotos();
    photos = imported.refs;
    result.photos = imported.stored;
  }
  const pages = seedPages(photos);
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
