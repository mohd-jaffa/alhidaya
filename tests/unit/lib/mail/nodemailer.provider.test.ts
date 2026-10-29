// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMail = vi.fn(async () => ({}));
const createTransport = vi.fn(() => ({ sendMail }));
vi.mock("nodemailer", () => ({ default: { createTransport } }));

const { createConfiguredMailService, NodemailerProvider } = await import("@/lib/mail/nodemailer.provider");
const { MailService } = await import("@/lib/mail/mail.service");

const env = (values: Record<string, unknown>) =>
  ({
    DATABASE_URL: "mysql://a:b@h/d",
    NEXT_PUBLIC_SITE_URL: "https://alhidaya.qa",
    NODE_ENV: "development",
    ...values,
  }) as never;

beforeEach(() => {
  sendMail.mockClear();
  createTransport.mockClear();
});

describe("NodemailerProvider", () => {
  it("connects with credentials only when both are given", () => {
    new NodemailerProvider({ host: "h", port: 465, secure: true, requireTLS: false, user: "u", password: "p" });
    new NodemailerProvider({ host: "h", port: 587, secure: false, requireTLS: true, user: "u" });
    const timeouts = { connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 30_000 };
    expect(createTransport.mock.calls[0]).toEqual([
      { host: "h", port: 465, secure: true, requireTLS: false, ...timeouts, auth: { user: "u", pass: "p" } },
    ]);
    expect(createTransport.mock.calls[1]).toEqual([
      { host: "h", port: 587, secure: false, requireTLS: true, ...timeouts, auth: undefined },
    ]);
  });

  it("sends attachments as buffers, and a message without any as it is", async () => {
    const provider = new NodemailerProvider({ host: "h", port: 25, secure: false, requireTLS: false });
    const base = { from: "f", to: "t", subject: "s", text: "t", html: "<p>t</p>" };
    await provider.send({
      ...base,
      replyTo: "visitor@example.com",
      attachments: [{ filename: "cv.pdf", content: new Uint8Array([37, 80]), contentType: "application/pdf" }],
    });
    await provider.send(base);
    expect(sendMail.mock.calls[0]).toEqual([
      expect.objectContaining({
        replyTo: "visitor@example.com",
        attachments: [{ filename: "cv.pdf", content: Buffer.from([37, 80]), contentType: "application/pdf" }],
      }),
    ]);
    expect(sendMail.mock.calls[1]).toEqual([expect.objectContaining({ attachments: undefined })]);
  });
});

describe("createConfiguredMailService", () => {
  it("says mail is not set up when there is no host", () => {
    expect(() => createConfiguredMailService(env({}))).toThrow(
      expect.objectContaining({ code: "MAIL_NOT_CONFIGURED" }),
    );
  });

  it("uses port 587 in the clear only outside production", () => {
    expect(createConfiguredMailService(env({ SMTP_HOST: "127.0.0.1" }))).toBeInstanceOf(MailService);
    expect(createTransport.mock.calls[0]).toEqual([
      expect.objectContaining({ host: "127.0.0.1", port: 587, secure: false, requireTLS: false }),
    ]);
  });

  it("lets production reach a mail server on this machine without TLS, and only that", () => {
    for (const host of ["localhost", "127.0.0.1", "::1"])
      createConfiguredMailService(env({ SMTP_HOST: host, NODE_ENV: "production" }));
    createConfiguredMailService(env({ SMTP_HOST: "127.example.com", NODE_ENV: "production" }));
    expect(
      (createTransport.mock.calls as unknown as [{ requireTLS: boolean }][]).map(([options]) => options.requireTLS),
    ).toEqual([false, false, false, true]);
  });

  it("requires TLS in production, and takes the port and SSL as set", () => {
    createConfiguredMailService(env({ SMTP_HOST: "mail", NODE_ENV: "production" }));
    createConfiguredMailService(env({ SMTP_HOST: "mail", SMTP_PORT: 465, SMTP_SECURE: true, NODE_ENV: "production" }));
    expect(createTransport.mock.calls[0]).toEqual([expect.objectContaining({ secure: false, requireTLS: true })]);
    expect(createTransport.mock.calls[1]).toEqual([
      expect.objectContaining({ port: 465, secure: true, requireTLS: false }),
    ]);
  });

  it("reads the process environment when given none", () => {
    expect(() => createConfiguredMailService()).toThrow();
  });
});
