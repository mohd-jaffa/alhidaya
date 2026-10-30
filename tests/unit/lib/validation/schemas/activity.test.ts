import { describe, expect, it } from "vitest";

import { activityQuerySchema } from "@/lib/validation";

describe("activityQuerySchema (D96)", () => {
  it("takes one kind or none, and a page from 1", () => {
    expect(activityQuerySchema.parse({ kind: "SIGN_INS", page: "2" })).toEqual({ kind: "SIGN_INS", page: 2 });
    expect(activityQuerySchema.parse({})).toEqual({ page: 1 });
    for (const wrong of [{ kind: "PAGES" }, { kind: "content" }, { page: "0" }, { page: "1.5" }, { page: "x" }]) {
      expect(activityQuerySchema.safeParse(wrong).success).toBe(false);
    }
  });
});
