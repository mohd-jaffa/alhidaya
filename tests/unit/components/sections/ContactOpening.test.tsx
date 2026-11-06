import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContactOpening } from "@/components/sections/ContactOpening";
import { contentFixture } from "@tests/support/fixtures/content";

describe("ContactOpening", () => {
  it("reads the published headline and lede without the old photograph or duplicate actions", () => {
    const content = { ...contentFixture("SIGN"), lede: { en: "Message us or call." } };
    const { rerender } = render(<ContactOpening anchor="start" content={content} />);
    expect(screen.getByRole("heading", { level: 1, name: content.headline.en })).toBeInTheDocument();
    expect(screen.getByText(content.lede.en!)).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    rerender(<ContactOpening anchor="start" content={{ ...content, lede: { en: null } }} />);
    expect(screen.queryByText(content.lede.en!)).not.toBeInTheDocument();
  });
});
