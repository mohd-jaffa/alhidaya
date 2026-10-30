import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import * as z from "zod";

import { ERROR_MESSAGES } from "@/constants/messages";
import { useSchemaForm } from "@/hooks/useSchemaForm";
import { ApiError } from "@/lib/api/client";
import { requiredLine } from "@/lib/validation";

const schema = z.object({
  name: requiredLine("Name", { max: 10 }),
  choice: z.enum(["A", "B"], { error: "Choose one." }),
  size: z.string(),
  agree: z.literal(true, { error: "Please agree." }),
  file: z.unknown(),
});

function Probe({
  load = async () => schema,
  send = async () => {},
}: {
  load?: () => Promise<z.ZodType>;
  send?: (values: Record<string, unknown>) => Promise<unknown>;
}) {
  const { form, errors, status, failure, answered } = useSchemaForm({ schema: load, send });
  return (
    <form {...form} aria-label="Probe">
      <label>
        Name <input name="name" aria-describedby="name-error" />
      </label>
      <p id="name-error">{errors.name}</p>
      <fieldset>
        <legend>Choice</legend>
        <label>
          <input type="radio" name="choice" value="A" />A
        </label>
        <label>
          <input type="radio" name="choice" value="B" />B
        </label>
      </fieldset>
      <p data-testid="choice-error">{errors.choice}</p>
      <label>
        Size
        <select name="size" defaultValue="s">
          <option value="s">Small</option>
        </select>
      </label>
      <label>
        <input type="checkbox" name="agree" /> Agree
      </label>
      <p data-testid="agree-error">{errors.agree}</p>
      <label>
        File <input type="file" name="file" />
      </label>
      <input aria-label="Unnamed" />
      <a href="#terms">Terms</a>
      <button type="submit">Send</button>
      <output>{status}</output>
      <p data-testid="answered">{answered}</p>
      {failure ? <p role="alert">{`${failure.code}: ${failure.message}`}</p> : null}
    </form>
  );
}

const name = () => screen.getByRole("textbox", { name: "Name" });
const send = () => screen.getByRole("button", { name: "Send" });

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(name(), "Mariam");
  await user.click(screen.getByRole("radio", { name: "B" }));
  await user.click(screen.getByRole("checkbox", { name: "Agree" }));
}

describe("useSchemaForm", () => {
  it("fetches the schema once, when the visitor first reaches into the form", async () => {
    const user = userEvent.setup();
    const load = vi.fn(async () => schema);
    render(<Probe load={load} />);
    expect(load).not.toHaveBeenCalled();
    await user.click(name());
    await user.click(screen.getByRole("radio", { name: "A" }));
    expect(load).toHaveBeenCalledOnce();
  });

  it("shows each mistake beside its field and puts the visitor on the first, sending nothing", async () => {
    const user = userEvent.setup();
    const sent = vi.fn(async () => {});
    render(<Probe send={sent} />);
    await user.click(send());
    expect(name()).toHaveFocus();
    expect(name()).toHaveAccessibleDescription("Name is required.");
    expect(screen.getByTestId("choice-error")).toHaveTextContent("Choose one.");
    expect(screen.getByTestId("agree-error")).toHaveTextContent("Please agree.");
    expect(sent).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("editing");
  });

  it("after a first attempt, clears a mistake as it is fixed and shows a new one only once a field is left", async () => {
    const user = userEvent.setup();
    render(<Probe />);
    await user.click(send());

    await user.type(name(), "M");
    await waitFor(() => expect(name()).not.toHaveAccessibleDescription());
    await user.click(screen.getByRole("radio", { name: "A" }));
    await waitFor(() => expect(screen.getByTestId("choice-error")).toBeEmptyDOMElement());

    // Wrong again while typing: not said until the field is left.
    await user.type(name(), "ariam Al Thani");
    expect(name()).not.toHaveAccessibleDescription();
    await user.tab();
    await waitFor(() => expect(name()).toHaveAccessibleDescription("Name can be at most 10 characters."));
    // Still wrong as it changes: the problem stays; fixed, it goes.
    await user.type(name(), "!");
    await waitFor(() => expect(name()).toHaveAccessibleDescription("Name can be at most 10 characters."));
    await user.clear(name());
    await user.type(name(), "Mariam");
    await waitFor(() => expect(name()).not.toHaveAccessibleDescription());

    // Leaving what is not a field (the link, the send action) checks nothing.
    await user.click(screen.getByRole("link", { name: "Terms" }));
    await user.click(screen.getByRole("textbox", { name: "Unnamed" }));
    expect(screen.getByTestId("agree-error")).toHaveTextContent("Please agree.");
  });

  it("checks nothing as fields change before the first attempt", async () => {
    const user = userEvent.setup();
    render(<Probe />);
    await user.type(name(), "far too long a name");
    await user.tab();
    expect(name()).not.toHaveAccessibleDescription();
  });

  it("sends what the form holds: a box as ticked, the chosen answer, no file, and says it was sent", async () => {
    const user = userEvent.setup();
    let finish = () => {};
    const sent = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    render(<Probe send={sent} />);
    await fillValid(user);
    await user.click(send());
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("sending"));
    // A second press while the first is under way sends nothing more.
    await user.click(send());
    expect(sent).toHaveBeenCalledOnce();
    expect(sent).toHaveBeenCalledWith({ name: "Mariam", choice: "B", size: "s", agree: true, file: null });
    expect(screen.getByTestId("answered")).toHaveTextContent("0");
    await act(async () => finish());
    expect(screen.getByRole("status")).toHaveTextContent("sent");
    expect(screen.getByTestId("answered")).toHaveTextContent("1");
  });

  it("sends a picked file as the file itself", async () => {
    const user = userEvent.setup();
    const sent = vi.fn(async () => {});
    render(<Probe send={sent} />);
    await fillValid(user);
    const file = new File(["%PDF-1.7"], "cv.pdf", { type: "application/pdf" });
    await user.upload(screen.getByLabelText("File"), file);
    await user.click(send());
    await waitFor(() => expect(sent).toHaveBeenCalledOnce());
    expect(sent).toHaveBeenCalledWith(expect.objectContaining({ file }));
  });

  it("shows what the route refused beside its field", async () => {
    const user = userEvent.setup();
    const refusal = new ApiError(400, "VALIDATION_ERROR", ERROR_MESSAGES.VALIDATION_ERROR, "req_1", [
      { path: "name", message: "Not this name." },
    ]);
    render(
      <Probe
        send={async () => {
          throw refusal;
        }}
      />,
    );
    await fillValid(user);
    await user.click(send());
    await waitFor(() => expect(name()).toHaveAccessibleDescription("Not this name."));
    expect(name()).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("editing");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("says why it was not sent when the refusal names no field of the form, or is not the visitor's to fix", async () => {
    const user = userEvent.setup();
    const failures = [
      new ApiError(400, "VALIDATION_ERROR", ERROR_MESSAGES.VALIDATION_ERROR, "req_2", [{ path: "form", message: "x" }]),
      new ApiError(400, "VALIDATION_ERROR", ERROR_MESSAGES.VALIDATION_ERROR, "req_3"),
      new ApiError(429, "RATE_LIMITED", ERROR_MESSAGES.RATE_LIMITED, "req_4"),
    ];
    const sent = vi.fn(async () => {
      throw failures.shift();
    });
    render(<Probe send={sent} />);
    await fillValid(user);
    await user.click(send());
    expect(await screen.findByRole("alert")).toHaveTextContent(`VALIDATION_ERROR: ${ERROR_MESSAGES.VALIDATION_ERROR}`);
    expect(screen.getByRole("status")).toHaveTextContent("failed");
    await user.click(send());
    await user.click(send());
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("RATE_LIMITED"));
    // Each send the server answered counts, refused or not: a one-time token is spent by each.
    expect(screen.getByTestId("answered")).toHaveTextContent("3");
    // Nothing typed is lost.
    expect(name()).toHaveValue("Mariam");
  });

  it("reads anything else that stops a send as the server not being reached", async () => {
    const user = userEvent.setup();
    render(
      <Probe
        send={async () => {
          throw new Error("boom");
        }}
      />,
    );
    await fillValid(user);
    await user.click(send());
    expect(await screen.findByRole("alert")).toHaveTextContent(ERROR_MESSAGES.NETWORK_UNREACHABLE);
  });

  it("says so when the schema cannot be fetched, and fetches it again next time", async () => {
    const user = userEvent.setup();
    let reachable = false;
    const load = vi.fn(async () => {
      if (!reachable) throw new Error("chunk");
      return schema;
    });
    const sent = vi.fn(async () => {});
    render(<Probe load={load} send={sent} />);
    // Reaching in fails quietly; sending says so.
    await user.click(name());
    await user.click(send());
    expect(await screen.findByRole("alert")).toHaveTextContent("NETWORK_UNREACHABLE");
    // A change after that attempt cannot be checked either, and says nothing.
    await user.type(name(), "Mariam");
    await user.tab();
    expect(name()).not.toHaveAccessibleDescription();

    reachable = true;
    await user.click(screen.getByRole("radio", { name: "B" }));
    await user.click(screen.getByRole("checkbox", { name: "Agree" }));
    await user.click(send());
    await waitFor(() => expect(sent).toHaveBeenCalledOnce());
  });
});
