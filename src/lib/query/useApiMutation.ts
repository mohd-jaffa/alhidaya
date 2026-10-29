"use client";

import { useCallback, useState } from "react";

import { useRevalidate } from "./useRevalidate";

/**
 * A write to the API (from clinicdesk), with what every form around one
 * keeps: whether it is in flight, and which routes it makes stale, refreshed
 * once it worked. What happened is the caller's to say: `onSuccess` gets the
 * result, `onError` the failure.
 */
export function useApiMutation<TInput, TResult>(
  run: (input: TInput) => Promise<TResult>,
  options: {
    revalidate?: readonly string[];
    onSuccess?: (result: TResult) => void;
    onError?: (failure: unknown) => void;
  } = {},
) {
  const refresh = useRevalidate();
  const [submitting, setSubmitting] = useState(false);
  const { revalidate, onSuccess, onError } = options;

  const submit = useCallback(
    async (input: TInput): Promise<TResult | undefined> => {
      setSubmitting(true);
      try {
        const result = await run(input);
        await refresh(revalidate ?? []);
        onSuccess?.(result);
        return result;
      } catch (failure) {
        onError?.(failure);
        return undefined;
      } finally {
        setSubmitting(false);
      }
    },
    [run, revalidate, onSuccess, onError, refresh],
  );

  return { submit, submitting };
}
