"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";

import { UI_TEXT } from "@/constants/messages";

import { Pictogram } from "./pictogram";

/**
 * A dialog over the page (plan §32): the browser's own modal dialog, so focus
 * is held inside it, the page behind is out of reach, Escape closes it, and
 * focus returns to what opened it.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    // The dialog element is always rendered, so it is there by the time this runs.
    const dialog = ref.current!;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-auto w-[min(36rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] overscroll-contain rounded-panel bg-ground p-0 text-navy shadow-overlay backdrop:bg-navy/60"
    >
      <div className="flex items-start justify-between gap-4 border-b border-rule px-6 py-4">
        <h2 id={titleId} className="text-title font-bold">
          {title}
        </h2>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          className="-me-2 grid size-touch shrink-0 place-items-center rounded-control hover:bg-mist"
        >
          <Pictogram name="close" label={UI_TEXT.close} />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </dialog>
  );
}
