import { describe, expect, it } from "vitest";

import { ERROR_MESSAGES } from "@/constants/messages";
import { ApiError } from "@/lib/api/client";
import { conflictError, errorMessage } from "@/lib/errors";

describe("errorMessage", () => {
  it("shows the site's own words for its own errors", () => {
    expect(errorMessage(conflictError())).toBe(ERROR_MESSAGES.CONFLICT);
    expect(errorMessage(new ApiError(429, "RATE_LIMITED", "Slow down."))).toBe("Slow down.");
  });

  it("never shows a library's text", () => {
    expect(errorMessage(new TypeError("Failed to fetch"))).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
    expect(errorMessage(new ApiError(500, "INTERNAL_ERROR", ""), "NETWORK_UNREACHABLE")).toBe(
      ERROR_MESSAGES.NETWORK_UNREACHABLE,
    );
    expect(errorMessage("text", "UPLOAD_TOO_LARGE")).toBe(ERROR_MESSAGES.UPLOAD_TOO_LARGE);
  });
});
