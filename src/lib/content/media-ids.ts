/**
 * Every file id a stored copy names, at any depth (plan §15): a section's
 * photo or faces, a service's photo, a logo, the brochure.
 */
export function mediaIds(node: unknown, found: Set<string> = new Set()): Set<string> {
  if (Array.isArray(node)) for (const item of node) mediaIds(item, found);
  else if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (key === "mediaId" && typeof value === "string") found.add(value);
      else mediaIds(value, found);
    }
  }
  return found;
}
