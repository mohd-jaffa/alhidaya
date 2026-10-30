"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { TextInput } from "@/components/ui/text-input";
import { PASSWORD_RESET_MINUTES } from "@/constants/limits";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES } from "@/constants/admin-routes";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiMutation } from "@/lib/query/useApiMutation";
import { type ForgotPasswordInput, type ForgotPasswordPayload, forgotPasswordSchema } from "@/lib/validation";

import { AuthClient } from "../api.client";
import { AuthScene } from "./AuthScene";

/**
 * A link to choose a new password (plan §26.4), to the email typed. The
 * answer is the same whether or not it is the admin's, so this page can
 * never tell anyone who the admin is.
 */
export function ForgotPasswordScreen() {
  const [outcome, setOutcome] = useState<{ sent: true } | { failed: string } | null>(null);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordInput, unknown, ForgotPasswordPayload>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const { submit, submitting } = useApiMutation(AuthClient.requestReset, {
    onSuccess: () => setOutcome({ sent: true }),
    onError: (error) => setOutcome({ failed: errorMessage(error) }),
  });

  return (
    <AuthScene
      title={ADMIN_TEXT.forgotTitle}
      intro={ADMIN_TEXT.forgotIntro}
      aside={{ label: ADMIN_TEXT.backToSignIn, href: ADMIN_ROUTES.login }}
    >
      {outcome && "sent" in outcome ? (
        <Notice tone="success" title={ADMIN_TEXT.linkSent}>
          {ADMIN_TEXT.linkSentBody(PASSWORD_RESET_MINUTES)}
        </Notice>
      ) : (
        <form method="post" noValidate onSubmit={handleSubmit(() => submit(getValues()))} className="grid gap-6">
          <Field label={ADMIN_TEXT.email} required error={errors.email?.message}>
            <TextInput type="email" autoComplete="username" {...register("email")} />
          </Field>
          {outcome ? (
            <Notice tone="error" title={ADMIN_TEXT.linkNotSent}>
              {outcome.failed}
            </Notice>
          ) : null}
          <Button type="submit" size="lg" pending={submitting} className="w-full">
            {submitting ? ADMIN_TEXT.sending : ADMIN_TEXT.sendLink}
          </Button>
        </form>
      )}
    </AuthScene>
  );
}
