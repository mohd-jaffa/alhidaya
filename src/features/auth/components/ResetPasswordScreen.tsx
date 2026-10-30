"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button, ButtonLink } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { PasswordInput } from "@/components/ui/password-input";
import { PASSWORD_LENGTH } from "@/constants/limits";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES } from "@/constants/admin-routes";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiMutation } from "@/lib/query/useApiMutation";
import { type ResetPasswordInput, type ResetPasswordPayload, resetPasswordSchema } from "@/lib/validation";

import { AuthClient } from "../api.client";
import { AuthScene } from "./AuthScene";

/**
 * A new password from the emailed link (plan §26.4): the link's one-time
 * token rides along unseen. Saved, every session ends and the admin signs in
 * again; refused (the link spent or expired), they are offered a new link.
 */
export function ResetPasswordScreen({ token }: { token: string | null }) {
  const [outcome, setOutcome] = useState<{ changed: true } | { failed: string } | null>(null);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ResetPasswordInput, unknown, ResetPasswordPayload>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: token ?? "", password: "" },
  });
  const { submit, submitting } = useApiMutation(AuthClient.resetPassword, {
    onSuccess: () => setOutcome({ changed: true }),
    onError: (error) => setOutcome({ failed: errorMessage(error) }),
  });

  if (!token) {
    return (
      <AuthScene title={ADMIN_TEXT.resetTitle} aside={{ label: ADMIN_TEXT.backToSignIn, href: ADMIN_ROUTES.login }}>
        <Notice tone="info" title={ADMIN_TEXT.resetLinkMissing} />
        <ButtonLink href={ADMIN_ROUTES.forgotPassword} variant="secondary" className="justify-self-start">
          {ADMIN_TEXT.askAgain}
        </ButtonLink>
      </AuthScene>
    );
  }

  if (outcome && "changed" in outcome) {
    return (
      <AuthScene title={ADMIN_TEXT.passwordChanged} intro={ADMIN_TEXT.passwordChangedBody}>
        <ButtonLink href={ADMIN_ROUTES.login} size="lg" className="w-full">
          {ADMIN_TEXT.signIn}
        </ButtonLink>
      </AuthScene>
    );
  }

  return (
    <AuthScene title={ADMIN_TEXT.resetTitle} aside={{ label: ADMIN_TEXT.askAgain, href: ADMIN_ROUTES.forgotPassword }}>
      <form method="post" noValidate onSubmit={handleSubmit(() => submit(getValues()))} className="grid gap-6">
        <Field
          label={ADMIN_TEXT.newPassword}
          hint={ADMIN_TEXT.resetHint(PASSWORD_LENGTH.min, PASSWORD_LENGTH.max)}
          required
          error={errors.password?.message}
        >
          <PasswordInput autoComplete="new-password" {...register("password")} />
        </Field>
        {outcome ? (
          <Notice tone="error" title={ADMIN_TEXT.passwordNotChanged}>
            {outcome.failed}
          </Notice>
        ) : null}
        <Button type="submit" size="lg" pending={submitting} className="w-full">
          {submitting ? ADMIN_TEXT.saving : ADMIN_TEXT.savePassword}
        </Button>
      </form>
    </AuthScene>
  );
}
