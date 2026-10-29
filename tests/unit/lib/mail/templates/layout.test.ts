import { describe, expect, it } from "vitest";

import { UI_TEXT } from "@/constants/messages";
import { emailHtml, emailText, escapeHtml, type EmailParts } from "@/lib/mail/templates/layout";

const parts: EmailParts = {
  siteUrl: "https://alhidaya.qa/",
  subject: "Subject",
  preheader: "Preheader",
  heading: "Heading",
  paragraphs: ["Hello <script>alert(1)</script>,", "Body & more"],
  action: { label: "Open", url: "https://alhidaya.qa/x?a=1&b=2", fallback: "Copy this:" },
  note: "Note",
  footnote: "Footnote",
};

describe("escapeHtml", () => {
  it("makes typed text safe for HTML", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  });
});

describe("emailHtml", () => {
  it("draws the email with everything a person gave escaped", () => {
    const html = emailHtml(parts);
    expect(html).toContain(UI_TEXT.siteName);
    expect(html).toContain('href="https://alhidaya.qa"');
    expect(html).toContain("Hello &lt;script&gt;alert(1)&lt;/script&gt;,");
    expect(html).not.toContain("<script>");
    expect(html).toContain("https://alhidaya.qa/x?a=1&amp;b=2");
    expect(html).toContain("Note");
  });

  it("leaves out the button and the note when there are none", () => {
    const html = emailHtml({ ...parts, action: undefined, note: undefined });
    expect(html).not.toContain("Copy this:");
    expect(html).not.toContain(">Note<");
  });
});

describe("an email's answers", () => {
  const details = [
    { label: "Your name", value: "Mariam <b>Ali</b>" },
    { label: "Message", value: "First line\nSecond line" },
  ];

  it("stand under their labels, escaped, each keeping its own lines", () => {
    const html = emailHtml({ ...parts, details });
    expect(html).toContain(">Your name<");
    expect(html).toContain("Mariam &lt;b&gt;Ali&lt;/b&gt;");
    expect(html).toContain("First line<br>Second line");
    expect(emailHtml(parts)).not.toContain("border-top:1px solid");
  });

  it("read the same in plain text, a label that is a question or a sentence keeping its own ending", () => {
    expect(emailText({ ...parts, details })).toContain(
      "Your name:\nMariam <b>Ali</b>\n\nMessage:\nFirst line\nSecond line",
    );
    const asked = emailText({ ...parts, details: [{ label: "Who is the care for?", value: "A school" }] });
    expect(asked).toContain("Who is the care for?\nA school");
  });
});

describe("emailText", () => {
  it("says the same in plain text", () => {
    const text = emailText(parts);
    expect(text).toContain("Open: https://alhidaya.qa/x?a=1&b=2");
    expect(text).toContain("Note");
    expect(text.endsWith(`${UI_TEXT.siteName}\nFootnote`)).toBe(true);
    expect(emailText({ ...parts, action: undefined, note: undefined })).not.toContain("Open:");
  });
});
