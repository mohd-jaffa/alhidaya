import { UI_TEXT } from "@/constants/messages";

/**
 * The colours an email is drawn in, written out: mail apps read no stylesheet
 * variables, and most read no stylesheet at all, so every style sits on its
 * element. The logo's colours (plan §30.2): navy ink on white, one deep-blue
 * action; aligned with the site's tokens when they are set (R2.1). Light
 * only: mail apps darken an email themselves.
 */
const COLOUR = {
  ground: "#f3f7fb",
  surface: "#ffffff",
  border: "#d7e3ef",
  text: "#0b2440",
  muted: "#43566b",
  action: "#0f64ac",
  actionText: "#ffffff",
  line: "#33a0da",
} as const;

// A system face wherever a mail app has one; nothing is fetched, so opening
// an email tells no font service anything.
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** Anything a person typed, made safe to stand in an email's HTML. */
export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

export interface EmailParts {
  /** The site's address, where the name at the top leads. */
  siteUrl: string;
  subject: string;
  /** What a mail app shows beside the subject, before the email is opened. */
  preheader: string;
  heading: string;
  /** Plain text, a paragraph each; the first is the greeting. */
  paragraphs: string[];
  /** Answers under their labels, after the paragraphs: what a visitor sent (plan §10.4). */
  details?: readonly { label: string; value: string }[];
  /** The one thing to do, as a button, with its address in words under it. */
  action?: { label: string; url: string; fallback: string };
  /** A line under the button: how long its link lasts. */
  note?: string;
  /** Why this email came, and what to do if it should not have. */
  footnote: string;
}

const paragraph = (text: string, last: boolean) =>
  `<p style="margin:0 0 ${last ? 0 : 16}px;font-family:${SANS};font-size:16px;line-height:26px;color:${COLOUR.muted};">${escapeHtml(text)}</p>`;

/** Each answer under its label; a value's own lines are kept. */
function detailRows(details: readonly { label: string; value: string }[]): string {
  const rows = details
    .map(
      ({ label, value }) => `<tr>
              <td style="padding:12px 0;border-top:1px solid ${COLOUR.border};">
                <p style="margin:0 0 4px;font-family:${SANS};font-size:13px;line-height:20px;font-weight:600;color:${COLOUR.muted};">${escapeHtml(label)}</p>
                <p style="margin:0;font-family:${SANS};font-size:16px;line-height:24px;color:${COLOUR.text};">${escapeHtml(value).replace(/\n/g, "<br>")}</p>
              </td>
            </tr>`,
    )
    .join("\n            ");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0;">
            ${rows}
          </table>`;
}

/**
 * An email in the site's plain voice: the name above a sky-blue line, the
 * words on a white card, one deep-blue button. Tables and inline styles, for
 * every mail app from Gmail to Outlook; a phone's gets a narrower frame.
 * Everything a person gave is escaped.
 */
export function emailHtml(parts: EmailParts): string {
  const base = parts.siteUrl.replace(/\/+$/, "");
  const button = parts.action
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
        <tr>
          <td bgcolor="${COLOUR.action}" style="border-radius:8px;background:${COLOUR.action};">
            <a href="${escapeHtml(parts.action.url)}" style="display:inline-block;padding:15px 28px;font-family:${SANS};font-size:16px;font-weight:600;line-height:20px;color:${COLOUR.actionText};text-decoration:none;border-radius:8px;">${escapeHtml(parts.action.label)}</a>
          </td>
        </tr>
      </table>
      <p style="margin:20px 0 0;font-family:${SANS};font-size:13px;line-height:20px;color:${COLOUR.muted};">${escapeHtml(parts.action.fallback)}<br><a href="${escapeHtml(parts.action.url)}" style="color:${COLOUR.action};word-break:break-all;">${escapeHtml(parts.action.url)}</a></p>`
    : "";
  const note = parts.note
    ? `<p style="margin:16px 0 0;font-family:${SANS};font-size:13px;line-height:20px;color:${COLOUR.muted};">${escapeHtml(parts.note)}</p>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${escapeHtml(parts.subject)}</title>
<style>
  :root { color-scheme: light only; supported-color-schemes: light only; }
  body { margin: 0; padding: 0; }
  @media (max-width: 600px) {
    .mail-frame { padding: 24px 12px !important; }
    .mail-card { padding: 28px 22px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${COLOUR.ground};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(parts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLOUR.ground}" style="background:${COLOUR.ground};">
  <tr>
    <td align="center" class="mail-frame" style="padding:40px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
        <tr>
          <td style="padding:0 4px 16px;border-bottom:3px solid ${COLOUR.line};">
            <a href="${escapeHtml(base)}" style="font-family:${SANS};font-size:19px;line-height:28px;font-weight:700;color:${COLOUR.text};text-decoration:none;">${escapeHtml(UI_TEXT.siteName)}</a>
          </td>
        </tr>
        <tr><td style="height:20px;line-height:20px;font-size:0;">&nbsp;</td></tr>
        <tr>
          <td class="mail-card" bgcolor="${COLOUR.surface}" style="background:${COLOUR.surface};border:1px solid ${COLOUR.border};border-radius:12px;padding:40px 40px 36px;">
            <h1 style="margin:0 0 20px;font-family:${SANS};font-size:26px;line-height:32px;font-weight:700;color:${COLOUR.text};">${escapeHtml(parts.heading)}</h1>
            ${parts.paragraphs.map((text, at) => paragraph(text, at === parts.paragraphs.length - 1)).join("\n            ")}
            ${parts.details ? detailRows(parts.details) : ""}${button}${note}
          </td>
        </tr>
        <tr>
          <td style="padding:24px 4px 0;">
            <p style="margin:0;font-family:${SANS};font-size:12px;line-height:19px;color:${COLOUR.muted};">${escapeHtml(parts.footnote)}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/** The same email as plain text, for a mail app that shows no HTML. */
export function emailText(parts: EmailParts): string {
  return [
    ...parts.paragraphs.flatMap((text) => [text, ""]),
    // A label that is a question or a sentence keeps its own ending.
    ...(parts.details ?? []).flatMap(({ label, value }) => [/[.?!:]$/.test(label) ? label : `${label}:`, value, ""]),
    ...(parts.action ? [`${parts.action.label}: ${parts.action.url}`, ""] : []),
    ...(parts.note ? [parts.note, ""] : []),
    "—",
    UI_TEXT.siteName,
    parts.footnote,
  ].join("\n");
}
