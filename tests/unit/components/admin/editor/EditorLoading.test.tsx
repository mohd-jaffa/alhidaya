import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EditorLoading } from "@/components/admin/editor/EditorLoading";
import { ADMIN_TEXT } from "@/constants/admin-messages";

describe("EditorLoading", () => {
  it("says it is reading, in the rows' places", () => {
    render(<EditorLoading />);
    expect(screen.getByLabelText(ADMIN_TEXT.loading)).toHaveAttribute("aria-busy", "true");
  });
});
