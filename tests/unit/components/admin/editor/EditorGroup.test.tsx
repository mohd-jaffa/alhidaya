import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EditorGroup } from "@/components/admin/editor/EditorGroup";

describe("EditorGroup", () => {
  it("names a group of fields, says what it is for, and holds them", () => {
    render(
      <EditorGroup title="Dates" hint="When it shows.">
        <p>A field</p>
      </EditorGroup>,
    );
    const group = screen.getByRole("region", { name: "Dates" });
    expect(group).toHaveTextContent("When it shows.");
    expect(group).toHaveTextContent("A field");
  });

  it("needs no hint", () => {
    render(<EditorGroup title="Description">{null}</EditorGroup>);
    expect(screen.getByRole("region", { name: "Description" }).querySelector("p")).toBeNull();
  });
});
