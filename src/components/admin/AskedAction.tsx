"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Notice } from "@/components/ui/notice";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiMutation } from "@/lib/query/useApiMutation";

/**
 * An action asked first (plan §16): delete, archive, restore, close or open
 * again. The dialog says what happens; `keep` is the way out, and Escape or
 * Close the same. Done, the lists it changes are refreshed and `afterwards`
 * runs with the answer; a failure says so in the dialog, and nothing changed.
 */
export function AskedAction<T>({
  label,
  title,
  body,
  keep,
  failed,
  pendingLabel = label,
  act,
  revalidate = [],
  afterwards,
  primary = false,
  danger = false,
}: {
  label: string;
  title: string;
  body: string;
  keep: string;
  /** What the failure's notice is headed. */
  failed: string;
  pendingLabel?: string;
  act: () => Promise<T>;
  revalidate?: readonly string[];
  afterwards?: (result: T) => void;
  /** The screen's main action (Publish the order), in the deep blue. */
  primary?: boolean;
  /** What cannot be undone (deleting an image, D126): in the error red, here and in the question. */
  danger?: boolean;
}) {
  const [asking, setAsking] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const { submit, submitting } = useApiMutation(act, {
    revalidate,
    onSuccess: (result) => {
      setAsking(false);
      afterwards?.(result);
    },
    onError: (error) => setFailure(errorMessage(error)),
  });
  return (
    <>
      <Button
        variant={danger ? "danger" : primary ? "primary" : "secondary"}
        onClick={() => {
          setFailure(null);
          setAsking(true);
        }}
        className="justify-self-start"
      >
        {label}
      </Button>
      <Dialog open={asking} onClose={() => setAsking(false)} title={title}>
        <div className="grid gap-5">
          <p>{body}</p>
          {failure ? (
            <Notice tone="error" title={failed}>
              {failure}
            </Notice>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button variant={danger ? "danger" : "primary"} pending={submitting} onClick={() => submit(undefined)}>
              {submitting ? pendingLabel : label}
            </Button>
            <Button variant="secondary" onClick={() => setAsking(false)}>
              {keep}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
