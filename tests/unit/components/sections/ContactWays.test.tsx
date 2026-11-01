import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContactWays } from "@/components/sections/ContactWays";
import { UI_TEXT } from "@/constants/messages";
import { siteFixture } from "@tests/support/fixtures/content";

describe("ContactWays (D130, D135)", () => {
  it("lists WhatsApp, a call at any hour and the email, each with what it is and the number or address", () => {
    render(<ContactWays site={siteFixture()} className="mt-4" />);
    expect(screen.getByRole("list")).toHaveClass("mt-4");
    expect(screen.getAllByText("+974 3130 6555")).toHaveLength(2);
    expect(screen.getByRole("link", { name: new RegExp(UI_TEXT.whatsappUs) })).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/97431306555"),
    );
    expect(screen.getByRole("link", { name: new RegExp(UI_TEXT.callUs247) })).toHaveAttribute(
      "href",
      "tel:+97431306555",
    );
    expect(screen.getByRole("link", { name: new RegExp(UI_TEXT.emailUs) })).toHaveAttribute(
      "href",
      "mailto:info@alhidaya.qa",
    );
  });
});
