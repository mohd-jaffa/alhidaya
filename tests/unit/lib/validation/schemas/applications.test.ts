import { describe, expect, it } from "vitest";

import { UPLOAD_LIMITS } from "@/constants/limits";
import { UI_TEXT, VALIDATION_MESSAGES } from "@/constants/messages";
import {
  applicationFormSchema,
  applicationListQuerySchema,
  applicationNoteSchema,
  applicationStatusSchema,
} from "@/lib/validation";
import { applicationSchemaFor, withJobQuestions } from "@/lib/validation/schemas/applications";

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
      answers: [],
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

  it("allows job applicants to skip screening and still requires it for general applications", () => {
    const screening = { whereNow: undefined, mophLicence: undefined, dataflow: undefined, prometric: undefined };
    expect(problems(applicationFormSchema.safeParse({ ...application, ...screening }))).toEqual({
      whereNow: VALIDATION_MESSAGES.whereNow,
      mophLicence: VALIDATION_MESSAGES.mophLicence,
      dataflow: VALIDATION_MESSAGES.dataflow,
      prometric: VALIDATION_MESSAGES.prometric,
    });
    const jobId = "0f8c1c62-5d55-4b8e-9c3a-2f4e1d6b7a90";
    const schema = applicationSchemaFor(jobId);
    expect(schema.safeParse({ ...application, ...screening, jobId }).success).toBe(true);
    expect(problems(schema.safeParse({ ...application, jobId, prometric: "Unknown" }))).toEqual({
      prometric: VALIDATION_MESSAGES.prometric,
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

  it("requires visible years of experience and permits omission only when a job hides it", () => {
    const jobId = "0f8c1c62-5d55-4b8e-9c3a-2f4e1d6b7a90";
    const input = { ...application, jobId, experienceYears: undefined };
    expect(withJobQuestions(jobId, [], true).safeParse(input).success).toBe(true);
    expect(problems(withJobQuestions(jobId, []).safeParse(input))).toEqual({
      experienceYears: VALIDATION_MESSAGES.required(UI_TEXT.experienceYears),
    });
    expect(withJobQuestions(null, [], true).safeParse({ ...input, jobId: "" }).success).toBe(false);
    expect(withJobQuestions(jobId, [], true).safeParse({ ...input, experienceYears: "51" }).success).toBe(false);
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

describe("a job's own questions (D209)", () => {
  it("go to the route as the questions asked, each with the choice made, tidied and bounded", () => {
    const answers = [{ question: " Night shifts? ", choice: " Yes " }];
    expect(applicationFormSchema.parse({ ...application, answers }).answers).toEqual([
      { question: "Night shifts?", choice: "Yes" },
    ]);
    expect(
      applicationFormSchema.parse({
        ...application,
        answers: [{ question: " Shifts? ", choices: [" Days ", "Nights "] }],
      }).answers,
    ).toEqual([{ question: "Shifts?", choices: ["Days", "Nights"] }]);
    for (const bad of [[], Array.from({ length: 7 }, () => "Days")]) {
      expect(
        applicationFormSchema.safeParse({ ...application, answers: [{ question: "Shifts?", choices: bad }] }).success,
      ).toBe(false);
    }
    const many = Array.from({ length: 11 }, (_, index) => ({ question: `Q${index}?`, choice: "Yes" }));
    expect(problems(applicationFormSchema.safeParse({ ...application, answers: many })).answers).toBe(
      VALIDATION_MESSAGES.atMost("Answers", 10),
    );
    expect(
      applicationFormSchema.safeParse({ ...application, answers: [{ question: "Q?", choice: " " }] }).success,
    ).toBe(false);
  });

  it("are each answered in the browser with one of their choices, by the field that names them", () => {
    const schema = withJobQuestions(null, [
      { field: "answer-0", choices: ["Yes", "No"], selection: "single" },
      { field: "answer-1", choices: ["Days", "Nights"], selection: "multiple" },
    ]);
    expect(schema.safeParse({ ...application, "answer-0": "No", "answer-1": ["Days", "Nights"] }).success).toBe(true);
    expect(problems(schema.safeParse({ ...application, "answer-0": "Maybe" }))).toEqual({
      "answer-0": VALIDATION_MESSAGES.chooseAnswer,
      "answer-1": VALIDATION_MESSAGES.chooseAnswers,
    });
    expect(problems(schema.safeParse({ ...application, "answer-0": "No", "answer-1": ["Unknown"] }))).toEqual({
      "answer-1": VALIDATION_MESSAGES.chooseAnswer,
    });
    expect(withJobQuestions(null, []).safeParse(application).success).toBe(true);
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
