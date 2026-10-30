import { TEXT_LIMITS } from "@/constants/limits";

/**
 * A web address made from a name (D92): "Maternity & Newborn Care" becomes
 * "maternity-newborn-care". Accents fall away, anything but a letter or a
 * digit separates words, and it fits the address's bound without ending on a
 * dash. A name with no Latin letters or digits makes an empty one, for the
 * admin to type.
 */
export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, TEXT_LIMITS.slug)
    .replace(/^-+|-+$/g, "");
}
