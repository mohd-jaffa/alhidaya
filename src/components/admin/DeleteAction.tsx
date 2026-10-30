"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Notice } from "@/components/ui/notice";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiMutation } from "@/lib/query/useApiMutation";

/**
 * Delete, asked first (D82): the dialog says what goes and that it cannot
 * be undone; Keep it is the way out, and Escape or Close the same. Deleted,
 * the lists it was in are refreshed and `afterwards` runs; a failure says
 * so in the dialog, and nothing went.
 */
export function DeleteAction({
  title,
  body,
  remove,
  revalidate,
  afterwards,
}: {
  title: string;
  body: string;
  remove: () => Promise<unknown>;
  /** The lists it leaves. */
  revalidate: readonly string[];
  afterwards?: () => void;
}) {
  const [asking, setAsking] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const { submit, submitting } = useApiMutation(remove, {
    revalidate,
    onSuccess: () => {
      setAsking(false);
      afterwards?.();
    },
    onError: (error) => setFailure(errorMessage(error)),
  });
  return (
    <>
      <Button
        variant="secondary"
        onClick={() => {
          setFailure(null);
          setAsking(true);
        }}
        className="justify-self-start"
      >
        {ADMIN_TEXT.delete}
      </Button>
      <Dialog open={asking} onClose={() => setAsking(false)} title={title}>
        <div className="grid gap-5">
          <p>{body}</p>
          {failure ? (
            <Notice tone="error" title={ADMIN_TEXT.notDeleted}>
              {failure}
            </Notice>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button pending={submitting} onClick={() => submit(undefined)}>
              {submitting ? ADMIN_TEXT.deleting : ADMIN_TEXT.delete}
            </Button>
            <Button variant="secondary" onClick={() => setAsking(false)}>
              {ADMIN_TEXT.keep}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
