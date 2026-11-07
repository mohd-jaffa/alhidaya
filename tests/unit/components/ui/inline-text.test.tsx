import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InlineRuns, InlineText } from "@/components/ui/inline-text";

describe("InlineText", () => {
  it("renders plain, bold, italic and combined emphasis as safe semantic nodes", () => {
    const { container } = render(
      <p>
        <InlineText text="Plain **bold** *italic* ***both***" />
      </p>,
    );
    expect(container).toHaveTextContent("Plain bold italic both");
    expect(screen.getByText("bold").tagName).toBe("STRONG");
    expect(screen.getByText("italic").tagName).toBe("EM");
    expect(screen.getByText("both").closest("strong")).not.toBeNull();
    expect(container.querySelectorAll("em")).toHaveLength(2);
  });

  it("escapes HTML and keeps unsupported markup and unmatched markers literal", () => {
    const { container } = render(
      <InlineText text={'<img src=x onerror="bad()"> [link](https://example.com) **unfinished'} />,
    );
    expect(container.querySelector("img, script, a")).toBeNull();
    expect(container).toHaveTextContent('<img src=x onerror="bad()"> [link](https://example.com) **unfinished');
  });

  it("renders an empty run list without reserving an element", () => {
    const { container } = render(<InlineRuns runs={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
