import { render, screen } from "@testing-library/react";
import Link from "next/link";
import { describe, expect, it } from "vitest";

import { LineRow } from "@/components/ui/line-row";

describe("LineRow", () => {
  it("is a line in its colour, named by its heading, with its actions", () => {
    const { container } = render(
      <LineRow tone="leaf" pictogram="careers" title="Nurses: join us">
        <Link href="/careers">Careers</Link>
      </LineRow>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Nurses: join us" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Careers" })).toBeInTheDocument();
    expect(container.querySelector(".bg-leaf")).toHaveAttribute("aria-hidden", "true");
  });

  it("can sit under a page's own heading", () => {
    render(
      <LineRow tone="sky" pictogram="careAtHome" title="Care at home" level="h3">
        <span />
      </LineRow>,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Care at home" })).toBeInTheDocument();
  });
});
