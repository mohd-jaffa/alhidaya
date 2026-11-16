"use client";

import { type FocusEvent, type FormEvent, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { ZodType } from "zod";

import { ERROR_MESSAGES } from "@/constants/messages";
import { ApiError } from "@/lib/api/client";

export type FormStatus = "editing" | "sending" | "sent" | "failed";
export type FieldErrors = Partial<Record<string, string>>;

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const isControl = (element: Element): element is Control =>
  element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement;

/** The field an event came from; anything else (the send action, a link) has no name. */
const fieldName = (target: EventTarget): string => (target instanceof Element && isControl(target) ? target.name : "");

/**
 * What a form holds, by field name: a box as ticked or not, a group of
 * choices as the one chosen or the list of checked options, a file as the one
 * picked (or null).
 */
function formValues(form: HTMLFormElement): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const element of form.elements) {
    if (!isControl(element) || !element.name) continue;
    if (element.type === "checkbox") {
      const checked = (element as HTMLInputElement).checked;
      if (element.hasAttribute("data-choice-list")) {
        if (checked) ((values[element.name] ??= []) as string[]).push(element.value);
      } else values[element.name] = checked;
    } else if (element.type === "file") values[element.name] = (element as HTMLInputElement).files?.[0] ?? null;
    else if (element.type !== "radio" || (element as HTMLInputElement).checked) values[element.name] = element.value;
  }
  return values;
}

/** The first problem with each field, from the schema's issues or the route's refusal ("service" or ["service"]). */
function byField(issues: readonly { path: string | readonly PropertyKey[]; message: string }[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const { path, message } of issues) {
    const name = String(typeof path === "string" ? path.split(".")[0] : path[0]);
    errors[name] ??= message;
  }
  return errors;
}

/** The fields the route named in a refusal, as the form names them; anything else is not the visitor's to fix. */
function refusedFields(failure: ApiError, form: HTMLFormElement): FieldErrors {
  if (!Array.isArray(failure.details)) return {};
  const names = new Set([...form.elements].filter(isControl).map((control) => control.name));
  return Object.fromEntries(Object.entries(byField(failure.details)).filter(([name]) => names.has(name)));
}

function focusFirst(form: HTMLFormElement, errors: FieldErrors) {
  const first = [...form.elements].find((element): element is Control => isControl(element) && element.name in errors);
  first?.focus();
}

/**
 * A public form checked by its schema (AGENTS.md §12) without carrying Zod in
 * the page's first load (plan §31, Q43): the schema is fetched when the
 * visitor first reaches into the form, long before they send it. The fields
 * are the browser's own, so nothing typed is lost on a mistake or a failure
 * (plan §30.3). A mistake shows beside its field and the first takes focus;
 * after a first attempt, a field is checked again as it changes (a fixed one
 * clears at once) and as it is left.
 */
export function useSchemaForm({
  schema,
  send,
}: {
  /** Loads the form's schema; called once, again only if it failed. */
  schema: () => Promise<ZodType>;
  send: (values: Record<string, unknown>) => Promise<unknown>;
}) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<FormStatus>("editing");
  const [failure, setFailure] = useState<ApiError | null>(null);
  /** How many sends the server has answered: a one-time token in the form (Turnstile's) is spent by each. */
  const [answered, setAnswered] = useState(0);
  const loading = useRef<Promise<ZodType> | null>(null);
  const tried = useRef(false);
  const submitting = useRef(false);

  function load(): Promise<ZodType> {
    loading.current ??= schema().catch((error: unknown) => {
      loading.current = null;
      throw error;
    });
    return loading.current;
  }

  function fail(error: unknown) {
    setFailure(
      error instanceof ApiError ? error : new ApiError(0, "NETWORK_UNREACHABLE", ERROR_MESSAGES.NETWORK_UNREACHABLE),
    );
    setStatus("failed");
  }

  function showErrors(form: HTMLFormElement, found: FieldErrors) {
    flushSync(() => {
      setErrors(found);
      setStatus("editing");
    });
    focusFirst(form, found);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || status === "sent") return;
    submitting.current = true;
    setFailure(null);
    setStatus("sending");
    try {
      const form = event.currentTarget;
      tried.current = true;
      const values = formValues(form);
      let check: ZodType;
      try {
        check = await load();
      } catch (error) {
        fail(error);
        return;
      }
      const result = check.safeParse(values);
      if (!result.success) return showErrors(form, byField(result.error.issues));

      setErrors({});
      try {
        await send(values);
        setStatus("sent");
      } catch (error) {
        const refused = error instanceof ApiError ? refusedFields(error, form) : {};
        if (Object.keys(refused).length > 0) {
          showErrors(form, refused);
          // A field the server could not take (a CV not saved, D84) is said above the send action too.
          if ((error as ApiError).code === "VALIDATION_ERROR") return;
        }
        fail(error);
      } finally {
        setAnswered((count) => count + 1);
      }
    } finally {
      submitting.current = false;
    }
  }

  /** Checks one field again once the form was tried: `add` shows a new problem, otherwise one is only kept or cleared. */
  function recheck(form: HTMLFormElement, name: string, add: boolean) {
    if (!tried.current || !name) return;
    load()
      .then((check) => {
        const result = check.safeParse(formValues(form));
        const message = result.success ? undefined : byField(result.error.issues)[name];
        setErrors((current) => {
          if (!message) {
            if (!(name in current)) return current;
            const rest = { ...current };
            delete rest[name];
            return rest;
          }
          return add || name in current ? { ...current, [name]: message } : current;
        });
      })
      .catch(() => {});
  }

  return {
    form: {
      noValidate: true,
      // Before the page's script runs, a sent form keeps its words out of the address.
      method: "post",
      onSubmit,
      onFocus: () => void load().catch(() => {}),
      onChange: (event: FormEvent<HTMLFormElement>) => recheck(event.currentTarget, fieldName(event.target), false),
      onBlur: (event: FocusEvent<HTMLFormElement>) => recheck(event.currentTarget, fieldName(event.target), true),
    },
    errors,
    status,
    failure,
    answered,
  };
}
