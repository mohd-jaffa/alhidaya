import { expect, it, vi } from "vitest";
const localFont = vi.fn((options: { variable: string }) => ({ variable: options.variable }));
vi.mock("next/font/local", () => ({ default: localFont }));
const { siteFontVariables } = await import("@/app/site-fonts");
it("registers all fourteen optional local faces without preloading them", () => {
  expect(siteFontVariables.split(" ")).toHaveLength(14);
  expect(localFont).toHaveBeenCalledTimes(14);
  for (const [index, [options]] of localFont.mock.calls.entries())
    expect(options).toMatchObject({
      preload: false,
      adjustFontFallback: index >= 9 && index <= 11 ? "Times New Roman" : "Arial",
      display: "swap",
      style: "normal",
    });
});
