import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import useSWR, { SWRConfig } from "swr";
import { describe, expect, it, vi } from "vitest";

import { useRevalidate } from "@/lib/query/useRevalidate";

function wrapper({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>;
}

describe("useRevalidate", () => {
  it("refreshes every read of the routes named, searched ones too, and nothing else", async () => {
    const fetcher = vi.fn(async (key: string) => key);
    const { result } = renderHook(
      () => {
        useSWR("/api/admin/enquiries", fetcher);
        useSWR("/api/admin/enquiries?needsYou=true", fetcher);
        useSWR("/api/admin/enquiries/e-1", fetcher);
        return useRevalidate();
      },
      { wrapper },
    );
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(3));
    fetcher.mockClear();
    await act(async () => {
      await result.current(["/api/admin/enquiries", "/api/admin/never-read"]);
    });
    expect(fetcher.mock.calls.map(([key]) => key).toSorted()).toEqual([
      "/api/admin/enquiries",
      "/api/admin/enquiries?needsYou=true",
    ]);
  });
});
