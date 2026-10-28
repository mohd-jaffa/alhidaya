import { afterEach, describe, expect, it, vi } from "vitest";

import { ERROR_MESSAGES } from "@/constants/messages";
import { ApiError, deleteJson, getJson, patchJson, postForm, postJson, putJson } from "@/lib/api/client";

afterEach(() => vi.unstubAllGlobals());

function answer(status: number, body: unknown) {
  const fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("the API client", () => {
  it("unwraps a success and sends JSON with the session's cookies", async () => {
    const fetchMock = answer(200, { success: true, data: { id: 7 } });
    expect(await postJson("/api/x", { a: 1 })).toEqual({ id: 7 });
    expect(fetchMock).toHaveBeenCalledWith("/api/x", {
      credentials: "same-origin",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a: 1 }),
    });
  });

  it("sends each method, and no body when there is none", async () => {
    const fetchMock = answer(200, { success: true, data: null });
    await getJson("/a");
    await patchJson("/b", { x: 1 });
    await putJson("/c", { y: 2 });
    await deleteJson("/d");
    expect(fetchMock.mock.calls.map(([, init]) => init?.method)).toEqual(["GET", "PATCH", "PUT", "DELETE"]);
    expect(fetchMock.mock.calls[3][1]?.body).toBeUndefined();
  });

  it("sends a form as multipart, leaving the boundary to the browser", async () => {
    const fetchMock = answer(201, { success: true, data: { saved: true } });
    const form = new FormData();
    form.set("cv", new Blob(["%PDF"]), "cv.pdf");
    expect(await postForm("/api/applications", form)).toEqual({ saved: true });
    expect(fetchMock.mock.calls[0][1]).toEqual({ credentials: "same-origin", method: "POST", body: form });
  });

  it("turns a refusal into an ApiError with the server's words", async () => {
    answer(429, {
      success: false,
      error: { code: "RATE_LIMITED", message: "Wait.", requestId: "req_9", details: { after: 60 } },
    });
    await expect(getJson("/x")).rejects.toMatchObject({
      name: "ApiError",
      status: 429,
      code: "RATE_LIMITED",
      message: "Wait.",
      requestId: "req_9",
      details: { after: 60 },
    });
  });

  it("reads an unreadable refusal as a failure of our own", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("<html>", { status: 502 })),
    );
    await expect(getJson("/x")).rejects.toMatchObject({
      status: 502,
      code: "UNKNOWN_ERROR",
      message: ERROR_MESSAGES.INTERNAL_ERROR,
    });
  });

  it("says offline or unreachable when the request never left", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new TypeError("Failed to fetch"))),
    );
    const online = vi.spyOn(navigator, "onLine", "get");

    online.mockReturnValue(false);
    await expect(getJson("/x")).rejects.toMatchObject({ status: 0, code: "NETWORK_OFFLINE" });
    online.mockReturnValue(true);
    await expect(getJson("/x")).rejects.toMatchObject({ status: 0, code: "NETWORK_UNREACHABLE" });
  });

  it("lets any other failure through as it is", async () => {
    const abort = new DOMException("aborted", "AbortError");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(abort)),
    );
    await expect(getJson("/x")).rejects.toBe(abort);
  });

  it("is an Error", () => {
    expect(new ApiError(400, "VALIDATION_ERROR", "m")).toBeInstanceOf(Error);
  });
});
