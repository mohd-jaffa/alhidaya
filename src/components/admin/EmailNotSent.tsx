"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { MAIL_RETRIES } from "@/constants/limits";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiMutation } from "@/lib/query/useApiMutation";

/**
 * An email to the team that did not go (plan §9.3, §10.4), with Retry; a
 * failed Retry says why. It says too whether the website is still sending
 * it again on its own, or has stopped after its tries (D85).
 */
export function EmailNotSent({
  title,
  body,
  action,
  retries,
  retry,
  revalidate,
}: {
  title: string;
  body: string;
  action: string;
  /** How often the mail-retry cron has sent it again. */
  retries: number;
  retry: () => Promise<unknown>;
  revalidate: readonly string[];
}) {
  const [failure, setFailure] = useState<string | null>(null);
  const { submit, submitting } = useApiMutation(retry, {
    revalidate,
    onError: (error) => setFailure(errorMessage(error)),
  });
  return (
    <Notice tone="error" title={title}>
      <p>{failure ?? body}</p>
      <p className="text-small">
        {retries < MAIL_RETRIES.tries ? ADMIN_TEXT.emailRetrying(retries) : ADMIN_TEXT.emailRetriesDone}
      </p>
      <Button variant="secondary" pending={submitting} onClick={() => submit(undefined)} className="mt-3">
        {action}
      </Button>
    </Notice>
  );
}
