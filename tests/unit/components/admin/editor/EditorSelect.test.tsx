import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { EditorSelect } from "@/components/admin/editor/EditorSelect";
import { EditorForm } from "@tests/support/editor-form";

describe("EditorSelect", () => {
  it("chooses one of a fixed list, starting from the value as saved", async () => {
    let form: UseFormReturn<FieldValues> | undefined;
    render(
      <EditorForm values={{ audience: "INSTITUTIONS" }} onForm={(methods) => (form = methods)}>
        <EditorSelect
          name="audience"
          label="Shown under"
          options={[
            ["FAMILIES", "Care at home"],
            ["INSTITUTIONS", "Staffing"],
          ]}
        />
      </EditorForm>,
    );
    const select = screen.getByRole("combobox", { name: "Shown under" });
    expect(select).toHaveValue("INSTITUTIONS");
    await userEvent.selectOptions(select, "Care at home");
    expect(form!.getValues("audience")).toBe("FAMILIES");
    await act(async () => form!.reset({ audience: "INSTITUTIONS" }));
    expect(select).toHaveValue("INSTITUTIONS");
    await userEvent.selectOptions(select, "FAMILIES");
    expect(form!.getValues("audience")).toBe("FAMILIES");
    await act(async () => form!.reset({ audience: "INSTITUTIONS" }));
    expect(select).toHaveValue("INSTITUTIONS");
  });
});
