import { describe, expect, it } from "vitest";

import { TEXT_LIMITS } from "@/constants/limits";
import { slugify } from "@/lib/text/slug";
import { slugSchema } from "@/lib/validation/schemas/content";

describe("slugify", () => {
  it("uses visible title words without inserting hyphens inside formatted words", () => {
    expect(slugify("Nur**sing** *care*")).toBe("nursing-care");
  });
  it("makes a web address from a name, in the address's own rules (D92)", () => {
    expect(slugify("Maternity & Newborn Care")).toBe("maternity-newborn-care");
    expect(slugify("  Soins à domicile  ")).toBe("soins-a-domicile");
    expect(slugify("Registered General Nurse – Home Care")).toBe("registered-general-nurse-home-care");
    expect(slugify("رعاية")).toBe("");
  });

  it("fits the address's bound and never ends on a dash", () => {
    const slug = slugify(`${"a".repeat(TEXT_LIMITS.slug - 1)} b`);
    expect(slug).toBe("a".repeat(TEXT_LIMITS.slug - 1));
    expect(slugSchema.safeParse(slugify("Elderly care, at home!")).success).toBe(true);
  });
});
