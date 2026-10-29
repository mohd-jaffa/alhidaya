"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button, ButtonLink } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { TextArea } from "@/components/ui/text-input";
import { TEXT_LIMITS } from "@/constants/limits";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { API_ROUTES } from "@/constants/routes";
import { ENQUIRY_STATUS_LABELS, ENQUIRY_STATUSES } from "@/constants/statuses";
import { mailtoHref, telHref, whatsappHref } from "@/lib/contact";
import { dohaDateTime } from "@/lib/dates";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiMutation } from "@/lib/query/useApiMutation";
import { useApiQuery } from "@/lib/query/useApiQuery";
import { type EnquiryNoteInput, type EnquiryNotePayload, enquiryNoteSchema } from "@/lib/validation";

import { EnquiriesClient } from "../api.client";
import type { EnquiryOpened as Opened } from "../types";

/**
 * An enquiry opened in its row (plan §10.5, R6.1): every answer as the
 * visitor gave it, the ways to answer them, where it stands and the team's
 * notes, all in place. A change refreshes the lists it belongs to.
 */
export function EnquiryOpened({ id }: { id: string }) {
  const { data, error, isLoading, mutate } = useApiQuery<Opened>(API_ROUTES.adminEnquiry(id));
  if (error) {
    return (
      <Notice tone="error" title={ADMIN_TEXT.loadFailed}>
        <p>{errorMessage(error)}</p>
        <Button variant="secondary" onClick={() => mutate()} className="mt-3">
          {ADMIN_TEXT.tryAgain}
        </Button>
      </Notice>
    );
  }
  if (isLoading || !data) return <p aria-busy="true" className="h-40 animate-pulse rounded-panel bg-rule/40" />;
  return (
    <div className="grid gap-6">
      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {data.fields.map((field) => (
          <div key={field.label} className={field.value.length > 80 ? "sm:col-span-2" : undefined}>
            <dt className="text-small font-semibold text-ink-2">{field.label}</dt>
            <dd className="whitespace-pre-line break-words">{field.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap gap-2">
        <ButtonLink href={telHref(data.phone)} pictogram="phone">
          {ADMIN_TEXT.call}
        </ButtonLink>
        <ButtonLink href={whatsappHref(data.phone)} variant="secondary" pictogram="chat">
          {ADMIN_TEXT.whatsapp}
        </ButtonLink>
        <ButtonLink href={mailtoHref(data.email)} variant="secondary" pictogram="mail">
          {ADMIN_TEXT.emailAction}
        </ButtonLink>
      </div>
      <Moves enquiry={data} />
      {data.emailStatus === "NOT_SENT" ? <AlertNotSent id={data.id} /> : null}
      <Notes enquiry={data} />
    </div>
  );
}

/** The routes an enquiry's change makes stale: the lists, and the enquiry itself. */
const stale = (id: string) => [API_ROUTES.adminEnquiries, API_ROUTES.adminEnquiry(id)];

/** Where it stands, and the other places it can go. */
function Moves({ enquiry }: { enquiry: Opened }) {
  const [failure, setFailure] = useState<string | null>(null);
  const { submit, submitting } = useApiMutation(EnquiriesClient.setStatus, {
    revalidate: stale(enquiry.id),
    onSuccess: () => setFailure(null),
    onError: (error) => setFailure(errorMessage(error)),
  });
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">{ADMIN_TEXT.moveTo}</span>
        {ENQUIRY_STATUSES.filter((status) => status !== enquiry.status).map((status) => (
          <Button
            key={status}
            variant="secondary"
            disabled={submitting}
            onClick={() => submit({ id: enquiry.id, status })}
          >
            {ENQUIRY_STATUS_LABELS[status]}
          </Button>
        ))}
      </div>
      {failure ? (
        <Notice tone="error" title={ADMIN_TEXT.statusNotChanged}>
          {failure}
        </Notice>
      ) : null}
    </div>
  );
}

/** The alert email that did not go (plan §10.4), with Retry. */
function AlertNotSent({ id }: { id: string }) {
  const [failure, setFailure] = useState<string | null>(null);
  const { submit, submitting } = useApiMutation(EnquiriesClient.retryAlert, {
    revalidate: stale(id),
    onError: (error) => setFailure(errorMessage(error)),
  });
  return (
    <Notice tone="error" title={ADMIN_TEXT.alertNotSent}>
      <p>{failure ?? ADMIN_TEXT.alertNotSentBody}</p>
      <Button variant="secondary" pending={submitting} onClick={() => submit(id)} className="mt-3">
        {ADMIN_TEXT.retryAlert}
      </Button>
    </Notice>
  );
}

/** The team's notes, oldest first, and a new one. */
function Notes({ enquiry }: { enquiry: Opened }) {
  const [failure, setFailure] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<EnquiryNoteInput, unknown, EnquiryNotePayload>({
    resolver: zodResolver(enquiryNoteSchema),
    defaultValues: { body: "" },
  });
  const { submit, submitting } = useApiMutation(EnquiriesClient.addNote, {
    revalidate: [API_ROUTES.adminEnquiry(enquiry.id)],
    onSuccess: () => {
      setFailure(null);
      reset();
    },
    onError: (error) => setFailure(errorMessage(error)),
  });
  return (
    <section className="grid gap-3" aria-labelledby={`notes-${enquiry.id}`}>
      <h4 id={`notes-${enquiry.id}`} className="font-bold">
        {ADMIN_TEXT.notes}
      </h4>
      {enquiry.notes.length === 0 ? (
        <p className="text-ink-2">{ADMIN_TEXT.noNotes}</p>
      ) : (
        <ul className="grid gap-2">
          {enquiry.notes.map((note) => {
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
      <form
        method="post"
        noValidate
        onSubmit={handleSubmit(() => submit({ id: enquiry.id, body: getValues().body }))}
        className="grid gap-3"
      >
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
