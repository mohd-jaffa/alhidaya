"use client";

import useSWR, { type SWRConfiguration } from "swr";

import { fetcher } from "@/lib/api/client";

/**
 * A read from the API for an admin screen (plan §16, from clinicdesk):
 * everything a screen needs to draw its loading, failed and empty states, in
 * one object. `key` may be null while what it depends on is still unknown;
 * SWR then waits rather than fetching.
 */
export function useApiQuery<T>(key: string | null, options?: SWRConfiguration<T>) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(key, fetcher, options);
  return { data, error: error as unknown, isLoading, isValidating, mutate };
}
