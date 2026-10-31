import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoopRow } from "@/components/motion/LoopRow";

const items = ["Tell us", "We talk", "We plan"].map((name) => (
  <li key={name}>
    <a href={`/${name}`}>{name}</a>
  </li>
));

describe("LoopRow (D124)", () => {
  it("is read and reached once, its repeats hidden from screen readers and the keyboard", () => {
    const { container } = render(<LoopRow as="ol" items={items} secondsPerItem={6} pauseLabel="Pause the steps" />);
    const lists = container.querySelectorAll("ol");
    // Three items, repeated to eight or more in each half: three copies a half, six in all.
    expect(lists).toHaveLength(6);
    expect(screen.getAllByRole("list")).toHaveLength(1);
    expect(
      within(screen.getByRole("list"))
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual(["Tell us", "We talk", "We plan"]);
    for (const copy of [...lists].slice(1)) {
      expect(copy).toHaveAttribute("aria-hidden", "true");
      expect(copy).toHaveAttribute("inert");
      expect(copy).toHaveClass("loop-copy");
    }
    expect(lists[0]).not.toHaveAttribute("inert");
    // Each half passes at six seconds an item: nine items.
    expect(container.firstElementChild).toHaveStyle({ "--loop-duration": "54s" });
  });

  it("has its pause button, with the way onward beside it", () => {
    render(
      <LoopRow items={items} secondsPerItem={5} pauseLabel="Pause the services" footer={<a href="#all">All</a>} />,
    );
    expect(screen.getByRole("checkbox", { name: "Pause the services" })).not.toBeChecked();
    expect(screen.getByRole("link", { name: "All" })).toBeVisible();
  });

  it("keeps only the way onward with nothing to run, and nothing without one", () => {
    const { container, rerender } = render(
      <LoopRow items={[]} secondsPerItem={5} pauseLabel="Pause" footer={<a href="#all">All</a>} />,
    );
    expect(screen.getByRole("link", { name: "All" })).toBeVisible();
    expect(screen.queryByRole("checkbox")).toBeNull();
    rerender(<LoopRow items={[]} secondsPerItem={5} pauseLabel="Pause" />);
    expect(container).toBeEmptyDOMElement();
  });
});
