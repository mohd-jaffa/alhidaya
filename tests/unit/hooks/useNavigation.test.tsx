import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useNavigation } from "@/hooks/useNavigation";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

beforeEach(() => {
  router.replace.mockReset();
});

describe("useNavigation", () => {
  it("replaces the page through the router, and is not navigating once the move is made (D204)", () => {
    const { result } = renderHook(() => useNavigation());
    expect(result.current.navigating).toBe(false);
    act(() => result.current.replace("/admin/login"));
    expect(router.replace).toHaveBeenCalledExactlyOnceWith("/admin/login");
    expect(result.current.navigating).toBe(false);
  });

  it("says it is navigating from the move until the new page has arrived", async () => {
    // Next's router keeps the move a transition until the page is there; a stand-in that stays pending shows it.
    let arrived: () => void = () => {};
    router.replace.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          arrived = resolve;
        }),
    );
    const { result } = renderHook(() => useNavigation());
    act(() => result.current.replace("/admin"));
    expect(result.current.navigating).toBe(true);
    await act(async () => arrived());
    expect(result.current.navigating).toBe(false);
  });
});
