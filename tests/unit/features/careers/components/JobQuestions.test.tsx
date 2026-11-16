import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { JOB_QUESTION_CHOICES, LIST_LIMITS } from "@/constants/limits";
import { UI_TEXT, VALIDATION_MESSAGES } from "@/constants/messages";
import { JobQuestions } from "@/features/careers/components/JobQuestions";
import { type JobDocument, type JobDocumentInput, jobDocumentSchema } from "@/lib/validation";
import { jobFixture } from "@tests/support/fixtures/content";

function Editor({ initial = jobFixture(), save }: { initial?: JobDocument; save: (value: JobDocument) => void }) {
  const form = useForm<JobDocumentInput, unknown, JobDocument>({
    defaultValues: initial,
    resolver: zodResolver(jobDocumentSchema),
  });
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(save)}>
        <JobQuestions />
        <button type="submit">Save</button>
      </form>
    </FormProvider>
  );
}

const question = (number: number) =>
  screen.getByRole("group", { name: ADMIN_TEXT.numbered(ADMIN_TEXT.question, number) });
const choice = (group: HTMLElement, number: number) =>
  within(group).getByRole("textbox", { name: ADMIN_TEXT.numbered(ADMIN_TEXT.choice, number) });

describe("JobQuestions (D209)", () => {
  it("starts with none; a new question comes with its two choices, which it keeps, and more may be added", async () => {
    const save = vi.fn();
    const user = userEvent.setup();
    render(<Editor save={save} />);
    expect(screen.queryByRole("textbox")).toBeNull();
    const fieldToHide = screen.getByRole("checkbox", { name: ADMIN_TEXT.hideQuestion(UI_TEXT.prometric) });
    const fieldToRestore = screen.getByRole("checkbox", { name: ADMIN_TEXT.hideQuestion(UI_TEXT.whereNow) });
    expect(fieldToHide).not.toBeChecked();
    await user.click(fieldToHide);
    await user.click(fieldToRestore);
    await user.click(fieldToRestore);
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.addQuestion }));
    const first = question(1);
    expect(within(first).getByRole("combobox", { name: ADMIN_TEXT.answerSelection })).toHaveValue("single");
    await user.type(
      within(first).getByRole("textbox", { name: ADMIN_TEXT.question }),
      "Do you hold a BLS certificate?",
    );
    await user.type(choice(first, 1), "Yes");
    await user.type(choice(first, 2), "No");
    const removeChoice = within(first).getByRole("button", {
      name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, ADMIN_TEXT.numbered(ADMIN_TEXT.choice, 2)),
    });
    expect(removeChoice).toHaveAttribute("aria-disabled", "true");

    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.addQuestion }));
    const second = question(2);
    await user.selectOptions(within(second).getByRole("combobox", { name: ADMIN_TEXT.answerSelection }), "multiple");
    await user.type(within(second).getByRole("textbox", { name: ADMIN_TEXT.question }), "Which shifts?");
    await user.type(choice(second, 1), "Days");
    await user.type(choice(second, 2), "Nights");
    const addChoice = within(second).getByRole("button", { name: ADMIN_TEXT.addChoice });
    await user.click(addChoice);
    await user.type(choice(second, 3), "Either");
    await user.click(addChoice);
    await user.click(addChoice);
    await user.click(addChoice);
    expect(within(second).getAllByRole("textbox")).toHaveLength(1 + JOB_QUESTION_CHOICES.max);
    expect(within(second).queryByRole("button", { name: ADMIN_TEXT.addChoice })).toBeNull();
    for (const number of [6, 5, 4]) {
      await user.click(
        within(second).getByRole("button", {
          name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, ADMIN_TEXT.numbered(ADMIN_TEXT.choice, number)),
        }),
      );
    }

    await user.click(
      screen.getByRole("button", {
        name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveUp, ADMIN_TEXT.numbered(ADMIN_TEXT.question, 2)),
      }),
    );
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        hiddenQuestions: ["prometric"],
        questions: [
          {
            question: { en: "Which shifts?" },
            choices: [{ en: "Days" }, { en: "Nights" }, { en: "Either" }],
            selection: "multiple",
          },
          {
            question: { en: "Do you hold a BLS certificate?" },
            choices: [{ en: "Yes" }, { en: "No" }],
            selection: "single",
          },
        ],
      }),
      expect.anything(),
    );
  });

  it("removes a question, says what the schema refuses, and adds no more than ten", async () => {
    const save = vi.fn();
    const user = userEvent.setup();
    const asked = (words: string) => ({
      question: { en: words },
      choices: [{ en: "Yes" }, { en: "yes" }],
      selection: "single" as const,
    });
    render(<Editor save={save} initial={jobFixture({ questions: [asked("Night shifts?"), asked("Weekends?")] })} />);
    await user.click(
      screen.getByRole("button", {
        name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, ADMIN_TEXT.numbered(ADMIN_TEXT.question, 2)),
      }),
    );
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await within(question(1)).findByText(VALIDATION_MESSAGES.noRepeats("Choices"))).toBeVisible();
    expect(save).not.toHaveBeenCalled();

    const add = screen.getByRole("button", { name: ADMIN_TEXT.addQuestion });
    for (let count = 1; count < LIST_LIMITS.jobQuestions; count++) await user.click(add);
    expect(add).toBeDisabled();
  });

  it("says the schema's refusal of the list itself", async () => {
    const asked = {
      question: { en: "Night shifts?" },
      choices: [{ en: "Yes" }, { en: "No" }],
      selection: "single" as const,
    };
    render(<Editor save={vi.fn()} initial={jobFixture({ questions: [asked, asked] })} />);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText(VALIDATION_MESSAGES.noRepeats("Application questions"))).toBeVisible();
  });
});
