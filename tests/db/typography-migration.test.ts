import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { DOCUMENT_KEYS } from "@/constants/sections";
import { DEFAULT_TYPOGRAPHY, FONT_IDS } from "@/constants/typography";

const sql = readFileSync("drizzle/0007_typography.sql", "utf8");
describe("0007_typography", () => {
  it("extends the document CHECK without a new table and initializes both copies to the existing face", () => {
    const allowed = sql
      .match(/CHECK \(`key` in \(([^)]*)\)\)/)![1]
      .split(", ")
      .map((item) => item.replaceAll("'", ""));
    expect(allowed).toEqual(DOCUMENT_KEYS);
    expect(sql).not.toContain("CREATE TABLE");
    expect(sql.split(JSON.stringify(DEFAULT_TYPOGRAPHY))).toHaveLength(3);
    expect(sql).toContain("`draft`, `published`, `published_at`");
  });
  it("bundles the fifteen licensed WOFF2 files and locks optional font provenance by hash", () => {
    const shippedLicenses = readFileSync("public/fonts/LICENSES.txt", "utf8");
    const fonts = JSON.parse(readFileSync("src/assets/fonts/library.json", "utf8"));
    expect(fonts).toHaveLength(14);
    for (const id of FONT_IDS) {
      const file = readFileSync(`src/assets/fonts/${id}/${id}-latin-wght-normal.woff2`);
      expect(file.toString("ascii", 0, 4)).toBe("wOF2");
      if (id === "inter-tight") {
        expect(existsSync(`src/assets/fonts/${id}/OFL.txt`)).toBe(true);
        expect(shippedLicenses).toContain(readFileSync(`src/assets/fonts/${id}/OFL.txt`, "utf8").trim());
      } else {
        const source = fonts.find((font: { id: string }) => font.id === id);
        expect(source.sha256).toBe(createHash("sha256").update(file).digest("hex"));
        const license = readFileSync(`src/assets/fonts/${id}/LICENSE.txt`, "utf8");
        expect(license).toContain("SIL OPEN FONT LICENSE");
        expect(shippedLicenses).toContain(license.trim());
      }
    }
  });
});
