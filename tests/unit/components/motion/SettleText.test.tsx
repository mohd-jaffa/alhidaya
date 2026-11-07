import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SettleText } from "@/components/motion/SettleText";

describe("SettleText (D97)", () => {
  it("preserves inline styles through letter and highlight splits with clean accessible words", () => {
    const { container } = render(
      <h1>
        <SettleText text="**Care** at *home*, ***now***" highlight="**at home**" />
      </h1>,
    );
    expect(screen.getByRole("heading", { name: "Care at home, now" })).toBeVisible();
    const visual = container.querySelector('[aria-hidden="true"]')!;
    expect(visual.textContent).toBe("Care at home, now");
    expect(visual.querySelectorAll("strong")).toHaveLength(7);
    expect(visual.querySelectorAll("em")).toHaveLength(7);
    expect(visual.querySelector(".bg-leaf-pale")).toHaveTextContent("at home");
  });

  it("is read once, whole, while its letters settle by CSS alone, each numbered across the text", () => {
    const { container } = render(
      <h1>
        <SettleText text="Care at home" />
      </h1>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Care at home");
    expect(screen.getByText("Care at home")).toHaveClass("sr-only");
    const letters = container.querySelectorAll<HTMLElement>(".settle-letter");
    expect(letters).toHaveLength(10);
    expect(letters[0].closest("[aria-hidden]")).not.toBeNull();
    expect(letters[0].style.getPropertyValue("--i")).toBe("0");
    expect(letters[9].style.getPropertyValue("--i")).toBe("9");
    // Letters left of the middle start further left, those right of it further right.
    expect(Number(letters[0].style.getPropertyValue("--spread"))).toBeLessThan(0);
    expect(Number(letters[9].style.getPropertyValue("--spread"))).toBeGreaterThan(0);
  });

  it("sets the highlighted words on the pale-green highlight, and ignores a highlight the text does not hold", () => {
    const { container, rerender } = render(
      <SettleText text="Quality nursing care at your doorstep" highlight="nursing care" />,
    );
    const marked = container.querySelector(".bg-leaf-pale");
    expect(marked).toHaveTextContent("nursing care");
    expect(marked?.textContent).toBe("nursing care");
    // Kept on one line.
    expect(marked).toHaveClass("inline-block", "max-w-full");
    rerender(<SettleText text="Quality nursing care at your doorstep" highlight="hospital" />);
    expect(container.querySelector(".bg-leaf-pale")).toBeNull();
  });

  it("keeps a comma just after the highlight as text, so a line never breaks before it", () => {
    const { container } = render(<SettleText text="Care at home, and nurses" highlight="Care at home" />);
    const after = container.querySelector(".bg-leaf-pale")?.nextSibling;
    expect(after?.nodeType).toBe(Node.TEXT_NODE);
    expect(after?.textContent).toBe(",");
    expect(container.querySelectorAll(".settle-letter")).toHaveLength("Careathomeandnurses".length);
  });
});
