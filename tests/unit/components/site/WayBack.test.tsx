import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WayBack } from "@/components/site/WayBack";
import { UI_TEXT } from "@/constants/messages";

describe("WayBack", () => {
  it("offers home, the services and contact, as outlined buttons that load the page whole", () => {
    render(<WayBack />);
    expect(screen.getAllByRole("link").map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      [UI_TEXT.home, "/"],
      [UI_TEXT.services, "/services"],
      [UI_TEXT.contact, "/contact"],
    ]);
    for (const link of screen.getAllByRole("link")) expect(link).toHaveClass("ring-deep", "rounded-button");
  });
});
