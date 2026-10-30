import { orderingDocumentKey } from "@/constants/sections";
import { assertImagesKept, getImages } from "@/features/media/api";
import type { SiteImage } from "@/features/media/types";
import type { Actor } from "@/lib/content/actor";
import { publishedTags, revalidateContent } from "@/lib/content/cache";
import { readDocument } from "@/lib/content/documents";
import {
  discardOrderDraft,
  inOrder,
  listInDraftOrder,
  type OrderState,
  publishOrder,
  saveOrderDraft,
} from "@/lib/content/ordering";
import {
  type AdminRecord,
  createRecord,
  discardRecordDraft,
  getRecordForAdmin,
  listRecords,
  publishRecord,
  type PublishedRecord,
  saveRecordDraft,
  setRecordArchived,
} from "@/lib/content/records";
import type { ContentView } from "@/lib/content/view";
import { type ClientDocument, clientDocumentSchema, type OrderingDocument } from "@/lib/validation";

export type PublishedClient = PublishedRecord<ClientDocument>;

/** Every published client logo, in the published order (plan §11, D59); none until the client supplies them (D7). */
export async function listPublishedClients(view: ContentView = "published"): Promise<PublishedClient[]> {
  const [clients, order] = await Promise.all([
    listRecords<ClientDocument>("CLIENTS", view),
    readDocument<OrderingDocument>(orderingDocumentKey("CLIENTS"), view),
  ]);
  return inOrder(clients, order);
}

/** A client logo in the admin's list (D92): its name, site and logo, and where it stands. */
export interface ClientSummary {
  id: string;
  name: string;
  url: string | null;
  logo: SiteImage | null;
  publishedAt: Date | null;
  archivedAt: Date | null;
  unpublishedChanges: boolean;
}

/** The client logos in their draft order (archived last), and where that order stands (D92). */
export interface ClientList {
  items: ClientSummary[];
  order: OrderState;
}

/** A client logo opened in the editor, as its draft reads. */
export interface ClientDraft {
  id: string;
  draft: ClientDocument;
  publishedAt: Date | null;
  archivedAt: Date | null;
  unpublishedChanges: boolean;
}

const asDraft = (record: AdminRecord<ClientDocument>): ClientDraft => ({
  id: record.id,
  draft: record.draft,
  publishedAt: record.publishedAt,
  archivedAt: record.archivedAt,
  unpublishedChanges: record.unpublishedChanges,
});

/** Every client logo for the admin (D92), in its draft order, each with its logo to show. */
export async function listClientsForAdmin(): Promise<ClientList> {
  const { records, order } = await listInDraftOrder<ClientDocument>("CLIENTS");
  const logos = await getImages(records.map((record) => record.draft.logo.mediaId));
  return {
    items: records.map((record) => ({
      id: record.id,
      name: record.draft.name.en,
      url: record.draft.url,
      logo: logos.get(record.draft.logo.mediaId) ?? null,
      publishedAt: record.publishedAt,
      archivedAt: record.archivedAt,
      unpublishedChanges: record.unpublishedChanges,
    })),
    order,
  };
}

export async function getClientForAdmin(id: string): Promise<ClientDraft> {
  return asDraft(await getRecordForAdmin<ClientDocument>("CLIENTS", id));
}

/** Adds a client logo as a draft (D92), its logo known to the library; nothing shows until it is published. */
export async function createClient(document: ClientDocument, actor: Actor): Promise<ClientDraft> {
  await assertImagesKept([document.logo.mediaId]);
  return getClientForAdmin(await createRecord("CLIENTS", document, actor));
}

/** Saves a client logo's draft (plan §14); the site is unchanged until Publish. */
export async function saveClientDraft(id: string, document: ClientDocument, actor: Actor): Promise<ClientDraft> {
  await assertImagesKept([document.logo.mediaId]);
  await saveRecordDraft("CLIENTS", id, document, actor);
  return getClientForAdmin(id);
}

/** Publishes a client logo's saved draft (plan §11, §14), checked as it goes live; the logo rows read afresh. */
export async function publishClient(id: string, actor: Actor): Promise<ClientDraft> {
  await publishRecord(
    "CLIENTS",
    id,
    (draft) => {
      clientDocumentSchema.parse(draft);
      return null;
    },
    actor,
  );
  revalidateContent(publishedTags({ collection: "CLIENTS", slugs: [] }));
  return getClientForAdmin(id);
}

/** Throws a client logo's draft away, back to what is published (plan §14). */
export async function discardClientDraft(id: string, actor: Actor): Promise<ClientDraft> {
  await discardRecordDraft("CLIENTS", id, actor);
  return getClientForAdmin(id);
}

/** Takes a client logo off the site, or puts it back (D92); it is never deleted. */
export async function setClientArchived(id: string, archived: boolean, actor: Actor): Promise<ClientDraft> {
  await setRecordArchived("CLIENTS", id, archived, actor);
  revalidateContent(publishedTags({ collection: "CLIENTS", slugs: [] }));
  return getClientForAdmin(id);
}

/** Saves the logos' order as a draft (D92). */
export async function saveClientOrder(ids: OrderingDocument, actor: Actor): Promise<ClientList> {
  await saveOrderDraft("CLIENTS", ids, actor);
  return listClientsForAdmin();
}

/** Publishes the logos' order (D92): every row of logos on the site follows it. */
export async function publishClientOrder(actor: Actor): Promise<ClientList> {
  await publishOrder("CLIENTS", actor);
  return listClientsForAdmin();
}

/** Throws the logos' draft order away, back to the published one. */
export async function discardClientOrder(actor: Actor): Promise<ClientList> {
  await discardOrderDraft("CLIENTS", actor);
  return listClientsForAdmin();
}
