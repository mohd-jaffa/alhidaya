import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";

describe("Select", () => {
  it("is the browser's own select, labelled by its field, with the chevron out of the way", () => {
    const { container } = render(
      <Field label="Service" error="Please choose a service.">
        <Select name="service" defaultValue="elderly-care" className="font-semibold">
          <option value="home-nursing-care">Home nursing care</option>
          <option value="elderly-care">Elderly care</option>
        </Select>
      </Field>,
    );
    const select = screen.getByRole("combobox", { name: /^Service/ });
    expect(select).toHaveValue("elderly-care");
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select).toHaveClass("appearance-none", "font-semibold");
    expect(container.querySelector("svg")).toHaveClass("pointer-events-none");
  });
});
