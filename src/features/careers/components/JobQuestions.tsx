"use client";

import { useController, useFieldArray } from "react-hook-form";

import { EditorSelect } from "@/components/admin/editor/EditorSelect";
import { EditorText, useEditorError } from "@/components/admin/editor/EditorText";
import { ItemControls } from "@/components/admin/editor/ItemControls";
import { ListItems } from "@/components/admin/editor/RichTextField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/choice";
import { FieldError } from "@/components/ui/field";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { JOB_QUESTION_CHOICES, LIST_LIMITS, TEXT_LIMITS } from "@/constants/limits";
import { UI_TEXT } from "@/constants/messages";
import {
  APPLICATION_QUESTION_FIELDS,
  type ApplicationQuestionField,
  JOB_QUESTION_SELECTIONS,
} from "@/constants/statuses";

const SELECTION_OPTIONS = JOB_QUESTION_SELECTIONS.map(
  (selection) => [selection, ADMIN_TEXT.answerSelections[selection]] as const,
);

/** A new question, with the two choices every question needs, blank for the admin to fill. */
const blankQuestion = () => ({
  question: { en: "" },
  selection: "single",
  choices: Array.from({ length: JOB_QUESTION_CHOICES.min }, () => ({ en: "" })),
});

/**
 * A job's own application questions (D209): none, or up to ten, each with
 * its words and two to six choices, moved and removed like any list's items.
 * The admin chooses which screening questions to show and how each custom
 * question is answered (D210).
 */
export function JobQuestions() {
  const { fields, append, move, remove } = useFieldArray({ name: "questions", keyName: "key" });
  const { field: visibility } = useController({ name: "hiddenQuestions", defaultValue: [] });
  const hidden = visibility.value as ApplicationQuestionField[];
  const error = useEditorError("questions");
  return (
    <div className="grid gap-5">
      <fieldset className="grid">
        <legend className="mb-2 font-semibold">{ADMIN_TEXT.predefinedQuestions}</legend>
        <p className="text-small text-ink-2">{ADMIN_TEXT.predefinedQuestionsHint}</p>
        {APPLICATION_QUESTION_FIELDS.map((field) => (
          <div key={field}>
            {field === "experienceYears" ? <p className="mt-3 font-semibold">{UI_TEXT.experienceYears}</p> : null}
            <Checkbox
              checked={hidden.includes(field)}
              onBlur={visibility.onBlur}
              onChange={(event) =>
                visibility.onChange(
                  event.target.checked ? [...hidden, field] : hidden.filter((value) => value !== field),
                )
              }
            >
              {ADMIN_TEXT.hideQuestion(UI_TEXT[field])}
            </Checkbox>
          </div>
        ))}
      </fieldset>
      {fields.map((field, index) => {
        const title = ADMIN_TEXT.numbered(ADMIN_TEXT.question, index + 1);
        return (
          <fieldset key={field.key} className="grid gap-4">
            <legend className="sr-only">{title}</legend>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold">{title}</p>
              <ItemControls
                thing={title}
                index={index}
                count={fields.length}
                onMove={(to) => move(index, to)}
                onRemove={() => remove(index)}
              />
            </div>
            <EditorText
              name={`questions.${index}.question.en`}
              label={ADMIN_TEXT.question}
              max={TEXT_LIMITS.item}
              required
            />
            <EditorSelect
              name={`questions.${index}.selection`}
              label={ADMIN_TEXT.answerSelection}
              options={SELECTION_OPTIONS}
            />
            <ListItems
              name={`questions.${index}.choices`}
              item={ADMIN_TEXT.choice}
              min={JOB_QUESTION_CHOICES.min}
              max={JOB_QUESTION_CHOICES.max}
              maxLength={TEXT_LIMITS.heading}
              add={ADMIN_TEXT.addChoice}
            />
          </fieldset>
        );
      })}
      {error ? <FieldError>{error}</FieldError> : null}
      <Button
        type="button"
        variant="secondary"
        disabled={fields.length >= LIST_LIMITS.jobQuestions}
        onClick={() => append(blankQuestion())}
        className="justify-self-start"
      >
        {ADMIN_TEXT.addQuestion}
      </Button>
    </div>
  );
}
