import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WayBack } from "@/components/site/WayBack";
import { UI_TEXT } from "@/constants/messages";

describe("WayBack", () => {
  it("offers home, the services and contact", () => {
    render(<WayBack />);
    expect(screen.getAllByRole("link").map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      [UI_TEXT.home, "/"],
      [UI_TEXT.services, "/services"],
      [UI_TEXT.contact, "/contact"],
    ]);
  });
});
