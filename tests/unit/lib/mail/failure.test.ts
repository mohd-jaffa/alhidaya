// @vitest-environment node
import { describe, expect, it } from "vitest";

import { externalServiceError } from "@/lib/errors";
import { asMailFailure } from "@/lib/mail/failure";

describe("asMailFailure", () => {
  it("keeps the app's own error and wraps a mail server's", () => {
    const own = externalServiceError("MAIL_NOT_CONFIGURED");
    expect(asMailFailure(own)).toBe(own);
    const smtp = new Error("535 Authentication failed");
    expect(asMailFailure(smtp)).toMatchObject({ code: "EXTERNAL_SERVICE_ERROR", httpStatus: 502, cause: smtp });
  });
});
