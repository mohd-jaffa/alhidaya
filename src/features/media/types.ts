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
