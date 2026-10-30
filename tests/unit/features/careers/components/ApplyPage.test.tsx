import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { ApplyPage } from "@/features/careers/components/ApplyPage";
import { jobFixture, publishedFixture } from "@tests/support/fixtures/content";
import { stubServerEnv } from "@tests/support/env";
import { mockObservers } from "@tests/support/motion";

// The page's line watches the page; here it only needs to be drawn.
vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: null }) }));
vi.mock("@/features/careers/components/ApplicationForm", () => ({
  ApplicationForm: ({ jobId, siteKey }: { jobId: string | null; siteKey: string }) => (
    <form aria-label="Application" data-job={jobId ?? ""} data-site-key={siteKey} />
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
  it("names the open job on the nurses' leaf-green sign, with the way back to it, then the form for it", () => {
    const job = { ...publishedFixture(jobFixture()), open: true };
    const { container } = render(<ApplyPage job={job} />);
    expect(container.querySelector("#start section")).toHaveClass("bg-leaf");
    const sign = within(container.querySelector<HTMLElement>("#start")!);
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
  });
});
