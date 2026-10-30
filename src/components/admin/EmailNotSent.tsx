"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiMutation } from "@/lib/query/useApiMutation";

/** An email to the team that did not go (plan §9.3, §10.4), with Retry; a failed Retry says why. */
export function EmailNotSent({
  title,
  body,
  action,
  retry,
  revalidate,
}: {
  title: string;
  body: string;
  action: string;
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
      <Button variant="secondary" pending={submitting} onClick={() => submit(undefined)} className="mt-3">
        {action}
      </Button>
    </Notice>
  );
}
