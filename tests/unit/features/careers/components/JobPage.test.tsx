import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { JobPage } from "@/features/careers/components/JobPage";
import { jobFixture, publishedFixture } from "@tests/support/fixtures/content";
import { mockObservers } from "@tests/support/motion";

// The page's cards rise in as they scroll by; here they only need to be drawn.
vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: null }) }));
beforeEach(() => mockObservers());
afterEach(() => vi.unstubAllGlobals());

const en = <T,>(value: T) => ({ en: value });
const job = (overrides: Parameters<typeof jobFixture>[0] = {}, open = true) => ({
  ...publishedFixture(jobFixture(overrides)),
  open,
});
const structuredData = (container: HTMLElement) =>
  [...container.querySelectorAll('script[type="application/ld+json"]')].map(
    (script) => JSON.parse(script.innerHTML)["@type"],
  );

describe("JobPage", () => {
  it("opens an open job under Careers' pill with Apply, then the job in full beside its facts, then the others", () => {
    const { container } = render(
      <JobPage
        job={job({
          department: en("Home care"),
          closesOn: "2026-11-30",
          description: [{ type: "paragraph", text: en("Visits across Doha.") }],
          responsibilities: [en("Visit patients at home")],
          benefits: [en("Accommodation")],
        })}
        others={[job({ title: en("School Nurse"), slug: "school-nurse" })]}
      />,
    );
    const sign = within(container.querySelector<HTMLElement>("#start")!);
    expect(sign.getByText(PAGE_NAMES.CAREERS)).toBeInTheDocument();
    expect(sign.getByRole("heading", { level: 1, name: "Registered General Nurse – Home Care" })).toBeInTheDocument();
    expect(sign.getByText("Home care nursing.")).toBeInTheDocument();
    expect(sign.getByRole("link", { name: UI_TEXT.applyForJob })).toHaveAttribute(
      "href",
      ROUTES.applyForJob("registered-general-nurse-home-care"),
    );
    expect(screen.queryByText(UI_TEXT.jobClosed)).not.toBeInTheDocument();

    const about = within(screen.getByRole("region", { name: UI_TEXT.aboutJob }));
    expect(about.getByText("Visits across Doha.")).toBeInTheDocument();
    for (const [title, item] of [
      [UI_TEXT.responsibilities, "Visit patients at home"],
      [UI_TEXT.qualifications, "MOPH licence or home-country registration"],
      [UI_TEXT.benefits, "Accommodation"],
    ])
      expect(about.getByRole("heading", { level: 3, name: title }).nextElementSibling).toHaveTextContent(item);
    const facts = [...container.querySelectorAll("dt")].map((term) => [
      term.textContent,
      term.nextSibling?.textContent,
    ]);
    expect(facts).toEqual([
      [UI_TEXT.location, "Doha, Qatar"],
      [UI_TEXT.employment, "Full time"],
      [UI_TEXT.department, "Home care"],
      [UI_TEXT.experience, "2 years"],
      [UI_TEXT.posted, "1 October 2026"],
      [UI_TEXT.closes, "30 November 2026"],
    ]);

    const card = within(container.querySelector<HTMLElement>("#about .bg-mist")!);
    expect(card.getByRole("link", { name: UI_TEXT.applyForJob })).toBeInTheDocument();
    expect(sign.getByRole("link", { name: UI_TEXT.allOpenJobs })).toHaveAttribute("href", ROUTES.careers);
    expect(sign.queryByRole("link", { name: UI_TEXT.generalApplication })).not.toBeInTheDocument();
    const more = within(screen.getByRole("region", { name: UI_TEXT.otherOpenJobs }));
    expect(more.getByRole("link", { name: "School Nurse" })).toHaveAttribute("href", ROUTES.job("school-nurse"));
    expect(structuredData(container)).toEqual(["JobPosting", "BreadcrumbList"]);
  });

  it("keeps a closed job reachable: it says so, takes no application, and offers the general one", () => {
    const { container } = render(<JobPage job={job({ closesOn: "2026-10-15" }, false)} others={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent(UI_TEXT.jobClosed);
    expect(screen.getByRole("status")).toHaveTextContent(UI_TEXT.jobClosedBody);
    expect(screen.queryByRole("link", { name: UI_TEXT.applyForJob })).not.toBeInTheDocument();
    const sign = within(container.querySelector<HTMLElement>("#start")!);
    expect(sign.getByRole("link", { name: UI_TEXT.generalApplication })).toHaveAttribute("href", ROUTES.applyGeneral);
    expect(screen.getByText(UI_TEXT.closedOn).nextSibling).toHaveTextContent("15 October 2026");
    expect(screen.queryByRole("heading", { name: UI_TEXT.otherOpenJobs })).not.toBeInTheDocument();
    expect(sign.getByRole("link", { name: UI_TEXT.allOpenJobs })).toHaveAttribute("href", ROUTES.careers);
    // Out of Google's jobs, still on the trail.
    expect(structuredData(container)).toEqual(["BreadcrumbList"]);
  });

  it("leaves out what a job does not have", () => {
    const { container } = render(<JobPage job={job({ experience: en(null), qualifications: [] })} others={[]} />);
    expect(screen.queryByRole("heading", { level: 3, name: UI_TEXT.qualifications })).not.toBeInTheDocument();
    expect(screen.queryByText(UI_TEXT.department)).not.toBeInTheDocument();
    expect(screen.queryByText(UI_TEXT.experience)).not.toBeInTheDocument();
    expect(screen.queryByText(UI_TEXT.closes)).not.toBeInTheDocument();
    expect(container.querySelector("#about .max-w-measure.gap-5")).toBeNull();
  });
});
