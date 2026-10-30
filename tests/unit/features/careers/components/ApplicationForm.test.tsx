import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { UI_TEXT, VALIDATION_MESSAGES } from "@/constants/messages";
import { CV_ACCEPT } from "@/constants/uploads";
import { ApplicationForm } from "@/features/careers/components/ApplicationForm";
import { ApiError } from "@/lib/api/client";

const { apply } = vi.hoisted(() => ({ apply: vi.fn(async (values: Record<string, unknown>) => void values) }));
vi.mock("@/features/careers/api.client", () => ({ CareersClient: { apply } }));
vi.mock("@/components/ui/bot-check", () => ({
  BotCheck: () => <input type="hidden" name="turnstileToken" value="token-from-cloudflare" readOnly />,
}));

const JOB_ID = "0f8c1c62-5d55-4b8e-9c3a-2f4e1d6b7a90";
const field = (label: string) => screen.getByRole("textbox", { name: label });
const cvInput = () => screen.getByLabelText(UI_TEXT.cv, { exact: false });

async function fill(user: ReturnType<typeof userEvent.setup>, cv: File) {
  await user.type(field(UI_TEXT.fullName), "Mariam Ali");
  await user.type(field(UI_TEXT.email), "mariam@example.com");
  await user.type(field(UI_TEXT.phone), "5551 2345");
  await user.click(screen.getByRole("radio", { name: "Outside Qatar" }));
  await user.click(screen.getByRole("radio", { name: "In progress" }));
  await user.click(screen.getAllByRole("radio", { name: "Done" })[0]);
  await user.click(screen.getByRole("radio", { name: "Passed" }));
  await user.type(field(UI_TEXT.experienceYears), "4");
  await user.upload(cvInput(), cv);
  await user.click(screen.getByRole("checkbox"));
}

describe("ApplicationForm (plan §9.2)", () => {
  it("asks where the nurse is with Qatar's licensing, and for a PDF or Word CV within its size", async () => {
    const user = userEvent.setup();
    render(<ApplicationForm jobId={null} siteKey="site-key" />);
    for (const legend of [UI_TEXT.whereNow, UI_TEXT.mophLicence, UI_TEXT.dataflow, UI_TEXT.prometric]) {
      expect(screen.getByRole("group", { name: legend })).toBeInTheDocument();
    }
    expect(screen.getAllByRole("radio")).toHaveLength(9);
    expect(cvInput()).toHaveAttribute("accept", CV_ACCEPT);
    expect(cvInput()).toHaveAccessibleDescription(UI_TEXT.cvHint("5 MB"));
    expect(field(UI_TEXT.experienceYears)).toHaveAttribute("inputmode", "numeric");

    await user.click(screen.getByRole("button", { name: UI_TEXT.sendApplication }));
    expect(await screen.findByText(VALIDATION_MESSAGES.cvRequired)).toBeVisible();
    expect(screen.getByText(VALIDATION_MESSAGES.mophLicence)).toBeVisible();
    expect(apply).not.toHaveBeenCalled();
  });

  it("sends the application for its job, with the CV picked, and thanks the applicant without WhatsApp", async () => {
    const user = userEvent.setup();
    Element.prototype.scrollIntoView = vi.fn();
    render(<ApplicationForm jobId={JOB_ID} siteKey="site-key" />);
    const cv = new File(["%PDF-1.7"], "cv.pdf", { type: "application/pdf" });
    await fill(user, cv);
    await user.click(screen.getByRole("button", { name: UI_TEXT.sendApplication }));
    await waitFor(() =>
      expect(apply).toHaveBeenCalledWith({
        jobId: JOB_ID,
        name: "Mariam Ali",
        email: "mariam@example.com",
        phone: "5551 2345",
        whereNow: "OUTSIDE_QATAR",
        mophLicence: "IN_PROGRESS",
        dataflow: "DONE",
        prometric: "PASSED",
        experienceYears: "4",
        cv,
        note: "",
        consent: true,
        your_reference: "",
        turnstileToken: "token-from-cloudflare",
      }),
    );
    const thanks = await screen.findByRole("group", { name: UI_TEXT.applicationSent });
    expect(thanks).toHaveTextContent(UI_TEXT.applicationSentNext);
    expect(thanks).not.toHaveTextContent(UI_TEXT.fasterOnWhatsApp);
  });

  it("shows the route's refusal of the CV's type beside the CV", async () => {
    const user = userEvent.setup();
    apply.mockRejectedValueOnce(
      new ApiError(400, "VALIDATION_ERROR", "Please check the highlighted fields.", "req_1", [
        { path: "cv", message: VALIDATION_MESSAGES.cvType },
      ]),
    );
    render(<ApplicationForm jobId={null} siteKey="site-key" />);
    await fill(user, new File(["not a cv"], "cv.pdf", { type: "application/pdf" }));
    await user.click(screen.getByRole("button", { name: UI_TEXT.sendApplication }));
    expect(await screen.findByText(VALIDATION_MESSAGES.cvType)).toBeVisible();
    expect(apply).toHaveBeenLastCalledWith(expect.objectContaining({ jobId: "" }));
  });
});
