import { orderingDocumentKey } from "@/constants/sections";
import { readPublishedDocument } from "@/lib/content/documents";
import { inOrder } from "@/lib/content/ordering";
import { findPublishedRecord, listPublishedRecords, type PublishedRecord } from "@/lib/content/records";
import type { OrderingDocument, ServiceDocument } from "@/lib/validation";

export type PublishedService = PublishedRecord<ServiceDocument>;

/** Every published service, in the published order (plan §8, D59). */
export async function listPublishedServices(): Promise<PublishedService[]> {
  const [services, order] = await Promise.all([
    listPublishedRecords<ServiceDocument>("SERVICES"),
    readPublishedDocument<OrderingDocument>(orderingDocumentKey("SERVICES")),
  ]);
  return inOrder(services, order);
}

/** The published service at a web address, or where it moved to (plan §8). */
export function findPublishedService(slug: string) {
  return findPublishedRecord<ServiceDocument>("SERVICES", slug);
}
