"use client";

import { type DragEvent, useState } from "react";

import { Pictogram } from "@/components/ui/pictogram";

/**
 * Reordering by the browser's own drag and drop (D90): a row is picked up by
 * its handle, the rows it passes over take it, and a sky line shows where it
 * will land. Nothing may land above `first` (a page's sign keeps the top).
 * Phones have no drag and drop; there, Move up and Move down.
 */
export function useDragOrder({ first = 0, onMove }: { first?: number; onMove: (from: number, to: number) => void }) {
  const [from, setFrom] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const end = () => {
    setFrom(null);
    setOver(null);
  };
  return {
    /** What a row's own element listens to, as a place to land. */
    target: (index: number) => ({
      onDragOver: (event: DragEvent) => {
        if (from === null || index < first) return;
        event.preventDefault();
        setOver(index);
      },
      onDrop: (event: DragEvent) => {
        event.preventDefault();
        if (from !== null && over !== null && from !== over) onMove(from, over);
        end();
      },
    }),
    /** Where the line shows on a row, if it does: after it when the row moves down, before it when up. */
    lineAt: (index: number): "before" | "after" | null =>
      from !== null && over === index && from !== index ? (from < index ? "after" : "before") : null,
    start: (index: number) => setFrom(index),
    end,
  };
}

/** The sky line where a dragged row will land. */
export function DropLine({ side }: { side: "before" | "after" | null }) {
  if (!side) return null;
  return (
    <span
      aria-hidden="true"
      className={`absolute inset-x-0 z-[1] h-[3px] rounded-full bg-sky ${side === "after" ? "-bottom-0.5" : "-top-0.5"}`}
    />
  );
}

/**
 * A row's handle: dragged, it carries its row's look. Hidden from screen
 * readers and from phones, which reorder with Move up and Move down.
 */
export function DragHandle({
  thing,
  hint,
  onStart,
  onEnd,
}: {
  /** What is dragged, as the browser carries it. */
  thing: string;
  hint: string;
  onStart: () => void;
  onEnd: () => void;
}) {
  const start = (event: DragEvent<HTMLSpanElement>) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", thing);
    event.dataTransfer.setDragImage(event.currentTarget.closest("article")!, 24, 24);
    onStart();
  };
  return (
    <span
      draggable
      onDragStart={start}
      onDragEnd={onEnd}
      aria-hidden="true"
      title={hint}
      className="hidden size-touch shrink-0 cursor-grab place-items-center rounded-control text-ink-2 hover:bg-sky/15 hover:text-navy active:cursor-grabbing sm:grid"
    >
      <Pictogram name="grip" size="sm" />
    </span>
  );
}
