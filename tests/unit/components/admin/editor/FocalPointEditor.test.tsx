import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FocalPointEditor } from "@/components/admin/editor/FocalPointEditor";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import type { SiteImage } from "@/features/media/types";

const image: SiteImage = {
  id: "photo",
  width: 1600,
  height: 900,
  alt: "Care",
  sources: [{ url: "/photo.webp", width: 1600, mime: "image/webp" }],
};

describe("FocalPointEditor", () => {
  it("keeps unset framing unchanged and offers equivalent keyboard controls", async () => {
    const onChange = vi.fn();
    const { container } = render(<FocalPointEditor image={image} value={undefined} onChange={onChange} />);
    await userEvent.click(screen.getByText(ADMIN_TEXT.framing));
    expect(screen.getByRole("button", { name: ADMIN_TEXT.resetFraming })).toBeDisabled();
    const x = screen.getByRole("slider", { name: new RegExp(ADMIN_TEXT.focalHorizontal) });
    const y = screen.getByRole("slider", { name: new RegExp(ADMIN_TEXT.focalVertical) });
    expect(x).toHaveValue("50");
    expect(x).toHaveAttribute("dir", "ltr");
    fireEvent.change(x, { target: { value: "0" } });
    expect(onChange).toHaveBeenLastCalledWith({ x: 0, y: 50 });
    fireEvent.change(y, { target: { value: "100" } });
    expect(onChange).toHaveBeenLastCalledWith({ x: 50, y: 100 });
    expect(container.querySelector("img")).not.toHaveAttribute("style");
    const target = screen.getByRole("button", { name: ADMIN_TEXT.focalChoose });
    target.focus();
    await userEvent.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith({ x: 50, y: 50 });
  });

  it("selects from the original image, previews crops and resets reversibly", async () => {
    const onChange = vi.fn();
    const { container } = render(<FocalPointEditor image={image} value={{ x: 20, y: 80 }} onChange={onChange} />);
    await userEvent.click(screen.getByText(ADMIN_TEXT.framing));
    const target = screen.getByRole("button", { name: ADMIN_TEXT.focalChoose });
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
      left: 10,
      top: 20,
      width: 200,
      height: 100,
    } as DOMRect);
    fireEvent.click(target, { detail: 1, clientX: 60, clientY: 95 });
    expect(onChange).toHaveBeenLastCalledWith({ x: 25, y: 75 });
    const photos = container.querySelectorAll("img");
    expect(photos).toHaveLength(4);
    expect(photos[0]).not.toHaveAttribute("style");
    for (const photo of Array.from(photos).slice(1)) expect(photo).toHaveStyle({ objectPosition: "20% 80%" });
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.resetFraming }));
    expect(onChange).toHaveBeenLastCalledWith(undefined);
    onChange.mockClear();
    vi.mocked(target.getBoundingClientRect).mockReturnValue({ left: 0, top: 0, width: 0, height: 0 } as DOMRect);
    fireEvent.click(target, { detail: 1, clientX: 10, clientY: 10 });
    expect(onChange).not.toHaveBeenCalled();
  });
});
