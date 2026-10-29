import type { ImageSource } from "@/features/media/api";

/**
 * The launch's stock photographs (plan D8, D75): each file in
 * `src/db/seed/photos/`, what it shows (its alt text, never naming anyone as
 * Al Hidaya's staff), and where it came from, kept with the image.
 */
export const SEED_PHOTOS = {
  careAtHome: {
    file: "care-at-home.jpg",
    alt: "A nurse smiling with an older woman she is caring for",
    source: {
      provider: "Unsplash (Age Cymru)",
      url: "https://unsplash.com/photos/nurse-smiling-with-elderly-patient-in-room-dMhB7w99ju8",
      licence: "Unsplash License",
    },
  },
  clinicCheck: {
    file: "clinic-check.jpg",
    alt: "A nurse checking a woman's blood pressure",
    source: {
      provider: "Unsplash (CDC)",
      url: "https://unsplash.com/photos/healthcare-worker-checking-blood-pressure-Y2lUjUiay-o",
      licence: "Unsplash License",
    },
  },
  hospitalCorridor: {
    file: "hospital-corridor.jpg",
    alt: "Hospital staff in scrubs walking down a corridor",
    source: {
      provider: "Unsplash (Luis Melendez)",
      url: "https://unsplash.com/photos/group-of-doctors-walking-on-hospital-hallway-Pd4lRfKo16U",
      licence: "Unsplash License",
    },
  },
} as const satisfies Record<string, { file: string; alt: string; source: ImageSource }>;

export type SeedPhoto = keyof typeof SEED_PHOTOS;

/** Each seed photograph's image, once imported; none before. */
export type SeedPhotoRefs = Record<SeedPhoto, { mediaId: string } | null>;

export const NO_PHOTOS: SeedPhotoRefs = { careAtHome: null, clinicCheck: null, hospitalCorridor: null };
