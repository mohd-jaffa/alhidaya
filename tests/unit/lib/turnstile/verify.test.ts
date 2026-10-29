// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { TURNSTILE_VERIFY_MS } from "@/constants/limits";
import { TURNSTILE_SITEVERIFY } from "@/lib/turnstile/endpoints";
import { verifyTurnstile } from "@/lib/turnstile/verify";
import { stubServerEnv, TEST_ENV } from "@tests/support/env";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const answering = (response: Response | Error) => {
  const fetch = vi.fn(async () => {
    if (response instanceof Error) throw response;
    return response;
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
};

describe("verifyTurnstile", () => {
  it("asks Cloudflare about the token with the secret alone, never the visitor's address, and waits a bounded time", async () => {
    stubServerEnv();
    const timeout = vi.spyOn(AbortSignal, "timeout");
    const fetch = answering(Response.json({ success: true }));
    await expect(verifyTurnstile("token")).resolves.toBeUndefined();

    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(TURNSTILE_SITEVERIFY);
    expect(init.method).toBe("POST");
    expect(Object.fromEntries(init.body as URLSearchParams)).toEqual({
      secret: TEST_ENV.TURNSTILE_SECRET_KEY,
      response: "token",
    });
    expect(timeout).toHaveBeenCalledWith(TURNSTILE_VERIFY_MS);
  });

  it("refuses a token Cloudflare does not confirm: false, spent, or an answer without a verdict", async () => {
    stubServerEnv();
    for (const body of [{ success: false, "error-codes": ["timeout-or-duplicate"] }, {}, { success: "true" }]) {
      answering(Response.json(body));
      await expect(verifyTurnstile("token")).rejects.toMatchObject({ code: "BOT_CHECK_FAILED", httpStatus: 403 });
    }
  });

  it("refuses the form as an outside service's failure when Cloudflare cannot be reached or answers badly", async () => {
    stubServerEnv();
    for (const answer of [
      new TypeError("fetch failed"),
      new Response("Bad gateway", { status: 502 }),
      new Response("not json", { status: 200 }),
    ]) {
      answering(answer);
      await expect(verifyTurnstile("token")).rejects.toMatchObject({ code: "EXTERNAL_SERVICE_ERROR", httpStatus: 502 });
    }
  });
});
