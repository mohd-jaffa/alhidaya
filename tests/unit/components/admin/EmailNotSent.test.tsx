import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EmailNotSent } from "@/components/admin/EmailNotSent";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { MAIL_RETRIES } from "@/constants/limits";
import { WithSWR } from "@tests/support/api";

const notice = (retries: number) => (
  <EmailNotSent
    title={ADMIN_TEXT.alertNotSent}
    body={ADMIN_TEXT.alertNotSentBody}
    action={ADMIN_TEXT.retryAlert}
    retries={retries}
    retry={vi.fn(async () => "SENT")}
    revalidate={[]}
  />
);

describe("EmailNotSent (D85)", () => {
  it("says the website is still sending it again on its own, and how often it has", () => {
    render(notice(1), { wrapper: WithSWR });
    expect(screen.getByText(ADMIN_TEXT.emailRetrying(1))).toBeVisible();
    expect(screen.getByRole("button", { name: ADMIN_TEXT.retryAlert })).toBeVisible();
  });

  it("says when the website has stopped after its tries, and the email waits for the admin", () => {
    render(notice(MAIL_RETRIES.tries), { wrapper: WithSWR });
    expect(screen.getByText(ADMIN_TEXT.emailRetriesDone)).toBeVisible();
  });
});
