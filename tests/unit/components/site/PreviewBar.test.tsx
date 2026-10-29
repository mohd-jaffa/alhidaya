import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PreviewBar } from "@/components/site/PreviewBar";
import { UI_TEXT } from "@/constants/messages";
import { API_ROUTES } from "@/constants/routes";

describe("PreviewBar", () => {
  it("tells the admin they see unpublished changes, with the way out", () => {
    render(<PreviewBar active />);
    expect(screen.getByRole("status")).toHaveTextContent(UI_TEXT.previewBar);
    expect(screen.getByRole("link", { name: UI_TEXT.previewExit })).toHaveAttribute("href", API_ROUTES.previewExit);
  });

  it("is not there outside a preview", () => {
    const { container } = render(<PreviewBar active={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});
