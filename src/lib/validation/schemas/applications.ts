import * as z from "zod";

import { EXPERIENCE_YEARS, TEXT_LIMITS, UPLOAD_LIMITS } from "@/constants/limits";
import { UI_TEXT, VALIDATION_MESSAGES } from "@/constants/messages";
import { APPLICATION_STATUSES, DATAFLOW, MOPH_LICENCE, PROMETRIC, WHERE_NOW } from "@/constants/statuses";
import { formatBytes } from "@/lib/files/size";
import { normaliseLine } from "@/lib/text/normalise";

import {
  botCheck,
  consent,
  optionalLine,
  optionalLines,
  requiredEmail,
  requiredLine,
  requiredLines,
  requiredPhone,
} from "../primitives";

/**
 * Years of nursing experience (plan §9.2): typed as a whole number, so a
 * phone's number pad is enough, and kept as one.
 */
const experienceYears = z
  .string({ error: VALIDATION_MESSAGES.required(UI_TEXT.experienceYears) })
  .transform((text, ctx) => {
    const value = normaliseLine(text);
    const years = /^\d{1,2}$/.test(value) ? Number(value) : null;
    if (years === null || years > EXPERIENCE_YEARS.max) {
      ctx.addIssue({
        code: "custom",
        message:
          value === ""
            ? VALIDATION_MESSAGES.required(UI_TEXT.experienceYears)
            : VALIDATION_MESSAGES.between(UI_TEXT.experienceYears, EXPERIENCE_YEARS.min, EXPERIENCE_YEARS.max),
      });
      return z.NEVER;
    }
    return years;
  });

/**
 * The CV as picked (plan §9.2, Q4): one file, at most its size. Its type is
 * read from its first bytes by the route, never from its name or the
 * browser's word; the picker only suggests PDF and Word files.
 */
const cv = z
  .custom<File>((value) => value instanceof File, { error: VALIDATION_MESSAGES.cvRequired })
  .refine((file) => file.size <= UPLOAD_LIMITS.cvBytes, {
    error: VALIDATION_MESSAGES.cvSize(formatBytes(UPLOAD_LIMITS.cvBytes)),
  });

/**
 * The application form (plan §9.2, Q7 default), each field named by the
 * label the applicant sees: the job applied for (none for a general
 * application), who they are, where they are with Qatar's licensing, their
 * experience, their CV and an optional note. The browser checks it with the
 * file picked; the route parses it once more with the file received.
 */
export const applicationFormSchema = z.object({
  /** The job's id, or blank for a general application; the route checks it is published and open (§6.6). */
  jobId: z
    .union([z.uuid({ error: VALIDATION_MESSAGES.invalid }), z.literal("")])
    .optional()
    .transform((value) => value || null),
  name: requiredLine(UI_TEXT.fullName, { max: TEXT_LIMITS.name }),
  email: requiredEmail(UI_TEXT.email),
  phone: requiredPhone(UI_TEXT.phone),
  whereNow: z.enum(WHERE_NOW, { error: VALIDATION_MESSAGES.whereNow }),
  mophLicence: z.enum(MOPH_LICENCE, { error: VALIDATION_MESSAGES.mophLicence }),
  dataflow: z.enum(DATAFLOW, { error: VALIDATION_MESSAGES.dataflow }),
  prometric: z.enum(PROMETRIC, { error: VALIDATION_MESSAGES.prometric }),
  experienceYears,
  cv,
  note: optionalLines(UI_TEXT.applicationNote, TEXT_LIMITS.note),
  consent,
  ...botCheck,
});
export type ApplicationFormInput = z.input<typeof applicationFormSchema>;
export type ApplicationFormPayload = z.output<typeof applicationFormSchema>;

/** The general application, as the inbox's job filter names it. */
export const GENERAL_APPLICATIONS = "general";

/**
 * The applications inbox (plan §9.5): which applications to list, newest
 * first, by job (or the general ones), by status, by whether they need the
 * admin, and by what the admin types (a name, an email, a phone number), a
 * page at a time.
 */
export const applicationListQuerySchema = z.object({
  job: z.union([z.uuid(), z.literal(GENERAL_APPLICATIONS)]).optional(),
  status: z.enum(APPLICATION_STATUSES).optional(),
  /** Only what needs the admin (Today, R6.1): new, or its HR email not sent. */
  needsYou: z
    .enum(["true"])
    .optional()
    .transform((value) => value === "true"),
  q: optionalLine("Search", TEXT_LIMITS.line),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
});
export type ApplicationListQueryInput = z.input<typeof applicationListQuerySchema>;
export type ApplicationListQueryPayload = z.output<typeof applicationListQuerySchema>;

/** Where an application stands (plan §9.5). */
export const applicationStatusSchema = z.object({ status: z.enum(APPLICATION_STATUSES) });
export type ApplicationStatusInput = z.input<typeof applicationStatusSchema>;
export type ApplicationStatusPayload = z.output<typeof applicationStatusSchema>;

/** The team's internal note on an application (plan §9.5). */
export const applicationNoteSchema = z.object({ body: requiredLines("Note", { max: TEXT_LIMITS.note }) });
export type ApplicationNoteInput = z.input<typeof applicationNoteSchema>;
export type ApplicationNotePayload = z.output<typeof applicationNoteSchema>;
