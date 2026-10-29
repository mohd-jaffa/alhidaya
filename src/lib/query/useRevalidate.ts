"use client";

import { useCallback } from "react";
import { useSWRConfig } from "swr";

/** A cache key's route, without its query. */
const routeOf = (key: string): string => key.split("?")[0];

/**
 * Refreshes every read of some routes (from clinicdesk): searched, filtered
 * and paged ones too, whose keys carry a query a route alone would miss. A
 * route nothing has read yet is still named, so a screen opened next starts
 * fresh.
 */
export function useRevalidate() {
  const { mutate, cache } = useSWRConfig();
  return useCallback(
    async (routes: readonly string[]) => {
      const named = new Set(routes);
      const stale = [...cache.keys()].filter((key) => named.has(routeOf(key)));
      await Promise.all([...new Set([...named, ...stale])].map((key) => mutate(key)));
    },
    [mutate, cache],
  );
}
