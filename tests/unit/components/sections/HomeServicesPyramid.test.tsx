import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HomeServicesPyramid } from "@/components/sections/HomeServicesPyramid";

const { mount, cleanup } = vi.hoisted(() => ({ mount: vi.fn(), cleanup: vi.fn() }));
vi.mock("@/lib/motion/services-pyramid", () => ({ mountServicesPyramid: mount }));
beforeEach(() => {
  mount.mockReset();
  mount.mockReturnValue(cleanup);
  cleanup.mockClear();
});
const props = {
  children: (
    <>
      <h2>What we do</h2>
      <ul>
        <li>Home care</li>
        <li>Elderly care</li>
      </ul>
    </>
  ),
};

describe("HomeServicesPyramid", () => {
  it("keeps server-drawn content and loads the enhancement after paint", async () => {
    const { unmount } = render(<HomeServicesPyramid {...props} />);
    expect(screen.getByRole("heading", { name: "What we do" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    await waitFor(() => expect(mount).toHaveBeenCalled());
    unmount();
    expect(cleanup).toHaveBeenCalled();
  });
  it("ignores a module that arrives after unmount", async () => {
    const { unmount } = render(<HomeServicesPyramid {...props} />);
    unmount();
    await act(async () => {
      await Promise.resolve();
    });
    expect(mount).not.toHaveBeenCalled();
  });
  it("keeps the native row usable when the deferred motion chunk fails", async () => {
    const react = await import("react");
    vi.resetModules();
    vi.doMock("react", () => react);
    vi.doMock("@/lib/motion/services-pyramid", () => {
      throw new Error("offline chunk");
    });
    const { HomeServicesPyramid: Offline } = await import("@/components/sections/HomeServicesPyramid");
    render(<Offline {...props} />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    vi.doUnmock("react");
    vi.doUnmock("@/lib/motion/services-pyramid");
  });
});
