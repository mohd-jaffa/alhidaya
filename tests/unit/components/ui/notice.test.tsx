import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Notice } from "@/components/ui/notice";

describe("Notice", () => {
  it("interrupts with an error, in words and an icon", () => {
    render(
      <Notice tone="error" title="Your message was not sent.">
        Please check the highlighted fields.
      </Notice>,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Your message was not sent.Please check the highlighted fields.");
    expect(alert).toHaveClass("border-error");
    expect(alert.querySelector("svg")).toHaveClass("text-error");
  });

  it("tells of a success or a fact in its turn", () => {
    render(
      <>
        <Notice tone="success" title="Thank you." />
        <Notice tone="info" title="Applications close at midnight in Doha." />
      </>,
    );
    const [success, info] = screen.getAllByRole("status");
    expect(success).toHaveTextContent("Thank you.");
    expect(info).toHaveTextContent("Applications close at midnight in Doha.");
    expect(success.querySelectorAll("p")).toHaveLength(1);
  });

  it("gives its title an id, so what takes focus with it can be named by it", () => {
    render(
      <section aria-labelledby="sent-title">
        <Notice tone="success" title="Thank you." titleId="sent-title" />
      </section>,
    );
    expect(screen.getByRole("region", { name: "Thank you." })).toBeInTheDocument();
  });
});
