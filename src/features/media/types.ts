/** One made size of an uploaded image (plan §15): where it is served, its width and its type. */
export interface ImageSource {
  url: string;
  width: number;
  mime: string;
}

/** An uploaded image as a page shows it (plan §15, §22.3): its made sizes, its shape and its words. */
export interface SiteImage {
  id: string;
  width: number;
  height: number;
  /** What it shows; empty for an image marked decorative. */
  alt: string;
  sources: ImageSource[];
}

/** A place that uses a file, as the library names it, opening its editor (plan §15). */
export interface MediaUsage {
  label: string;
  href: string;
}

/** An image in the media library (D89, D93): its words, where it came from, its size and where it is used. */
export interface LibraryImage extends SiteImage {
  decorative: boolean;
  source: { provider: string | null; url: string | null; licence: string | null } | null;
  /** All its made sizes together. */
  bytes: number;
  createdAt: Date;
  usedIn: MediaUsage[];
}

/** An image as the library's endpoint answers it. */
export type LibraryImageItem = Omit<LibraryImage, "createdAt"> & { createdAt: string };
