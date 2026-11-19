import * as z from "zod";

import { JOB_QUESTION_CHOICES, LIST_LIMITS, TEXT_LIMITS } from "@/constants/limits";
import { VALIDATION_MESSAGES } from "@/constants/messages";
import { RESERVED_JOB_SLUGS } from "@/constants/routes";
import {
  APPLICATION_QUESTION_FIELDS,
  AUDIENCES,
  EMPLOYMENT_TYPES,
  JOB_QUESTION_SELECTIONS,
} from "@/constants/statuses";
import { plainText } from "@/lib/text/inline";

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
  withoutRepeats,
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

/** The same words, whatever their emphasis or case: two choices, or two questions, may not say them twice. */
const sameWords = (text: { en: string }) => plainText(text.en).toLocaleLowerCase("en");

/**
 * One of a job's own application questions (D209): its words and two to six
 * distinct choices and the selection mode (D210).
 */
export const jobQuestionSchema = z.object({
  question: localized(requiredLine("Question", { max: TEXT_LIMITS.item })),
  selection: z.enum(JOB_QUESTION_SELECTIONS, { error: VALIDATION_MESSAGES.invalid }).default("single"),
  choices: z
    .array(localized(requiredLine("Choice", { max: TEXT_LIMITS.heading })))
    .min(JOB_QUESTION_CHOICES.min, VALIDATION_MESSAGES.fewChoices(JOB_QUESTION_CHOICES.min))
    .max(JOB_QUESTION_CHOICES.max, VALIDATION_MESSAGES.atMost("Choices", JOB_QUESTION_CHOICES.max))
    .superRefine(withoutRepeats("Choices", sameWords)),
});
export type JobQuestion = z.output<typeof jobQuestionSchema>;

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
    hiddenQuestions: z
      .array(z.enum(APPLICATION_QUESTION_FIELDS, { error: VALIDATION_MESSAGES.invalid }))
      .max(APPLICATION_QUESTION_FIELDS.length, VALIDATION_MESSAGES.invalid)
      .superRefine(withoutRepeats("Predefined questions", (field) => field))
      .default([]),
    /** Its own questions in its application form (D209, D210). */
    questions: z
      .array(jobQuestionSchema)
      .max(LIST_LIMITS.jobQuestions, VALIDATION_MESSAGES.atMost("Application questions", LIST_LIMITS.jobQuestions))
      .superRefine(withoutRepeats("Application questions", (asked) => sameWords(asked.question)))
      .default([]),
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
