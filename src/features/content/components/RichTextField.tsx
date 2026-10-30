"use client";

import { useFieldArray } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { LIST_LIMITS, TEXT_LIMITS } from "@/constants/limits";

import { EditorText, useEditorError } from "./EditorText";
import { ItemControls } from "./ItemControls";

type BlockType = "heading" | "paragraph" | "list" | "link";

const BLOCK_NAMES: Record<BlockType, string> = {
  heading: ADMIN_TEXT.blockHeading,
  paragraph: ADMIN_TEXT.blockParagraph,
  list: ADMIN_TEXT.blockList,
  link: ADMIN_TEXT.blockLink,
};

/** A new block of each kind, blank for the admin to fill. */
const BLANK: Record<BlockType, object> = {
  heading: { type: "heading", text: { en: "" } },
  paragraph: { type: "paragraph", text: { en: "" } },
  list: { type: "list", items: [{ en: "" }] },
  link: { type: "link", label: { en: "" }, href: "" },
};

const ADDS: [BlockType, string][] = [
  ["paragraph", ADMIN_TEXT.addParagraph],
  ["heading", ADMIN_TEXT.addHeading],
  ["list", ADMIN_TEXT.addList],
  ["link", ADMIN_TEXT.addLink],
];

/** A list's lines, each its own field, at least one. */
function ListItems({ name }: { name: string }) {
  const { fields, append, move, remove } = useFieldArray({ name, keyName: "key" });
  const error = useEditorError(name);
  return (
    <div className="grid gap-3">
      <ol className="grid gap-2">
        {fields.map((field, index) => {
          const thing = ADMIN_TEXT.numbered(ADMIN_TEXT.listItem, index + 1);
          return (
            <li key={field.key} className="flex items-end gap-2">
              <div className="min-w-0 flex-1">
                <EditorText
                  name={`${name}.${index}.en`}
                  label={thing}
                  max={TEXT_LIMITS.item}
                  required
                  multiline
                  rows={2}
                />
              </div>
              <ItemControls
                thing={thing}
                index={index}
                count={fields.length}
                canRemove={fields.length > 1}
                onMove={(to) => move(index, to)}
                onRemove={() => remove(index)}
              />
            </li>
          );
        })}
      </ol>
      {error ? <FieldError>{error}</FieldError> : null}
      {fields.length < LIST_LIMITS.jobPoints ? (
        <Button variant="quiet" pictogram="plus" onClick={() => append({ en: "" })} className="justify-self-start">
          {ADMIN_TEXT.addItem}
        </Button>
      ) : null}
    </div>
  );
}

/** One block's fields, by its kind; a heading's or a paragraph's label is the block's own name, in view above it. */
function BlockFields({ name, type, thing }: { name: string; type: BlockType; thing: string }) {
  switch (type) {
    case "heading":
      return <EditorText name={`${name}.text.en`} label={thing} max={TEXT_LIMITS.heading} required hideLabel />;
    case "paragraph":
      return (
        <EditorText
          name={`${name}.text.en`}
          label={thing}
          max={TEXT_LIMITS.paragraph}
          required
          multiline
          rows={4}
          hideLabel
        />
      );
    case "list":
      return <ListItems name={`${name}.items`} />;
    case "link":
      return (
        <>
          <EditorText name={`${name}.label.en`} label={ADMIN_TEXT.linkText} max={TEXT_LIMITS.label} required />
          <EditorText
            name={`${name}.href`}
            label={ADMIN_TEXT.linkAddress}
            hint={ADMIN_TEXT.linkHint}
            max={TEXT_LIMITS.url}
            required
          />
        </>
      );
  }
}

/**
 * Text block by block (plan §7.2, D90): headings, paragraphs, lists and
 * links, each its own field, added, moved and removed one at a time, exactly
 * as it is stored. No HTML is typed or kept.
 */
export function RichTextField({ name, label }: { name: string; label: string }) {
  const { fields, append, move, remove } = useFieldArray({ name, keyName: "key" });
  const error = useEditorError(name);
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-2 font-semibold">{label}</legend>
      {fields.length === 0 ? (
        <p className="text-ink-2">{ADMIN_TEXT.noBlocks}</p>
      ) : (
        <ol className="grid gap-3">
          {fields.map((field, index) => {
            // A block keeps its kind for life, so the field's copy of it is always right.
            const { type } = field as unknown as { type: BlockType };
            const thing = ADMIN_TEXT.numbered(BLOCK_NAMES[type], index + 1);
            return (
              <li key={field.key} className="grid gap-3 rounded-control border border-rule bg-ground p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-small font-bold text-ink-2">{thing}</p>
                  <ItemControls
                    thing={thing}
                    index={index}
                    count={fields.length}
                    onMove={(to) => move(index, to)}
                    onRemove={() => remove(index)}
                  />
                </div>
                <BlockFields name={`${name}.${index}`} type={type} thing={thing} />
              </li>
            );
          })}
        </ol>
      )}
      {error ? <FieldError>{error}</FieldError> : null}
      {fields.length < LIST_LIMITS.richBlocks ? (
        <div className="flex flex-wrap gap-1">
          {ADDS.map(([type, words]) => (
            <Button key={type} variant="quiet" pictogram="plus" onClick={() => append(BLANK[type])}>
              {words}
            </Button>
          ))}
        </div>
      ) : null}
    </fieldset>
  );
}
