import type { EnquiryDetail, EnquiryNote, EnquirySummary } from "./api";

/** A date as it crosses the wire: text, made a date again where it is shown. */
type Wired<T> = { [K in keyof T]: T[K] extends Date ? string : T[K] };

/** What the inbox's list answers (plan §10.5). */
export interface EnquiryList {
  items: Wired<EnquirySummary>[];
  total: number;
  page: number;
  pageSize: number;
}

export type EnquiryListItem = EnquiryList["items"][number];
export type EnquiryNoteItem = Wired<EnquiryNote>;

/** One enquiry opened, as its endpoint answers it. */
export type EnquiryOpened = Wired<Omit<EnquiryDetail, "notes">> & { notes: EnquiryNoteItem[] };

/** Which enquiries a list shows; what is left out takes the inbox's default. */
export interface EnquiryListQuery {
  form?: "QUOTE" | "CONTACT";
  status?: "NEW" | "IN_PROGRESS" | "RESOLVED";
  needsYou?: boolean;
  q?: string;
  page?: number;
}
