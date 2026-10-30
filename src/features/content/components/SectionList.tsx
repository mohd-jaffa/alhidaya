"use client";

import { useState } from "react";
import { useFieldArray, useWatch } from "react-hook-form";

import { DropLine, useDragOrder } from "@/components/admin/editor/DragOrder";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { ADMIN_TEXT, SECTION_NAMES } from "@/constants/admin-messages";
import type { PageKey, SectionType } from "@/constants/sections";
import type { PageDocumentInput } from "@/lib/validation";

import { addableTypes, blankSection } from "../editor";
import { SectionRow } from "./SectionRow";

/** Add a section (D87): only what the page can still hold; it goes at the end, opened. */
function AddSection({ page, onAdd }: { page: PageKey; onAdd: (type: SectionType) => void }) {
  const types = useWatch<PageDocumentInput, "sections">({ name: "sections" }).map((section) => section.type);
  const addable = addableTypes(page, types);
  const [picked, setPicked] = useState("");
  if (addable.length === 0) return null;
  const type = addable.find((candidate) => candidate === picked);
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-full sm:w-80">
        <Field label={ADMIN_TEXT.addSection} hint={ADMIN_TEXT.addSectionHint} markOptional={false}>
          <Select value={type ?? ""} onChange={(event) => setPicked(event.target.value)}>
            <option value="">{ADMIN_TEXT.chooseKind}</option>
            {addable.map((candidate) => (
              <option key={candidate} value={candidate}>
                {SECTION_NAMES[candidate]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Button
        variant="secondary"
        pictogram="plus"
        disabled={!type}
        onClick={() => {
          onAdd(type!);
          setPicked("");
        }}
      >
        {ADMIN_TEXT.add}
      </Button>
    </div>
  );
}

/**
 * A page's sections in order (D88, D90): dragged by their handles with the
 * browser's own drag and drop, the sky line marking where one will land, or
 * moved with Move up and Move down; each move is said aloud. Nothing can go
 * above the sign.
 */
export function SectionList({
  page,
  openId,
  onOpen,
}: {
  page: PageKey;
  openId: string | null;
  onOpen: (id: string | null) => void;
}) {
  const { fields, append, move, remove } = useFieldArray<PageDocumentInput, "sections", "key">({
    name: "sections",
    keyName: "key",
  });
  const [said, setSaid] = useState("");

  const moveTo = (index: number, to: number) => {
    move(index, to);
    setSaid(ADMIN_TEXT.movedTo(SECTION_NAMES[fields[index].type], to + 1, fields.length));
  };
  const drag = useDragOrder({ first: 1, onMove: moveTo });

  return (
    <div className="grid gap-6">
      <ol className="grid gap-1">
        {fields.map((field, index) => (
          <li key={field.key} className="relative" {...drag.target(index)}>
            <DropLine side={drag.lineAt(index)} />
            <SectionRow
              page={page}
              index={index}
              open={openId === field.id}
              onToggle={() => onOpen(openId === field.id ? null : field.id)}
              onMove={(to) => moveTo(index, to)}
              onRemove={() => remove(index)}
              onDragStart={() => drag.start(index)}
              onDragEnd={drag.end}
            />
          </li>
        ))}
      </ol>
      <p aria-live="polite" className="sr-only">
        {said}
      </p>
      <AddSection
        page={page}
        onAdd={(type) => {
          const section = blankSection(page, type);
          append(section, { shouldFocus: false });
          onOpen(section.id);
        }}
      />
    </div>
  );
}
