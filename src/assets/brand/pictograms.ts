/**
 * The site's pictograms (plan §30.1, R2.3, Q12): one set, drawn for this site
 * in the manner of hospital symbol systems. Each is drawn on a 24-unit grid,
 * inside a 2-unit margin, as round-capped 2-unit strokes, so every one reads
 * at the same weight at any size; `src/components/ui/pictogram.tsx` draws
 * them. A drawing is a list of path data; `dot` marks are zero-length strokes
 * that the round cap turns into a dot.
 */
export const PICTOGRAMS = {
  // The three lines (plan §30.1).
  careAtHome: ["M3 11 12 3.5 21 11", "M5 9.5V20h14V9.5", "M12 11.5v6", "M9 14.5h6"],
  staffing: ["M2.5 21h19", "M4.5 21V7a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v14", "M12 8.5v5", "M9.5 11h5", "M10 21v-3.5h4V21"],
  careers: [
    "M8.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
    "M2.5 20.5v-.5a5.5 5.5 0 0 1 5.5-5.5h1a5.5 5.5 0 0 1 5.5 5.5v.5",
    "M18.5 8v6",
    "M15.5 11h6",
  ],

  // Reaching the company (plan §6.7).
  phone: [
    "M4.5 3.5h3.4l1.7 4.4-2.3 1.5a11.5 11.5 0 0 0 7.3 7.3l1.5-2.3 4.4 1.7v3.4a2 2 0 0 1-2.1 2A17 17 0 0 1 2.5 5.6a2 2 0 0 1 2-2.1Z",
  ],
  chat: ["M4 5.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-4.5 4v-4H6a2 2 0 0 1-2-2Z"],
  mail: ["M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z", "M3.5 6.5 12 13l8.5-6.5"],
  location: ["M12 21.5s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z", "M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 7v5l3.5 2"],

  // Finding the way and acting.
  arrow: ["M4 12h15", "M13.5 6.5 19 12l-5.5 5.5"],
  chevronDown: ["M6 9.5l6 6 6-6"],
  menu: ["M4 7h16", "M4 12h16", "M4 17h16"],
  close: ["M6 6l12 12", "M18 6 6 18"],
  external: [
    "M14 4h6v6",
    "M20 4l-8.5 8.5",
    "M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10",
  ],
  download: ["M12 4v11", "M7 10.5l5 5 5-5", "M5 20h14"],
  upload: [
    "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z",
    "M14 3v5h5",
    "M12 18v-6.5",
    "M9.5 14 12 11.5l2.5 2.5",
  ],

  // Status: always with words (plan §30.3).
  check: ["M4.5 12.5l5 5 10-11"],
  error: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 7.5V13", "M12 16.5v.01"],
  info: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 11v5.5", "M12 7.5v.01"],
} as const satisfies Record<string, readonly string[]>;

export type PictogramName = keyof typeof PICTOGRAMS;

/** The pictograms that point somewhere, mirrored when the page reads right to left (plan §33). */
export const DIRECTIONAL_PICTOGRAMS: readonly PictogramName[] = ["arrow", "external"];
