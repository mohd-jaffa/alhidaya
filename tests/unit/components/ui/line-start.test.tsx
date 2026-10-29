import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LineStart } from "@/components/ui/line-start";
import { UI_TEXT } from "@/constants/messages";

describe("LineStart", () => {
  it("says where the visitor stands, then the lines; the station and its stem are decoration", () => {
    const { container } = render(
      <LineStart>
        <h2>Care at home</h2>
      </LineStart>,
    );
    const marker = screen.getByText(UI_TEXT.youAreHere);
    expect(marker.tagName).toBe("P");
    expect(marker.compareDocumentPosition(screen.getByRole("heading", { name: "Care at home" }))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
    expect(container.querySelector(".border-navy")).toHaveAttribute("aria-hidden", "true");
  });
});
