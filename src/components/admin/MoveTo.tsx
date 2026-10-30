"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiMutation } from "@/lib/query/useApiMutation";

/** Where an arrival stands, and the other places it can go (plan §9.5, §10.5); a failure says so. */
export function MoveTo<S extends string>({
  current,
  statuses,
  labels,
  move,
  revalidate,
}: {
  current: S;
  statuses: readonly S[];
  labels: Record<S, string>;
  move: (status: S) => Promise<unknown>;
  revalidate: readonly string[];
}) {
  const [failure, setFailure] = useState<string | null>(null);
  const { submit, submitting } = useApiMutation(move, {
    revalidate,
    onSuccess: () => setFailure(null),
    onError: (error) => setFailure(errorMessage(error)),
  });
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">{ADMIN_TEXT.moveTo}</span>
        {statuses
          .filter((status) => status !== current)
          .map((status) => (
            <Button key={status} variant="secondary" disabled={submitting} onClick={() => submit(status)}>
              {labels[status]}
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
