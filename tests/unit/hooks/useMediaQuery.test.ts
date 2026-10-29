import { act, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { mockMedia } from "@tests/support/motion";

describe("useMediaQuery", () => {
  it("answers whether the query matches, and follows it as it changes", () => {
    const media = mockMedia({ "(pointer: fine)": false });
    const { result, unmount } = renderHook(() => useMediaQuery("(pointer: fine)"));
    expect(result.current).toBe(false);

    act(() => media.set("(pointer: fine)", true));
    expect(result.current).toBe(true);

    unmount();
    expect(media.listening("(pointer: fine)")).toBe(0);
  });

  it("answers the given value on the server, which cannot know", () => {
    function Probe() {
      return createElement("span", null, String(useMediaQuery("(pointer: fine)", true)));
    }
    expect(renderToString(createElement(Probe))).toContain("true");
  });
});
