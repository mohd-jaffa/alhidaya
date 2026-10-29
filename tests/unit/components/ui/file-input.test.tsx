import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Field } from "@/components/ui/field";
import { FileInput } from "@/components/ui/file-input";
import { UI_TEXT } from "@/constants/messages";

describe("FileInput", () => {
  it("is the browser's picker, labelled by its field, saying what was chosen and how big it is", async () => {
    const onChange = vi.fn();
    render(
      <Field label="CV" hint="PDF, DOC or DOCX, up to 5 MB.">
        <FileInput name="cv" accept=".pdf" onChange={onChange} />
      </Field>,
    );
    const input = screen.getByLabelText(/^CV/);
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveAccessibleDescription("PDF, DOC or DOCX, up to 5 MB.");
    expect(screen.getByText(UI_TEXT.chooseFile)).toBeInTheDocument();
    expect(screen.getByText(UI_TEXT.noFileChosen)).toBeInTheDocument();

    await userEvent.upload(input, new File([new Uint8Array(820 * 1024)], "Mariam CV.pdf", { type: "application/pdf" }));
    expect(screen.getByText("Mariam CV.pdf · 820 kB")).toBeInTheDocument();
    expect(screen.getByText(UI_TEXT.replaceFile)).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("forgets the file when the choice is cleared, without a handler of its own", async () => {
    render(
      <Field label="CV">
        <FileInput name="cv" />
      </Field>,
    );
    const input = screen.getByLabelText(/^CV/) as HTMLInputElement;
    await userEvent.upload(input, new File(["x"], "cv.pdf"));
    expect(screen.getByText("cv.pdf · 0.1 kB")).toBeInTheDocument();
    Object.defineProperty(input, "files", { configurable: true, value: [] });
    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(await screen.findByText(UI_TEXT.noFileChosen)).toBeInTheDocument();
  });
});
