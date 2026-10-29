// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const draft = { isEnabled: false };
const getAdminSession = vi.fn();
vi.mock("next/headers", () => ({ draftMode: async () => draft, headers: async () => new Headers() }));
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));

const { contentView, previewMetadata } = await import("@/lib/content/view");

afterEach(() => {
  draft.isEnabled = false;
  vi.clearAllMocks();
});

describe("contentView", () => {
  it("is what is published, unless draft mode is on and the admin is still signed in", async () => {
    expect(await contentView()).toBe("published");
    expect(getAdminSession).not.toHaveBeenCalled();

    draft.isEnabled = true;
    getAdminSession.mockResolvedValueOnce(null);
    expect(await contentView()).toBe("published");

    getAdminSession.mockResolvedValueOnce({ adminId: "a1", email: "admin@alhidaya.qa", name: "Admin" });
    expect(await contentView()).toBe("preview");
  });
});

describe("previewMetadata", () => {
  it("keeps a preview out of search engines, and nothing else", async () => {
    expect(await previewMetadata()).toEqual({});
    draft.isEnabled = true;
    getAdminSession.mockResolvedValueOnce({ adminId: "a1", email: "admin@alhidaya.qa", name: "Admin" });
    expect(await previewMetadata()).toEqual({ robots: { index: false, follow: false } });
  });
});
