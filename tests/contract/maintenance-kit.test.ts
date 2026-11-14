import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { SITE } from "@/constants/site";

// The maintenance page shown during the cutover window (docs/RELEASE.md section 6): static, self-contained, and
// answering 503 so search engines keep the rankings. scripts/test-maintenance-kit.sh proves it in a real Apache.
const page = readFileSync("deploy/maintenance/maintenance.html", "utf8");
const block = readFileSync("deploy/maintenance/htaccess.block", "utf8");
const script = readFileSync("scripts/maintenance.sh", "utf8");
const seed = readFileSync("src/db/seed/content.ts", "utf8");

describe("maintenance page", () => {
  it("is one self-contained, script-free, indexable-never document", () => {
    expect(page).toMatch(/^<!doctype html>\s*<html lang="en">/i);
    expect(page).toContain('<meta name="viewport"');
    expect(page).toMatch(/<meta name="robots" content="noindex"\s*\/?>/);
    // url(#id) is the logo's own gradient inside the inline SVG; any other url() would be a network request.
    expect(page).not.toMatch(/<script|<link|@import|<img|<iframe|url\((?!#)/i);
    // The only addresses it links to are the three ways to reach the company.
    const links = [...page.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
    expect(links).toHaveLength(3);
    expect(links.every((link) => /^(https:\/\/wa\.me\/\d+|tel:\+\d+|mailto:[^@\s]+@[^@\s]+)$/.test(link))).toBe(true);
  });

  it("names the company's real contact details, taken from the site's own constants and content", () => {
    expect(page).toContain(`mailto:${SITE.defaultRecipients.enquiries}`);
    const phone = /href="tel:(\+\d+)"/.exec(page)?.[1];
    expect(phone).toMatch(/^\+974\d{8}$/);
    expect(seed).toContain(phone);
    expect(page).toContain(`https://wa.me/${phone?.slice(1)}`);
  });

  it("says what is happening in words, with a heading and a labelled contact group", () => {
    expect(page).toMatch(/<h1>[^<]+<\/h1>/);
    expect(page).toContain('aria-labelledby="reach"');
    expect(page).toContain('id="reach"');
  });
});

describe("maintenance rules", () => {
  it("answer 503 with Retry-After for everything except the notice and the SSL challenges", () => {
    expect(block).toContain("# BEGIN MAINTENANCE");
    expect(block.trim().endsWith("# END MAINTENANCE")).toBe(true);
    expect(block).toContain("RewriteRule ^ - [R=503,L]");
    expect(block).toContain("ErrorDocument 503 /maintenance.html");
    // The three headers belong to the 503 only, so a checked response shows the site's own headers.
    for (const header of ['Retry-After "3600"', 'Cache-Control "no-store"', 'X-Robots-Tag "noindex"']) {
      expect(block).toContain(`Header always set ${header} "expr=%{REQUEST_STATUS} == 503"`);
    }
    expect(block).toContain("!^/maintenance\\.html$");
    expect(block).toContain("!^/\\.well-known/(acme-challenge|pki-validation)/");
    expect(block).toContain("Options -Indexes");
  });

  it("let one request through: the window's release-check token, never written in the repository", () => {
    expect(block).toContain("RewriteCond %{HTTP:X-Release-Check} !=@BYPASS_TOKEN@");
    expect(block.match(/@BYPASS_TOKEN@/g)).toHaveLength(1);
    // maintenance.sh makes a fresh token, puts it into the rules and into a private file on the server, and
    // removes that file again when the page goes off; it never echoes it.
    expect(script).toContain("openssl rand -hex 16");
    expect(script).toContain('sed "s/@BYPASS_TOKEN@/$token/g"');
    expect(script).toContain("umask 077");
    expect(script).toContain(".maintenance-token");
    expect(script).not.toMatch(/echo[^\n]*\$token|printf[^\n]*\$token[^|\n]*$/m);
    expect(`${page}${block}${script}`).not.toMatch(/X-Release-Check:\s*[0-9a-f]{16,}/);
  });

  it("use the same markers the switch script cuts the block out by", () => {
    expect(script).toContain("/^# BEGIN MAINTENANCE/");
    expect(script).toContain("/^# END MAINTENANCE/");
    expect(script.match(/# BEGIN MAINTENANCE/g)).toHaveLength(2);
  });
});
