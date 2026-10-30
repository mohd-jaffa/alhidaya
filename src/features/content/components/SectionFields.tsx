"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { EditorText, useEditorError } from "@/components/admin/editor/EditorText";
import { ItemControls } from "@/components/admin/editor/ItemControls";
import { PhotoField } from "@/components/admin/editor/PhotoField";
import { RichTextField } from "@/components/admin/editor/RichTextField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/choice";
import { Field, FieldError } from "@/components/ui/field";
import { Pictogram } from "@/components/ui/pictogram";
import { Select } from "@/components/ui/select";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { PAGE_NAMES } from "@/constants/messages";
import { type PageKey, SECTION_PICTOGRAMS, type SectionType } from "@/constants/sections";
import { FORM_KINDS } from "@/constants/statuses";

import { blankItem, type SectionField, sectionFields } from "../editor";
import { ValuesField } from "./ValuesField";

/** Which of the two forms a form section shows (plan §7.2), each named as the page it belongs to. */
function FormChoice({ name, label }: { name: string; label: string }) {
  const { register } = useFormContext();
  return (
    <Field label={label} required>
      <Select {...register(name)}>
        {FORM_KINDS.map((kind) => (
          <option key={kind} value={kind}>
            {PAGE_NAMES[kind]}
          </option>
        ))}
      </Select>
    </Field>
  );
}

/** The icon beside some words (D97), picked from the set by name, or none. */
function PictogramChoice({ name, label }: { name: string; label: string }) {
  const { register } = useFormContext();
  return (
    <Field label={label}>
      <Select {...register(name, { setValueAs: (value: string | null) => value || null })}>
        <option value="">{ADMIN_TEXT.noIcon}</option>
        {SECTION_PICTOGRAMS.map((pictogram) => (
          <option key={pictogram} value={pictogram}>
            {ADMIN_TEXT.pictogramNames[pictogram]}
          </option>
        ))}
      </Select>
    </Field>
  );
}

/** A yes or no about some words: a statement's darker phrases (D97). */
function Toggle({ name, label }: { name: string; label: string }) {
  const { register } = useFormContext();
  return <Checkbox {...register(name)}>{label}</Checkbox>;
}

/**
 * Faces in a group (D97): each a photo from the library, in order, up to
 * `max`. A face just added waits empty for its photo, so the group keeps its
 * own list rather than React Hook Form's (whose items must be objects).
 */
function FacesField({ name, label, max }: { name: string; label: string; max: number }) {
  const { setValue } = useFormContext();
  const faces = (useWatch({ name }) as ({ mediaId: string } | null)[] | undefined) ?? [];
  const error = useEditorError(name);
  const change = (next: ({ mediaId: string } | null)[]) => setValue(name, next, { shouldDirty: true });
  const move = (from: number, to: number) => {
    const next = [...faces];
    const [face] = next.splice(from, 1);
    next.splice(to, 0, face);
    change(next);
  };
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-2 font-semibold">{label}</legend>
      <ol className="grid gap-3 sm:grid-cols-2">
        {faces.map((_, index) => {
          const thing = ADMIN_TEXT.numbered(ADMIN_TEXT.face, index + 1);
          return (
            <li key={index} className="grid gap-3 rounded-control border border-rule bg-ground p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-small font-bold text-ink-2">{thing}</p>
                <ItemControls
                  thing={thing}
                  index={index}
                  count={faces.length}
                  onMove={(to) => move(index, to)}
                  onRemove={() => change(faces.filter((__, at) => at !== index))}
                />
              </div>
              <PhotoField name={`${name}.${index}`} label={thing} required />
            </li>
          );
        })}
      </ol>
      {error ? <FieldError>{error}</FieldError> : null}
      {faces.length < max ? (
        <Button
          variant="quiet"
          pictogram="plus"
          onClick={() => change([...faces, null])}
          className="justify-self-start"
        >
          {ADMIN_TEXT.addFace}
        </Button>
      ) : null}
    </fieldset>
  );
}

/** A list of items (D100), each holding its own fields: a statement's phrases, figures, features, steps. */
function ListField({
  page,
  name,
  field,
}: {
  page: PageKey;
  name: string;
  field: Extract<SectionField, { kind: "list" }>;
}) {
  const { fields, append, move, remove } = useFieldArray({ name, keyName: "key" });
  const error = useEditorError(name);
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-2 font-semibold">{field.label}</legend>
      <ol className="grid gap-3">
        {fields.map((item, index) => {
          const thing = ADMIN_TEXT.numbered(field.item, index + 1);
          return (
            <li key={item.key} className="grid gap-4 rounded-control border border-rule bg-ground p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-small font-bold text-ink-2">{thing}</p>
                <ItemControls
                  thing={thing}
                  index={index}
                  count={fields.length}
                  canRemove={fields.length > field.min}
                  onMove={(to) => move(index, to)}
                  onRemove={() => remove(index)}
                />
              </div>
              <Fields page={page} base={`${name}.${index}`} fields={field.fields} />
            </li>
          );
        })}
      </ol>
      {error ? <FieldError>{error}</FieldError> : null}
      {fields.length < field.max ? (
        <Button
          variant="quiet"
          pictogram="plus"
          onClick={() => append(blankItem(page, field.fields))}
          className="justify-self-start"
        >
          {field.add}
        </Button>
      ) : null}
    </fieldset>
  );
}

/** Fields at `base`: each named from it, or, when its name is empty, the value at `base` itself. */
function Fields({ page, base, fields }: { page: PageKey; base: string; fields: readonly SectionField[] }) {
  return fields.map((field) => {
    const name = field.name ? `${base}.${field.name}` : base;
    switch (field.kind) {
      case "line":
      case "lines":
        return (
          <EditorText
            key={name}
            name={`${name}.en`}
            label={field.label}
            max={field.max}
            required={field.required}
            multiline={field.kind === "lines"}
            hint={field.hint}
          />
        );
      case "photo":
        return <PhotoField key={name} name={name} label={field.label} />;
      case "rich":
        return <RichTextField key={name} name={name} label={field.label} />;
      case "values":
        return <ValuesField key={name} name={name} label={field.label} />;
      case "form":
        return <FormChoice key={name} name={name} label={field.label} />;
      case "pictogram":
        return <PictogramChoice key={name} name={name} label={field.label} />;
      case "toggle":
        return <Toggle key={name} name={name} label={field.label} />;
      case "faces":
        return <FacesField key={name} name={name} label={field.label} max={field.max} />;
      case "group":
        return (
          <fieldset key={name} className="grid gap-4 rounded-control border border-rule p-4">
            <legend className="px-1 font-semibold">{field.label}</legend>
            <Fields page={page} base={name} fields={field.fields} />
          </fieldset>
        );
      case "list":
        return <ListField key={name} page={page} name={name} field={field} />;
    }
  });
}

/**
 * A section opened in its row (D88): its type's fields in order (Home's sign
 * with its hero's besides, D97), and what it shows on its own besides them
 * (the services, the jobs, the contact details), so the admin knows where
 * those are changed.
 */
export function SectionFields({ page, index, type }: { page: PageKey; index: number; type: SectionType }) {
  const shows = ADMIN_TEXT.sectionShows[type];
  return (
    <div className="grid gap-5">
      {shows ? (
        <p className="flex items-start gap-2 text-ink-2">
          <Pictogram name="info" size="sm" className="mt-0.5 text-deep" />
          <span>{shows}</span>
        </p>
      ) : null}
      <Fields page={page} base={`sections.${index}.content`} fields={sectionFields(page, type)} />
    </div>
  );
}
