import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const sidecar = JSON.parse(readFileSync(".impeccable/design.json", "utf8")) as {
  extensions: { colorMeta: Record<string, { tonalRamp: string[] }>; typographyMeta: Record<string, unknown> };
  components: { refersTo?: string; html: string }[];
  narrative: { northStar: string; keyCharacteristics: string[]; rules: { name: string; body: string }[] };
};

const markdown = readFileSync("DESIGN.md", "utf8");
const frontmatter = markdown.split("---")[1];
const keys = (section: string) =>
  [
    ...frontmatter
      .split(`${section}:\n`)[1]
      .split(/^\S/m)[0]
      .matchAll(/^  ([\w-]+):/gm),
  ].map((match) => match[1]);

describe("the Impeccable sidecar", () => {
  it("extends the current normative tokens without retaining retired keys or broken component references", () => {
    expect(Object.keys(sidecar.extensions.colorMeta).sort()).toEqual(keys("colors").sort());
    expect(Object.keys(sidecar.extensions.typographyMeta).sort()).toEqual(keys("typography").sort());
    for (const component of sidecar.components) {
      if ("refersTo" in component) expect(keys("components")).toContain(component.refersTo);
      expect(component.html).not.toMatch(/<img|class="(?:bg-|text-|rounded-)/);
    }
    for (const color of Object.values(sidecar.extensions.colorMeta)) expect(color.tonalRamp).toHaveLength(8);
  });

  it("copies current narrative rules and characteristics from DESIGN.md", () => {
    expect(markdown).toContain(`Creative North Star: "${sidecar.narrative.northStar}"`);
    for (const characteristic of sidecar.narrative.keyCharacteristics) expect(markdown).toContain(characteristic);
    for (const rule of sidecar.narrative.rules) expect(markdown).toContain(`**${rule.name}.** ${rule.body}`);
  });
});
