import { describe, expect, it } from "vitest";

import { UPLOAD_LIMITS } from "@/constants/limits";
import { UI_TEXT, VALIDATION_MESSAGES } from "@/constants/messages";
import {
  applicationFormSchema,
  applicationListQuerySchema,
  applicationNoteSchema,
  applicationStatusSchema,
} from "@/lib/validation";

const cv = new File(["%PDF-1.7"], "cv.pdf", { type: "application/pdf" });

const application = {
  jobId: "",
  name: "  Mariam   Ali ",
  email: "Mariam@Example.com",
  phone: "5551 2345",
  whereNow: "OUTSIDE_QATAR",
  mophLicence: "HAVE",
  dataflow: "DONE",
  prometric: "PASSED",
  experienceYears: " 12 ",
  cv,
  note: "ICU,\r\nfrom March.",
  consent: true,
  turnstileToken: "token-from-cloudflare",
};

/** The first problem with each field, as the form shows it. */
const problems = (result: { error?: { issues: { path: PropertyKey[]; message: string }[] } }) =>
  Object.fromEntries((result.error?.issues ?? []).map((issue) => [String(issue.path[0]), issue.message]));

describe("the application form (plan §9.2)", () => {
  it("tidies what was typed and keeps the CV as picked; blank is a general application", () => {
    expect(applicationFormSchema.parse(application)).toEqual({
      jobId: null,
      name: "Mariam Ali",
      email: "mariam@example.com",
      phone: "+97455512345",
      whereNow: "OUTSIDE_QATAR",
      mophLicence: "HAVE",
      dataflow: "DONE",
      prometric: "PASSED",
      experienceYears: 12,
      cv,
      note: "ICU,\nfrom March.",
      consent: true,
      turnstileToken: "token-from-cloudflare",
    });
    const jobId = "0f8c1c62-5d55-4b8e-9c3a-2f4e1d6b7a90";
    expect(applicationFormSchema.parse({ ...application, jobId, note: "" })).toMatchObject({ jobId, note: null });
    expect(applicationFormSchema.parse({ ...application, jobId: undefined }).jobId).toBeNull();
  });

  it("names each field in its problem, in the catalogue's words", () => {
    expect(problems(applicationFormSchema.safeParse({ jobId: "job-7", consent: false, cv: null }))).toEqual({
      jobId: VALIDATION_MESSAGES.invalid,
      name: VALIDATION_MESSAGES.required(UI_TEXT.fullName),
      email: VALIDATION_MESSAGES.required(UI_TEXT.email),
      phone: VALIDATION_MESSAGES.required(UI_TEXT.phone),
      whereNow: VALIDATION_MESSAGES.whereNow,
      mophLicence: VALIDATION_MESSAGES.mophLicence,
      dataflow: VALIDATION_MESSAGES.dataflow,
      prometric: VALIDATION_MESSAGES.prometric,
      experienceYears: VALIDATION_MESSAGES.required(UI_TEXT.experienceYears),
      cv: VALIDATION_MESSAGES.cvRequired,
      consent: VALIDATION_MESSAGES.consent,
      turnstileToken: VALIDATION_MESSAGES.botCheck,
    });
  });

  it("takes years of experience as a whole number from 0 to 50", () => {
    const years = (experienceYears: string) =>
      problems(applicationFormSchema.safeParse({ ...application, experienceYears })).experienceYears;
    const between = VALIDATION_MESSAGES.between(UI_TEXT.experienceYears, 0, 50);
    expect(years("0")).toBeUndefined();
    expect(years("50")).toBeUndefined();
    expect(years("51")).toBe(between);
    expect(years("2.5")).toBe(between);
    expect(years("-1")).toBe(between);
    expect(years("three")).toBe(between);
    expect(years("   ")).toBe(VALIDATION_MESSAGES.required(UI_TEXT.experienceYears));
  });

  it("refuses a CV past its size, and anything that is not a file", () => {
    const large = new File([new Uint8Array(UPLOAD_LIMITS.cvBytes + 1)], "cv.pdf");
    expect(problems(applicationFormSchema.safeParse({ ...application, cv: large })).cv).toBe(
      VALIDATION_MESSAGES.cvSize("5 MB"),
    );
    const largest = new File([new Uint8Array(UPLOAD_LIMITS.cvBytes)], "cv.pdf");
    expect(applicationFormSchema.safeParse({ ...application, cv: largest }).success).toBe(true);
    expect(problems(applicationFormSchema.safeParse({ ...application, cv: "cv.pdf" })).cv).toBe(
      VALIDATION_MESSAGES.cvRequired,
    );
  });
});

describe("the applications inbox (plan §9.5)", () => {
  it("reads a list's job (or the general ones), status, needs-you, search and page", () => {
    const job = "0f8c1c62-5d55-4b8e-9c3a-2f4e1d6b7a90";
    expect(applicationListQuerySchema.parse({ job, status: "IN_REVIEW", q: "  Mariam ", page: "2" })).toEqual({
      job,
      status: "IN_REVIEW",
      needsYou: false,
      q: "Mariam",
      page: 2,
    });
    expect(applicationListQuerySchema.parse({ job: "general", needsYou: "true" })).toMatchObject({
      job: "general",
      needsYou: true,
      page: 1,
    });
    for (const query of [{ job: "nurse" }, { status: "RESOLVED" }, { page: "0" }, { needsYou: "yes" }]) {
      expect(applicationListQuerySchema.safeParse(query).success, JSON.stringify(query)).toBe(false);
    }
  });

  it("moves an application only to a status it knows, and takes a note tidied", () => {
    expect(applicationStatusSchema.parse({ status: "SHORTLISTED" })).toEqual({ status: "SHORTLISTED" });
    expect(applicationStatusSchema.safeParse({ status: "RESOLVED" }).success).toBe(false);
    expect(applicationNoteSchema.parse({ body: " Call on Sunday.\r\n " })).toEqual({ body: "Call on Sunday." });
    expect(applicationNoteSchema.safeParse({ body: "  " }).success).toBe(false);
  });
});
