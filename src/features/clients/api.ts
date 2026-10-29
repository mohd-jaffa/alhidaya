import { orderingDocumentKey } from "@/constants/sections";
import { readDocument } from "@/lib/content/documents";
import { inOrder } from "@/lib/content/ordering";
import { listRecords, type PublishedRecord } from "@/lib/content/records";
import type { ContentView } from "@/lib/content/view";
import type { ClientDocument, OrderingDocument } from "@/lib/validation";

export type PublishedClient = PublishedRecord<ClientDocument>;

/** Every published client logo, in the published order (plan §11, D59); none until the client supplies them (D7). */
export async function listPublishedClients(view: ContentView = "published"): Promise<PublishedClient[]> {
  const [clients, order] = await Promise.all([
    listRecords<ClientDocument>("CLIENTS", view),
    readDocument<OrderingDocument>(orderingDocumentKey("CLIENTS"), view),
  ]);
  return inOrder(clients, order);
}
