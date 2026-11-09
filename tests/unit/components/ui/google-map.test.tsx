import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GoogleMap } from "@/components/ui/google-map";
import { UI_TEXT } from "@/constants/messages";

describe("GoogleMap", () => {
  it("provides an accessible lazy satellite frame with stable geometry and the approved shadow", () => {
    render(<GoogleMap query="Al Hidaya, Doha" pin={null} />);
    const frame = screen.getByTitle(UI_TEXT.satelliteMap);
    expect(frame).toHaveAttribute("loading", "lazy");
    expect(frame).toHaveAttribute("width", "600");
    expect(frame).toHaveAttribute("height", "400");
    expect(frame).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    expect(frame).toHaveAttribute("allowfullscreen");
    expect(frame.parentElement).toHaveClass("min-h-map-min", "rounded-card", "shadow-map");
  });
});
