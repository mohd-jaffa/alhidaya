import { describe, expect, it } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";

describe("ADMIN_TEXT", () => {
  it("holds no empty wording, and says each count as it is", () => {
    const wordings: [string, unknown][] = Object.entries(ADMIN_TEXT).flatMap(([key, value]) =>
      typeof value === "object"
        ? Object.entries(value).map(([inner, words]): [string, unknown] => [`${key}.${inner}`, words])
        : [[key, value] as [string, unknown]],
    );
    for (const [key, value] of wordings) {
      const words = typeof value === "function" ? (value as (...args: unknown[]) => string)(2, 3) : String(value);
      expect(words.trim(), key).not.toBe("");
    }
    expect(ADMIN_TEXT.fieldsNeedAttention(1)).toBe("1 field needs attention");
    expect(ADMIN_TEXT.fieldsNeedAttention(3)).toBe("3 fields need attention");
    expect(ADMIN_TEXT.needsYouCount(1)).toBe("1 awaiting action");
    expect(ADMIN_TEXT.needsYouCount(4)).toBe("4 awaiting action");
    expect(ADMIN_TEXT.quoteFrom("Omar")).toBe("Quote request from Omar");
    expect(ADMIN_TEXT.purgeDeleted(1, 1, 1)).toBe("Deleted 1 enquiry, 1 application and 1 CV.");
    expect(ADMIN_TEXT.purgeDeleted(0, 2, 3)).toBe("Deleted 0 enquiries, 2 applications and 3 CVs.");
    expect(ADMIN_TEXT.purgeFilesLeft(1)).toMatch(/^1 CV file could not/);
  });
});
