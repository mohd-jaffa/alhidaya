import type { ApplicationStatus } from "@/constants/statuses";

import type { ApplicationDetail, ApplicationNote, ApplicationSummary, AppliedJob } from "./api";

/** A date as it crosses the wire: text, made a date again where it is shown. */
type Wired<T> = { [K in keyof T]: T[K] extends Date ? string : T[K] };

/** What the inbox's list answers (plan §9.5), with the jobs it can be filtered by. */
export interface ApplicationList {
  items: Wired<ApplicationSummary>[];
  total: number;
  page: number;
  pageSize: number;
  jobs: AppliedJob[];
}

export type ApplicationListItem = ApplicationList["items"][number];
export type ApplicationNoteItem = Wired<ApplicationNote>;

/** One application opened, as its endpoint answers it. */
export type ApplicationOpened = Wired<Omit<ApplicationDetail, "notes">> & { notes: ApplicationNoteItem[] };

/** Which applications a list shows; what is left out takes the inbox's default. */
export interface ApplicationListQuery {
  /** A job's id, or "general" for the general applications. */
  job?: string;
  status?: ApplicationStatus;
  needsYou?: boolean;
  q?: string;
  page?: number;
}
