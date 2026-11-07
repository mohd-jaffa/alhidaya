import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TypewriterText } from "@/components/motion/TypewriterText";

describe("TypewriterText", () => {
  it("types only visible letters while keeping emphasis and one marker-free accessible name", () => {
    const { container } = render(
      <h1>
        <TypewriterText text="**Day** and *night*" />
      </h1>,
    );
    expect(screen.getByRole("heading", { name: "Day and night" })).toBeVisible();
    expect(container.querySelectorAll("[data-type-letter]")).toHaveLength(11);
    const visual = container.querySelector('[aria-hidden="true"]')!;
    expect(visual.textContent).toBe("Day and night");
    expect(visual.querySelectorAll("strong")).toHaveLength(3);
    expect(visual.querySelectorAll("em")).toHaveLength(5);
  });

  it("keeps one accessible headline and reserves the complete text while visual letters type", () => {
    const text = "We are here day and night";
    const { container } = render(
      <h1>
        <TypewriterText text={text} />
      </h1>,
    );
    expect(screen.getByRole("heading", { name: text })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-type-letter]")).toHaveLength(text.replaceAll(" ", "").length);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent(text);
  });
});
