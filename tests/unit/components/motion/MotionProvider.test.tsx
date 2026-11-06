import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MotionProvider, useMotion } from "@/components/motion/MotionProvider";
import { REDUCED_MOTION_QUERY, WHEEL_QUERY } from "@/lib/motion/preferences";
import { fakeEngine, mockMedia } from "@tests/support/motion";

const state = vi.hoisted(() => ({
  pathname: "/",
  load: vi.fn(),
  smooth: { toTop: vi.fn(), stop: vi.fn() },
  start: vi.fn(),
}));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("@/lib/motion/engine", () => ({ loadMotionEngine: state.load, startSmoothScroll: state.start }));

function Probe() {
  const { engine } = useMotion();
  return <p>{engine ? "moving" : "still"}</p>;
}

let fonts: () => void;
function motionEngine() {
  const fake = fakeEngine();
  fake.engine.startSmoothScroll = state.start;
  return fake;
}

beforeEach(() => {
  state.pathname = "/";
  state.start.mockReturnValue(state.smooth);
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { ready: new Promise<void>((resolve) => (fonts = resolve)) },
  });
});
afterEach(() => {
  vi.clearAllMocks();
  delete (window as { requestIdleCallback?: unknown }).requestIdleCallback;
});

describe("MotionProvider", () => {
  it("loads motion only once the page is idle, then smooths a wheel's scrolling", async () => {
    const { engine, ScrollTrigger } = motionEngine();
    state.load.mockResolvedValue(engine);
    mockMedia({ [WHEEL_QUERY]: true });
    const idle = vi.fn((callback: () => void) => {
      callback();
      return 7;
    });
    Object.assign(window, { requestIdleCallback: idle, cancelIdleCallback: vi.fn() });

    render(
      <MotionProvider>
        <Probe />
      </MotionProvider>,
    );
    await screen.findByText("moving");
    expect(idle).toHaveBeenCalledWith(expect.any(Function), { timeout: 2000 });
    await waitFor(() => expect(state.start).toHaveBeenCalledWith(engine));

    // Measured again once the fonts and the images have settled.
    await act(async () => fonts());
    window.dispatchEvent(new Event("load"));
    await waitFor(() => expect(ScrollTrigger.refresh).toHaveBeenCalledTimes(2));
  });

  it("keeps a touch screen's own scrolling", async () => {
    state.load.mockResolvedValue(motionEngine().engine);
    mockMedia({ [WHEEL_QUERY]: false });
    render(
      <MotionProvider>
        <Probe />
      </MotionProvider>,
    );
    await screen.findByText("moving");
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(state.start).not.toHaveBeenCalled();
  });

  it("loads nothing when the visitor asks for less motion, and lets go of it when they change their mind", async () => {
    const { engine } = motionEngine();
    state.load.mockResolvedValue(engine);
    const media = mockMedia({ [REDUCED_MOTION_QUERY]: true, [WHEEL_QUERY]: true });
    render(
      <MotionProvider>
        <Probe />
      </MotionProvider>,
    );
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(state.load).not.toHaveBeenCalled();
    expect(screen.getByText("still")).toBeInTheDocument();

    act(() => media.set(REDUCED_MOTION_QUERY, false));
    await screen.findByText("moving");
    await waitFor(() => expect(state.start).toHaveBeenCalled());
    act(() => media.set(REDUCED_MOTION_QUERY, true));
    expect(screen.getByText("still")).toBeInTheDocument();
    await waitFor(() => expect(state.smooth.stop).toHaveBeenCalled());
  });

  it("starts a new page at its top with its triggers measured afresh, but never jumps on load", async () => {
    const { engine, ScrollTrigger } = motionEngine();
    state.load.mockResolvedValue(engine);
    mockMedia({ [WHEEL_QUERY]: true });
    const { rerender } = render(
      <MotionProvider>
        <Probe />
      </MotionProvider>,
    );
    await screen.findByText("moving");
    await waitFor(() => expect(state.start).toHaveBeenCalled());
    expect(state.smooth.toTop).not.toHaveBeenCalled();

    state.pathname = "/services";
    rerender(
      <MotionProvider>
        <Probe />
      </MotionProvider>,
    );
    expect(state.smooth.toTop).toHaveBeenCalledTimes(1);
    expect(ScrollTrigger.refresh).toHaveBeenCalled();
  });

  it("follows a new page before motion has loaded without error, and ignores a load that fails or arrives too late", async () => {
    let resolve: (value: unknown) => void = () => undefined;
    state.load.mockReturnValueOnce(new Promise((done) => (resolve = done))).mockRejectedValueOnce(new Error("offline"));
    mockMedia({ [WHEEL_QUERY]: true });
    const { rerender, unmount } = render(
      <MotionProvider>
        <Probe />
      </MotionProvider>,
    );
    state.pathname = "/about";
    rerender(
      <MotionProvider>
        <Probe />
      </MotionProvider>,
    );
    await waitFor(() => expect(state.load).toHaveBeenCalled());
    unmount();
    await act(async () => resolve(motionEngine().engine));
    expect(state.start).not.toHaveBeenCalled();

    render(
      <MotionProvider>
        <Probe />
      </MotionProvider>,
    );
    await waitFor(() => expect(state.load).toHaveBeenCalledTimes(2));
    expect(screen.getByText("still")).toBeInTheDocument();
  });
});
