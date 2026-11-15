import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { ApplyPage } from "@/features/careers/components/ApplyPage";
import { jobFixture, publishedFixture } from "@tests/support/fixtures/content";
import { stubServerEnv } from "@tests/support/env";
import { mockObservers } from "@tests/support/motion";

// The page's motion waits on the engine; here the page only needs to be drawn.
vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: null }) }));
vi.mock("@/features/careers/components/ApplicationForm", () => ({
  ApplicationForm: ({ jobId, siteKey, questions }: { jobId: string | null; siteKey: string; questions: unknown }) => (
    <form
      aria-label="Application"
      data-job={jobId ?? ""}
      data-site-key={siteKey}
      data-questions={JSON.stringify(questions)}
    />
  ),
}));
beforeEach(() => {
  mockObservers();
  stubServerEnv({ TURNSTILE_SITE_KEY: "site-key" });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("ApplyPage", () => {
  it("names the open job under Careers' pill, with the way back to it, then the form for it on its panel", () => {
    const job = { ...publishedFixture(jobFixture()), open: true };
    const { container } = render(<ApplyPage job={job} />);
    const sign = within(container.querySelector<HTMLElement>("#start")!);
    expect(sign.getByText(PAGE_NAMES.CAREERS)).toBeInTheDocument();
    expect(sign.getByRole("heading", { level: 1, name: "Registered General Nurse – Home Care" })).toBeInTheDocument();
    expect(sign.getByText(UI_TEXT.applyLede)).toBeInTheDocument();
    const back = ROUTES.job("registered-general-nurse-home-care");
    expect(sign.getByRole("link", { name: UI_TEXT.aboutJob })).toHaveAttribute("href", back);

    const apply = within(screen.getByRole("region", { name: UI_TEXT.yourApplication }));
    expect(apply.getByText(UI_TEXT.applyingFor, { exact: false })).toHaveTextContent(
      `${UI_TEXT.applyingFor} Registered General Nurse – Home Care.`,
    );
    expect(apply.getByRole("link", { name: "Registered General Nurse – Home Care" })).toHaveAttribute("href", back);
    const form = apply.getByRole("form", { name: "Application" });
    expect([form.dataset.job, form.dataset.siteKey]).toEqual([job.id, "site-key"]);
    expect(form.parentElement).toHaveClass("bg-mist", "rounded-card");
  });

  it("hands the form the job's own questions in plain words, and none for a job published before them (D209)", () => {
    const questions = [
      { question: { en: "Do you hold a **BLS** certificate?" }, choices: [{ en: "*Yes*" }, { en: "No" }] },
    ];
    const job = { ...publishedFixture(jobFixture({ questions })), open: true };
    const { unmount } = render(<ApplyPage job={job} />);
    expect(JSON.parse(screen.getByRole("form", { name: "Application" }).dataset.questions!)).toEqual([
      { question: "Do you hold a BLS certificate?", choices: ["Yes", "No"] },
    ]);
    unmount();

    const before: Partial<ReturnType<typeof jobFixture>> = jobFixture();
    delete before.questions;
    render(<ApplyPage job={{ ...publishedFixture(before as ReturnType<typeof jobFixture>), open: true }} />);
    expect(screen.getByRole("form", { name: "Application" }).dataset.questions).toBe("[]");
  });

  it("is the general application without a job, with the way back to the open jobs", () => {
    const { container } = render(<ApplyPage job={null} />);
    const sign = within(container.querySelector<HTMLElement>("#start")!);
    expect(sign.getByRole("heading", { level: 1, name: UI_TEXT.generalApplicationHeadline })).toBeInTheDocument();
    expect(sign.getByText(UI_TEXT.generalApplicationLede)).toBeInTheDocument();
    expect(sign.getByRole("link", { name: UI_TEXT.allOpenJobs })).toHaveAttribute("href", ROUTES.careers);
    const apply = within(screen.getByRole("region", { name: UI_TEXT.yourApplication }));
    expect(apply.getByText(UI_TEXT.generalApplicationFor)).toBeInTheDocument();
    expect(apply.getByRole("form", { name: "Application" }).dataset.job).toBe("");
    expect(apply.getByRole("form", { name: "Application" }).dataset.questions).toBe("[]");
  });
});
