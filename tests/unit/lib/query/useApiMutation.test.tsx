import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import useSWR, { SWRConfig } from "swr";
import { describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/client";
import { useApiMutation } from "@/lib/query/useApiMutation";

function wrapper({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>;
}

describe("useApiMutation", () => {
  it("locks immediately against concurrent submits and allows another operation once it finishes", async () => {
    let finish!: (value: string) => void;
    const run = vi
      .fn<() => Promise<string>>()
      .mockImplementationOnce(() => new Promise<string>((resolve) => (finish = resolve)))
      .mockResolvedValue("next");
    const { result } = renderHook(() => useApiMutation(run), { wrapper });
    let first!: Promise<string | undefined>;
    let duplicate!: Promise<string | undefined>;
    act(() => {
      first = result.current.submit(undefined);
      duplicate = result.current.submit(undefined);
    });
    expect(run).toHaveBeenCalledOnce();
    await expect(duplicate).resolves.toBeUndefined();
    await act(async () => {
      finish("saved");
      await first;
    });
    await act(async () => {
      expect(await result.current.submit(undefined)).toBe("next");
    });
    expect(run).toHaveBeenCalledTimes(2);
  });
  it("hands back what came back and tells the caller it worked", async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const run = vi.fn().mockResolvedValue({ id: "n-1" });
    const { result } = renderHook(() => useApiMutation(run, { onSuccess, onError }), { wrapper });
    expect(result.current.submitting).toBe(false);

    let returned: unknown;
    await act(async () => {
      returned = await result.current.submit({ body: "Called back." });
    });
    expect(run).toHaveBeenCalledWith({ body: "Called back." });
    expect(returned).toEqual({ id: "n-1" });
    expect(onSuccess).toHaveBeenCalledWith({ id: "n-1" });
    expect(onError).not.toHaveBeenCalled();
  });

  it("hands a refusal to the caller to report, returns nothing, and is never left submitting", async () => {
    const refusal = new ApiError(429, "AUTH_LOCKED", "Too many attempts.", "req_1");
    const onError = vi.fn();
    const { result } = renderHook(
      () =>
        useApiMutation(
          vi.fn(() => Promise.reject(refusal)),
          { onError },
        ),
      {
        wrapper,
      },
    );
    let returned: unknown = "unset";
    await act(async () => {
      returned = await result.current.submit(undefined);
    });
    expect(onError).toHaveBeenCalledWith(refusal);
    expect(returned).toBeUndefined();
    expect(result.current.submitting).toBe(false);

    const { result: unheard } = renderHook(() => useApiMutation(vi.fn(() => Promise.reject(new Error("nope")))), {
      wrapper,
    });
    await act(async () => {
      await unheard.current.submit(undefined);
    });
    expect(unheard.current.submitting).toBe(false);
  });

  it("refreshes every read of the routes it made stale, then says it worked", async () => {
    const reads: string[] = [];
    const fetcher = vi.fn(async (key: string) => {
      reads.push(key);
      return [];
    });
    const order: string[] = [];
    const { result } = renderHook(
      () => {
        useSWR("/api/admin/enquiries?status=NEW");
        useSWR("/api/admin/settings");
        return useApiMutation(vi.fn().mockResolvedValue("ok"), {
          revalidate: ["/api/admin/enquiries"],
          onSuccess: () => order.push("success"),
        });
      },
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <SWRConfig value={{ provider: () => new Map(), fetcher, dedupingInterval: 0 }}>{children}</SWRConfig>
        ),
      },
    );
    await waitFor(() => expect(reads).toHaveLength(2));
    reads.length = 0;
    await act(async () => {
      await result.current.submit(undefined);
    });
    expect(reads).toEqual(["/api/admin/enquiries?status=NEW"]);
    expect(reads).not.toContain("/api/admin/settings");
    expect(order).toEqual(["success"]);
  });
});
