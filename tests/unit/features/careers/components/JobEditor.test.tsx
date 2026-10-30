import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { ERROR_MESSAGES } from "@/constants/messages";
import { API_ROUTES, ROUTES } from "@/constants/routes";
import { JobEditor } from "@/features/careers/components/JobEditor";
import type { JobDraftItem } from "@/features/careers/types";
import { dohaDay } from "@/lib/dates";
import type { JobDocument } from "@/lib/validation";
import { type Answer, stubApi, stubDialogs, WithSWR } from "@tests/support/api";
import { jobFixture } from "@tests/support/fixtures/content";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

beforeAll(stubDialogs);
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const PUBLISHED = "2026-10-29T08:00:00.000Z";
const saved = (overrides: Partial<JobDraftItem> = {}): JobDraftItem => ({
  id: "j1",
  draft: jobFixture({ title: { en: "Registered nurse" }, slug: "registered-nurse" }),
  publishedAt: PUBLISHED,
  archivedAt: null,
  unpublishedChanges: false,
  open: true,
  ...overrides,
});

/** The job's endpoints: its draft as last written, and what each write answers. */
function api(
  start: JobDraftItem | null,
  write: (method: string, url: string, body: unknown) => Answer | undefined = () => undefined,
) {
  let current = start ?? saved({ publishedAt: null, unpublishedChanges: true, open: false });
  return stubApi((method, url, body) => {
    const answer = write(method, url, body);
    if (answer) return answer;
    if (url === ADMIN_API_ROUTES.adminJobs && method === "GET") return { data: [] };
    if (method === "POST" && url === ADMIN_API_ROUTES.adminJobs) current = { ...current, draft: body as JobDocument };
    if (method === "PUT") current = { ...current, draft: body as JobDocument, unpublishedChanges: true };
    if (url === ADMIN_API_ROUTES.adminJobPublish("j1"))
      current = { ...current, publishedAt: PUBLISHED, unpublishedChanges: false, open: true };
    if (url === ADMIN_API_ROUTES.adminJobClose("j1")) {
      const { closed } = body as { closed: boolean };
      current = { ...current, draft: { ...current.draft, closed }, open: !closed };
    }
    if (url === ADMIN_API_ROUTES.adminJobArchive("j1"))
      current = { ...current, archivedAt: (body as { archived: boolean }).archived ? PUBLISHED : null };
    return { data: current };
  });
}

const textbox = (name: string | RegExp) => screen.getByRole("textbox", { name });
const writes = (fetch: ReturnType<typeof stubApi>) =>
  fetch.mock.calls
    .filter(([, init]) => init?.method && init.method !== "GET")
    .map(([url, init]) => [init!.method, url]);

describe("JobEditor (D92)", () => {
  it("starts a new job posted today, fills its address from the title, and makes it on the first save", async () => {
    const replace = vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
    const fetch = api(null);
    render(<JobEditor id={null} />, { wrapper: WithSWR });
    expect(screen.getByRole("heading", { level: 1, name: ADMIN_TEXT.newJob })).toBeVisible();
    expect(screen.getByLabelText(ADMIN_TEXT.postedOn)).toHaveValue(dohaDay());
    await userEvent.type(textbox(ADMIN_TEXT.title), "Registered Nurse");
    expect(textbox(ADMIN_TEXT.webAddress)).toHaveValue("registered-nurse");
    await userEvent.type(textbox(ADMIN_TEXT.location), "Doha, Qatar");
    await userEvent.type(textbox(ADMIN_TEXT.summary), "Care at home.");
    const responsibilities = screen.getByRole("group", { name: ADMIN_TEXT.responsibilities });
    await userEvent.click(within(responsibilities).getByRole("button", { name: ADMIN_TEXT.addItem }));
    await userEvent.type(textbox(`${ADMIN_TEXT.responsibility} 1`), "Visit patients at home");
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.saveDraft }));
    expect(await screen.findByRole("heading", { level: 1, name: "Registered Nurse" })).toBeVisible();
    expect(writes(fetch)).toEqual([["POST", ADMIN_API_ROUTES.adminJobs]]);
    expect(replace).toHaveBeenCalledWith(null, "", ADMIN_ROUTES.job("j1"));
    expect(screen.getByRole("link", { name: ADMIN_TEXT.preview })).toHaveAttribute(
      "href",
      `${API_ROUTES.preview}?path=${encodeURIComponent(ROUTES.job("registered-nurse"))}`,
    );
    expect(
      within(screen.getByRole("region", { name: ADMIN_TEXT.onTheSite })).getByText(ADMIN_TEXT.publishToOpen),
    ).toBeVisible();
  });

  it("closes a published job at once and reopens it, each asked first", async () => {
    const fetch = api(saved());
    render(<JobEditor id="j1" />, { wrapper: WithSWR });
    const site = await screen.findByRole("region", { name: ADMIN_TEXT.onTheSite });
    expect(within(site).getByText(ADMIN_TEXT.takingApplications)).toBeVisible();
    await userEvent.click(within(site).getByRole("button", { name: ADMIN_TEXT.closeNow }));
    const asked = screen.getByRole("dialog", { name: ADMIN_TEXT.closeTitle("Registered nurse") });
    expect(asked).toHaveTextContent(ADMIN_TEXT.closeBody);
    await userEvent.click(within(asked).getByRole("button", { name: ADMIN_TEXT.closeNow }));
    expect(await within(site).findByText(ADMIN_TEXT.notTakingApplications)).toBeVisible();
    await userEvent.click(within(site).getByRole("button", { name: ADMIN_TEXT.reopen }));
    await userEvent.click(
      within(screen.getByRole("dialog", { name: ADMIN_TEXT.reopenTitle("Registered nurse") })).getByRole("button", {
        name: ADMIN_TEXT.reopen,
      }),
    );
    expect(await within(site).findByText(ADMIN_TEXT.takingApplications)).toBeVisible();
    expect(writes(fetch)).toEqual([
      ["POST", ADMIN_API_ROUTES.adminJobClose("j1")],
      ["POST", ADMIN_API_ROUTES.adminJobClose("j1")],
    ]);
  });

  it("says a job past its closing date is closed, with nothing to close; and archives and restores it", async () => {
    api(saved({ open: false, draft: jobFixture({ title: { en: "Registered nurse" }, closesOn: "2026-10-01" }) }));
    render(<JobEditor id="j1" />, { wrapper: WithSWR });
    const site = await screen.findByRole("region", { name: ADMIN_TEXT.onTheSite });
    expect(within(site).getByText(ADMIN_TEXT.notTakingApplications)).toBeVisible();
    expect(within(site).queryByRole("button", { name: ADMIN_TEXT.closeNow })).toBeNull();
    expect(within(site).queryByRole("button", { name: ADMIN_TEXT.reopen })).toBeNull();
    await userEvent.click(within(site).getByRole("button", { name: ADMIN_TEXT.archive }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: ADMIN_TEXT.archive }));
    expect(await within(site).findByText(ADMIN_TEXT.isArchived)).toBeVisible();
    expect(within(site).queryByText(ADMIN_TEXT.notTakingApplications)).toBeNull();
    await userEvent.click(within(site).getByRole("button", { name: ADMIN_TEXT.restore }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: ADMIN_TEXT.restore }));
    await waitFor(() => expect(within(site).queryByText(ADMIN_TEXT.isArchived)).toBeNull());
  });

  it("saves, discards and publishes a saved job, its address bar left as it is", async () => {
    const replace = vi.spyOn(window.history, "replaceState");
    const fetch = api(saved({ unpublishedChanges: true }));
    render(<JobEditor id="j1" />, { wrapper: WithSWR });
    await screen.findByRole("heading", { level: 1, name: "Registered nurse" });
    await userEvent.type(textbox(ADMIN_TEXT.summary), " More.");
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.saveDraft }));
    await waitFor(() => expect(screen.getByRole("button", { name: ADMIN_TEXT.saveDraft })).toBeDisabled());
    expect(replace).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.discardDraft }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: ADMIN_TEXT.discard }));
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.publish }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: ADMIN_TEXT.publish }));
    expect(await screen.findByText(ADMIN_TEXT.isPublished("Registered nurse"))).toBeVisible();
    expect(writes(fetch)).toEqual([
      ["PUT", ADMIN_API_ROUTES.adminJob("j1")],
      ["POST", ADMIN_API_ROUTES.adminJobDiscard("j1")],
      ["POST", ADMIN_API_ROUTES.adminJobPublish("j1")],
    ]);
  });

  it("says when the job did not load, with Try again", async () => {
    let fails = true;
    api(saved(), (method, url) =>
      url === ADMIN_API_ROUTES.adminJob("j1") && fails
        ? { status: 404, error: { code: "RECORD_NOT_FOUND", message: ERROR_MESSAGES.RECORD_NOT_FOUND } }
        : undefined,
    );
    render(<JobEditor id="j1" />, { wrapper: WithSWR });
    expect(screen.getByLabelText(ADMIN_TEXT.loading)).toHaveAttribute("aria-busy", "true");
    expect(await screen.findByText(ERROR_MESSAGES.RECORD_NOT_FOUND)).toBeVisible();
    fails = false;
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.tryAgain }));
    expect(await screen.findByRole("heading", { level: 1, name: "Registered nurse" })).toBeVisible();
  });
});
