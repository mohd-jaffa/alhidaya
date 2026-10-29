import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import GlobalError from "@/app/global-error";
import { UI_TEXT } from "@/constants/messages";

describe("the global error page", () => {
  it("stands alone with its own document, a retry and the reference", () => {
    const html = renderToString(
      <GlobalError error={Object.assign(new Error("secret"), { digest: "2718" })} reset={vi.fn()} />,
    );
    expect(html).toMatch(/^<html lang="en" dir="ltr">/);
    expect(html).toContain(UI_TEXT.errorHeadline);
    expect(html).toContain(UI_TEXT.tryAgain);
    expect(html).toContain("2718");
    expect(html).not.toContain("secret");
  });

  it("leaves the reference out when there is none", () => {
    const html = renderToString(<GlobalError error={new Error("x")} reset={vi.fn()} />);
    expect(html).not.toContain(UI_TEXT.errorReference);
  });
});
