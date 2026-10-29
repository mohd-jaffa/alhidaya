import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LineEdge } from "@/components/ui/line-edge";

describe("LineEdge", () => {
  it("draws the line in its colour with a station where it starts, hidden from screen readers", () => {
    const { container } = render(<LineEdge tone="leaf" />);
    const parts = container.querySelectorAll(":scope > span");
    expect(parts).toHaveLength(2);
    for (const part of parts) expect(part).toHaveAttribute("aria-hidden", "true");
    expect(parts[0]).toHaveClass("bg-leaf");
    expect(parts[1].firstElementChild).toHaveClass("border-leaf");
  });
});
