import type { ClientDraft, ClientList } from "./api";

/** A date as it crosses the wire: text, made a date again where it is shown. */
type Wired<T> = { [K in keyof T]: T[K] extends Date | null ? Exclude<T[K], Date> | string : T[K] };

/** The client logos as the admin's list answers them (D92). */
export interface ClientListItems {
  items: Wired<ClientList["items"][number]>[];
  order: Wired<ClientList["order"]>;
}

export type ClientSummaryItem = ClientListItems["items"][number];

/** A client logo opened in the editor, as its endpoint answers it. */
export type ClientDraftItem = Wired<ClientDraft>;
