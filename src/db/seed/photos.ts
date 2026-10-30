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
  // The redesign's photographs (Phase 6B, D97): the hero, faces, cards, steps and each service's.
  heroNurse: {
    file: "hero-nurse.jpg",
    alt: "A smiling nurse in a blue cap and scrubs at a desk",
    source: {
      provider: "Unsplash (EqualStock)",
      url: "https://unsplash.com/photos/a-smiling-woman-in-surgical-attire-YkRpDEdkkRY",
      licence: "Unsplash License",
    },
  },
  avatarNavy: {
    file: "nurse-navy-scrubs.jpg",
    alt: "A smiling woman in navy scrubs and glasses",
    source: {
      provider: "Unsplash (Beatriz Mendez)",
      url: "https://unsplash.com/photos/a-woman-in-blue-scrubs-with-glasses-smiles-_4xStiTXY1o",
      licence: "Unsplash License",
    },
  },
  avatarBraids: {
    file: "nurse-blue-scrubs.jpg",
    alt: "A smiling woman in blue scrubs holding an open book",
    source: {
      provider: "Unsplash (DELIGHT ODINWA)",
      url: "https://unsplash.com/photos/a-woman-in-a-blue-shirt-is-reading-a-book-Nvv8ya3XAmU",
      licence: "Unsplash License",
    },
  },
  avatarGreen: {
    file: "nurse-green-scrubs.jpg",
    alt: "A smiling man in green scrubs with a stethoscope",
    source: {
      provider: "Unsplash (Muhammad Hicham)",
      url: "https://unsplash.com/photos/a-man-in-a-green-scrub-suit-holding-a-toothbrush-PYxK4LNGn6E",
      licence: "Unsplash License",
    },
  },
  avatarTurban: {
    file: "nurse-head-wrap.jpg",
    alt: "A smiling woman in blue scrubs and a head wrap",
    source: {
      provider: "Unsplash (Kamal Hoseinianzade)",
      url: "https://unsplash.com/photos/a-person-sitting-in-a-chair-QdMjS_yNjkM",
      licence: "Unsplash License",
    },
  },
  wardNurse: {
    file: "ward-nurse.jpg",
    alt: "A nurse leaning over a patient's hospital bed",
    source: {
      provider: "Unsplash (Maria Luísa Queiroz)",
      url: "https://unsplash.com/photos/a-nurse-is-attending-to-a-patient-in-a-hospital-KlBltbAwxWk",
      licence: "Unsplash License",
    },
  },
  nursesTalking: {
    file: "nurses-talking.jpg",
    alt: "Two nurses talking in a hospital corridor",
    source: {
      provider: "Unsplash (Centre for Ageing Better)",
      url: "https://unsplash.com/photos/a-woman-talking-to-another-woman-in-a-hospital-hallway-PuCtm8SOqLo",
      licence: "Unsplash License",
    },
  },
  onThePhone: {
    file: "on-the-phone.jpg",
    alt: "An older woman smiling as she talks on her phone",
    source: {
      provider: "Unsplash (A. C.)",
      url: "https://unsplash.com/photos/woman-in-white-scoop-neck-shirt-wearing-black-framed-eyeglasses-f5uc9of5eak",
      licence: "Unsplash License",
    },
  },
  consultation: {
    file: "consultation.jpg",
    alt: "A clinician in a white coat talking with a woman",
    source: {
      provider: "Unsplash (Nate Johnston)",
      url: "https://unsplash.com/photos/a-person-in-a-white-coat-fNSPSQAH1mQ",
      licence: "Unsplash License",
    },
  },
  laughingCare: {
    file: "laughing-care.jpg",
    alt: "A carer laughing with an older woman",
    source: {
      provider: "Unsplash (Age Cymru)",
      url: "https://unsplash.com/photos/two-women-laughing-together-indoors-GPrh_GLiWCI",
      licence: "Unsplash License",
    },
  },
  homeNursing: {
    file: "home-nursing.jpg",
    alt: "A nurse checking a man's blood pressure at home",
    source: {
      provider: "Unsplash (Nappy)",
      url: "https://unsplash.com/photos/a-man-showing-a-man-something-on-the-tablet-PSHCnGmOeUo",
      licence: "Unsplash License",
    },
  },
  chronicCare: {
    file: "chronic-care.jpg",
    alt: "Hands holding a blood glucose meter",
    source: {
      provider: "Unsplash (isens usa)",
      url: "https://unsplash.com/photos/a-person-holding-a-thermometer-in-their-hand-gosL6M_WJSE",
      licence: "Unsplash License",
    },
  },
  childCare: {
    file: "child-care.jpg",
    alt: "A nurse sitting with a young girl on a sofa",
    source: {
      provider: "Unsplash (Lisa Marie Theck)",
      url: "https://unsplash.com/photos/nurse-comforting-a-young-child-on-a-sofa-5PMciQ-z8Xs",
      licence: "Unsplash License",
    },
  },
  newbornCare: {
    file: "newborn-care.jpg",
    alt: "A mother holding her newborn baby on a bed",
    source: {
      provider: "Unsplash (Jonathan Borba)",
      url: "https://unsplash.com/photos/woman-in-white-crew-neck-t-shirt-holding-baby-xlY3ayphpIc",
      licence: "Unsplash License",
    },
  },
  palliativeCare: {
    file: "palliative-care.jpg",
    alt: "One person holding another's hand",
    source: {
      provider: "Unsplash (National Cancer Institute)",
      url: "https://unsplash.com/photos/person-wearing-gold-wedding-band-BxXgTQEw1M4",
      licence: "Unsplash License",
    },
  },
  elderlyCare: {
    file: "elderly-care.jpg",
    alt: "A carer helping an older couple with drawing at a table",
    source: {
      provider: "Unsplash (Age Cymru)",
      url: "https://unsplash.com/photos/caregiver-assisting-elderly-couple-with-coloring-bSXk1lOp8T0",
      licence: "Unsplash License",
    },
  },
  schoolNurse: {
    file: "school-nurse.jpg",
    alt: "A clinician listening to a girl's back with a stethoscope",
    source: {
      provider: "Unsplash (Bermix Studio)",
      url: "https://unsplash.com/photos/a-woman-in-a-white-lab-coat-sitting-on-a-couch-with-a-little-girl-Kru-gp6dgS0",
      licence: "Unsplash License",
    },
  },
} as const satisfies Record<string, { file: string; alt: string; source: ImageSource }>;

export type SeedPhoto = keyof typeof SEED_PHOTOS;

/** Each seed photograph's image, once imported; none before. */
export type SeedPhotoRefs = Record<SeedPhoto, { mediaId: string } | null>;

export const NO_PHOTOS = Object.fromEntries(Object.keys(SEED_PHOTOS).map((name) => [name, null])) as SeedPhotoRefs;
