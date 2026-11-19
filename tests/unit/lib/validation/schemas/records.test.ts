import { describe, expect, it } from "vitest";

import { VALIDATION_MESSAGES } from "@/constants/messages";
import { JOB_QUESTION_CHOICES, LIST_LIMITS, TEXT_LIMITS } from "@/constants/limits";
import {
  archiveSchema,
  clientDocumentSchema,
  closeSchema,
  jobDocumentSchema,
  serviceDocumentSchema,
} from "@/lib/validation";
import { clientFixture, jobFixture, serviceFixture } from "@tests/support/fixtures/content";

describe("a service", () => {
  it("defaults legacy services to no header buttons and validates at most two safe, labelled destinations", () => {
    const legacy: Partial<ReturnType<typeof serviceFixture>> = serviceFixture();
    delete legacy.headerButtons;
    expect(serviceDocumentSchema.parse(legacy).headerButtons).toEqual([]);
    const buttons = [
      { label: { en: " Contact us " }, href: "/contact" },
      { label: { en: "Message us" }, href: "https://wa.me/97431306555" },
    ];
    expect(serviceDocumentSchema.parse(serviceFixture({ headerButtons: buttons })).headerButtons[0].label.en).toBe(
      "Contact us",
    );
    for (const href of ["javascript:alert(1)", "data:text/html,x", "//evil.example", "https://user:pass@example.com"])
      expect(
        serviceDocumentSchema.safeParse(serviceFixture({ headerButtons: [{ label: { en: "Unsafe" }, href }] })).success,
      ).toBe(false);
    expect(
      serviceDocumentSchema.safeParse(serviceFixture({ headerButtons: [{ label: { en: "" }, href: "/contact" }] }))
        .success,
    ).toBe(false);
    expect(
      serviceDocumentSchema.safeParse(serviceFixture({ headerButtons: [...buttons, buttons[0]] })).error?.issues[0]
        .message,
    ).toBe(VALIDATION_MESSAGES.atMost("Header buttons", 2));
  });
  it("is valid as its fixture, and refuses an unknown audience or a bad address", () => {
    expect(serviceDocumentSchema.parse(serviceFixture()).slug).toBe("home-nursing-care");
    expect(serviceDocumentSchema.safeParse(serviceFixture({ audience: "EVERYONE" as never })).success).toBe(false);
    expect(serviceDocumentSchema.safeParse(serviceFixture({ slug: "Home Care" })).success).toBe(false);
    expect(serviceDocumentSchema.safeParse(serviceFixture({ description: [] })).error?.issues[0].message).toBe(
      VALIDATION_MESSAGES.atLeastOne("The description"),
    );
  });
});

describe("a job", () => {
  it("may close on its posting day or later, or never", () => {
    expect(jobDocumentSchema.safeParse(jobFixture({ closesOn: "2026-10-01" })).success).toBe(true);
    expect(jobDocumentSchema.safeParse(jobFixture({ closesOn: null })).success).toBe(true);
    expect(jobDocumentSchema.safeParse(jobFixture({ closesOn: "2026-09-30" })).error?.issues[0]).toMatchObject({
      message: VALIDATION_MESSAGES.closesBeforePosted,
      path: ["closesOn"],
    });
  });

  it("can't take an address the site keeps for itself under /careers", () => {
    expect(jobDocumentSchema.safeParse(jobFixture({ slug: "apply" })).error?.issues[0]).toMatchObject({
      message: VALIDATION_MESSAGES.slugReserved,
      path: ["slug"],
    });
    expect(jobDocumentSchema.safeParse(jobFixture({ slug: "apply-now" })).success).toBe(true);
  });

  it("is open until the admin closes it, a job saved before Close now existed included (D92)", () => {
    const before: Partial<ReturnType<typeof jobFixture>> = jobFixture();
    delete before.closed;
    expect(jobDocumentSchema.parse(before).closed).toBe(false);
    expect(jobDocumentSchema.parse(jobFixture({ closed: true })).closed).toBe(true);
  });

  it("bounds its department", () => {
    const long = { en: "x".repeat(TEXT_LIMITS.department + 1) };
    expect(jobDocumentSchema.safeParse(jobFixture({ department: long })).success).toBe(false);
  });

  it("bounds its lists", () => {
    const many = Array.from({ length: 21 }, () => ({ en: "x" }));
    expect(jobDocumentSchema.safeParse(jobFixture({ qualifications: many })).error?.issues[0].message).toBe(
      VALIDATION_MESSAGES.atMost("Qualifications", 20),
    );
  });
});

describe("a job's own application questions (D209)", () => {
  const choices = (...words: string[]) => words.map((word) => ({ en: word }));
  const asked = (question: string, ...words: string[]) => ({
    question: { en: question },
    choices: choices(...words),
    selection: "single" as const,
  });
  const issue = (questions: ReturnType<typeof asked>[]) =>
    jobDocumentSchema.safeParse(jobFixture({ questions })).error?.issues[0];

  it("are none on a job saved before they existed, and keep each question tidied with its choices", () => {
    const before: Partial<ReturnType<typeof jobFixture>> = jobFixture();
    delete before.questions;
    delete before.hiddenQuestions;
    expect(jobDocumentSchema.parse(before)).toMatchObject({ questions: [], hiddenQuestions: [] });
    const legacy = { question: { en: "Shifts?" }, choices: choices("Days", "Nights") };
    expect(jobDocumentSchema.parse({ ...before, questions: [legacy] }).questions).toEqual([
      asked("Shifts?", "Days", "Nights"),
    ]);
    const questions = [asked("  Do you hold a  BLS certificate? ", " Yes ", "No")];
    expect(jobDocumentSchema.parse(jobFixture({ questions })).questions).toEqual([
      asked("Do you hold a BLS certificate?", "Yes", "No"),
    ]);
  });

  it("keeps known screening fields and answer modes", () => {
    const question = { ...asked("Shifts?", "Days", "Nights"), selection: "multiple" as const };
    const hiddenQuestions = ["whereNow", "prometric", "experienceYears"];
    expect(jobDocumentSchema.parse({ ...jobFixture(), questions: [question], hiddenQuestions })).toMatchObject({
      questions: [question],
      hiddenQuestions,
    });
    for (const hidden of [["unrecognised"], ["whereNow", "whereNow"]]) {
      expect(jobDocumentSchema.safeParse({ ...jobFixture(), hiddenQuestions: hidden }).success).toBe(false);
    }
    expect(
      jobDocumentSchema.safeParse({ ...jobFixture(), questions: [{ ...question, selection: "anything" }] }).success,
    ).toBe(false);
  });

  it("need two to six choices, each different from the others, whatever their emphasis or case", () => {
    expect(issue([asked("Shift?", "Days")])).toMatchObject({
      message: VALIDATION_MESSAGES.fewChoices(JOB_QUESTION_CHOICES.min),
      path: ["questions", 0, "choices"],
    });
    const seven = Array.from({ length: JOB_QUESTION_CHOICES.max + 1 }, (_, index) => `Choice ${index}`);
    expect(issue([asked("Shift?", ...seven)])?.message).toBe(
      VALIDATION_MESSAGES.atMost("Choices", JOB_QUESTION_CHOICES.max),
    );
    expect(issue([asked("Shift?", "Days", "**days**")])).toMatchObject({
      message: VALIDATION_MESSAGES.noRepeats("Choices"),
      path: ["questions", 0, "choices"],
    });
    expect(issue([asked("Shift?", "Days", "  ")])).toMatchObject({ path: ["questions", 0, "choices", 1, "en"] });
  });

  it("need their words, bounded, and never ask the same question twice, at most ten to a job", () => {
    expect(issue([asked(" ", "Yes", "No")])).toMatchObject({
      message: VALIDATION_MESSAGES.required("Question"),
      path: ["questions", 0, "question", "en"],
    });
    expect(issue([asked("x".repeat(TEXT_LIMITS.item + 1), "Yes", "No")])?.path).toEqual([
      "questions",
      0,
      "question",
      "en",
    ]);
    expect(issue([asked("Shift?", "x".repeat(TEXT_LIMITS.heading + 1), "No")])?.path).toEqual([
      "questions",
      0,
      "choices",
      0,
      "en",
    ]);
    expect(issue([asked("Night shifts?", "Yes", "No"), asked("night SHIFTS?", "Yes", "No")])).toMatchObject({
      message: VALIDATION_MESSAGES.noRepeats("Application questions"),
      path: ["questions"],
    });
    const eleven = Array.from({ length: LIST_LIMITS.jobQuestions + 1 }, (_, index) => asked(`Q${index}?`, "Yes", "No"));
    expect(issue(eleven)?.message).toBe(VALIDATION_MESSAGES.atMost("Application questions", LIST_LIMITS.jobQuestions));
  });
});

describe("a client logo", () => {
  it("needs its logo, and links only to an https site", () => {
    expect(clientDocumentSchema.safeParse(clientFixture({ url: "https://client.example" })).success).toBe(true);
    expect(clientDocumentSchema.safeParse(clientFixture({ url: "http://client.example" })).success).toBe(false);
    expect(clientDocumentSchema.safeParse({ ...clientFixture(), logo: null }).error?.issues[0].message).toBe(
      VALIDATION_MESSAGES.required("The logo"),
    );
    expect(clientDocumentSchema.parse({ ...clientFixture(), url: "" }).url).toBeNull();
  });
});

describe("archiving and closing (D92)", () => {
  it("say yes or no, nothing else", () => {
    expect(archiveSchema.parse({ archived: true })).toEqual({ archived: true });
    expect(archiveSchema.safeParse({ archived: "true" }).success).toBe(false);
    expect(closeSchema.parse({ closed: false })).toEqual({ closed: false });
    expect(closeSchema.safeParse({}).success).toBe(false);
  });
});
