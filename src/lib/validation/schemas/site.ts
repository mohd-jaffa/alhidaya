import * as z from "zod";

import { CV_EXPIRY_DAYS, LIST_LIMITS, RETENTION_DAYS, TEXT_LIMITS } from "@/constants/limits";
import { VALIDATION_MESSAGES } from "@/constants/messages";
import { SOCIAL_NETWORKS } from "@/constants/statuses";

import { optionalLine, requiredEmail, requiredLine, requiredLines, requiredPhone } from "../primitives";

import { hrefSchema, httpsUrlSchema, localized, withoutRepeats } from "./content";

const link = z.object({ label: localized(requiredLine("Link text", { max: TEXT_LIMITS.label })), href: hrefSchema });

/** A latitude or longitude in degrees, as a map app gives it. */
const coordinate = (label: string, limit: number) =>
  z
    .number(VALIDATION_MESSAGES.between(label, -limit, limit))
    .min(-limit, VALIDATION_MESSAGES.between(label, -limit, limit))
    .max(limit, VALIDATION_MESSAGES.between(label, -limit, limit));

/**
 * The site's own content (plan §13): contact details, links, SEO defaults,
 * the brochure, and whether the floating WhatsApp button shows (D67).
 */
export const siteDocumentSchema = z.object({
  name: localized(requiredLine("Company name", { max: TEXT_LIMITS.name })),
  description: localized(requiredLines("Description", { max: TEXT_LIMITS.lede })),
  contact: z.object({
    phone: requiredPhone("Phone"),
    whatsapp: requiredPhone("WhatsApp"),
    email: requiredEmail("Email"),
    address: z
      .array(localized(requiredLine("Address line", { max: TEXT_LIMITS.heading })))
      .min(1, VALIDATION_MESSAGES.atLeastOne("The address"))
      .max(LIST_LIMITS.addressLines, VALIDATION_MESSAGES.atMost("The address", LIST_LIMITS.addressLines)),
    mapUrl: httpsUrlSchema,
    /** The office on the static map (plan §30.6, D74); none until the client confirms the spot. */
    mapPin: z.object({ lat: coordinate("Latitude", 90), lon: coordinate("Longitude", 180) }).nullable(),
    hours: localized(optionalLine("Hours", TEXT_LIMITS.heading)),
  }),
  social: z
    .array(z.object({ network: z.enum(SOCIAL_NETWORKS), url: httpsUrlSchema }))
    .max(LIST_LIMITS.social, VALIDATION_MESSAGES.atMost("Social links", LIST_LIMITS.social))
    .superRefine(withoutRepeats("Social links", (item) => item.network)),
  navigation: z
    .array(link.extend({ visible: z.boolean() }))
    .max(LIST_LIMITS.navigation, VALIDATION_MESSAGES.atMost("The navigation", LIST_LIMITS.navigation)),
  footer: z
    .array(
      z.object({
        heading: localized(requiredLine("Column heading", { max: TEXT_LIMITS.label })),
        links: z
          .array(link)
          .max(LIST_LIMITS.footerLinks, VALIDATION_MESSAGES.atMost("A column", LIST_LIMITS.footerLinks)),
      }),
    )
    .max(LIST_LIMITS.footerColumns, VALIDATION_MESSAGES.atMost("The footer", LIST_LIMITS.footerColumns)),
  seo: z.object({
    title: localized(requiredLine("SEO title", { max: TEXT_LIMITS.seoTitle })),
    description: localized(requiredLines("SEO description", { max: TEXT_LIMITS.seoDescription })),
  }),
  brochure: z.object({ mediaId: z.uuid() }).nullable(),
  whatsappButton: z.boolean(),
});
export type SiteDocument = z.output<typeof siteDocumentSchema>;

/** An order of services or client logos, by id (plan D59). */
export const orderingDocumentSchema = z
  .array(z.uuid())
  .max(LIST_LIMITS.ordering)
  .superRefine(withoutRepeats("An order", (id) => id));
export type OrderingDocument = z.output<typeof orderingDocumentSchema>;

const days = (label: string, range: { min: number; max: number }) =>
  z
    .number(VALIDATION_MESSAGES.between(label, range.min, range.max))
    .int(VALIDATION_MESSAGES.between(label, range.min, range.max))
    .min(range.min, VALIDATION_MESSAGES.between(label, range.min, range.max))
    .max(range.max, VALIDATION_MESSAGES.between(label, range.min, range.max));

const recipients = (label: string) =>
  z
    .array(requiredEmail(label))
    .min(1, VALIDATION_MESSAGES.atLeastOne(label))
    .max(LIST_LIMITS.recipients, VALIDATION_MESSAGES.atMost(label, LIST_LIMITS.recipients))
    .superRefine(withoutRepeats(label, (email) => email));

/** How the site runs (plan §13): recipients, and how long things are kept (D24, D52). */
export const operationsSchema = z.object({
  enquiriesTo: recipients("Enquiry recipients"),
  applicationsTo: recipients("Application recipients"),
  retentionDays: days("Retention", RETENTION_DAYS),
  cvExpiryDays: days("CV expiry", CV_EXPIRY_DAYS),
});
export type OperationsInput = z.input<typeof operationsSchema>;
export type OperationsPayload = z.output<typeof operationsSchema>;
