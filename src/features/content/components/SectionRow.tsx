"use client";

import { type DragEvent, useId, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { StatusChip } from "@/components/admin/StatusChip";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Pictogram } from "@/components/ui/pictogram";
import { ADMIN_TEXT, SECTION_NAMES } from "@/constants/admin-messages";
import type { PageKey } from "@/constants/sections";
import type { PageDocumentInput, SectionInput } from "@/lib/validation";

import { sectionLock, sectionSummary } from "../editor";
import { useHasErrors } from "./EditorText";
import { ItemControls } from "./ItemControls";
import { SectionFields } from "./SectionFields";

/**
 * One section of a page as a row (D88, D90): its place, its kind, what it
 * says first, whether it is hidden; Hide or Show, Move up, Move down and
 * Remove (asked first). Pressed, it opens where it is with its fields. The
 * sign stays first; a section the page needs stays visible and stays.
 */
export function SectionRow({
  page,
  index,
  open,
  onToggle,
  onMove,
  onRemove,
  onDragStart,
  onDragEnd,
}: {
  page: PageKey;
  index: number;
  open: boolean;
  onToggle: () => void;
  onMove: (to: number) => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const { setValue } = useFormContext<PageDocumentInput>();
  const sections = useWatch<PageDocumentInput, "sections">({ name: "sections" }) as SectionInput[];
  const section = sections[index];
  const name = SECTION_NAMES[section.type];
  const lock = sectionLock(page, sections, index);
  const summary = sectionSummary(section.content as Record<string, unknown>);
  const invalid = useHasErrors(`sections.${index}`);
  const [asking, setAsking] = useState(false);
  const panel = useId();

  const startDrag = (event: DragEvent<HTMLSpanElement>) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", name);
    event.dataTransfer.setDragImage(event.currentTarget.closest("article")!, 24, 24);
    onDragStart();
  };

  return (
    <article className={open ? "rounded-panel border border-rule bg-mist" : "border-b border-rule"}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-2 py-1.5">
        {/* Phones have no drag and drop: there, Move up and Move down. */}
        {lock === "fixed" ? (
          <span aria-hidden="true" className="hidden size-touch shrink-0 sm:block" />
        ) : (
          <span
            draggable
            onDragStart={startDrag}
            onDragEnd={onDragEnd}
            aria-hidden="true"
            title={ADMIN_TEXT.sectionsHint}
            className="hidden size-touch shrink-0 cursor-grab place-items-center rounded-control text-ink-2 hover:bg-sky/15 hover:text-navy active:cursor-grabbing sm:grid"
          >
            <Pictogram name="grip" size="sm" />
          </span>
        )}
        <h3 className="min-w-0 flex-1 basis-56">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={open ? panel : undefined}
            onClick={onToggle}
            className="flex min-h-touch w-full items-center gap-3 rounded-control px-2 py-1.5 text-start hover:bg-mist"
          >
            <span className="w-5 shrink-0 text-ink-2 tabular-nums">{index + 1}</span>
            <span className="grid min-w-0 flex-1 gap-0.5">
              <span className="font-semibold">{name}</span>
              {summary ? <span className="truncate text-small text-ink-2">{summary}</span> : null}
            </span>
            <span className="shrink-0 font-semibold text-deep">{open ? ADMIN_TEXT.closeSection : ADMIN_TEXT.edit}</span>
          </button>
        </h3>
        <div className="flex flex-wrap items-center gap-2 ps-9 sm:ps-0">
          {invalid ? <StatusChip tone="error">{ADMIN_TEXT.needsAttention}</StatusChip> : null}
          {section.visible ? null : (
            <span className="inline-flex items-center gap-1.5 rounded-tag bg-rule/60 px-2 py-0.5 text-small font-semibold">
              <Pictogram name="eyeOff" size="sm" />
              {ADMIN_TEXT.hidden}
            </span>
          )}
          {lock ? (
            <span className="text-small text-ink-2">
              {lock === "fixed" ? ADMIN_TEXT.alwaysFirst : ADMIN_TEXT.pageNeedsIt}
            </span>
          ) : (
            <Button
              variant="quiet"
              pictogram={section.visible ? "eyeOff" : "eye"}
              aria-label={ADMIN_TEXT.actionOn(section.visible ? ADMIN_TEXT.hide : ADMIN_TEXT.show, name)}
              onClick={() => setValue(`sections.${index}.visible`, !section.visible, { shouldDirty: true })}
            >
              {section.visible ? ADMIN_TEXT.hide : ADMIN_TEXT.show}
            </Button>
          )}
          {lock === "fixed" ? null : (
            <ItemControls
              thing={name}
              index={index}
              count={sections.length}
              first={1}
              canRemove={lock === null}
              onMove={onMove}
              onRemove={() => setAsking(true)}
            />
          )}
        </div>
      </div>
      {open ? (
        <div id={panel} className="px-4 pt-2 pb-6 sm:ps-[6.25rem]">
          <SectionFields index={index} type={section.type} />
        </div>
      ) : null}
      <Dialog open={asking} onClose={() => setAsking(false)} title={ADMIN_TEXT.removeSectionTitle(name)}>
        <div className="grid gap-5">
          <p>{ADMIN_TEXT.removeSectionBody}</p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                setAsking(false);
                onRemove();
              }}
            >
              {ADMIN_TEXT.remove}
            </Button>
            <Button variant="secondary" onClick={() => setAsking(false)}>
              {ADMIN_TEXT.keep}
            </Button>
          </div>
        </div>
      </Dialog>
    </article>
  );
}
