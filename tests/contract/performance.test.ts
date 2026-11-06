import { describe, expect, it } from "vitest";

import { droppedFrameRatio, initialScripts, PERFORMANCE_BUDGET } from "@tests/support/performance";

describe("the performance gate", () => {
  it("counts unique modern scripts, ignoring legacy polyfills and unrelated or inline scripts", () => {
    expect(
      initialScripts(`<script src="/_next/static/a.js" async></script>
        <script async src='/_next/static/a.js'></script>
        <script src="/_next/static/b.js?v=1"></script>
        <script src="/_next/static/polyfill.js" noModule></script>
        <script NOMODULE src="/_next/static/legacy.js"></script>
        <script src="https://other.test/a.js"></script><script>"src='x'"</script>
        <script>self.__next_f.push([1,"\\\"/_next/static/boundary.js\\\""])</script>`),
    ).toEqual(["/_next/static/a.js", "/_next/static/b.js", "/_next/static/boundary.js"]);
    expect(PERFORMANCE_BUDGET.initialJavaScript).toBe(174_080);
  });

  it("counts missed frames instead of treating a slow frame as one dropped frame", () => {
    expect(droppedFrameRatio([16, 16, 16], 16)).toBe(0);
    expect(droppedFrameRatio([16, 48, 16], 16)).toBe(2 / 5);
  });
});
