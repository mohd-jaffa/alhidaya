# Changelog

All notable changes to this project are recorded here, newest last. Entries are
appended and never rewritten (AGENTS.md §26).

## 2026-10-28 — planning

### Added
- **The plan** (`healthcare-portfolio-website-studio.md`), rewritten from the
  initial draft for Al Hidaya: the product, the specifications, the
  architecture, the data model, the API, the design direction, the motion and
  performance rules, testing, deployment to cPanel, and the delivery phases
  0 – 8 with a tracker. The initial draft is kept unchanged at
  `docs/planning/2026-10-28-initial-draft.md`; plan §43 lists every change.
- **The decision log** (plan §2, D1 – D38): every answer from the planning
  interview, among them English now and Arabic later under `/ar`; a Content
  CMS with the design locked; one admin; Quote and Contact forms; CVs to
  Google Drive and the HR email; retention set by the admin up to a year;
  hosting on the client's cPanel; cPanel SMTP from `no-reply@alhidaya.qa`;
  Turnstile; Cloudflare Web Analytics; light only; GSAP + Lenis; testing and
  git as clinicdesk.
- **`PRODUCT.md`** from the Impeccable interview: audiences, purpose,
  positioning, brand commitments (the logo's colours, premium and never
  childish, very smooth, healthcare worlds only), the evidence on hand and
  what must never be invented.
- **The design direction, "Follow the Line"** (plan §30.1, D36): hospital
  wayfinding in the logo's colours, chosen by the user on the Impeccable
  decision page after one re-roll; its direction contract is in
  `.impeccable/surfaces/src-app-site-page-tsx.md`.
- **`AGENTS.md`**, adapted from clinicdesk's, and **`CLAUDE.md`**, which loads
  it; **`README.md`**; this changelog.
- The logo, copied to `docs/brand/al-hidaya-logo-original.jpg`.

### Validation
- Planning only; no code yet. Section cross-references checked.

### Blockers
- None. Open questions (plan §41) each carry a default; client prerequisites
  are listed in plan §40 (SSH access is needed for R0.8).

## 2026-10-28 — R0.2, the app

### Added
- **The Next.js app** (plan R0.2): Next.js 16.4 with the React Compiler and
  `output: "standalone"` (the build cPanel's Passenger runs, plan §35.3);
  React 19.3; TypeScript 5.9, strict; Tailwind CSS 4.3; ESLint 9 with Next's
  rules and the `src/lib` → `src/features` import ban; Prettier at 120
  columns; Node 22 (`.nvmrc`, `engines`); `@/` and `@tests/` paths; npm
  scripts as clinicdesk.
- The root layout (English, `dir="ltr"`, metadata from `UI_TEXT`) and a
  placeholder Home at `src/app/(site)/page.tsx` until R3.3.
- `src/constants/messages.ts`, the start of the message catalogue.

### Validation
- Typecheck, lint and format check passed.
- `npm run build` passed; `node .next/standalone/server.js` served `/` (200).
- No tests yet: the harness arrives with R0.3.

### Blockers
- None.

## 2026-10-28 — the client's server instead of Supabase; R0.8, the server check

### Changed
- **Supabase is replaced by the client's own cPanel server** (plan D39 – D43,
  D49), at the user's request: **MySQL 8.0** on the server (its cPanel does not
  support PostgreSQL), **Drizzle ORM** with Drizzle Kit migrations, **Better
  Auth** for the admin's sign-in, images in a media folder and **CVs in a
  private folder on the server, attached to the HR email** (no Google Drive),
  and a cPanel cron job for the retention purge. The plan's architecture,
  security model (§26: no row-level security; access enforced in the server
  code, a least-privilege database user), data model, migrations, API,
  testing, environments, deployment and tracker follow; `PRODUCT.md`,
  `AGENTS.md` and `README.md` with them.
- **Nothing is deployed to or changed on the client's server until the user
  confirms full payment** (D48); until then SSH is read-only. The current
  site is backed up and downloaded before any change (D44, new row R0.9).
- SSH by a dedicated key pair on this machine, authorised by the client in
  cPanel (D46); installs use npm 11 (D47).

### Added
- **R0.8, the server check** (read-only, over SSH port 2200), recorded in plan
  §21.1: HostCarts shared cPanel on OVH in Singapore; CloudLinux 8; Node 22.22
  with Passenger; **1 GB memory, 1 core, 1 GB disk (733 MB free), 5 GB
  bandwidth a month**; MySQL 8.0.46, at most 2 databases (1 used); the
  domain's **mail is Microsoft 365** with cPanel routing set to Remote; SPF
  valid, **DKIM missing, no DMARC**; `noreply@alhidaya.qa` already exists; the
  current site is Laravel 9 on PHP 8.1.
- Plan §21.2 (living within 1 GB of disk), §21.3 (serving uploaded images),
  §40.1 (findings on today's site for the client), and open questions Q24 –
  Q28 (sender mailbox, a hosting-plan upgrade, image serving, the old site's
  CVs and data, reusing its service photos). Q1 and Q20 are answered.

### Validation
- Documentation only. The server was read, never changed: no file written,
  moved or deleted. No `.env` content was read or printed; the public zip was
  checked by response headers and its file list only.

### Blockers
- **Security, today's site (plan §40.1), for the client to act on now:**
  `public_html/.well-known.zip` is publicly downloadable and contains the old
  site's `application/.env`; 83 CVs sit in `public_html/upload/CV` without an
  access rule. Not changed by us (D48); waiting on the user's decision.
- Full payment (D48) for R0.9 and every server step.

## 2026-10-28 — decisions: disk, CVs, sender, security

### Changed
- **The user backs up the old site** before the deploy, gives the backup to
  the client and clears the old site and its database from the server (plan
  D50); R0.9 is now theirs, still after full payment (D48).
- **No hosting upgrade** (D51): plan §21.2 now budgets the 1 GB disk (two
  releases ≤ 250 MB, media ≤ 250 MB, CVs ≤ 250 MB, database, logs and mail
  ≤ 150 MB, headroom ≥ 50 MB), with uploads refused past their budget and
  image originals not kept.
- **CVs have their own expiry**, set in the admin (1 – 365 days, D52), and
  **can be opened from cPanel's File Manager** (D54): readable, sanitised
  names under `~/alhidaya-data/cvs/<YYYY-MM>/`, folders `700` and files `600`,
  never web-reachable, admin downloads audited (plan §9.4).
- The media folder gets its own `.htaccess`: no listing, no script execution,
  only image and PDF types (plan §15).
- **The sender is `noreply@alhidaya.qa`** (D53).
- **Security is a must** (D55): CI runs `npm audit`; R7.3 is an OWASP ASVS
  level 2 review.
- `AGENTS.md` follows; Q4, Q8, Q24, Q25 and Q27 answered or updated.

### Validation
- Documentation only.

### Blockers
- None new. Plan §40.1 (today's site) still waits on the client.
