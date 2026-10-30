import type { SiteDraft } from "./api";

/** A date as it crosses the wire: text, made a date again where it is shown. */
type Wired<T> = { [K in keyof T]: T[K] extends Date | null ? Exclude<T[K], Date> | string : T[K] };

/** The site's content opened in Settings, as its endpoint answers it (D94). */
export type SiteDraftItem = Wired<SiteDraft>;
