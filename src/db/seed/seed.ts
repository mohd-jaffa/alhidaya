import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  type DocumentKey,
  orderingDocumentKey,
  PAGE_KEYS,
  pageDocumentKey,
  SITE_DOCUMENT_KEY,
} from "@/constants/sections";
import { findImageBySource, type ImageSource, storeImage } from "@/features/media/api";
import type { Actor } from "@/lib/content/actor";
import { readDocumentDraft, saveDocumentDraft } from "@/lib/content/documents";
import { createRecord, listRecordsForAdmin } from "@/lib/content/records";
import { dohaDay } from "@/lib/dates";
import {
  clientDocumentSchema,
  jobDocumentSchema,
  orderingDocumentSchema,
  pageDocumentSchema,
  serviceDocumentSchema,
  siteDocumentSchema,
} from "@/lib/validation";

import { SEED_CLIENTS } from "./clients";
import { SEED_SITE, seedJob, seedPages, seedServices } from "./content";
import { NO_PHOTOS, SEED_PHOTOS, type SeedPhoto, type SeedPhotoRefs } from "./photos";

export interface SeedResult {
  documents: DocumentKey[];
  services: number;
  jobs: number;
  /** The client logos written (D118), as drafts. */
  clients: number;
  /** The photographs and logos stored this time; one kept before is used again. */
  photos: number;
}

const PHOTOS = path.join(process.cwd(), "src/db/seed/photos");
const LOGOS = path.join(process.cwd(), "src/db/seed/clients");

/**
 * One of the seed's images, made into its sizes through the step every upload
 * takes, with its words and source, or the one kept from that source before.
 */
async function importSeedImage(
  file: string,
  alt: string,
  source: ImageSource & { url: string },
): Promise<{ id: string; stored: boolean }> {
  const kept = await findImageBySource(source.url);
  if (kept) return { id: kept, stored: false };
  const bytes = new Uint8Array(await readFile(file));
  return { id: await storeImage({ bytes, alt, source, createdBy: null }), stored: true };
}

/** The seed's photographs as images in the library (plan D75, D118). */
export async function importSeedPhotos(): Promise<{ refs: SeedPhotoRefs; stored: number }> {
  const refs: SeedPhotoRefs = { ...NO_PHOTOS };
  let stored = 0;
  for (const name of Object.keys(SEED_PHOTOS) as SeedPhoto[]) {
    const { file, alt, source } = SEED_PHOTOS[name];
    const image = await importSeedImage(path.join(PHOTOS, file), alt, source);
    if (image.stored) stored += 1;
    refs[name] = { mediaId: image.id };
  }
  return { refs, stored };
}

const SEED_ACTOR: Actor = { adminId: null, requestId: "seed" };

/**
 * Fills what is missing with the seed content (plan R1.8), as drafts: a page
 * or the site's content only when it has none, the services, the job and the
 * client logos (D118) only when their collection is empty; the pages with
 * their photographs (D75), and every seed photograph in the library. Nothing
 * is overwritten and nothing is published; every document is checked by its
 * schema first. Run by `npm run db:seed`, for local development (AGENTS.md
 * §13).
 */
export async function seedContent(actor: Actor = SEED_ACTOR, today: string = dohaDay()): Promise<SeedResult> {
  const result: SeedResult = { documents: [], services: 0, jobs: 0, clients: 0, photos: 0 };
  const saveIfMissing = async (key: DocumentKey, draft: unknown) => {
    if (await readDocumentDraft(key)) return;
    await saveDocumentDraft(key, draft, actor);
    result.documents.push(key);
  };

  // Every photograph is in the library, whatever else is written: those kept before are found again.
  const imported = await importSeedPhotos();
  const photos = imported.refs;
  result.photos = imported.stored;
  const noServices = (await listRecordsForAdmin("SERVICES")).length === 0;
  const pages = seedPages(photos);
  for (const page of PAGE_KEYS) await saveIfMissing(pageDocumentKey(page), pageDocumentSchema(page).parse(pages[page]));
  await saveIfMissing(SITE_DOCUMENT_KEY, siteDocumentSchema.parse(SEED_SITE));

  if (noServices) {
    const ids: string[] = [];
    for (const service of seedServices(photos))
      ids.push(await createRecord("SERVICES", serviceDocumentSchema.parse(service), actor));
    await saveDocumentDraft(orderingDocumentKey("SERVICES"), orderingDocumentSchema.parse(ids), actor);
    result.documents.push(orderingDocumentKey("SERVICES"));
    result.services = ids.length;
  }

  if ((await listRecordsForAdmin("JOBS")).length === 0) {
    await createRecord("JOBS", jobDocumentSchema.parse(seedJob(today)), actor);
    result.jobs = 1;
  }

  if ((await listRecordsForAdmin("CLIENTS")).length === 0) {
    const ids: string[] = [];
    for (const client of SEED_CLIENTS) {
      const logo = await importSeedImage(path.join(LOGOS, client.file), client.name, client.source);
      if (logo.stored) result.photos += 1;
      const document = clientDocumentSchema.parse({ name: { en: client.name }, logo: { mediaId: logo.id }, url: null });
      ids.push(await createRecord("CLIENTS", document, actor));
    }
    await saveDocumentDraft(orderingDocumentKey("CLIENTS"), orderingDocumentSchema.parse(ids), actor);
    result.documents.push(orderingDocumentKey("CLIENTS"));
    result.clients = ids.length;
  }
  return result;
}
