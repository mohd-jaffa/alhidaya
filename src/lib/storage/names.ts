/**
 * Text reduced to what a file name may safely hold: lowercase ASCII letters,
 * digits and single hyphens, at most `max` characters; accents are dropped,
 * and anything else (Arabic included) leaves nothing, so `fallback` is used.
 */
export function slugForFile(text: string, max: number, fallback: string): string {
  const slug = text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
  return slug || fallback;
}

/** A short random part, so no two files' names collide and none can be guessed. */
export function randomPart(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
}

/** The month folder a file goes in: "2026-10", in UTC. */
export function monthFolder(at: Date): string {
  return at.toISOString().slice(0, 7);
}
