import * as z from "zod";

import { LIST_LIMITS, TEXT_LIMITS } from "@/constants/limits";
import { VALIDATION_MESSAGES } from "@/constants/messages";
import { RESERVED_JOB_SLUGS } from "@/constants/routes";
import { AUDIENCES, EMPLOYMENT_TYPES } from "@/constants/statuses";

import { optionalLine, optionalLines, requiredLine, requiredLines } from "../primitives";

import {
  hrefSchema,
  httpsUrlSchema,
  imageRefSchema,
  isoDateSchema,
  localized,
  richTextSchema,
  seoSchema,
  slugSchema,
} from "./content";

const points = (label: string, max: number) =>
  z.array(localized(requiredLine(label, { max: TEXT_LIMITS.item }))).max(max, VALIDATION_MESSAGES.atMost(label, max));

/** A service (plan §8): who it is for sets its line on the site (D31). */
export const serviceDocumentSchema = z.object({
  name: localized(requiredLine("Name", { max: TEXT_LIMITS.name })),
  slug: slugSchema,
  audience: z.enum(AUDIENCES),
  summary: localized(requiredLines("Summary", { max: TEXT_LIMITS.lede })),
  description: richTextSchema.min(1, VALIDATION_MESSAGES.atLeastOne("The description")),
  included: points("What's included", LIST_LIMITS.included),
  headerButtons: z
    .array(
      z.object({
        label: localized(requiredLine("Button wording", { max: TEXT_LIMITS.label })),
        href: hrefSchema,
      }),
    )
    .max(LIST_LIMITS.serviceButtons, VALIDATION_MESSAGES.atMost("Header buttons", LIST_LIMITS.serviceButtons))
    .default([]),
  forWhom: localized(optionalLines("Who it's for", TEXT_LIMITS.lede)),
  image: imageRefSchema.nullable(),
  seo: seoSchema,
});
export type ServiceDocument = z.output<typeof serviceDocumentSchema>;
export type ServiceDocumentInput = z.input<typeof serviceDocumentSchema>;

/** A job (plan §9.1): closed on its own once its closing date has passed. */
export const jobDocumentSchema = z
  .object({
    title: localized(requiredLine("Title", { max: TEXT_LIMITS.heading })),
    slug: slugSchema.refine((slug) => !RESERVED_JOB_SLUGS.includes(slug), VALIDATION_MESSAGES.slugReserved),
    department: localized(optionalLine("Department", TEXT_LIMITS.department)),
    location: localized(requiredLine("Location", { max: TEXT_LIMITS.heading })),
    employmentType: z.enum(EMPLOYMENT_TYPES),
    experience: localized(optionalLine("Experience", TEXT_LIMITS.heading)),
    summary: localized(requiredLines("Summary", { max: TEXT_LIMITS.lede })),
    description: richTextSchema,
    responsibilities: points("Responsibilities", LIST_LIMITS.jobPoints),
    qualifications: points("Qualifications", LIST_LIMITS.jobPoints),
    benefits: points("Benefits", LIST_LIMITS.jobPoints),
    postedOn: isoDateSchema("The posting date"),
    closesOn: isoDateSchema("The closing date").nullable(),
    /** Closed at once by the admin (D92), whatever its closing date; set only by Close now and Reopen. */
    closed: z.boolean().default(false),
    seo: seoSchema,
  })
  .refine((job) => job.closesOn === null || job.closesOn >= job.postedOn, {
    message: VALIDATION_MESSAGES.closesBeforePosted,
    path: ["closesOn"],
  });
export type JobDocument = z.output<typeof jobDocumentSchema>;
export type JobDocumentInput = z.input<typeof jobDocumentSchema>;

/** A client's logo (plan §11): shown only with the client's permission (D7). */
export const clientDocumentSchema = z.object({
  name: localized(requiredLine("Organisation", { max: TEXT_LIMITS.heading })),
  // Chosen from the library; none chosen yet is said as the editor's other missing fields are.
  logo: z.object(imageRefSchema.shape, { error: VALIDATION_MESSAGES.required("The logo") }),
  url: z.union([z.literal("").transform(() => null), httpsUrlSchema, z.null()]),
});
export type ClientDocumentInput = z.input<typeof clientDocumentSchema>;
export type ClientDocument = z.output<typeof clientDocumentSchema>;

/** Taking a service or a job off the site, or putting it back (D92). */
export const archiveSchema = z.object({ archived: z.boolean() });
export type ArchivePayload = z.output<typeof archiveSchema>;

/** Closing a job at once, or opening it again (D92). */
export const closeSchema = z.object({ closed: z.boolean() });
export type ClosePayload = z.output<typeof closeSchema>;
