"use client";
"use no memo"; // Rarely redrawn: memoising it would only add to the page's JavaScript budget (plan §31).

import { type ComponentProps, type ReactNode, useId } from "react";

import { UI_TEXT } from "@/constants/messages";

import { FieldError } from "./field";

/** A box or a round to tick, filled deep blue when ticked (D130). */
const MARK =
  "mt-0.5 size-6 shrink-0 appearance-none border-2 border-ink-2 bg-ground bg-center bg-no-repeat checked:border-deep checked:bg-deep aria-invalid:border-error data-invalid:border-error";

/** A check mark drawn in the ground colour, for a ticked box. */
const TICK =
  "checked:bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12.5l4.5 4.5L19 7'/%3E%3C/svg%3E\")]";

/** A vocabulary's answers as a `RadioGroup` offers them: each value with its label, in the vocabulary's order. */
export const choiceOptions = <T extends string>(values: readonly T[], labels: Record<T, string>) =>
  values.map((value) => ({ value, label: labels[value] }));

/**
 * Single or multiple answers (plan §9.2, §10.1): a fieldset with its question
 * as the legend, each answer a tall, tappable row. The instructions and error
 * describe the group.
 */
export function ChoiceGroup({
  legend,
  name,
  options,
  error,
  required = false,
  multiple = false,
  ...props
}: {
  legend: string;
  name: string;
  options: readonly { value: string; label: string }[];
  error?: string;
  required?: boolean;
  multiple?: boolean;
} & Omit<ComponentProps<"input">, "type" | "id" | "value">) {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;
  const hintId = multiple ? `${id}-hint` : undefined;
  return (
    <fieldset aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined} className="grid gap-2">
      <legend className="mb-2 font-semibold">
        {legend}
        {required ? null : (
          <>
            {" "}
            <span className="font-normal text-ink-2">({UI_TEXT.optional})</span>
          </>
        )}
      </legend>
      {hintId ? (
        <p id={hintId} className="text-small text-ink-2">
          {UI_TEXT.selectOneOrMore}
        </p>
      ) : null}
      {options.map((option) => (
        <label key={option.value} className="flex min-h-touch cursor-pointer items-start gap-3 py-2">
          <input
            type={multiple ? "checkbox" : "radio"}
            name={name}
            value={option.value}
            required={required && !multiple}
            data-choice-list={multiple ? "" : undefined}
            data-invalid={error ? "" : undefined}
            {...props}
            className={`${MARK} ${multiple ? `${TICK} rounded-tag` : "rounded-full checked:shadow-[inset_0_0_0_4px_var(--color-ground)]"}`}
          />
          <span>{option.label}</span>
        </label>
      ))}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </fieldset>
  );
}

export function RadioGroup(props: Omit<ComponentProps<typeof ChoiceGroup>, "multiple">) {
  return <ChoiceGroup {...props} />;
}

/** A box to tick, its words beside it: the consent to the privacy notice (plan §9.2). */
export function Checkbox({
  children,
  error,
  ...props
}: { children: ReactNode; error?: string } & Omit<ComponentProps<"input">, "type" | "id">) {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="flex min-h-touch cursor-pointer items-start gap-3 py-2">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          {...props}
          className={`${MARK} ${TICK} rounded-tag`}
        />
        <span>{children}</span>
      </label>
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
