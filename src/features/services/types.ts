import type { ServiceDraft, ServiceList } from "./api";

/** A date as it crosses the wire: text, made a date again where it is shown. */
type Wired<T> = { [K in keyof T]: T[K] extends Date | null ? Exclude<T[K], Date> | string : T[K] };

/** The services as the admin's list answers them (D92). */
export interface ServiceListItems {
  items: Wired<ServiceList["items"][number]>[];
  order: Wired<ServiceList["order"]>;
}

export type ServiceSummaryItem = ServiceListItems["items"][number];

/** A service opened in the editor, as its endpoint answers it. */
export type ServiceDraftItem = Wired<ServiceDraft>;
