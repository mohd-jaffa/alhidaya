import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DragHandle, DropLine, useDragOrder } from "@/components/admin/editor/DragOrder";

/** Three rows, the first kept on top, each dropped where the test drags it. */
function Rows({ onMove }: { onMove: (from: number, to: number) => void }) {
  const drag = useDragOrder({ first: 1, onMove });
  return (
    <ol>
      {["Top", "Second", "Third"].map((name, index) => (
        <li key={name} data-testid={name} {...drag.target(index)}>
          <DropLine side={drag.lineAt(index)} />
          <article>
            <DragHandle thing={name} hint="Drag" onStart={() => drag.start(index)} onEnd={drag.end} />
            {name}
          </article>
        </li>
      ))}
    </ol>
  );
}

const dataTransfer = () => ({ effectAllowed: "", setData: vi.fn(), setDragImage: vi.fn() });
const handle = (name: string) => screen.getByTestId(name).querySelector<HTMLElement>("[draggable]")!;

describe("useDragOrder (D90)", () => {
  it("carries a row by its handle, shows where it will land, and moves it there", () => {
    const onMove = vi.fn();
    render(<Rows onMove={onMove} />);
    const transfer = dataTransfer();
    fireEvent.dragStart(handle("Third"), { dataTransfer: transfer });
    expect(transfer).toMatchObject({ effectAllowed: "move" });
    expect(transfer.setData).toHaveBeenCalledWith("text/plain", "Third");
    expect(transfer.setDragImage).toHaveBeenCalledWith(handle("Third").closest("article"), 24, 24);
    fireEvent.dragOver(screen.getByTestId("Top"));
    expect(screen.getByTestId("Top").querySelector(".bg-sky")).toBeNull();
    fireEvent.dragOver(screen.getByTestId("Second"));
    expect(screen.getByTestId("Second").querySelector(".bg-sky")).toHaveClass("-top-0.5");
    fireEvent.drop(screen.getByTestId("Second"));
    expect(onMove).toHaveBeenCalledWith(2, 1);
    expect(document.querySelector(".bg-sky")).toBeNull();
  });

  it("draws the line below a row passed on the way down, and moves nothing dropped where it was", () => {
    const onMove = vi.fn();
    render(<Rows onMove={onMove} />);
    fireEvent.dragStart(handle("Second"), { dataTransfer: dataTransfer() });
    fireEvent.dragOver(screen.getByTestId("Third"));
    expect(screen.getByTestId("Third").querySelector(".bg-sky")).toHaveClass("-bottom-0.5");
    fireEvent.dragOver(screen.getByTestId("Second"));
    fireEvent.drop(screen.getByTestId("Second"));
    fireEvent.dragEnd(handle("Second"));
    fireEvent.dragOver(screen.getByTestId("Third"));
    fireEvent.drop(screen.getByTestId("Third"));
    expect(onMove).not.toHaveBeenCalled();
  });
});
