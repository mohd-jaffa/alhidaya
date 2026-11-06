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
  // The proper brand mark is a shared static SVG; retain this CMS key (D154).
  chat: [],
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

  // The admin's editors (R6.3): a row to drag, moved up, a thing added.
  grip: ["M9 6v.01", "M15 6v.01", "M9 12v.01", "M15 12v.01", "M9 18v.01", "M15 18v.01"],
  chevronUp: ["M6 14.5l6-6 6 6"],
  plus: ["M12 5v14", "M5 12h14"],

  // The admin's password field (R6.2): what was typed, shown or hidden.
  eye: ["M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"],
  eyeOff: [
    "M9.9 5.8A9.7 9.7 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.7 3.5",
    "M14.1 14.1a3 3 0 0 1-4.2-4.2",
    "M6.6 7.1A16.8 16.8 0 0 0 2.5 12s3.5 6.5 9.5 6.5a9.4 9.4 0 0 0 4.9-1.4",
    "M3.5 3.5l17 17",
  ],

  // The redesign's icon chips (D97): what a section's words are about, beside them.
  heart: ["M12 20.5s-8-4.9-8-10.6A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 8 2.6c0 5.7-8 10.6-8 10.6Z"],
  shield: ["M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6Z", "M8.5 12l2.5 2.5 4.5-5"],
  calendar: [
    "M5 5.5h14a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z",
    "M4 10h16",
    "M8 3.5v4",
    "M16 3.5v4",
  ],
  globe: [
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
    "M3 12h18",
    "M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z",
  ],
  team: [
    "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    "M3.5 19.5v-.5a4.5 4.5 0 0 1 4.5-4.5h2a4.5 4.5 0 0 1 4.5 4.5v.5",
    "M16 5.3a3 3 0 0 1 0 5.4",
    "M17.5 14.6a4.5 4.5 0 0 1 3 4.4v.5",
  ],
  stethoscope: [
    "M6.5 3.5H5v5a4.5 4.5 0 0 0 9 0v-5h-1.5",
    "M9.5 13v2.5a5 5 0 0 0 10 0V13",
    "M19.5 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  ],
  clipboard: [
    "M8.5 5H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5",
    "M9 3.5h6v3H9Z",
    "M8.5 13.5l2 2 4.5-4.5",
  ],

  // The social networks the site links to (plan §13): plain line marks beside each name.
  instagram: [
    "M7.5 3.5h9a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4Z",
    "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
    "M17 7v0",
  ],
  facebook: ["M15.5 3.5H14a4 4 0 0 0-4 4v13", "M7 11.5h8"],
  linkedin: [
    "M4.5 3.5h15a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z",
    "M8 10.5v6",
    "M8 7.5v0",
    "M12 16.5v-6",
    "M12 13a2.5 2.5 0 0 1 5 0v3.5",
  ],
  x: ["M4.5 4.5l15 15", "M19.5 4.5l-15 15"],
  youtube: ["M6 5.5h12a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3Z", "M10 9.5v5l4.5-2.5Z"],

  // The admin's menu (R6B.7): each section beside its mark.
  dashboard: ["M4 4h7v7H4Z", "M13 4h7v4h-7Z", "M13 10h7v10h-7Z", "M4 13h7v7H4Z"],
  document: ["M6 3.5h8l4.5 4.5v12.5H6Z", "M14 3.5V8h4.5", "M9 12.5h6", "M9 16h6"],
  briefcase: ["M3.5 7.5h17v12h-17Z", "M8.5 7.5V5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v2.5", "M3.5 12.5h17"],
  image: ["M3.5 5h17v14h-17Z", "M8.5 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z", "M3.5 17l5-5 4 4 3-3 5 5"],
  typography: ["M4 7V4h16v3", "M12 4v16", "M8 20h8"],
  settings: [
    "M4 6.5h10",
    "M18 6.5h2",
    "M16 4.5v4",
    "M4 12h2",
    "M10 12h10",
    "M8 10v4",
    "M4 17.5h8",
    "M16 17.5h4",
    "M14 15.5v4",
  ],
  profile: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M4.5 20.5a7.5 7.5 0 0 1 15 0"],
  logout: ["M10 4.5H5.5v15H10", "M15 8l4 4-4 4", "M19 12H9.5"],
} as const satisfies Record<string, readonly string[]>;

export type PictogramName = keyof typeof PICTOGRAMS;

/** The pictograms that point somewhere, mirrored when the page reads right to left (plan §33). */
export const DIRECTIONAL_PICTOGRAMS: readonly PictogramName[] = ["arrow", "external", "logout"];

/** Shared standard WhatsApp brand SVG (Font Awesome Free, CC BY 4.0). */
export const WHATSAPP_MARK = "/brand/whatsapp.svg#mark";
