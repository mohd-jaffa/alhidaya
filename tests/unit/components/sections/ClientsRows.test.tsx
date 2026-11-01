import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { type ClientLogo, ClientsRows } from "@/components/sections/ClientsRows";

const logo = (name: string, url: string | null = null): ClientLogo => ({
  id: name,
  name,
  url,
  logo: <span>{`${name} logo`}</span>,
});

const tracks = () => [...document.querySelectorAll(".logo-track")];

describe("ClientsRows (D133)", () => {
  it("splits the logos between two rows running opposite ways, each long enough for a wide screen", () => {
    render(<ClientsRows clients={["A", "B", "C", "D", "E"].map((name) => logo(name))} />);
    const [first, second] = tracks();
    expect(first).not.toHaveAttribute("data-reverse");
    expect(second).toHaveAttribute("data-reverse");
    // Three logos repeated to ten, then doubled: only the first copy is read and reached.
    expect(first.querySelectorAll(".logo-item")).toHaveLength(24);
    expect(first.querySelectorAll(".logo-copy")).toHaveLength(21);
    expect(first).toHaveStyle({ "--loop-duration": "48s" });
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("keeps a few logos in one row", () => {
    render(<ClientsRows clients={[logo("A"), logo("B")]} />);
    expect(tracks()).toHaveLength(1);
  });

  it("chooses a logo by a click, and lets it go by another, by choosing another, or by a click elsewhere", async () => {
    const user = userEvent.setup();
    render(
      <>
        <ClientsRows clients={[logo("A"), logo("B")]} />
        <p>Elsewhere</p>
      </>,
    );
    const a = screen.getByRole("button", { name: "A" });
    const b = screen.getByRole("button", { name: "B" });
    await user.click(a);
    expect(a).toHaveAttribute("aria-pressed", "true");
    fireEvent.pointerDown(a);
    expect(a).toHaveAttribute("aria-pressed", "true");
    await user.click(b);
    expect(a).toHaveAttribute("aria-pressed", "false");
    expect(b).toHaveAttribute("aria-pressed", "true");
    await user.click(b);
    expect(b).toHaveAttribute("aria-pressed", "false");
    await user.click(a);
    fireEvent.pointerDown(screen.getByText("Elsewhere"));
    expect(a).toHaveAttribute("aria-pressed", "false");
  });

  it("opens a logo's site in a new tab rather than choosing it", () => {
    render(<ClientsRows clients={[logo("Doha Clinic", "https://dohaclinic.example")]} />);
    const link = screen.getByRole("link", { name: "Doha Clinic" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(document.querySelectorAll('a[aria-hidden="true"][tabindex="-1"]').length).toBeGreaterThan(0);
  });
});
