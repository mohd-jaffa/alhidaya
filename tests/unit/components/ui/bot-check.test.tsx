import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UI_TEXT } from "@/constants/messages";
import { TURNSTILE_FIELD, TURNSTILE_SCRIPT } from "@/lib/turnstile/endpoints";

/** Cloudflare's widget as a test drives it: what it was asked to draw, and its callbacks. */
function fakeTurnstile() {
  const options: Record<string, unknown>[] = [];
  const turnstile = {
    render: vi.fn((_container: HTMLElement, given: Record<string, unknown>) => {
      options.push(given);
      return `widget-${options.length}`;
    }),
    reset: vi.fn(),
    remove: vi.fn(),
  };
  const call = (name: string) => act(() => (options.at(-1)?.[name] as () => void)());
  return { turnstile, options, call };
}

/** The module afresh, so each test starts before Cloudflare's script was ever added. */
async function load() {
  vi.resetModules();
  return (await import("@/components/ui/bot-check")).BotCheck;
}

const script = () => document.head.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SCRIPT}"]`);

/** Cloudflare's script finishing, well or badly. */
async function finish(how: "load" | "error") {
  const element = script();
  if (!element) throw new Error("the script was never added");
  await act(async () => {
    element.dispatchEvent(new Event(how));
  });
}

beforeEach(() => {
  delete window.turnstile;
});

afterEach(() => {
  for (const element of document.head.querySelectorAll("script")) element.remove();
});

describe("BotCheck", () => {
  it("adds Cloudflare's script only once the visitor reaches into the form, then draws the check", async () => {
    const BotCheck = await load();
    const { turnstile, options } = fakeTurnstile();
    render(
      <form>
        <input aria-label="Name" />
        <BotCheck siteKey="site-key" action="quote" renewal={0} />
      </form>,
    );
    expect(script()).toBeNull();

    fireEvent.focusIn(screen.getByRole("textbox", { name: "Name" }));
    fireEvent.focusIn(screen.getByRole("textbox", { name: "Name" }));
    expect(document.head.querySelectorAll("script")).toHaveLength(1);
    expect(script()?.async).toBe(true);

    window.turnstile = turnstile;
    await finish("load");
    expect(turnstile.render).toHaveBeenCalledOnce();
    expect(options[0]).toMatchObject({
      sitekey: "site-key",
      action: "quote",
      theme: "light",
      appearance: "interaction-only",
      size: "flexible",
      "response-field-name": TURNSTILE_FIELD,
    });
  });

  it("takes room only while Cloudflare shows its box, or there is something to say", async () => {
    const BotCheck = await load();
    const { turnstile, call } = fakeTurnstile();
    const { container, rerender } = render(
      <form>
        <BotCheck siteKey="site-key" action="contact" renewal={0} />
      </form>,
    );
    const check = container.querySelector("[aria-live]");
    fireEvent.focusIn(container.querySelector("form") as HTMLFormElement);
    window.turnstile = turnstile;
    await finish("load");
    expect(check).not.toHaveClass("pb-6");

    call("before-interactive-callback");
    expect(check).toHaveClass("pb-6");
    call("after-interactive-callback");
    expect(check).not.toHaveClass("pb-6");

    rerender(
      <form>
        <BotCheck siteKey="site-key" action="contact" renewal={0} error="Tick the box." />
      </form>,
    );
    expect(screen.getByText("Tick the box.")).toBeVisible();
    expect(check).toHaveClass("pb-6");
  });

  it("says when the check cannot work, and stops saying so once it does", async () => {
    const BotCheck = await load();
    const { turnstile, call } = fakeTurnstile();
    const { container } = render(
      <form>
        <BotCheck siteKey="site-key" action="contact" renewal={0} />
      </form>,
    );
    fireEvent.focusIn(container.querySelector("form") as HTMLFormElement);
    window.turnstile = turnstile;
    await finish("load");
    call("error-callback");
    expect(screen.getByText(UI_TEXT.botCheckUnavailable)).toBeVisible();
    call("callback");
    expect(screen.queryByText(UI_TEXT.botCheckUnavailable)).not.toBeInTheDocument();
  });

  it("says so when Cloudflare's script does not load, and tries it again in another form", async () => {
    const BotCheck = await load();
    const first = render(
      <form>
        <BotCheck siteKey="site-key" action="contact" renewal={0} />
      </form>,
    );
    fireEvent.focusIn(first.container.querySelector("form") as HTMLFormElement);
    await finish("error");
    expect(screen.getByText(UI_TEXT.botCheckUnavailable)).toBeVisible();
    expect(script()).toBeNull();
    first.unmount();

    // Loaded, yet without the widget: said the same way.
    const second = render(
      <form>
        <BotCheck siteKey="site-key" action="contact" renewal={0} />
      </form>,
    );
    fireEvent.focusIn(second.container.querySelector("form") as HTMLFormElement);
    expect(script()).not.toBeNull();
    await finish("load");
    expect(screen.getByText(UI_TEXT.botCheckUnavailable)).toBeVisible();
  });

  it("asks for a fresh token after each send the server answered, and removes the check with the form", async () => {
    const BotCheck = await load();
    const { turnstile } = fakeTurnstile();
    const form = (renewal: number) => (
      <form>
        <BotCheck siteKey="site-key" action="contact" renewal={renewal} />
      </form>
    );
    const { container, rerender, unmount } = render(form(0));
    fireEvent.focusIn(container.querySelector("form") as HTMLFormElement);
    window.turnstile = turnstile;
    await finish("load");
    expect(turnstile.reset).not.toHaveBeenCalled();
    rerender(form(1));
    expect(turnstile.reset).toHaveBeenCalledWith("widget-1");
    unmount();
    expect(turnstile.remove).toHaveBeenCalledWith("widget-1");
  });

  it("draws nothing for a form already gone, nor before it is drawn, nor outside a form", async () => {
    const BotCheck = await load();
    const { turnstile } = fakeTurnstile();
    window.turnstile = turnstile;
    const { container, rerender, unmount } = render(
      <form>
        <BotCheck siteKey="site-key" action="contact" renewal={0} />
      </form>,
    );
    // A send answered before the check was ever drawn has nothing to renew.
    rerender(
      <form>
        <BotCheck siteKey="site-key" action="contact" renewal={1} />
      </form>,
    );
    fireEvent.focusIn(container.querySelector("form") as HTMLFormElement);
    unmount();
    await finish("load");
    expect(turnstile.render).not.toHaveBeenCalled();
    expect(turnstile.reset).not.toHaveBeenCalled();
    expect(turnstile.remove).not.toHaveBeenCalled();

    // Outside a form there is nothing to reach into, so nothing is drawn.
    render(<BotCheck siteKey="site-key" action="contact" renewal={0} />);
    fireEvent.focusIn(document.body);
    expect(turnstile.render).not.toHaveBeenCalled();
  });

  it("goes quietly when a failed load is met by a form already gone", async () => {
    const BotCheck = await load();
    const { container, unmount } = render(
      <form>
        <BotCheck siteKey="site-key" action="contact" renewal={0} />
      </form>,
    );
    fireEvent.focusIn(container.querySelector("form") as HTMLFormElement);
    const element = script();
    unmount();
    await act(async () => {
      element?.dispatchEvent(new Event("error"));
    });
    expect(screen.queryByText(UI_TEXT.botCheckUnavailable)).not.toBeInTheDocument();
  });
});
