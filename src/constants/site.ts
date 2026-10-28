/**
 * The company's fixed facts, known before any content loads (AGENTS.md §21).
 * What the admin edits (phones, addresses, social links) lives in the site
 * content (plan §13), seeded from the current site in R1.8, not here.
 */
export const SITE = {
  domain: "alhidaya.qa",
  url: "https://alhidaya.qa",
  /** The sender of every email the site sends (plan D53), and the name it shows. */
  sender: "noreply@alhidaya.qa",
  senderName: "Al Hidaya Health Care Services",
  /** Where enquiries and applications go until the admin changes them (plan Q17). */
  defaultRecipients: {
    enquiries: "info@alhidaya.qa",
    applications: "hr@alhidaya.qa",
  },
} as const;
