import { orderingDocumentKey } from "@/constants/sections";
import { readPublishedDocument } from "@/lib/content/documents";
import { inOrder } from "@/lib/content/ordering";
import { listPublishedRecords, type PublishedRecord } from "@/lib/content/records";
import type { ClientDocument, OrderingDocument } from "@/lib/validation";

export type PublishedClient = PublishedRecord<ClientDocument>;

/** Every published client logo, in the published order (plan §11, D59); none until the client supplies them (D7). */
export async function listPublishedClients(): Promise<PublishedClient[]> {
  const [clients, order] = await Promise.all([
    listPublishedRecords<ClientDocument>("CLIENTS"),
    readPublishedDocument<OrderingDocument>(orderingDocumentKey("CLIENTS")),
  ]);
  return inOrder(clients, order);
}
