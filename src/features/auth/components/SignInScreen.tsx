"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { PasswordInput } from "@/components/ui/password-input";
import { TextInput } from "@/components/ui/text-input";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES } from "@/constants/routes";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiMutation } from "@/lib/query/useApiMutation";
import { type SignInInput, type SignInPayload, signInSchema } from "@/lib/validation";

import { AuthClient } from "../api.client";
import { AuthScene } from "./AuthScene";

/**
 * Signing in (plan §26.4): email and password; a refusal says why in the
 * server's words (a wrong pair, or the 15-minute pause after five), and
 * nothing typed is lost. Signed in, the admin goes where they were headed.
 */
export function SignInScreen({ next }: { next: string }) {
  const router = useRouter();
  const [failure, setFailure] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SignInInput, unknown, SignInPayload>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });
  const { submit, submitting } = useApiMutation(AuthClient.signIn, {
    onSuccess: () => router.replace(next),
    onError: (error) => setFailure(errorMessage(error)),
  });

  return (
    <AuthScene
      title={ADMIN_TEXT.signInTitle}
      intro={ADMIN_TEXT.signInIntro}
      aside={{ label: ADMIN_TEXT.forgotPassword, href: ADMIN_ROUTES.forgotPassword }}
    >
      <form
        method="post"
        noValidate
        onSubmit={handleSubmit(() => {
          setFailure(null);
          return submit(getValues());
        })}
        className="grid gap-6"
      >
        <Field label={ADMIN_TEXT.email} required error={errors.email?.message}>
          <TextInput type="email" autoComplete="username" {...register("email")} />
        </Field>
        <Field label={ADMIN_TEXT.password} required error={errors.password?.message}>
          <PasswordInput autoComplete="current-password" {...register("password")} />
        </Field>
        {failure ? (
          <Notice tone="error" title={ADMIN_TEXT.notSignedIn}>
            {failure}
          </Notice>
        ) : null}
        <Button type="submit" size="lg" pending={submitting} className="w-full">
          {submitting ? ADMIN_TEXT.signingIn : ADMIN_TEXT.signIn}
        </Button>
      </form>
    </AuthScene>
  );
}
