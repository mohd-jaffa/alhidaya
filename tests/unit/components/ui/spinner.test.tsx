import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Spinner } from "@/components/ui/spinner";

describe("Spinner", () => {
  it("is a ring in the words' own colour that turns by transform alone and stands still with reduced motion (D204)", () => {
    const { container } = render(<Spinner />);
    const ring = container.firstElementChild;
    expect(ring).toHaveAttribute("aria-hidden", "true");
    expect(ring).toHaveClass("animate-spinner", "border-current", "border-t-transparent", "rounded-full");
    expect(ring).toHaveClass("motion-reduce:animate-none");
    // Decoration only: the button that holds it says "busy".
    expect(ring).toBeEmptyDOMElement();
  });
});
