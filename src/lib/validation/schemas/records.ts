import * as z from "zod";

import { LIST_LIMITS, TEXT_LIMITS } from "@/constants/limits";
import { VALIDATION_MESSAGES } from "@/constants/messages";
import { AUDIENCES, EMPLOYMENT_TYPES } from "@/constants/statuses";

import { optionalLine, optionalLines, requiredLine, requiredLines } from "../primitives";

import {
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
  forWhom: localized(optionalLines("Who it's for", TEXT_LIMITS.lede)),
  image: imageRefSchema.nullable(),
  seo: seoSchema,
});
export type ServiceDocument = z.output<typeof serviceDocumentSchema>;

/** A job (plan §9.1): closed on its own once its closing date has passed. */
export const jobDocumentSchema = z
  .object({
    title: localized(requiredLine("Title", { max: TEXT_LIMITS.heading })),
    slug: slugSchema,
    department: localized(optionalLine("Department", 80)),
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
    seo: seoSchema,
  })
  .refine((job) => job.closesOn === null || job.closesOn >= job.postedOn, {
    message: VALIDATION_MESSAGES.closesBeforePosted,
    path: ["closesOn"],
  });
export type JobDocument = z.output<typeof jobDocumentSchema>;

/** A client's logo (plan §11): shown only with the client's permission (D7). */
export const clientDocumentSchema = z.object({
  name: localized(requiredLine("Organisation", { max: TEXT_LIMITS.heading })),
  logo: imageRefSchema,
  url: httpsUrlSchema.nullable(),
});
export type ClientDocument = z.output<typeof clientDocumentSchema>;
