"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { type FieldPath, type FieldValues, useForm, type UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { PasswordInput } from "@/components/ui/password-input";
import { TextInput } from "@/components/ui/text-input";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { PASSWORD_LENGTH, TEXT_LIMITS } from "@/constants/limits";
import { ApiError } from "@/lib/api/client";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiMutation } from "@/lib/query/useApiMutation";
import {
  type ChangePasswordInput,
  type ChangePasswordPayload,
  changePasswordSchema,
  type ProfileNameInput,
  type ProfileNamePayload,
  profileNameSchema,
} from "@/lib/validation";

import { AuthClient } from "../api.client";

/** One part of the profile, on its own panel under its heading. */
function Panel({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <section className="grid gap-5 rounded-panel border border-rule p-5 sm:p-6">
      <div className="grid gap-1">
        <h2 className="text-title font-bold">{title}</h2>
        {intro ? <p className="text-ink-2">{intro}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** A refusal that names fields marks each where it is (AGENTS.md §12); answers whether it named any. */
function markRefused<T extends FieldValues>(form: UseFormReturn<T>, error: unknown): boolean {
  const fields = (error instanceof ApiError && Array.isArray(error.details) ? error.details : []) as {
    path: string;
    message: string;
  }[];
  for (const { path, message } of fields) form.setError(path as FieldPath<T>, { type: "server", message });
  return fields.length > 0;
}

/** The admin's name, and the email they sign in with, which is shown but not changed here. */
function AccountDetails({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [outcome, setOutcome] = useState<"saved" | string | null>(null);
  const form = useForm<ProfileNameInput, unknown, ProfileNamePayload>({
    resolver: zodResolver(profileNameSchema),
    defaultValues: { name },
  });
  const { submit, submitting } = useApiMutation(AuthClient.rename, {
    onSuccess: (saved) => {
      form.reset({ name: saved.name });
      setOutcome("saved");
      // The column greets the admin by the new name.
      router.refresh();
    },
    onError: (error) => setOutcome(markRefused(form, error) ? null : errorMessage(error)),
  });
  return (
    <Panel title={ADMIN_TEXT.accountDetails}>
      <dl className="grid gap-1">
        <dt className="text-small font-semibold text-ink-2">{ADMIN_TEXT.signInEmail}</dt>
        <dd className="font-semibold">{email}</dd>
        <dd className="text-small text-ink-2">{ADMIN_TEXT.signInEmailHint}</dd>
      </dl>
      <form noValidate onSubmit={form.handleSubmit((values) => submit(values))} className="grid gap-5">
        <Field label={ADMIN_TEXT.name} required error={form.formState.errors.name?.message}>
          <TextInput autoComplete="name" maxLength={TEXT_LIMITS.name} {...form.register("name")} />
        </Field>
        {outcome === "saved" && !form.formState.isDirty ? <Notice tone="success" title={ADMIN_TEXT.nameSaved} /> : null}
        {outcome && outcome !== "saved" ? (
          <Notice tone="error" title={ADMIN_TEXT.nameNotSaved}>
            {outcome}
          </Notice>
        ) : null}
        <Button type="submit" pending={submitting} disabled={!form.formState.isDirty} className="justify-self-start">
          {submitting ? ADMIN_TEXT.saving : ADMIN_TEXT.saveName}
        </Button>
      </form>
    </Panel>
  );
}

/** A new password: the current one first, then the new one twice; every other session is signed out. */
function ChangePassword() {
  const [outcome, setOutcome] = useState<"changed" | string | null>(null);
  const form = useForm<ChangePasswordInput, unknown, ChangePasswordPayload>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const { submit, submitting } = useApiMutation(AuthClient.changePassword, {
    onSuccess: () => {
      form.reset();
      setOutcome("changed");
    },
    onError: (error) => setOutcome(markRefused(form, error) ? null : errorMessage(error)),
  });
  const { errors } = form.formState;
  return (
    <Panel title={ADMIN_TEXT.changePassword} intro={ADMIN_TEXT.changePasswordIntro}>
      <form noValidate onSubmit={form.handleSubmit((values) => submit(values))} className="grid gap-5">
        <Field label={ADMIN_TEXT.currentPassword} required error={errors.currentPassword?.message}>
          <PasswordInput autoComplete="current-password" {...form.register("currentPassword")} />
        </Field>
        <Field
          label={ADMIN_TEXT.newPassword}
          hint={ADMIN_TEXT.resetHint(PASSWORD_LENGTH.min, PASSWORD_LENGTH.max)}
          required
          error={errors.newPassword?.message}
        >
          <PasswordInput autoComplete="new-password" {...form.register("newPassword")} />
        </Field>
        <Field label={ADMIN_TEXT.confirmPassword} required error={errors.confirmPassword?.message}>
          <PasswordInput autoComplete="new-password" {...form.register("confirmPassword")} />
        </Field>
        {outcome === "changed" ? <Notice tone="success" title={ADMIN_TEXT.passwordUpdated} /> : null}
        {outcome && outcome !== "changed" ? (
          <Notice tone="error" title={ADMIN_TEXT.passwordNotChanged}>
            {outcome}
          </Notice>
        ) : null}
        <Button type="submit" pending={submitting} className="justify-self-start">
          {submitting ? ADMIN_TEXT.saving : ADMIN_TEXT.savePassword}
        </Button>
      </form>
    </Panel>
  );
}

/**
 * The signed-in admin's profile (D115): their name and sign-in email, a new
 * name, and a new password, each on its own panel.
 */
export function ProfileScreen({ name, email }: { name: string; email: string }) {
  return (
    <div className="grid max-w-3xl gap-6">
      <div className="grid gap-2">
        <h1 className="text-section font-bold">{ADMIN_TEXT.profile}</h1>
        <p className="text-ink-2">{ADMIN_TEXT.profileIntro}</p>
      </div>
      <AccountDetails name={name} email={email} />
      <ChangePassword />
    </div>
  );
}
