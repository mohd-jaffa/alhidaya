"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type * as z from "zod";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { TextArea } from "@/components/ui/text-input";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { TEXT_LIMITS } from "@/constants/limits";
import { dohaDateTime } from "@/lib/dates";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiMutation } from "@/lib/query/useApiMutation";

type NoteSchema = z.ZodType<{ body: string }, { body: string }>;

/** The team's notes on an arrival, oldest first, each by its admin, and a new one (plan §9.5, §10.5). */
export function TeamNotes({
  id,
  notes,
  schema,
  add,
  revalidate,
}: {
  id: string;
  notes: readonly { id: string; body: string; author: string | null; createdAt: string }[];
  /** The note's schema, from src/lib/validation. */
  schema: NoteSchema;
  add: (body: string) => Promise<unknown>;
  revalidate: readonly string[];
}) {
  const [failure, setFailure] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ body: string }>({ resolver: zodResolver(schema), defaultValues: { body: "" } });
  const { submit, submitting } = useApiMutation(add, {
    revalidate,
    onSuccess: () => {
      setFailure(null);
      reset();
    },
    onError: (error) => setFailure(errorMessage(error)),
  });
  return (
    <section className="grid gap-3" aria-labelledby={`notes-${id}`}>
      <h4 id={`notes-${id}`} className="font-bold">
        {ADMIN_TEXT.notes}
      </h4>
      {notes.length === 0 ? (
        <p className="text-ink-2">{ADMIN_TEXT.noNotes}</p>
      ) : (
        <ul className="grid gap-2">
          {notes.map((note) => {
            const when = dohaDateTime(new Date(note.createdAt));
            return (
              <li key={note.id} className="rounded-panel bg-ground p-3">
                <p className="whitespace-pre-line break-words">{note.body}</p>
                <p className="mt-1 text-small text-ink-2">
                  {note.author ? ADMIN_TEXT.noteBy(note.author, when) : when}
                </p>
              </li>
            );
          })}
        </ul>
      )}
      <form method="post" noValidate onSubmit={handleSubmit(({ body }) => submit(body))} className="grid gap-3">
        <Field label={ADMIN_TEXT.addNote} required error={errors.body?.message}>
          <TextArea rows={3} maxLength={TEXT_LIMITS.note} {...register("body")} />
        </Field>
        {failure ? (
          <Notice tone="error" title={ADMIN_TEXT.noteNotSaved}>
            {failure}
          </Notice>
        ) : null}
        <Button type="submit" variant="secondary" pending={submitting} className="justify-self-start">
          {ADMIN_TEXT.saveNote}
        </Button>
      </form>
    </section>
  );
}
