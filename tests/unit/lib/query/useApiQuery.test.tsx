import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { SWRConfig } from "swr";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useApiQuery } from "@/lib/query/useApiQuery";

function wrapper({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>;
}

afterEach(() => vi.unstubAllGlobals());

describe("useApiQuery", () => {
  it("reads through the API client: the data unwrapped, a refusal as the failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        url.endsWith("/fails")
          ? Response.json({ success: false, error: { code: "NOT_FOUND", message: "Gone." } }, { status: 404 })
          : Response.json({ success: true, data: { total: 3 } }),
      ),
    );
    const read = renderHook(() => useApiQuery<{ total: number }>("/api/admin/enquiries"), { wrapper });
    expect(read.result.current.isLoading).toBe(true);
    await waitFor(() => expect(read.result.current.data).toEqual({ total: 3 }));

    const failed = renderHook(() => useApiQuery("/api/admin/fails"), { wrapper });
    await waitFor(() => expect(failed.result.current.error).toMatchObject({ code: "NOT_FOUND", message: "Gone." }));
  });

  it("waits while its key is not known yet", () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const { result } = renderHook(() => useApiQuery(null), { wrapper });
    expect(result.current.isLoading).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
});
