import { describe, expect, it } from "vitest";

import { VALIDATION_MESSAGES } from "@/constants/messages";
import { TEXT_LIMITS } from "@/constants/limits";
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
