"use client";

import { useFormContext } from "react-hook-form";

import { Field } from "@/components/ui/field";
import { Pictogram } from "@/components/ui/pictogram";
import { Select } from "@/components/ui/select";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import type { SectionType } from "@/constants/sections";
import { PAGE_NAMES } from "@/constants/messages";
import { FORM_KINDS } from "@/constants/statuses";

import { SECTION_FIELDS } from "../editor";
import { EditorText } from "./EditorText";
import { PhotoField } from "./PhotoField";
import { RichTextField } from "./RichTextField";
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

/**
 * A section opened in its row (D88): its type's fields in order, and what it
 * shows on its own besides them (the services, the jobs, the contact
 * details), so the admin knows where those are changed.
 */
export function SectionFields({ index, type }: { index: number; type: SectionType }) {
  const shows = ADMIN_TEXT.sectionShows[type];
  return (
    <div className="grid gap-5">
      {shows ? (
        <p className="flex items-start gap-2 text-ink-2">
          <Pictogram name="info" size="sm" className="mt-0.5 text-deep" />
          <span>{shows}</span>
        </p>
      ) : null}
      {SECTION_FIELDS[type].map((field) => {
        const name = `sections.${index}.content.${field.name}`;
        switch (field.kind) {
          case "line":
          case "lines":
            return (
              <EditorText
                key={field.name}
                name={`${name}.en`}
                label={field.label}
                max={field.max}
                required={field.required}
                multiline={field.kind === "lines"}
              />
            );
          case "photo":
            return <PhotoField key={field.name} name={name} label={field.label} />;
          case "rich":
            return <RichTextField key={field.name} name={name} label={field.label} />;
          case "values":
            return <ValuesField key={field.name} name={name} label={field.label} />;
          case "form":
            return <FormChoice key={field.name} name={name} label={field.label} />;
        }
      })}
    </div>
  );
}
