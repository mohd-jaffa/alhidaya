import { describe, expect, it } from "vitest";

import { VALIDATION_MESSAGES } from "@/constants/messages";
import { previewQuerySchema } from "@/lib/validation";

describe("which page the preview opens on", () => {
  it("is a page of the public site, Home when none is named", () => {
    expect(previewQuerySchema.parse({})).toEqual({ path: "/" });
    expect(previewQuerySchema.parse({ path: "/services/elderly-care#about" })).toEqual({
      path: "/services/elderly-care#about",
    });
    expect(previewQuerySchema.parse({ path: "/administration" })).toEqual({ path: "/administration" });
  });

  it("is never another site, the admin or the API", () => {
    for (const path of ["https://evil.example", "//evil.example", "/admin", "/admin/pages", "/api", "/api?x=1"])
      expect(previewQuerySchema.safeParse({ path }).error?.issues[0].message, path).toBe(VALIDATION_MESSAGES.link);
  });
});
