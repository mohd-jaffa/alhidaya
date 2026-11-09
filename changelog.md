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

## 2026-10-28 — R0.3, the test harness

### Added
- **Vitest** (plan R0.3): a `unit` project in jsdom over `tests/` and an
  `integration` project whose global setup (`tests/support/local-database.ts`)
  refuses any database but the local MySQL; coverage over `src/**` at 100%
  (pages and layouts excluded, as composition).
- **Playwright**: the built standalone app on port 3100, phone (390×844) and
  desktop (1440×900), axe on every page; it refuses a non-local database.
- `scripts/check-test-paths.mjs` (every unit test mirrors a file in `src/`,
  none inside `src/`), run before `npm test` and coverage.
- `scripts/standalone-assets.mjs`: `npm run build` now copies `public/` and
  `.next/static` into `.next/standalone`, so the journeys run the folder
  exactly as Passenger will; `npm start` runs it.
- The first tests: `UI_TEXT` (unit) and Home with axe (E2E).

### Changed
- Installs use npm 11 (plan D47): `npx -y npm@11 install`. npm 11 holds back
  one install script (`unrs-resolver`, ESLint's resolver; its optional
  fallback), which lint does not need.

### Validation
- Lint, format check and typecheck passed.
- Unit tests passed (2), coverage 100%.
- E2E passed, phone and desktop, axe clean.
- The integration project has no tests yet; its first, against the local
  MySQL, arrives with R0.4.

### Blockers
- None.

## 2026-10-28 — R0.4, the local services

### Added
- **`compose.yaml`** (plan R0.4): **MySQL 8.0.46**, the client's server's exact
  version, and **Mailpit 1.32**, bound to this machine on 563xx ports
  (MySQL 56306, Mailpit 56324, SMTP 56325). Images come from AWS's mirror of
  the official MySQL image and Mailpit's GitHub registry (D57): Docker
  Desktop here cannot reach Docker Hub, and CI avoids its pull limits.
- `docker/mysql/init/01-databases-and-users.sql`: databases `alhidaya` and
  `alhidaya_test` in `utf8mb4`, and the two users production will have:
  `alhidaya_app` (data rights only) and `alhidaya_migrator` (schema rights).
- **Drizzle** (`drizzle-orm`, `mysql2`; `drizzle-kit` for migrations) and
  `drizzle.config.ts`, which migrates as the migrator; scripts
  `services:start`, `services:stop`, `db:generate`, `db:migrate`.
- `.env.example` with the local addresses; the integration project maps the
  app's `DATABASE_URL` to the test database.
- The first integration test (`tests/db/integration/local-database.test.ts`):
  the database is MySQL 8.0.46, stores `utf8mb4`, and **refuses the app any
  schema change** (create table, drop database).
- Plan D56: server versions may be updated when needed, after full payment.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (5), coverage 100%.
- `npm audit --omit=dev`: 0 vulnerabilities. The whole tree has 4 moderate
  findings, one esbuild dev-server advisory (GHSA-67mh-4wv8-2f99) reached only
  through `drizzle-kit`'s loader: a development tool that never ships, whose
  dev server is never run.
- Env validation (`src/lib/env`) moves to R0.6, with the error catalogue it
  reports through (as clinicdesk).

### Blockers
- None.

## 2026-10-28 — R0.5, CI

### Added
- **`.github/workflows/ci.yml`** (plan R0.5), on every push to `main`, every
  pull request, and callable by the release workflow with a `ref`:
  - `checks`: npm 11, `npm ci`, lint, format check, typecheck, unit tests,
    and the **dependency audit** (plan D55): what ships may have no known
    vulnerability at moderate or above (`npm audit --omit=dev`), the tools
    none at high or above.
  - `app`: MySQL 8.0.46 and Mailpit from the same `compose.yaml` as a laptop,
    `.env.local` from the example (local values only), unit + integration
    tests with coverage at 100%, the build, and the journeys on it (phone and
    desktop, axe); reports kept 14 days on failure.
- README: the CI section.

### Validation
- The workflow parses (Prettier). Its steps run green locally: both audits
  exit 0, coverage 100% (5 tests), build, E2E (2 passed).
- The first run on GitHub waits for the repository (plan §40).

### Blockers
- None.

## 2026-10-28 — R0.6, the core library

### Added
- **Errors** (`src/lib/errors`, plan R0.6), ported from clinicdesk: one
  `AppError` with `code`, `kind` and `traceId`, built only through the
  factories, now with a **429 rate-limited** kind for the forms and sign-in;
  `toAppError`, `errorMessage`; and **`fromDatabaseError`** for MySQL
  (duplicate key, deadlock, references → 409; `CHECK` → 422; bad values →
  400; connection lost → 503; everything else, a refused grant included,
  internals), reaching the driver's error inside Drizzle's wrapper. The
  driver's text never reaches a response.
- **The error catalogue** (`ERROR_MESSAGES`, `getErrorMessage`,
  `isErrorMessageCode`) in `src/constants/messages.ts`.
- **The logger** (`src/lib/logger.ts`): one JSON line per event, redacting
  credentials (passwords, tokens, sessions, database URLs) and anything
  personal on this site (names, phones, WhatsApp, emails, addresses,
  messages, notes, CVs, licence details, IPs), by key.
- **The API layer** (`src/lib/api`): the envelope (`no-store`, `nosniff`,
  `x-request-id`), `withApiHandler` (refusals logged as warnings, faults as
  errors with their cause, never returned), `readJson`, `readQuery`,
  `readBody` (oversized uploads refused before reading, and when the declared
  length lies), and a request id that **refuses a caller's id that could forge
  a log line**; the browser client (`getJson`, `postJson`, `patchJson`,
  `putJson`, `deleteJson`, `postForm` for CVs and images), with offline and
  unreachable told apart. No session-refresh dance: Better Auth's cookies need
  none.
- **Env validation** (`src/lib/env`, from R0.4): `DATABASE_URL` must be a MySQL
  address, `NEXT_PUBLIC_SITE_URL` a URL; a failure names the variable, **never
  its value** (a database URL carries a password).
- `cspell.json` (British English and the project's words), as clinicdesk.
- Zod 4.

### Changed
- `vitest.config.mts` uses `import.meta.dirname` (Vite's native loader).
- The tracker: `params` arrives with the first route (R1.2) and `lib/query`
  (SWR) with the admin screens (R6.2), not before they are needed.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (55), coverage 100% (169 statements,
  101 branches, 51 functions).
- Build passed; E2E passed, phone and desktop, axe clean.

### Blockers
- None.

## 2026-10-28 — R0.7, constants and validation

### Added
- **Constants** (plan R0.7, §25): `limits.ts` (text lengths; the firm upload
  limits, CV 5 MB and images 10 MB, originals kept at most 2400 px wide; the
  disk budgets, media and CVs 250 MB each, warning at 80 %; retention and CV
  expiry 1 – 365 days, 180 by default; the form rate limit, 5 per 10 minutes;
  the sign-in lockout, 5 failures for 15 minutes), `site.ts` (the domain, the
  sender `noreply@alhidaya.qa`, the default recipients info@ and hr@),
  `routes.ts` (every public and admin page), and in `messages.ts` the
  `VALIDATION_MESSAGES` and the WhatsApp first line (Q14).
- **Text hygiene** (`src/lib/text/normalise.ts`, from clinicdesk): NFC,
  invisible and control characters removed, whitespace collapsed, line breaks
  kept where a field has lines.
- **Phone numbers** (`src/lib/phone.ts`), rewritten for **Qatar**: stored as
  E.164; an 8-digit Qatar number (3, 4, 5, 6 or 7 first) may be typed without
  its code, written `+974`, `00974` or `(+974)`; any other country needs its
  code; `formatPhone` ("+974 3130 6555"), `callHref`, `whatsAppHref`.
- **Validation primitives** (`src/lib/validation`): required and optional
  lines, multi-line text, email (stored lower case) and phone (stored E.164),
  each problem in the field's own words; blank optional fields are null; and
  the wording floor, so Zod's English never reaches a visitor.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (84), coverage 100% (257 statements,
  153 branches, 83 functions).
- Build passed; E2E passed, phone and desktop, axe clean.
- `npm audit --omit=dev`: 0 vulnerabilities.

### Blockers
- None.

## 2026-10-28 — CI audits the build that ships

### Changed
- **The "what ships" audit now reads the standalone build itself**
  (`scripts/audit-shipped.mjs`, `npm run audit:shipped`, run in CI after the
  build): any package inside `.next/standalone` with a known vulnerability at
  moderate or above fails the run. `npm audit --omit=dev` could not answer
  that question: Better Auth lists `drizzle-kit` as an optional peer, which
  pulls the migration tool (and its old esbuild, GHSA-67mh-4wv8-2f99) into
  npm's production view, although neither is ever imported nor present in the
  build. The whole tree is still audited at high and above.

### Validation
- The script passes on today's build (13 packages ship) and fails when a
  vulnerable package is planted in the build, then passes again once removed.
- Better Auth 1.7.14 installed for R1.2; the tree has no high or critical
  finding.

### Blockers
- None.

## 2026-10-28 — R1.1, the database client and the auth tables

### Added
- **`src/db/client.ts`** (plan R1.1): one mysql2 pool per server process,
  made on first use (a build never connects), kept across hot reloads; five
  connections (shared hosting, plan §21.1); every connection's clock pinned to
  UTC, and dates sent and read as UTC, whatever the server's time zone;
  `closeDb()` for scripts and tests.
- **The schema conventions** (`src/db/schema/columns.ts`): random UUID ids
  (no admin URL can be guessed from another), `datetime(3)` instants set by
  the app, `created_at` and `updated_at` on every table.
- **`0000_auth`** (`src/db/schema/auth.ts`, `drizzle/0000_auth.sql`): Better
  Auth's `auth_user`, `auth_session`, `auth_account` and `auth_verification`,
  field for field as its core schema names them; a unique admin email,
  unique session tokens, sessions and accounts deleted with their admin,
  every lookup indexed; and **`sign_in_attempts`** for the lockout, which keeps
  only a keyed hash, never an email or an IP.
- The integration setup now migrates the test database (as the migrator)
  before each run; `npm run db:migrate` migrated the local one.
- Tests: the schema's rules from Drizzle's own view (unit), the migration's
  SQL (contract), and the pool against the local MySQL: one pool, UTC
  connections, timestamps to the millisecond (integration).

### Changed
- Migrations are numbered from `0000`, as Drizzle Kit writes them; plan §28 and
  the Phase 1 rows follow.
- `drizzle/meta/` (written by Drizzle Kit) joins `.prettierignore`.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (98), coverage 100% (288 statements,
  155 branches, 97 functions).
- Build passed; the shipped-build audit passed (13 packages); E2E passed,
  phone and desktop, axe clean.

### Blockers
- None.

## 2026-10-28 — R1.7, mail

### Added
- **The mail interface** (`src/lib/mail`, plan R1.7), ported from clinicdesk:
  one `MailProvider`, `NodemailerProvider` over SMTP, and `MailService` with
  one method per email. Messages now carry a **Reply-To** (the visitor, so the
  team answers them directly) and **attachments** (the CV for HR, plan
  §9.3). Mail is sent as `Al Hidaya Health Care Services
  <noreply@alhidaya.qa>` (D53); **TLS is required in production** (port 465,
  or STARTTLS on 587); with no `SMTP_HOST` mail is off and says so
  (`MAIL_NOT_CONFIGURED`), never undoing what it was for.
- **The email layout** in the logo's colours (navy ink, one deep-blue
  button, a sky-blue rule), tables and inline styles for every mail app,
  light only, no fetched fonts; **everything a person typed is escaped**.
- **The password-reset email** (`MAIL_TEXT.passwordReset`); its link works
  for 30 minutes, once (`PASSWORD_RESET_MINUTES`). The enquiry and
  application alerts join with their forms (R4.3, R5.4).
- Env: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`,
  `SMTP_PASSWORD` (Mailpit locally; the server's cPanel mail in production,
  R8.3); `MAILPIT_URL` for the tests.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (114), coverage 100% (334 statements,
  194 branches, 117 functions); an email with a Reply-To and a PDF attachment
  went through Mailpit's SMTP and was read back from its API.
- Build passed; the shipped-build audit passed; E2E passed, phone and
  desktop, axe clean.

### Blockers
- None.

## 2026-10-28 — R1.3, the audit trail and the error log

### Added
- **`0001_logs`** (plan R1.3): `audit_log` (the admin's changes, kept a
  year; a row outlives its admin account, `ON DELETE set null`) and
  `error_log` (the server's failures, kept a month); their actions and
  sources are `CHECK`s written from `AUDIT_ACTIONS` and `ERROR_SOURCES`
  (`src/constants/statuses.ts`), kept equal by a contract test; indexed by
  date and by entity.
- **`captureError`** (`src/lib/audit/errorLog.ts`, from clinicdesk): the
  failure to the server's output and to `error_log`, its context redacted,
  each field clipped to its column; **never throws**.
- **`logActionSafe`** (`src/lib/audit/auditLog.ts`): one admin change, the
  admin taken from the checked session; a failure to write is logged and
  swallowed. `changes` carries field names only for anything personal
  (AGENTS.md §8).
- **`cleanUpLogs`** (`src/lib/audit/retention.ts`): removes what is past its
  keeping, cut-offs worked out in UTC by the app; the daily job runs it (R6.7).
- `src/instrumentation.ts`: what Next catches itself (a page it could not draw,
  a route that threw) goes to the error log, the query left off the path.

### Changed
- `withApiHandler` sends a server fault to the error log, under the request
  id the person is shown, instead of only the output.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (132), coverage 100% (373 statements,
  232 branches, 127 functions); MySQL refuses an unknown audit action by its
  `CHECK`, and the refusal lands in the error log.
- Build passed; the shipped-build audit passed; E2E passed, phone and
  desktop, axe clean.

### Blockers
- None.

## 2026-10-28 — R1.2, the admin's sign-in

### Added
- **Better Auth on the site's own database** (`src/lib/auth/auth.ts`, plan
  R1.2, D43): email and password; **public sign-up disabled**; passwords
  12 – 128 characters, scrypt-hashed; 8-hour sessions extended hourly while in
  use, the cookie lasting for the browser's session only (`HttpOnly`,
  `SameSite=Lax`, `Secure` in production, prefix `alhidaya`); UUID ids;
  telemetry off. **Its HTTP routes are never mounted**: the admin's own routes
  call it on the server, so there is no sign-up endpoint and nothing else to
  discover.
- **The admin's routes**: `POST`/`DELETE /api/admin/session` (sign in, sign
  out), `POST /api/admin/password/forgot` and `/reset`. Every state-changing
  request must come from the site's own origin (`assertSameOrigin`); every
  admin route checks the session against the database (`withAdminRoute`).
- **The lockout** (`src/features/auth/lockout.ts`): five failures for an email
  or from an IP lock it for 15 minutes, counted under keyed hashes
  (`HASH_SECRET`), never the email or the IP; a lapsed lock starts the count
  again; the right password is refused while locked.
- **Every failed sign-in takes at least 800 ms**, so a wrong password and an
  unknown email, which Better Auth already answers alike, cannot be told
  apart by timing either.
- **Password reset**: a one-time link to the admin's own reset page (30
  minutes), the same answer for any email, **at most 3 mails an hour to an
  email** (silently) and **10 requests an hour from an IP** (then 429); a reset
  ends every session the admin had.
- **`0002_rate_limits`** and `consumeRateLimit` (`src/lib/rate-limit`):
  fixed-window counters under keyed hashes; the forms reuse them (R1.5).
- **`src/proxy.ts`**: a page under `/admin` without a session cookie goes to
  sign-in, keeping where it was headed; sign-in and the password pages are
  open; every admin page is sent `X-Robots-Tag: noindex, nofollow`. The
  secure cookie name in production is recognised.
- **`npm run admin:create -- --email … --name …`**
  (`scripts/create-admin.mts`, `src/features/auth/createAdmin.ts`): the only
  way an account comes to exist; the password is asked for unseen, twice,
  never taken from the command line, and works piped in over SSH.
- Audit rows for sign-in, sign-out, reset requests and password changes; the
  IP is taken as the last `X-Forwarded-For` entry (the one the server in front
  added), to be checked on the server at R8.2.
- Env: `BETTER_AUTH_SECRET`, `HASH_SECRET` (at least 32 characters each).

### Changed
- **The "what ships" audit now reads the runtime dependency closure** from the
  lockfile (`scripts/audit-shipped.mjs`), and runs in CI's `checks` job.
  Turbopack compiles Better Auth, mysql2 and the rest into its own server
  chunks, so the standalone build's `node_modules` (13 packages) missed most
  of what ships; the closure (89 packages) holds everything the app can load,
  bundled or not, and still leaves out development tools and optional peers
  (drizzle-kit). Proven both ways: a planted finding in `zod` fails it; ones
  only in esbuild, drizzle-kit and vitest pass.
- Plan §28 and §29: migrations renumbered after `0002_rate_limits`; the API
  table names the admin's own routes instead of Better Auth's.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (186), coverage 100% (520 statements,
  283 branches, 165 functions). Against the local MySQL and Mailpit: an
  account made, a sign-in with an HttpOnly cookie the database recognises,
  wrong password and unknown email refused alike and never faster than
  800 ms, the email locked after five failures even against the right
  password and from another IP, a lapsed lock counting again, sign-out ending
  the session, a reset email whose token sets a new password and ends the old
  session, the token refused a second time, nothing sent to an unknown email,
  an email's mail capped and an IP refused past its limit.
- `npm run admin:create` refuses mismatched and short passwords, creating
  nothing.
- Build passed; the shipped audit passed (89 packages); E2E passed, phone
  and desktop, axe clean.

### Blockers
- None. The admin sign-in screens arrive with the admin shell (R6.2); until
  then `/admin` redirects to a sign-in page that is not built yet.

## 2026-10-28 — R1.6, file storage

### Added
- **File types from first bytes** (`src/lib/storage/file-type.ts`, plan
  R1.6, §26.5): JPEG, PNG, WebP, AVIF, PDF, DOCX (a zip that holds
  `word/document.xml`, no other zip) and DOC; anything else, SVG and scripts
  included, is refused whatever its name says. The allowed lists are in
  `src/constants/uploads.ts`.
- **The CV folder** (`src/lib/storage/cvs.ts`, plan §9.4, D54): CVs under
  `CV_DIR/<YYYY-MM>/`, outside `public_html`, **folders `700`, files `600`**,
  named so a person finds them in cPanel's File Manager
  (`2026-10-28_registered-general-nurse-home-care_mariam-ali_8f3a2c91d0.pdf`):
  the job and name reduced to safe ASCII (Arabic and empty fall back to
  `general` and `applicant`), the extension taken from the detected type, a
  random part so no two collide. Only PDF and Word files; refused past the
  250 MB budget (`STORAGE_FULL`); read and deleted only by a key that matches
  the app's own pattern and stays inside the folder.
- **The media folder** (`src/lib/storage/media.ts`, plan §15, §21.3): public
  files under `MEDIA_DIR/<YYYY-MM>/`, **`644` in folders `755`**, named by the
  app, served at `MEDIA_URL`; only images and PDFs; refused past the 250 MB
  budget; and **its own `.htaccess`**: no listing, no CGI, PHP and script
  handlers removed, every file denied unless it is an image or a PDF,
  `nosniff`, cached a year.
- **The disk helpers** (`src/lib/storage/disk.ts`): a new file is written with
  exclusive create (`wx`), so nothing is ever written over or through an
  existing file or link; a folder's size never follows a link planted in it;
  a key that would leave its folder is refused.
- Env: `MEDIA_DIR`, `MEDIA_URL` (a plain path, `/media` by default), `CV_DIR`;
  locally `public/media` and `.data/cvs`, both git-ignored.

### Changed
- `.gitignore`: the uploads made while developing; the Supabase lines left
  from the first plan are gone.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (206), coverage 100% (632 statements,
  335 branches, 191 functions); the storage tests write real files in
  temporary folders and check their modes, the refusal of traversal keys,
  overwrites and planted links.
- Build passed; the shipped audit passed (89 packages); E2E passed, phone
  and desktop, axe clean.

### Blockers
- None.

## 2026-10-29 — R1.4, content with drafts and publishing

### Added
- **`0003_content`** (`src/db/schema/content.ts`, plan §27, D58 – D60):
  - `documents`, keyed: each page (`PAGE:<key>`, its SEO and its sections in
    order), the site's content (`SITE`) and each ordering (`ORDER:SERVICES`,
    `ORDER:CLIENTS`), each a `draft` and a `published` copy;
  - `records`: services, jobs and client logos, each a draft and a published
    copy, the published `slug` (unique within its collection), the slugs it
    had before, and `archived_at`;
  - `media` (the made sizes of an image, or the PDF; alt text, source) and
    `site_operations` (one row: recipients, retention and CV expiry days);
  - a `CHECK` for every key, collection and kind, written from the constants
    that own them (`oneOf`, now shared in `columns.ts`); retention and CV
    expiry bounded 1 – 365 days; a change's admin set to null if the account
    goes, the content kept.
- **The section catalogue** (`src/constants/sections.ts`, plan §7.2): the
  fixed pages, the section types, each page's rules (the sign first, which
  types it allows, how many, which it needs).
- **The content schemas** (`src/lib/validation/schemas/`): `content.ts`
  (per-language text, safe links only — a site path or https with no
  credentials, slugs, real calendar days, rich text as blocks and never HTML,
  SEO), `pages.ts` (every section type's content; a page checked against its
  rules), `records.ts` (service, job, client logo), `site.ts` (site content,
  orderings without repeats, operations).
- **Drafts and publishing** (`src/lib/content/`, plan §14): save writes the
  draft only; Publish copies it to the published copy in one statement (a
  document) or one transaction (a record, moving its address when its slug
  changes so the old one redirects); discard goes back to what is published;
  archive takes a record off the site and keeps it; a slug another record has
  is refused (`SLUG_TAKEN`). Every change is audited. Operations default to
  Q8 and Q17 until the admin sets them, and record what changed.
- **Published-only reads** (`src/features/{content,services,careers,clients,settings}/api.ts`):
  a page without its hidden sections, services and client logos in the
  published order (D59: a new order waits for Publish; records it does not
  name yet follow it), jobs open first and newest first, closing at the end
  of their day in Doha (`src/lib/dates.ts`), the site's content. None of them
  can return a draft.
- `databaseErrorCode` (`src/lib/errors`): the driver's code inside Drizzle's
  wrapper, so a duplicate slug is told apart from other failures.

### Changed
- Plan: D58 – D60 recorded; §27's tables and §28's migrations follow them
  (`0003_content`, then `0004_enquiries`, `0005_applications`); Q29 records
  D60 as the agent's default; R1.4 DONE.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (260), coverage 100% (844 statements,
  429 branches, 266 functions). Against the local MySQL: a draft never
  reaches a public read; publish, discard and archive; an old slug answering
  with the new one; a taken slug and an over-long one refused; records of
  another collection refused; the database refusing an unknown key, a second
  operations row and a retention of 0; jobs closing at Doha's midnight. The
  migration's `CHECK`s equal the constants.
- Build passed; the shipped audit passed (89 packages); E2E passed, phone
  and desktop, axe clean.

### Migration
- `0003_content` adds four tables; nothing existing changes. Applied to the
  local database.

### Blockers
- None.

## 2026-10-29 — R1.5, enquiries and applications

### Added
- **`0004_enquiries`** (`src/db/schema/enquiries.ts`, plan §10, §27): the
  Quote and Contact submissions, each with its form, status (`NEW`,
  `IN_PROGRESS`, `RESOLVED`), email status (`PENDING`, `SENT`, `NOT_SENT`),
  name, email and phone for the inbox's search, and every answer **with its
  label as the visitor saw it**; `enquiry_notes`, deleted with their enquiry.
  Indexed for the inbox (status, newest first) and the purge (by date). No IP
  is stored.
- **`0005_applications`** (`src/db/schema/applications.ts`, plan §9.3,
  §9.4): the job (or none, for a general application), its title as
  published when applied for, the answers with their labels, the CV's name
  as uploaded, its type (from its first bytes) and size, its key once saved,
  the CV status (`PENDING`, `STORED`, `NOT_STORED`, `EXPIRED`) and the email
  status; the database refuses a CV type outside PDF and Word, and an empty
  CV or one over 5 MB; `application_notes`, deleted with their application;
  an application outlives its job's record.
- **Submit in one transaction with the rate limit** (plan §10.3, Q16):
  `submitEnquiry` (`src/features/enquiries/api.ts`) and `submitApplication`
  (`src/features/careers/api.ts`) count the visitor's submission (five per
  form per ten minutes, by keyed hash) and store it in the same transaction:
  past the limit nothing is stored (`RATE_LIMITED`, 429), and a submission
  that fails to store is not counted. An application to a job that is not
  published, is archived, is not a job, or has closed in Doha today is
  refused (`JOB_CLOSED`, 422, plan §6.6).
- `consumeRateLimit` takes a transaction (`src/lib/rate-limit`).
- `src/constants/statuses.ts`: the enquiry, application, email and CV
  statuses; `src/constants/limits.ts`: the note, file-name and file-key
  lengths; `FORM_RATE_LIMIT` shaped as the other limits.

### Changed
- Plan §27: the enquiry and application rows name their statuses; R1.5 DONE.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (291), coverage 100% (884 statements,
  442 branches, 280 functions). Against the local MySQL: the sixth
  submission in a window refused and not stored, another form and the next
  window still taken, a failed submission not counted, a count in a rolled
  back transaction not kept; an application keeping the job's published
  title while the admin edits it, taken until midnight in Doha on its closing
  day, refused for closed, archived, draft, unknown and non-job ids; the
  database refusing an unknown form and wrong or out-of-bounds CVs; notes
  deleted with their submission. The migrations' `CHECK`s equal the
  constants.
- Build passed; the shipped audit passed (89 packages); E2E passed, phone
  and desktop, axe clean.

### Migration
- `0004_enquiries` and `0005_applications` add four tables; nothing existing
  changes. Applied to the local database.

### Blockers
- None.

## 2026-10-29 — R1.8, the seed

### Added
- **The seed content** (`src/db/seed/content.ts`, plan R1.8, D6): the current
  site's content, rewritten in plain professional English from the company's
  own facts, as drafts for the client to approve:
  - every page, its sections in plan §6's order (Privacy and Terms as a first
    draft from what the site actually does, §6.9, §18, for the client's
    review, Q18);
  - the site's content: name, description, phone and WhatsApp
    (+974 3130 6555), info@, the Al Sadd address in four lines, a Google Maps
    search link, "Available 24/7", Instagram, the navigation and footer
    links, SEO defaults; no brochure until one is uploaded;
  - **the eight services in the current order** with their audiences (§8),
    renamed only where the old name was unclear (Q9): *Nurse staffing for
    hospitals and clinics* (`hospital-and-clinic-staffing`), *Home nursing
    care* (`home-nursing-care`), *Chronic condition care*
    (`chronic-condition-care`); the other five keep their names and slugs.
    "What's included" is empty for every service until the client confirms
    it (Q9);
  - **the current job**, *Registered General Nurse – Home Care*, with its
    qualifications as posted.
- **`seedContent`** (`src/db/seed/seed.ts`): fills only what is missing (a
  page or the site's content with no draft, the services or jobs when their
  collection is empty), checks every document with its schema first, and
  publishes nothing. **`npm run db:seed`** (`scripts/seed.mts`) refuses
  unless the site's address is `localhost` (AGENTS.md §13).

### Changed
- Plan: R1.8 DONE; Q30 asks how the approved copy reaches the production
  database (default: the seed runs once on the empty production database at
  R8.1, with the user's go-ahead, and the admin publishes).

### For the client to confirm (R3.1)
- The job's employment type (seeded *full time*; the old site does not say)
  and its posting date (the old site shows "04 J 2025"; seeded as the day the
  seed runs).
- What *Child care* covers, and the three new service names.
- The map link (a search for the building until the exact pin is confirmed).

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (299), coverage 100% (927 statements,
  450 branches, 292 functions): every seeded page passes its page's rules,
  the services keep the plan's order and audiences, nothing claims a
  statistic, licence or award; against the local MySQL, the seed writes
  drafts only, leaves an existing page alone, orders the services, and
  writes nothing on a second run.
- `npm run db:seed` filled the local database, then wrote nothing on a second
  run; with a non-local site address it refused.
- Build passed; the shipped audit passed (89 packages); E2E passed, phone
  and desktop, axe clean.

### Blockers
- None.

## 2026-10-29 — R1.9, access tests (Phase 1 complete)

### Added
- **What the public can reach** (`tests/db/integration/access.test.ts`):
  every page, the site's content, every service, job and client logo is
  published, then changed in its draft only, with a marker; drafts that were
  never published, hidden sections and archived records carry it too. Every
  public read function is called, and **the marker never comes back**, while
  each read still returns what was published.
- **Least privilege, proven** (same file): the app's own database user is
  refused (`*_DENIED_ERROR`) when it tries to create, alter or drop a table,
  add an index or grant a right (plan §26.1).
- **The admin route contract** (`tests/contract/admin-routes.test.ts`): every
  handler under `src/app/api/admin` must check the session through
  `withAdminRoute`, except signing in and the password reset, which must
  refuse another site's request. An inbox, CV download or editing route
  added later without the check fails the suite.
- **The HTTP surface** (`tests/e2e/access.spec.ts`, phone and desktop): an
  admin page without a session redirects to sign-in, keeping where it was
  headed; the admin API answers 401 with `no-store`, with no cookie and with
  a forged one (the session is checked in the database, not by the cookie's
  presence); a write from another site is refused with 403 first.
- **The CV folder is kept apart from the media folder**
  (`src/lib/env/server.ts`): the server refuses to start when `CV_DIR` is
  the public `MEDIA_DIR`, inside it, or around it (plan §9.4).

### Changed
- Plan: R1.9 DONE. **Phase 1 (data and security) is complete**: R1.1 – R1.9.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (305), coverage 100% (931 statements,
  453 branches, 294 functions).
- Build passed; the shipped audit passed (89 packages); E2E passed (8, phone
  and desktop), axe clean.

### Blockers
- None. Phase 2 starts with the typeface (Q10): the user picks one from a
  specimen of three (R2.1).

## 2026-10-29 — R2.1, the typeface and the design tokens

### Added
- **The type specimen** (a private page for the user): Atkinson Hyperlegible
  Next, Barlow and Readex Pro, each with an Arabic companion, set in the
  site's own sign, three lines, scale, reading text, figures, form and Arabic
  beside English. **The user chose Atkinson Hyperlegible Next** with Noto Sans
  Arabic (D61, answers Q10).
- **The font, self-hosted** (`src/assets/fonts/atkinson-hyperlegible-next/`):
  the variable WOFF2 (weights 200 – 800), Latin subset, 34 KB, from
  `@fontsource-variable/atkinson-hyperlegible-next` 5.3.0 (tarball SHA-256
  recorded in the folder's README), with its SIL Open Font License. Loaded by
  `next/font/local` in `src/app/layout.tsx`: preloaded, `swap`, with an
  Arial fallback sized to its metrics, served from the site itself.
- **The design tokens** (`src/app/globals.css`, plan §30.2): the logo's
  colours (`#0F64AC`, `#33A0DA`, `#86AE3C`), the navy ink `#0B2440`, a
  secondary ink, the quiet panel, hairlines and the colours on deep blue;
  focus colours; type roles (sign, page, section, title, lead, body, small,
  label) at signage sizes; the gutter, section spacing, page and reading
  widths, the 44 px touch size; radii; two shadows for floating things;
  the line's width and station size; durations, eases and layers. **Tailwind's
  own palette, sizes, shadows, radii and eases are removed**, so a component
  can use only these. Base styles theme the browser's own surfaces: text
  selection, the caret, focus rings, link underlines, balanced headings, and
  the reduced-motion path.
- **The token contract** (`tests/contract/tokens.test.ts`): the palette is
  exactly the logo's colours and their inks; every text pairing passes WCAG
  AA (navy on white 15.7:1, white on deep blue 6.1:1, navy on sky blue 5.4:1
  and on leaf green 6.1:1); white is kept off sky blue and leaf green, where
  it fails; focus rings and field borders reach 3:1.
- E2E: the typeface loads, and every font request goes to the site itself.

### Changed
- Plan: D61; §30.1, §30.2, §22.4 and §33 name the face, the token values and
  their contrast; Q10 answered; **Q31 asks whether form errors may use a red**
  (default: no, logo colours only, D35; an error is navy with an icon, its
  message and a heavier border); R2.1 DONE.
- The Home placeholder uses the page heading size; `.gitignore` takes the
  Impeccable design hook's local cache.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (311), coverage 100%.
- Build passed: the font is emitted to `/_next/static/media` and preloaded on
  Home. The shipped audit passed (89 packages); E2E passed (10, phone and
  desktop), axe clean.

### Blockers
- None. Q31 (the error colour) is needed before the form fields are built in
  R2.5; until then the default holds.

## 2026-10-29 — The error red

### Added
- **`--color-error: #B42318`** (`src/app/globals.css`, plan D63): the user
  allowed red for errors (answers Q31), the one colour outside the logo's;
  6.6:1 on white, 6.1:1 on the quiet panel, and white on it 6.6:1. For
  errors only, always with an icon and words.

### Changed
- Plan: D62 (no vector logo: it is redrawn from the JPG, answers Q2) and D63
  (the error red, answers Q31); §30.2 lists the red and its contrast.
- AGENTS.md §18 names the error red as the one exception to the logo's
  colours.
- The token contract checks the red's pairings and that it is the only colour
  beyond the logo's.

### Validation
- Lint, format check, typecheck and unit tests passed; coverage 100%.

### Blockers
- None.

## 2026-10-29 — R2.2, the logo as SVG and the icons

### Added
- **The logo, redrawn as SVG** (`src/assets/brand/`, plan D62): the client
  has no vector, so it was redrawn from the JPG. The two crosses and the head
  were measured to sub-pixel edges and drawn exactly; the swoosh, the leaves
  (with their veins) and both lines of lettering were separated by colour,
  smoothed and traced at 4×, then compared with the original at 3×
  enlargement. Colours and gradients are sampled from the logo itself.
  `logo.svg` (the full logo, 66 KB) and `logo-mark.svg` (the mark, 6 KB); the
  method, colours and the one known difference (the swoosh's hairline tip)
  are in the folder's README.
- **The icons** (`src/app/`): `icon.svg` (the mark in a square),
  `favicon.ico` (16, 32 and 48 px) and `apple-icon.png` (180 px, on white),
  linked by Next.js on every page. `scripts/make-icons.mts` redraws the PNGs
  from `icon.svg` with Playwright's Chromium.
- **The brand contract** (`tests/contract/brand.test.ts`): the logo files are
  plain drawing (no script, link, embedded file or style), use only the
  logo's sampled colours, and the icon is square. E2E: the three icon links
  are on the page and the files are served.

### Changed
- Plan: R2.2 DONE.

### For the client to approve (R7.5)
- The redrawn logo. It reads *Service WLL*, while the site's name is *Al
  Hidaya Health Care Services*; the logo is kept as drawn.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (319), coverage 100%.
- Build passed; the shipped audit passed (89 packages); E2E passed (12, phone
  and desktop), axe clean.

### Blockers
- None.

## 2026-10-29 — R2.3, the pictograms

### Added
- **The pictogram set** (`src/assets/brand/pictograms.ts`, plan §30.1, Q12):
  18 drawings made for this site in the manner of hospital symbol systems,
  on a 24-unit grid inside a 2-unit margin, as round-capped 2-unit strokes:
  the three lines (*care at home*: a house with a cross; *staffing*: a
  hospital building; *careers*: a person joining), reaching the company
  (phone, chat, mail, location, clock), finding the way (arrow, chevron,
  menu, close, external link, download, upload a file) and status (check,
  error, info).
- **`Pictogram`** (`src/components/ui/pictogram.tsx`), the first component
  of the kit: draws one in the colour of the text around it at four sizes
  (20, 24, 40 and 56 px); hidden from screen readers unless given a label;
  the arrow and the external link mirror on right-to-left pages (plan §33).
- Tests: every drawing stays inside its grid's margin; the component's
  labelled and decorative forms, sizes, stroke and mirroring.

### Changed
- Plan: R2.3 DONE; **Q32 asks whether WhatsApp actions show WhatsApp's own
  logo** (default: no, the chat pictogram with the word *WhatsApp*; their
  logo must be used unaltered in its own green, outside the logo's colours).
- `globals.css`: the unused pictogram-stroke token is gone; the stroke is
  part of each drawing.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (326), coverage 100%.
- The set was drawn at 16, 24 and 48 px, on white and on deep blue, and in
  the three line stations, and checked by eye.
- Build passed; the shipped audit passed (89 packages); E2E passed (12, phone
  and desktop), axe clean.

### Blockers
- None.

## 2026-10-29 — R2.4, the motion system

### Added
- **GSAP 3.15 and Lenis 1.3** (D29). `@gsap/react` is not used: it imports
  GSAP at once, which would put it in the first paint; the same cleanup
  scope, `gsap.context`, is used on the engine once it has loaded.
- **The engine** (`src/lib/motion/`): `loadMotionEngine` fetches GSAP,
  ScrollTrigger and Lenis only when asked; `startSmoothScroll` drives Lenis
  from GSAP's ticker (one frame loop, lag smoothing off) and tells
  ScrollTrigger of every scroll. Motion's tokens mirror the CSS durations and
  curves (a test keeps them equal); the preference queries.
- **`MotionProvider`** (`src/components/motion/`), in the public site's new
  layout only, so the admin never loads motion: loads the engine when the
  browser is idle after the first paint; Lenis only for a wheel, never a
  touch screen; nothing at all with reduced motion, and lets go of it if the
  visitor turns reduced motion on; a new page starts at its top with its
  triggers measured afresh, never a jump on load; measured again once fonts
  and images settle. `useMediaQuery` (`src/hooks/`) follows a query live.
- **`Reveal`**: a block rises into place the first time it scrolls into
  view, by opacity and transform only; visible by default, never hiding
  anything already on screen, and opacity rather than visibility so screen
  readers and search always have it.
- **`TheLine`**, the signature: on a wide screen a line in the margin with a
  station for each section, each a link with `aria-current="location"` on
  where the visitor is; it draws onward with the scroll (scrubbed
  `scaleY`) while the marker travels it. On a phone, a slim progress line
  under the header naming the current station. Which station is current
  never depends on motion (an IntersectionObserver at 45 % of the viewport,
  and an end-of-page sentinel so a short last section still arrives); with
  motion reduced or not yet loaded the line is drawn in full.
- **The kit preview page** `/kit` (D64, agent default, Q33): served only
  where `KIT_PREVIEW=true` (documented in `.env.example`; set for the browser
  tests), a long page of the seeded services with the line, reveals and the
  pictograms.
- Tokens: the line's rail placement (halfway between the window's edge and
  the text), `--header-height` (set in R2.6), Lenis's own CSS rules; the
  theme's variables are now always emitted (`@theme static`) for the CSS
  that reads them.
- Tests: the engine's wiring and teardown, the provider's loading, touch,
  reduced-motion and navigation paths, `Reveal`, `TheLine` (stations,
  positions, current and passed, the end of the page, scrubbing, cleanup).
  E2E on `/kit`, phone and desktop: Lenis on a wheel and not on a touch
  screen; the current station follows the scroll to the last section; a
  block below the fold rises in while one on screen never hides; reduced
  motion leaves the line drawn in full and nothing moving; without
  JavaScript every word is visible; axe clean.

### Changed
- Plan §30.4 and AGENTS.md §19: ScrollTriggers live in `gsap.context`
  scopes from the loaded engine.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (350), coverage 100% (1,097 statements,
  508 branches, 345 functions).
- Build passed; the shipped audit passed (91 packages); E2E passed (24,
  phone and desktop), axe clean.
- **Measured JavaScript (gzip):** Home's first paint 133.5 KB for modern
  browsers (172.2 KB counting the 38.7 KB polyfill only legacy browsers
  load); motion after paint 51.7 KB (GSAP 26.7, ScrollTrigger 17.1, Lenis
  5.3, glue 2.6).

### Blocker
- Status: OPEN
- Area: performance budget (plan §31) against the motion stack (D29).
- Description: the budget is 170 KB per public route, motion included; the
  framework (133.5 KB) and motion (51.7 KB) already make 185 KB before any
  page content.
- What was attempted: motion is split out and loaded only after the first
  paint, on idle; `@gsap/react` is left out.
- Why it is blocked: meeting the budget means changing either the budget's
  rule or the approved motion stack, both the user's decisions.
- Required decision/input: Q34, options (a) count motion outside the
  first-load budget, (b) drop ScrollTrigger for a small scroll observer,
  (c) CSS scroll-driven animations with Lenis instead of GSAP.
- Temporary workaround: none needed before R7.1; the system works as built.

## 2026-10-29 — R2.5, the UI kit

### Added
- **The kit** (`src/components/ui/`, plan §30.3), each part on tokens only:
  - `SignPanel`: the deep-blue sign with the "You are here" marker, the
    headline (h1 or h2), the supporting line, its actions, and a photograph
    beside it on a wide screen.
  - `LineRow` and `StationMarker`: a line in its colour with its station,
    pictogram, name and actions; the station looks are shared with the line
    in the margin (`stationClasses`).
  - `Button` and `ButtonLink`: primary, secondary, the sky and leaf line
    actions (navy words), and white and outlined actions for a deep-blue
    sign; two sizes from 44 px; pressing in by transform alone; a pending
    state that says so and refuses a second press. Links to this site go
    through Next's link; other sites open in a new tab.
  - `ContactAction`: WhatsApp (the chat pictogram and the word, D66) with
    its first line written, a call, an email (`src/lib/contact.ts`).
  - `ArrowLink`: words and an arrow that steps forward on hover, mirrored
    right to left.
  - Fields: `Field` (label, hint, the error beside the control in red with
    its icon, D63, all tied to the control for screen readers), `TextInput`,
    `TextArea`, `Select` (the browser's own, in the site's look),
    `RadioGroup` (a fieldset of tall rows), `Checkbox`, `FileInput` (the
    browser's picker behind a large target that names the chosen file and
    its size, `src/lib/files/size.ts`). Required fields are announced by the
    browser; optional ones say "(optional)" for everyone to see.
  - `Notice` (info, success, error: words and an icon; an error interrupts
    a screen reader), `Dialog` (the browser's modal dialog: focus held,
    Escape closes, focus returns), `ImageFrame` (a photograph's fixed shape,
    a stock credit under it), `LogoTile` (4:3, never cropped), `Skeleton`
    (a slow fade, still with reduced motion).
- `/kit` shows every part on real copy, with the line through it.
- Tests: every part by role and accessible name; E2E on `/kit` at both
  widths: the dialog's focus and Escape, the file picker naming its file,
  required and optional fields; axe clean with every part on the page.
- Tokens: the sign's padding, the skeleton's fade.

### Changed
- Plan: **D65** (motion is counted outside the first-load budget, answers
  Q34; §31's row now reads "first paint, modern browsers, motion measured
  beside it"); **D66** (the WhatsApp action keeps the site's pictogram,
  answers Q32); **D64 confirmed** (Q33); R2.5 DONE.
- `TheLine` takes its station looks from the kit.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (391), coverage 100% (1,200
  statements, 597 branches, 383 functions).
- `/kit` was checked by eye at 1440 and 390 px, with no sideways scroll;
  the sign's second action was given its own outlined look on deep blue.
- Build passed; the shipped audit passed (91 packages); E2E passed (30,
  phone and desktop), axe clean.

### Blocker resolution
- The R2.4 blocker (motion's weight against the budget) is resolved by D65:
  133.5 KB at first paint is within 170 KB; motion's 51.7 KB is measured
  beside it.

## 2026-10-29 — R2.6, the site shell

### Added
- **The site's frame** (`src/components/site/`, `src/app/(site)/layout.tsx`),
  from the published site content:
  - `SkipLink`: the first Tab, straight to the page's content.
  - `SiteHeader`, the sign bar: the logo home; the admin's visible pages,
    the current one underlined in the line's weight as where the visitor is
    (`aria-current="page"`); on a wide screen the phone in Qatar's grouping
    and Request a quote; on a phone the menu. It stays in view; its height is
    a token (`--header-height`, 64 px, 80 px from 1024 px), which the line's
    phone bar sits under.
  - `MobileMenu`: the whole screen, each page a tall row with its station
    and arrow, the current one marked; WhatsApp, Call and the quote at
    hand; the browser's modal dialog (focus held, Escape closes, focus back
    to the button); it closes as a page is chosen.
  - `SiteFooter`, the base of the sign: navy, the three lines running into
    it, the logo in white (`src/assets/brand/logo-white.svg`, the same
    drawing), the admin's columns, the address, phone, email, hours, social
    links, the brochure once there is one, and the year in Doha.
  - `FloatingWhatsApp` (D67): on every page, clear of the phone's edges,
    unless the admin turns it off (`whatsappButton` in the site content,
    on in the seed).
  - `PreviewBar`: tells the admin they are seeing unpublished changes, with
    the way out (`API_ROUTES.previewExit`, built in R3.6).
  - `Logo`: the logo file in colour or white, served once for the site.
- `API_ROUTES` (`src/constants/routes.ts`) names every endpoint;
  `SOCIAL_NETWORK_LABELS` names the social networks.
- **The browser journeys run against the published seed**: the server uses
  the local test database, which `tests/e2e/global-setup.ts` migrates,
  seeds and publishes (`tests/support/published-seed.ts`) as the site would
  be at launch. CI needs nothing more: its MySQL already holds the test
  database.
- Tests: every part by role and name, with and without published content;
  E2E at both widths: the skip link, the header's pages (the menu on a
  phone, Escape, focus back), the floating WhatsApp chat, the footer's
  contact details and columns; axe clean on every page with the shell.

### Changed
- The site content gains `whatsappButton` (plan §13, D67).
- Pages no longer render `<main>`: the layout holds it (`#main`).
- The site's pages read the published content at request time
  (`connection()`) until caching arrives (R3.6).
- Plan: D67 (answers Q23), §13, R2.6 DONE; AGENTS.md §24 on the journeys'
  database.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (413), coverage 100% (1,242
  statements, 637 branches, 405 functions).
- Checked by eye at 1440 and 390 px (the header, the open menu, the
  footer), with no sideways scroll.
- Build passed; the shipped audit passed (91 packages); E2E passed (38,
  phone and desktop), axe clean.
- **Home's first paint: 146.9 KB** of JavaScript (gzip, modern browsers),
  within 170 KB; motion after paint as before (D65).

### Blockers
- None.

## 2026-10-29 — R2.7, the system pages

### Added
- **Not found** (`src/app/(site)/not-found.tsx`, plan §6.10): a sign saying
  the page is not on the map, with the ways on (home, services, contact,
  `WayBack`), inside the site's frame and kept out of search engines. Any
  address the site does not have reaches it through a catch-all route
  (`(site)/[...missing]`), so it answers **404** with the header and footer.
- **Error** (`(site)/error.tsx`): a sign saying the page did not load, a
  retry, the ways back, and the reference that ties it to the server's log;
  never the error's own words.
- **Global error** (`app/global-error.tsx`): when the site's own frame
  fails, a page standing alone with its own document, a retry, and a full
  load home (the client router is not trusted then).
- Tests: each page's words, actions and reference, the error text kept out;
  E2E: a missing address answers 404 with the sign inside the frame, its
  way home works, `noindex`; axe clean.

### Changed
- **No route-level loading state on the public site.** One was built and
  removed: Next.js's streaming boundary hid the page behind the skeleton
  without JavaScript (against plan §30.4, content visible by default) and
  answered 200 for a missing page. The public pages will be cached (R3.6);
  the admin's loading states come with it (R6). The skeleton stays in the
  kit for them.
- Plan: R2.7 DONE, with the note above.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed, coverage 100%.
- Build passed; the shipped audit passed (91 packages); E2E passed (42,
  phone and desktop), axe clean.

### Blockers
- None.

## 2026-10-29 — R2.8 (in progress), the kit's audit

### Audit (Impeccable, source and rendered at 1440, 390 and 360 px)
- **Score 19/20.** Accessibility 4 (axe clean on every page, labels, focus,
  44 px targets, reduced motion); performance 4 (146.9 KB at first paint,
  motion after it, transform and opacity only); theming 4 (tokens only;
  light only by D28); responsive 4 after the fix below; implementation
  integrity 3: one finding.
- **Finding, P2:** the sign's "You are here" marker reads as a kicker above
  the headline (`kicker-above-heading`, on `/kit`). It is the direction
  contract's sign grammar, but the craft floor bans the form. Asked as Q35.
- **Fixed:** at 320 px the header's logo pushed the page 10 px sideways; the
  logo is 32 px tall below 360 px (213 px wide) and the header's gap
  tighter on a phone. A journey now checks for sideways scroll at 320 and
  360 px on Home, `/kit` and a missing page.

### Changed
- Plan: R2.8 IN PROGRESS (waits on the user's check of the screenshots);
  Q35.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (419), coverage 100%.
- Build passed; the shipped audit passed (91 packages); E2E passed (44,
  phone and desktop), axe clean.

### Blockers
- None; R2.8 closes with the user's check and Q35.

## 2026-10-29 — R2.8 closed: "You are here" where the visitor stands (D68)

### Changed
- **The sign's headline stands alone** (answers Q35, option b; plan D68).
  The "You are here" label above every sign's headline is gone, and with it
  the sign's eyebrow field (`SIGN` in `schemas/pages.ts`, the seed, the
  fixtures). Stored pages need no migration: the schema drops the old field
  when it reads one.
- **The three lines start from a "You are here" station** (`LineStart`,
  `components/ui/line-start.tsx`): the travelling marker's navy station,
  standing still, with a stem down to the first line. On `/kit` now; on
  Home at R3.3. The line's travelling marker and the phone's progress line
  keep the words.
- **The system pages** (not-found, error, global error) lose their labels
  too; the not-found page's title is now `UI_TEXT.notFoundTitle`, and the
  unused `errorMarker` is removed.
- Plan: D68; Q35 answered; §6.1, §7.2 and §30.1 (first viewport) redrawn;
  R2.8 DONE. The surface brief's first viewport says the same.

### Validation
- Impeccable's detector on `/kit` and Home: no findings (the
  `kicker-above-heading` finding is gone). Screenshots at 1440 and 390 px.
- Lint, format check and typecheck passed.
- Unit and integration tests passed (420), coverage 100%.
- Build passed; the shipped audit passed (91 packages); E2E passed (44,
  phone and desktop), axe clean.

### Blockers
- None.

## 2026-10-29 — Q36 – Q39 answered; R3.1 closed

### Changed
- **Both "You are here" stay on a phone** (D69, Q36): the progress line under
  the header and the station where the three lines start.
- **The copy is reviewed with the client at the user's demo** (D70, Q37),
  not sent as a document; their changes are made in the admin, which edits
  every page's text, the services, the jobs, the contact details, the links
  and the SEO. R3.1 DONE: the copy written at R1.8 is the launch draft;
  sign-off stays at R7.5.
- **The three lines' names are fixed in code** (D71, Q38): `UI_TEXT.lineCareAtHome`,
  `lineStaffing`, `lineCareers` (`src/constants/messages.ts`), with
  `UI_TEXT.careers` for the nurses' action; `/kit` reads them.
- **Home's careers section will show the three most recent open jobs**, then
  a link to all of them (D72, Q39).
- Plan: D69 – D72; Q36 – Q39 answered; §6.1, §7.2 and §40 follow them.

### Validation
- Lint, format check and typecheck passed; unit tests passed (362).

### Blockers
- None.

## 2026-10-29 — R3.2 (doing): rich text and uploaded images

### Added
- **`RichText`** (`src/components/ui/rich-text.tsx`): the admin's text
  blocks (headings, paragraphs, lists, links) at a reading width, never as
  HTML; a paragraph keeps the admin's line breaks; its headings sit one level
  under the section's own.
- **`getImages`** (`src/features/media/api.ts`): the images published content
  refers to, by id, in one query, with their made sizes and words; anything
  that is not a whole image (a PDF, one without its shape, one that is gone)
  is left out, so a page shows no photo rather than one that shifts.
- **`MediaImage`** (`src/components/ui/media-image.tsx`): an uploaded image as
  a `<picture>` from its made sizes, AVIF first, then WebP, each at every
  width; width and height set; the page's main photo fetched first, the rest
  lazily; decorative images have empty alt text.

### Changed
- **Plan D73 (agent default, Q40):** images are drawn as a `<picture>`, not
  through a custom `next/image` loader (§22.3): a loader answers one address
  per width in one type, so it could not offer AVIF with a WebP fallback, and
  `next/image` would add script to every page with a photo. §22.3 updated.
- Plan: R3.2 DOING.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed, coverage 100%.
- Build passed; E2E passed (phone, desktop), axe clean.

### Blockers
- None.

## 2026-10-29 — R3.2, the section components

### Added
- **One component per section type** (`src/components/sections/`, plan §7.2),
  each drawing its published content in "Follow the Line":
  - `SignSection`: the page's sign, its photo fetched first; on Home,
    `HomeLines` follows it: the three lines from their "You are here"
    station, their names and actions fixed (D71), the numbers the site's.
  - `IntroSection` (text and a portrait photo), `ValuesSection` (each value
    a stop on a hairline, as many across as fit), `MissionSection` (mission
    and vision side by side on a quiet panel).
  - `ServicesIndexSection`: each audience's services as stops down its line
    (sky for care at home with WhatsApp and Call, deep blue for staffing
    with Request a Quote), each stop the link to its service; a line with
    no published services is left out.
  - `InstitutionsSection` and `CareersBandSection` on their lines' edges
    (`LineEdge`, a new kit part); the careers band shows the three most
    recent open jobs (D72) and **All open jobs**.
  - `JobsListSection`: every open job with where, its terms and its closing
    day; the admin's empty-state words when none is open; the general
    application always offered (Q7).
  - `ClientsSection`: logos named by their organisation, linked when the
    admin gave a site; not shown at all until there are logos (D7).
  - `ContactBandSection` (a deep-blue sign with WhatsApp, Call, the number,
    the email and the hours) and `ContactDetailsSection` (every way to reach
    the company, the office with **Open in Google Maps**, the hours, the
    brochure when there is one; the static map joins it at R3.5).
  - `FormSection` (the admin's heading and text above the form the page
    gives) and `RichTextSection`.
- **`PageSections`**: a page's visible sections in the admin's order, each at
  an anchor named by its type (`start`, `services`, `text-2`), which the
  line's stations will link to (R3.3); a jump lands below the header.
- **`getPublishedPageContent`** (`features/content/api.ts`): a page with all
  it shows, published copies only, in two round trips: the page, the site
  and only the collections its section types may show; then its images.
- Words: the sections' fixed words in `UI_TEXT`; employment-type labels in
  `statuses.ts`; `readableDay` ("30 November 2026") in `lib/dates.ts`.

### Changed
- Plan: R3.2 DONE.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (464), coverage 100%: every section's
  content, actions, empty and missing states; the renderer's order and
  anchors; the page read against the local MySQL (only what a page may show,
  and its images).
- Build passed; E2E passed (44, phone and desktop), axe clean. The sections
  are first seen on a page at R3.3.

### Blockers
- None.

## 2026-10-29 — R3.3, Home

### Added
- **Home** (`src/app/(site)/page.tsx`, plan §6.1, §30.1), built from its
  published sections: the sign, the three lines from their "You are here"
  station, who we are, every published service as a stop on its line, why
  Al Hidaya, the staffing offer, the nurses' line with the open job, and
  the contact band. The clients section stays off the page until a logo
  can be shown (D7). A Home never published answers 404.
- **The page's line** (`pageStations`, `components/sections/anchors.ts`): a
  station for each section shown, named by its heading (the sign by the
  page's short name, `PAGE_NAMES`), linking to its anchor; Home's line is
  deep blue.

### Changed
- The browser journeys wait for the app on `/kit`, which needs no published
  content: Home is a 404 until the global setup publishes the seed, and the
  integration tests empty the same database first.
- `UI_TEXT.placeholderNote` removed with the placeholder Home.
- Plan: R3.3 DONE; Q41 asks about the photos.

### Performance (local build, Home)
- JavaScript at first paint: **151.6 KB** gzip (modern browsers, within
  170 KB; the placeholder Home was 149.3 KB by the same count); motion
  after paint as before (D65).
- Phone, 4× CPU slowdown, 9 Mbps, 60 ms: LCP 268 ms, CLS 0.000. Desktop:
  LCP 28 ms, CLS 0.001. Served from this machine, so the server's own
  response time is not in these; the full profile runs in CI from R7.1.

### Validation
- Impeccable's detector on Home: no findings. Screenshots at 1440 and
  390 px, the first viewport and the full page.
- Lint, format check and typecheck passed.
- Unit and integration tests passed (466), coverage 100%.
- Build passed; E2E passed (49, phone and desktop), axe clean: the sign and
  the three lines with working actions, every seeded service on its line,
  the open job, the contact band, no clients section, the stations and a
  jump to one, and no sideways scroll down to 320 px.

### Blockers
- None. The sign's photo, and those of the introduction and the staffing
  section, wait on Q41.

## 2026-10-29 — R3.4, About, Services and a service

### Added
- **About** (`/about`) and **Services** (`/services`), built from their
  published sections on the deep-blue line, as Home.
- **A service's page** (`/services/[slug]`, plan §6.4,
  `features/services/components/ServicePage.tsx`):
  - its sign in its line's colour: **sky blue with navy type** for families'
    services (white on sky fails AA, §30.2; focus rings turn navy there),
    deep blue for staffing; the line's actions on it;
  - what the service is, who it is for and what it includes (each shown only
    when the admin filled it in);
  - the line it runs on, with its actions and the other services on it.
  - Families get WhatsApp and a call; institutions get **Request a quote**
    with the service already chosen (`ROUTES.quoteFor`, read by the quote
    form at R4.1). An address the service had before moves on for good
    (308); an unknown one is a 404. Its title and description are the
    admin's SEO words or the service's own.
- `getPublishedServicePage` and `getServiceMetadata`
  (`features/services/api.ts`): published copies only, in two round trips.
- `SignPanel` takes a `tone`; the services' stops, lines and actions are
  shared (`components/sections/ServiceLine.tsx`).

### Changed
- Plan: R3.4 DONE.

### Performance (local build)
- JavaScript at first paint: 151.7 KB gzip on each (within 170 KB).
- Phone, 4× CPU, 9 Mbps, 60 ms: LCP 264 ms (About), 268 ms (Services),
  252 ms (a service); CLS 0.000 each. Desktop: LCP 28 ms, CLS ≤ 0.001.

### Validation
- Impeccable's detector on all three: no findings. Screenshots at 1440 and
  390 px.
- Lint, format check and typecheck passed.
- Unit and integration tests passed (477), coverage 100%: the service read
  against the local MySQL (its photo, the others on its line, a moved
  address, a missing one, a photo since deleted, the SEO words).
- Build passed; E2E passed (57, phone and desktop), axe clean on each page.

### Blockers
- None. The photos wait on Q41.

## 2026-10-29 — R3.5 (doing): Contact, Request a Quote, Privacy, Terms

### Added
- **Contact** (`/contact`): the sign, every way to reach the company (each
  detail now sits at the top of its cell), and the Contact form's place; the
  static map joins it next, the form at R4.1.
- **Request a Quote** (`/request-a-quote`): the sign and the Quote form's
  place (R4.1).
- **Privacy** (`/privacy`) and **Terms** (`/terms`): the admin's text, as
  drafted from what the site actually does, for the client's review (Q18).
  As one run of text each, they have no line of stations, which would only
  repeat the page's name.

### Changed
- **The reading width** (`--container-measure`) is 48 `ch`, not 65:
  Atkinson Hyperlegible's figures are wide, so 65 `ch` held about 93
  characters a line (Impeccable's detector flagged Privacy); 48 `ch` holds
  about 70.
- A text section with no heading of its own is named on the line by its
  page, not by its first heading (on a phone the bar said "What we collect"
  at the top of Privacy).
- Plan: R3.5 DOING.

### Performance (local build)
- JavaScript at first paint: 151.7 KB gzip on each page.
- Phone, 4× CPU, 9 Mbps, 60 ms: LCP 256 – 260 ms, CLS 0.000 on each.

### Validation
- Impeccable's detector on every public page: no findings.
- Lint, format check and typecheck passed.
- Unit and integration tests passed (477), coverage 100%.
- Build passed; E2E passed (65, phone and desktop), axe clean on each page.

### Blockers
- None.

## 2026-10-29 — R3.5, the static map

### Added
- **The static map on Contact** (plan §30.6, D34;
  `src/components/ui/static-map.tsx`): the streets around Asmakh Mall,
  drawn from OpenStreetMap data, with no map script, tiles or cookies.
  Roads are SVG at a fixed stroke width at any size; the road names and the
  landmark are text laid over the drawing, so they stay legible (road names
  step aside on a phone); "Map data © OpenStreetMap contributors" links to
  the licence, as the ODbL asks. It sits beside the contact details on a
  wide screen and under them on a phone.
- **`scripts/make-map.mts`** makes `src/assets/brand/map.ts` from the
  Overpass API: a 900 × 600 m frame centred on Asmakh Mall, roads by class,
  the mall's outline, and up to four road labels along their roads.
- **The office's spot on the map is site content** (`contact.mapPin`, a
  latitude and longitude, D74): the admin sets it (R6), and the office then
  shows as a navy station named by the address's first line. It is empty in
  the seed: OpenStreetMap has Asmakh Mall but neither Retaj Building nor a
  Bin Naifaa street, so nothing is placed by guesswork. Stored pages need
  no migration; the seed and the fixtures carry `mapPin: null`.

### Changed
- Plan: D74; §13 and §30.6 follow it; R3.5 DONE.

### Performance (local build, Contact)
- JavaScript at first paint: 151.9 KB gzip; the map adds no script (31.6 KB
  of gzipped HTML for the page).
- Phone, 4× CPU, 9 Mbps, 60 ms: LCP 256 ms, CLS 0.000.

### Validation
- Impeccable's detector on Contact: one advisory, a false positive: the
  vertical "Jawaan Street" label's unrotated box overlaps the drawing; the
  label is drawn above it and reads clearly in the screenshots.
- Lint, format check and typecheck passed.
- Unit and integration tests passed (482), coverage 100%: where a spot falls
  on the map and when it is off it, the station only with a spot set, the
  credit, the pin's bounds in the schema.
- Build passed; E2E passed (65, phone and desktop), axe clean.

### For the client to confirm
- The office's exact spot (a pin, or its coordinates), entered in the admin.

### Blockers
- None.

## 2026-10-29 — R3.7 (doing): the 301 map, robots, the sitemap

### Added
- **The 301 map from the current site** (`src/constants/redirects.ts`,
  served by `next.config.ts`, plan §5.3): `/about_us`, `/contact-us`, each
  of the eight `/service-detail/…` addresses to its service's new page, any
  other `/service-detail/…` to Services, `/profile.pdf` to the brochure. All
  answer **301** (`statusCode`, not Next's default 308), as the old site's
  links expect; a journey checks each.
- **`robots.txt`** (`src/app/robots.ts`): the public site open; `/admin`,
  `/api` and `/kit` closed; the sitemap named.
- **`sitemap.xml`** (`src/app/sitemap.ts`): the fixed pages, every published
  service and every open job, read when it is asked for
  (`listPublicPaths`, `features/content/api.ts`), with when each record was
  published.

### Open question
- **Q42, how public pages are cached (R3.6, plan §22.1).** Cache Components
  prerenders cached reads at build, and the release builds on GitHub, where
  the client's database is out of reach; streaming instead would hide the
  content from visitors without JavaScript and turn a missing page's 404
  into a 200 (the R2.7 finding). Recommended: (b) keep per-request
  rendering and cache the database reads with tags, Publish revalidating
  exactly its tags. R3.6 waits on the answer.

### Changed
- Plan: Q42; R3.6 waits on it; R3.7 DOING.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (487), coverage 100%.
- Build passed; E2E passed (79), including each redirect, robots.txt and the
  sitemap.

### Blockers
- R3.6 waits on Q42.

## 2026-10-29 — R3.7 (doing): titles, descriptions, canonical addresses, structured data

### Added
- **Each page's title and description from its published content** (plan
  §19, `getPageMetadata`, `features/content/api.ts`): the admin's SEO words
  for the page, else the page's name and the site's description; Home's
  title is the site's own SEO title, whole. A service's page takes its SEO
  words or its own name and summary. Each names its **canonical address**
  and its Open Graph title, description and address, all absolute on the
  site's domain (`metadataBase`, `lib/seo/metadata.ts`).
- **Structured data** (`lib/seo/structured-data.ts`, `components/site/JsonLd.tsx`):
  `MedicalBusiness` on every public page from the published site content
  (address, phone, email, logo, Instagram; the office's coordinates once
  set, D74; open 24/7 only while the site's hours say so); `Service` and
  `BreadcrumbList` on each service's page. Written escaped, so no content can
  close its script tag.
- The page and site reads are made once a request (React `cache`): the
  title and the page share one read.

### Changed
- `PAGE_ROUTES` names where each fixed page lives (`constants/routes.ts`).
- Plan: R3.7 DOING (share images next).

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (495), coverage 100%: the titles with and
  without the admin's words, before and after publishing; the structured
  data with and without hours, place and profiles; the escaping.
- Build passed; E2E passed (80): Home's title, description, canonical
  address and `MedicalBusiness`; a service's canonical address with its
  `Service` and `BreadcrumbList`.

### Blockers
- R3.6 waits on Q42.

## 2026-10-29 — R3.7, share pictures

### Added
- **A share picture for each page** (plan §19, `lib/seo/share-image.tsx`,
  each page's `opengraph-image.tsx`): 1200 × 630, the page's sign in its
  line's colour (deep blue; sky with navy type for families' services) with
  its published headline in Atkinson Hyperlegible Next, the company's name
  at its foot by a station, and the three lines along the bottom edge. Drawn
  when asked for, from what is published; X shows it large
  (`summary_large_image`).
- The typeface's regular and bold weights as WOFF for the renderer, which
  cannot read WOFF2 (`src/assets/fonts/atkinson-hyperlegible-next/share/`,
  15 KB each, same licence, source recorded in the README); the build
  carries them into the standalone folder (`outputFileTracingIncludes`).
  They are never sent to a visitor's browser.

### Changed
- Coverage leaves out `src/app/**/opengraph-image.tsx` with the pages and
  layouts: each only names its page and calls the feature that draws it
  (`getPageShareImage`, `getServiceShareImage`), which is tested. AGENTS.md
  §24 and plan §34 say so.
- Plan: R3.7 DONE; `JobPosting` and the closed jobs' `noindex` come with the
  job page (R5.1), the preview's `noindex` with R3.6.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (499), coverage 100%: the picture's size
  and type in both colours; each page's and service's picture from the
  local MySQL, published or not.
- Build passed; E2E passed (81): each page names its share picture, which
  answers as a PNG; X's large card. Home's and a service's pictures checked
  by eye.

### Blockers
- R3.6 waits on Q42.

## 2026-10-29 — R3.6, caching and the admin's preview

### Decided
- **D75** (Q41): stock photos come now, through the sizing step the admin's
  uploads will use; next.
- **D76** (Q42, option b): public pages render per request from cached
  reads; Cache Components is not used (it prerenders cached reads at build,
  where the client's database is out of reach).

### Added
- **Cached published reads** (`src/lib/content/cache.ts`, plan §22.1): a
  page, the site's content, an order, a collection, a record at an address
  and the images are each kept in Next's data cache under their tags
  (`page:HOME`, `site`, `services`, `service:<slug>`, `jobs`, `job:<slug>`,
  `clients`, `media`). Pages still render on each request, so they work
  without JavaScript and a missing page answers 404. A cached record's date
  is made a date again.
- **`revalidateContent` and `publishedTags`**: what a publish changes, dropped
  with `expire: 0`, so stale content is never served. The admin's publish
  route calls them (R6); the seed and the tests publish outside the app and
  leave the running app's cache alone.
- **The admin's preview** (plan §14): `GET /api/preview?path=…` turns draft
  mode on for the signed-in admin only (401 otherwise) and opens a page of
  the public site (never another site, the admin or the API);
  `GET /api/preview/exit` turns it off. A request sees drafts only while
  draft mode is on **and** the admin's session is still valid
  (`contentView`, `lib/content/view.ts`): pages, the site's content, orders
  and every unarchived record as its draft reads, at the draft's address,
  uncached. The preview bar shows; the page is `noindex`.

### Changed
- The browser journeys wait for the app on `/robots.txt`, which reads no
  content: a page read before the global setup publishes the seed would keep
  "nothing published" in the app's data cache.
- The integration tests read straight from MySQL (`tests/support/next-cache.ts`
  stands in for Next's data cache, which lives inside the running app).
- Plan: D75, D76; Q41 and Q42 answered; §22.1 rewritten; R3.6 DONE.

### Validation
- Lint, format check and typecheck passed.
- Unit and integration tests passed (514), coverage 100%: the tags, the
  cached read's key and tags, the revalidation; the view (draft mode without
  a session shows what is published); the preview's reads against the local
  MySQL (drafts, unpublished and archived records, the draft's address,
  clients); the preview routes (session, path, exit).
- Build passed; E2E passed (83): the admin signs in, previews About with a
  draft headline under the preview bar, `noindex`, while a visitor sees the
  published page; leaving the preview; a page changed in the database behind
  the app keeps its cached content until a publish revalidates it.

### Blockers
- None.

## 2026-10-29 — D75: the launch's stock photographs

### Added
- **The sizing step** (`src/lib/storage/images.ts`, plan §15, brought
  forward from R6.5): an image is stood upright, its metadata removed, and
  made once at each width up to its own (480, 800, 1200, 1600, 2400; never
  enlarged) in AVIF and WebP; the original is not kept. One image at a time
  (`sharp.concurrency(1)`), decoding bounded at 40 megapixels; anything sharp
  cannot read is refused. `sharp` ^0.35.5 is a direct dependency, as the
  plan's stack names it.
- **`storeImage`** (`features/media/api.ts`): typed by its first bytes,
  within 10 MB, made into its sizes, each written to the media folder, then
  its row with its alt text and, for stock, its source and licence; files
  already written are removed if any step fails. `findImageBySource` finds an
  image kept from a source before. The admin's upload screen comes at R6.5.
- **Three licensed stock photographs** (`src/db/seed/photos/`, Unsplash
  License, sources in its README and in each image's record; never
  presented as Al Hidaya's staff, D8): a nurse smiling with an older woman
  (Home's sign), a nurse checking a woman's blood pressure (Who we are, on
  Home and About), hospital staff in a corridor (the staffing offer, on Home
  and Services). The seed imports them through `storeImage` when it writes
  the pages, and uses an image kept from the same source again.
- **The media folder served by the app itself, locally and in the browser
  tests only** (`src/app/media/[...key]/route.ts`, `SERVE_MEDIA`): the
  standalone build serves only what `public/` held when it was built; on the
  server Apache serves the folder (§21.3) and the route answers 404. Only
  keys the app made are read; `nosniff`; cached for a year.

### Changed
- A photograph's frame has a hairline over its edge, so a pale photo still
  reads as a panel on a white page.
- The browser journeys give the server and the global setup the same
  absolute media and CV folders (the standalone server runs from its own
  folder); the build never copies `public/media`.
- Plan: R6.5 notes what came forward.

### Performance (local build, Home)
- JavaScript at first paint: 153.9 KB gzip (within 170 KB).
- Phone, 4× CPU, 9 Mbps, 60 ms: LCP 236 ms with the sign's photograph
  (fetched first, AVIF at 800 px for a 460 px frame), CLS 0.000. Desktop:
  LCP 40 ms, CLS 0.001. Made sizes 5 – 190 KB each.

### Validation
- Impeccable's detector on Home, About and Services: no findings.
  Screenshots of the three photographs in place.
- Lint, format check and typecheck passed.
- Unit and integration tests passed (524), coverage 100%: the sizes, the
  upright turn, no metadata, the refusals; storing against the local MySQL
  and folder (sizes, words, source, refusals before any work, files removed
  when the row cannot be kept); the seed stores each photograph once and
  places it on its pages; the local media route (type, `nosniff`, 404s).
- Build passed; E2E passed (83), the sign's photograph loaded in its made
  size; the shipped audit passed (91 packages).

### Blockers
- None.

## 2026-10-29 — R4.1: the Quote and Contact forms

### Added
- **The two forms** (`features/enquiries/components/`, plan §10.1, §10.2,
  Q5 and Q6 as their defaults): Contact asks a name, phone, email and
  message; Quote adds the organisation (optional), who the care is for, the
  service (from the published services, optional) and how to reach the
  visitor. Both end with the consent to the privacy notice (which opens in a
  new tab, so nothing typed is lost) and one send action. Built from the
  kit's fields; labels above, hints under them, each mistake beside its
  field with the error icon; 16 px inputs, 44 px targets, `autocomplete` on
  every field.
- **The outcome in place** (§10.4, §30.3): sent, the form gives way to the
  thanks, which takes focus and offers WhatsApp as the fastest follow-up;
  not sent, the reason, "What you typed is still here." and the reference
  show above the send action, and every field keeps its words.
- **`POST /api/enquiries`** (§29): only from the site's own pages (the
  `Origin` check), read by `enquirySchema` (either form, by its kind), the
  chosen service checked against the published ones (refused beside the
  service field otherwise), then stored with the rate limit in one
  transaction (`receiveEnquiry`). Each answer is kept under the label the
  visitor saw and a choice in its words, not its code (§10.4); a field left
  empty is left out. The answer says nothing about the enquiry. Turnstile and
  the honeypot come at R4.2, the alert email at R4.3.
- **`useSchemaForm`** (`src/hooks/`): the public forms' checks (D77). The
  schema is fetched when the visitor first reaches into a form; a mistake
  takes focus; after a first attempt a field is checked again as it changes
  (a fixed one clears at once) and as it is left; what the route refuses
  shows beside its field. Before the page's script runs, a sent form posts,
  so its words never reach the address.
- The Quote form starts on the service in the address (`?service=`) when it
  is published, and on "Not sure yet" otherwise. Either form can sit in any
  page's FORM section; the section names which.
- Wording: every label, hint, choice, thanks and failure in `UI_TEXT`;
  four problems in `VALIDATION_MESSAGES`; the choices in `statuses.ts`
  (`CARE_FOR`, `CONTACT_METHODS`, with their words; only the form knows
  them, so no CHECK). New copy for the client's review at the demo (D70).

### Changed
- A page with a FORM section reads the published services (for the Quote
  form's choice).
- `Notice` can give its title an id, so the thanks is named by it.
- The browser journeys' app is told its own address
  (`NEXT_PUBLIC_SITE_URL=http://localhost:3100`, `tests/support/e2e-app.ts`):
  every write must come from the site's own origin (§26.4), and a form sent
  from a page on 3100 names 3100. The page links keep the address the build
  was made with. The admin and preview journeys send that origin too.
- The journeys' global setup clears the app's cached reads before it
  publishes the seed: Next keeps them on disk in the build folder
  (`.next/cache/fetch-cache`), across restarts, so reads cached from a
  database the integration tests have since reset would otherwise be served
  (a service listed beside itself, its ids changed). On the server, each
  release starts with an empty cache; the folder's size is checked against
  §21.2 at R8.2.
- AGENTS.md §12 and plan §10 describe the public forms' checks.

### Decisions
- D77 (agent default, Q43): the public forms load their checks after first
  paint, through the same Zod schema the route parses, without React Hook
  Form; React Hook Form with Zod measured ≈ 40 KB gzip more in the first
  load (≈ 194 KB against 170 KB). React Hook Form was installed to measure
  it and removed; it arrives with the admin.

### Performance (local build)
- JavaScript at first paint: Contact 163.6 KB, Request a Quote 163.6 KB,
  Home 157.6 KB gzip (all within 170 KB). Before this change: 153.9, 153.9
  and 152.4 KB. Zod and the schema (≈ 25 KB) arrive when the visitor first
  reaches into a form. No form code loads on Home: its rise is Turbopack
  regrouping shared code into the chunks Home loads, with the word catalogue
  in two of them (≈ 3 KB each); left for R7.1.

### Validation
- Lint, format check, typecheck and the test-path check passed.
- Unit and integration tests passed (558), coverage 100%: both schemas
  (tidying, every problem in the catalogue's words, either form by its
  kind); the hook (fetched once on first reach, mistakes beside their
  fields and the first focused, re-checks, what is sent, the route's
  refusals, failures, a schema that cannot be fetched); both forms, the
  shared frame (sending, thanks with and without WhatsApp, failure with and
  without a reference), the page helper, the client, the route (origin,
  schema, nothing kept on a refusal); against the local MySQL, each answer
  kept as the visitor saw it, and a service the site does not show refused.
- E2E: both forms at both widths with axe (mistakes, then sent and stored
  with their labels; the Quote form on its service; an unknown service;
  a failed send keeping every field). Screenshots of the Quote form empty
  and with mistakes, and of the thanks, at both widths.
- R3.8 marked DONE: every public page of Phase 3 has its journeys with axe at
  phone and desktop widths, with its numbers in these entries.

### Notes for later
- Tabbing back up a long form can leave a field under the sticky sign bar
  (WCAG 2.4.11): a `scroll-padding-top` on the page, with the sections'
  `scroll-margin` reduced to match, is for R7.3's accessibility pass.

### Blockers
- None.

## 2026-10-29 — R4.2: Turnstile and the trap for bots

### Added
- **Turnstile in both forms** (`src/components/ui/bot-check.tsx`, plan
  §10.3): Cloudflare's script is added when the visitor first reaches into
  a form, never in the page's first load; the check is seen only when
  Cloudflare needs the visitor to tick a box (D78), and takes no room
  otherwise. Its token goes into the form as `turnstileToken`; a token works
  once, so each send the server answered asks for a fresh one. If the
  script cannot load or the check fails, the form says so under the check,
  with the phone and WhatsApp as the way round.
- **The server's check** (`src/lib/turnstile/verify.ts`): each token is
  verified with Cloudflare's siteverify before anything is stored, sending
  only the token and the secret (never the visitor's address), with a
  10-second limit. A token Cloudflare does not confirm is refused
  (`BOT_CHECK_FAILED`, 403); when Cloudflare cannot be reached, the form is
  refused as an outside service's failure (502). Both forms' schemas need
  the token, so a form sent before the check passed says so beside it.
- **The trap for bots** (`src/lib/api/honeypot.ts`): a field hidden from
  sight and from screen readers, out of the tab order, named so no browser
  fills it in. A form that comes back with it filled is answered as taken
  and thrown away (logged by its request id, nothing personal), before the
  schema and before Cloudflare is asked.
- `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`, required, checked at
  start; the site key is read on the server at request time. `.env.example`
  holds Cloudflare's published test keys (always pass); `.env.local` was
  given them without its contents being read. The site's own keys come from
  the client's Cloudflare account at R8.4.
- Wording: the check's two messages and the trap's label in the catalogue;
  `BOT_CHECK_FAILED` in `ERROR_MESSAGES`.

### Changed
- The route's order: the site's own origin; the trap; the fields; Turnstile;
  then the chosen service and the store with the rate limit (R1.5), in one
  transaction.
- The send action, Turnstile's box and a failed send's reason are one group,
  so the hidden check adds no space above the send action.
- `useSchemaForm` counts the sends the server answered (`answered`).

### Decisions
- D78 (agent default, Q44): Turnstile seen only when needed and loaded on
  first reach; when Cloudflare cannot be reached the form is refused, so
  nothing is kept unchecked.

### Performance (local build)
- JavaScript at first paint: Contact and Request a Quote 164.9 KB, Home
  156.4 KB gzip (within 170 KB). Cloudflare's script is not in the first
  load; with the test keys the token arrives about 1.6 – 2 s after the
  visitor first reaches into a form.

### Validation
- Lint, format check, typecheck and the test-path check passed.
- Unit and integration tests passed (577), coverage 100%: the widget (added
  on first reach and only once, drawn with its options, room only when
  shown, its failures said and cleared, a failed load tried again, a fresh
  token after each answered send, removed with the form, nothing drawn for
  a form gone); siteverify (what is sent, refusals, Cloudflare unreachable
  or answering badly); the trap; the route (a filled trap thanked and
  dropped without asking Cloudflare, an unconfirmed token keeping nothing,
  no token asking nothing); both schemas needing the token; both keys
  required.
- E2E: both forms sent through Cloudflare's test keys and checked by the
  server; a form with the trap filled thanked and nothing stored. Screenshots
  of the check hidden and, with Cloudflare's always-ask test key, shown above
  the send action at both widths.

### Blockers
- None. The site's Turnstile keys wait on the client's Cloudflare account
  (§40, R8.4).

## 2026-10-29 — R4.3: the enquiry alert email

### Added
- **The alert** (`src/lib/mail/templates/enquiry-alert.ts`, plan §10.4,
  §17): "New quote request from …" or "New message from …", from
  `noreply@alhidaya.qa` to every enquiries recipient set in Operations
  (`info@alhidaya.qa` until the admin changes it, Q17), Reply-To the
  visitor. It says who sent it, through which form and when (Doha time),
  then every answer under the label the visitor saw (a message keeps its
  lines), and a button to the enquiry in the inbox. Plain-text version
  alongside; everything typed is escaped. Words in `MAIL_TEXT.enquiryAlert`.
- **`sendEnquiryAlert`** (`features/enquiries/api.ts`): sends it and marks
  the enquiry sent or not sent. A failure (mail server down, mail not set
  up) keeps the enquiry and goes to the error log by the enquiry's id alone,
  nothing personal.
- **`retryEnquiryAlert`**: the admin's Retry (its button comes with the
  inbox, R4.4): an alert not yet sent is sent again and the try is recorded
  in the audit trail (`UPDATE`, the email status from and to); one already
  sent is refused (`EMAIL_ALREADY_SENT`).
- **Sent once the visitor has their answer** (D79): the route stores the
  enquiry, answers, then sends the alert in the same request (Next's
  `after`); a failure to record it is logged under the request's id.
- The email layout can list answers under their labels; in plain text a
  label that is a question or a sentence keeps its own ending.
- `dohaDateTime`: a moment as the team reads it in Doha ("29 October 2026
  at 11:01"). `ADMIN_ROUTES.enquiry(id)`.

### Changed
- The mail server is given 10 s to connect and to greet, and 30 s between
  replies (`MAIL_TIMEOUTS_MS`): one that does not answer is a failed send,
  never a hanging request.
- In production, mail goes over TLS unless the mail server is on the same
  machine (localhost): the browser journeys run the production build against
  Mailpit, which has no STARTTLS, and every alert there was failing.
- An enquiry's phone answer is kept as people read it ("+974 5551 2345"; any
  other country's as stored); the phone column keeps E.164 for search and
  calls.
- Plan §17 describes the alert; D79 and Q45 recorded.

### Validation
- Lint, format check, typecheck and the test-path check passed.
- Unit and integration tests passed (588), coverage 100%: the alert's
  subject, sentence, answers and inbox link; the layout's answers (escaped,
  lines kept, both versions); the service (every recipient, Reply-To, the
  inbox link); the timeouts; TLS except on this machine (and a host that
  only starts with 127. still needs it); the route sending after the
  answer and logging a failure to record it. Against Mailpit and the local
  MySQL: the alert arrives to the recipients with Reply-To and every answer,
  the enquiry marked sent; with the mail server unreachable the enquiry is
  kept, marked not sent, and logged without anything personal; Retry sends
  it, is recorded, and refuses a second send.
- E2E passed (93): the Contact and Quote alerts arrive in Mailpit and the
  enquiry is marked sent; a form with the trap filled sends no alert.
  A sample alert rendered and checked.

### Blockers
- None.

## 2026-10-29 — R4.4 (server side): the enquiries inbox's API

### Added
- **The inbox's data** (`features/enquiries/api.ts`, plan §10.5):
  `listEnquiries` (newest first; by form, by status, by a search over the
  name, the email and the phone, a number matched by its digits however it
  was typed; a search's `%`, `_` and `\` mean themselves; 25 a page with the
  total, two reads); `getEnquiry` (every answer as sent, its notes oldest
  first with their admin's name, two reads); `setEnquiryStatus` (recorded
  from and to; nothing recorded when nothing changes); `addEnquiryNote`
  (recorded as added, never what it says, AGENTS.md §8).
- **The admin routes** (§29), each behind `withAdminRoute` and uncached:
  `GET /api/admin/enquiries`, `GET` and `PATCH /api/admin/enquiries/[id]`,
  `POST …/[id]/notes`, `POST …/[id]/retry-mail` (R4.3's Retry). Their
  schemas: `enquiryListQuerySchema`, `enquiryStatusSchema`,
  `enquiryNoteSchema`. `INBOX_PAGE_SIZE`; the endpoints in `API_ROUTES`.

### Changed
- MySQL reports a reference to a missing row without the constraint's name
  (`ER_NO_REFERENCED_ROW`, no `_2`) to a user who cannot read the other
  table, as the app's user cannot: both forms (and both of a row still
  referenced) are now mapped, and `referencesMissingRow` reads either. A
  note on a deleted enquiry answers not found, not an internal error.
- The admin-route contract matches `withAdminRoute(request` across line
  breaks, and names the inbox's routes.
- `getAuth` makes Better Auth again when the database pool it was made on
  has since been closed: a journey that closed the pool left the next one
  (the preview's) signing in through a closed pool.
- A note longer than its column (past the schema) is refused as invalid by
  the database's last word, not as an internal error.

### Decisions
- D80 (the user's): the admin is brought forward into Phase 4; R6.1 and
  R6.2 come before R4.4's screens.

### Validation
- Lint, format check, typecheck and the test-path check passed.
- Unit and integration tests passed, coverage 100%: the four routes
  (session, origin, schemas, the admin and request named on each change);
  the schemas; against the local MySQL, listing by form, status and search
  (name, email, digits of a phone, wildcards meaning themselves), pages and
  totals, an enquiry opened with its notes and authors, status changes
  recorded once, notes recorded without their words, not found for an
  enquiry that is gone.
- E2E passed (94): through the built app, the inbox refuses without the
  session (uncached), then the admin finds an enquiry by its phone as
  typed, moves it along, notes it and opens it; another site's write is
  refused.

### Blockers
- None.

## 2026-10-29 — R6.1, R6.2, R4.4, R4.5: the admin, Today and the enquiries inbox (Phase 4 complete)

### Added
- **The admin's shape (R6.1, brought forward, D80, D81):** shaped with
  Impeccable: a short interview (the inbox daily at a desktop, a
  non-technical admin; never like the public site, cramped or click-heavy),
  three layouts dealt by the surface seed and sketched at 1440 × 900, and the
  user's choice, **the day's log**, confirmed as a brief. Its direction
  contract is in `.impeccable/surfaces/src-app-admin-page-tsx.md`; the
  sketches stay in `.impeccable/mocks/decision/` (not committed).
- **Sign-in (R6.2, plan §26.4):** `/admin/login` (email and password with
  show and hide, the server's refusal in its words, then on to the page the
  admin was headed to, never off the site: `adminReturnPath`),
  `/admin/forgot-password` (the same answer for any email),
  `/admin/reset-password` (the link's token unseen; no token, the way to a
  new link). The rail's navy beside a plain form.
- **The shell (R6.2):** `AdminShell`: on a wide screen a navy rail that is
  the line, each section a station, the current one the white station, what
  waits in a sky count read aloud ("3 need you"); on a phone a navy bar
  naming the section with the rail in a menu; who is signed in and Sign out.
  The panel's layout checks the session on the server for every page. The
  admin loads none of the public site's motion.
- **Today (R6.2, the Overview, D81):** what needs the admin (an enquiry
  new, or its alert not sent), newest first, ruled by its day in Doha, times
  in even figures; Everything for all that arrived; a page at a time; an
  empty Today says what arrives there.
- **The inbox (R4.4, plan §10.5):** `/admin/enquiries`, the same log by
  status (All, New, In progress, Resolved), by form and by a search that
  works as a plain form; `/admin/enquiries/[id]`, where the alert email's
  link leads, opens that enquiry, above the list when it is not on the
  page. A row opens in place: every answer as sent, Call, WhatsApp (a chat
  with nothing written) and Email, Move to, the alert's Retry when it was
  not sent, and the team's notes with their admin and time. Loading,
  failure (with Try again) and empty states throughout.
- `GET /api/admin/enquiries?needsYou=true`; each listed enquiry carries its
  line (a quote's service and organisation, else the message's first line,
  cut to 160 characters).
- **The data layer** (`src/lib/query`, from clinicdesk): `useApiQuery`,
  `useApiMutation`, `useRevalidate` on SWR; `fetcher` in the API client.
  `swr` ^2.5.1, `react-hook-form` ^7.91 and `@hookform/resolvers` ^5.9 for
  the admin's forms (D77: the public forms keep their own checks).
- Kit: `PasswordInput`, `StatusChip`; `Field` can leave out "(optional)"
  (a search box); pictograms `eye` and `eyeOff`, drawn in the set's stroke.
- `ADMIN_TEXT` in its own catalogue, `src/constants/admin-messages.ts`: in
  `messages.ts` it reached the public pages whole (Contact rose to 168.3 KB
  of its 170 KB); AGENTS.md §5 and §21 say so. `ENQUIRY_STATUS_LABELS`,
  `EMAIL_STATUS_LABELS`, `dohaTime`, `dohaDayHeading`, `pageFrom`.

### Decisions
- D81 (the user's): the admin is the day's log; Today is the Overview.

### Validation
- Lint, format check, typecheck and the test-path check passed.
- Unit and integration tests passed, coverage 100%: sign-in, forgotten and
  reset passwords (refusals, pending words, no token); the return path
  (never another site, the API or sign-in itself); the shell (stations,
  current, counts read aloud, the phone's menu, sign-out even when the
  session was gone); Today and the inbox (tabs, filters kept, search carried,
  unknown filters ignored); the log (days in Doha, one row open, pages, the
  named enquiry above the list or not found, empty, failure and Try again);
  a row and an opened enquiry (answers, contact links, moves, Retry, notes,
  their failures); the ported query hooks; the list's needs-you filter and
  lines against the local MySQL.
- E2E: sign-in with a refusal and on to the page asked for; the password
  pages; Today's row opened, noted and moved (it leaves Needs you); the inbox
  found by a phone as typed and the email's link opening its enquiry; the
  phone's menu and sign-out; and the whole of Phase 4: a quote sent, its
  alert in Mailpit, the admin following its link through sign-in to the
  enquiry, open, and moving it along. Axe on every screen at both widths.
- Screenshots of sign-in, Today with a row open, the phone's Today and menu.
- E2E passed in full (104). JavaScript at first paint: Contact and Request a
  Quote 166.3 KB, Home 157.0 KB gzip (within 170 KB; no admin word in them).
  The form pages have 3.7 KB left: Turbopack's grouping and the catalogue
  shipped twice are R7.1's first look.

### Blockers
- None. Applications (Phase 5) and the content screens (Phase 6) join the
  rail and Today with their rows.

## 2026-10-29 — R5.1: Careers and a job's page

### Added
- **Careers** (`/careers`, plan §6.5): the page's sign, the open jobs under
  the admin's introduction (or, with none open, the admin's words saying so),
  the general application, and *Before you apply*, a new seeded text section
  saying what the application form asks for (the CV's types and size, the
  MOPH licence, Dataflow and Prometric, years of experience): the site's own
  facts, never a claim about nursing in Qatar. Its line is the nurses'
  leaf green. Its share picture is drawn from its sign.
- **A job's page** (`/careers/[slug]`, plan §6.6, `JobPage`): its title and
  summary on the nurses' leaf-green sign with **Apply for this job**; *About
  this job*: the description, *What you will do*, *What we ask for*, *What
  we offer* (each left out when empty), beside *The job at a glance*
  (location, employment, department, experience, posted, closes); then the
  nurses' line with Apply, all open jobs, and the other open jobs. A
  renamed job's old address moves on for good; the admin's preview shows
  drafts. A **closed** job stays at its address and says so, takes no
  application, and offers the general application and the open jobs.
- `JobPosting` structured data for an open job (plan §19): its description
  as escaped HTML from the job's own parts, open until 23:59:59 on its
  closing day in Doha (`+03:00`), Google's employment words, `directApply`.
  A closed job has none, and `noindex` (R3.7 left both to this row).
- `getPublishedJobPage`, `getJobMetadata`, `getJobShareImage`
  (`src/features/careers/api.ts`); the leaf-green sign in `SignPanel` and in
  share pictures (navy type, as on sky); `SITE_TIME_ZONE_OFFSET`.

### Changed
- A job's web address can't be `apply`, which the general application uses
  (`RESERVED_JOB_SLUGS`, plan §9.1, §5.1).

### Decisions
- D82 (the user's): the admin can delete an application or an enquiry from
  its inbox, asked first, audited; the CV file goes with its application.
  Built with the applications inbox (R5.5), the enquiries' Delete with it.

### Validation
- Lint, format check, typecheck and the test-path check passed.
- Unit and integration tests passed, coverage 100%: the job page open,
  closed and sparse; `JobPosting` (escaping, end of day in Doha, contract,
  no closing date); the reserved address; the leaf sign and share picture;
  the job page's reads against the local MySQL (open with the others,
  closed with the open ones, moved, missing, preview, SEO words, `noindex`
  when closed).
- E2E with axe at both widths: Careers' open jobs, general application and
  *Before you apply*; an open job from Careers with Apply and its
  `JobPosting`; a closed job, its notice and `noindex`; an unknown job 404.
- First paint: Careers and a job's page 158.9 KB of JavaScript (gzip,
  within 170 KB); LCP 272 ms and 256 ms on a throttled phone, CLS 0.

### Blockers
- None.

## 2026-10-30 — R5.2: the application form with its CV

### Added
- **The application form** (plan §9.2, Q7): full name, email, phone, where
  the nurse is now, their MOPH licence, Dataflow, Prometric, years of nursing
  experience, **the CV** (PDF or Word, at most 5 MB), an optional note and
  the consent; Turnstile and the trap as on the enquiry forms. The page of a
  job's Apply, `/careers/[slug]/apply`, names the job on the nurses'
  leaf-green sign with the way back to it; `/careers/apply` is the general
  application, with the way back to the open jobs. Sent, the thanks takes
  the form's place (no WhatsApp: an applicant is not asking for care).
- **`POST /api/applications`** (plan §9.3): only from the site's own pages;
  the whole body read within 5 MB and 64 KB, refused past it before reading
  when its length says so; a filled trap taken and thrown away; the fields
  and the file through `applicationFormSchema`; Cloudflare's check; then the
  CV's **type read from its first bytes** (a PDF or Word file, whatever its
  name), refused beside the CV otherwise, before anything is kept.
- `receiveApplication` (`src/features/careers/api.ts`): the application is
  stored with its rate limit and each answer as the applicant saw it, then
  **the CV saved in the private CV folder** under its readable name (§9.4,
  R5.3's saving): marked stored, or **not stored** when it cannot be saved,
  logged by the application's id alone, and the applicant still thanked.
  The name the CV was uploaded under is kept tidied, never as a path.
- `findJobToApply`, `getApplyMetadata`, the apply pages' share pictures;
  `readFormData` beside `readBody`; `CareersClient.apply`; the choices'
  vocabularies and labels in `statuses.ts` (the form's only);
  `EXPERIENCE_YEARS`, `APPLICATION_FIELDS_BYTES`, `CV_ACCEPT`.

### Changed
- The enquiry forms' shared frame is `SiteForm` (`src/components/site`),
  which the application form uses too; it offers WhatsApp in the thanks only
  when it is given a number, and takes its own words for what happens next.
- `useSchemaForm` reads a file field as the file picked (or none).
- The consent and the bot check are primitives (`src/lib/validation`),
  shared by the enquiry and application schemas; `choiceOptions` is in the
  kit's `choice.tsx`, shared by the Quote and application forms.

### Validation
- Lint, format check, typecheck and the test-path check passed.
- Unit and integration tests passed, coverage 100%: the schema (tidying,
  every field's wording, years from 0 to 50, the CV's size and presence);
  the form (its choices, the picker's types and hint, sending the CV, the
  route's refusal of its type beside it); the apply page for a job and
  without; the multipart reader; the route (taken, trap, Turnstile, another
  site, no CV, too large, not a form); against the local MySQL, an
  application kept with its answers and its CV saved (`600`, named by the
  job and the applicant), a file refused by its bytes with nothing kept, a
  CV that cannot be saved marked not stored and logged without anything
  personal; the job an apply page is for and its title.
- E2E with axe at both widths: from a job's Apply to its form, each mistake,
  then the application and its CV kept; the general application refusing an
  image named `cv.pdf` beside the CV, keeping what was typed, then taking a
  Word file; a closed job's form leading to the job; an unknown one 404.
  E2E passed in full (116, 22 skipped).
- First paint: both apply pages 168.2 KB of JavaScript (gzip, within
  170 KB); LCP 256 ms and 260 ms on a throttled phone, CLS 0. The new words
  in the shared catalogue raised Request a Quote and Contact from 166.3 KB
  to 168.0 KB: `UI_TEXT` and `VALIDATION_MESSAGES` reach every form page
  whole, so every form page now has under 2 KB left for new public words
  (`MAIL_TEXT` and `ADMIN_TEXT` do not reach them). R7.1's look at the
  catalogue is now due before any public page gains many more words.

### Blockers
- None.

## 2026-10-30 — R5.4: the HR email with the CV attached, and Retry

### Added
- **The HR email** (plan §9.3 step 4, §17): to the applications recipients
  set in Operations (`hr@alhidaya.qa` until the admin changes it), Reply-To
  the applicant, naming the job (or a general application) and when it came
  in Doha time, every answer as the applicant saw it, the CV as uploaded,
  and the way to the application in the inbox. **The CV is attached** under
  the name it is kept by, never the name it was uploaded under.
- It goes once the applicant has their answer, as the enquiry alerts do
  (D79), carrying the CV as received: a CV that could not be saved still
  reaches HR. The application is marked sent or not sent; a failure is
  logged by the application's id alone, and the applicant never knows.
- **Retry** (`POST /api/admin/applications/[id]/retry-mail`, admin only,
  audited with where the email stood and where it went): the email again,
  with the kept CV read from the folder. Without one (never kept, expired,
  or a file that cannot be read, which is logged) the email says the CV is
  not attached, and to ask the applicant for it. Never twice once sent.
- `sendApplicationAlert`, `retryApplicationAlert`
  (`src/features/careers/api.ts`); `MailService.sendApplicationAlert` and
  its template; `MAIL_TEXT.applicationAlert`; `ADMIN_ROUTES.application`.

### Changed
- `receiveApplication` answers the CV's bytes too, for the email to carry.

### Notes
- Plan §9.3 gives "not stored" a Retry. A CV that was not stored has none of
  its own: its bytes lived only in the request, and keeping them anywhere
  but the CV folder would break §9.4. The first HR email carries it. The
  inbox (R5.5) says so beside a CV not stored.

### Validation
- Lint, format check, typecheck and the test-path check passed.
- Unit and integration tests passed, coverage 100%: the template (job or
  general, the CV attached or not, everything escaped); the service (the
  attachment, or none); the route sending after the answer and logging a
  failure to record it; Retry's admin route and the route contract; through
  Mailpit, the email to the recipients with Reply-To, the answers and the CV
  attached byte for byte under its kept name; Retry with the kept CV,
  audited, refused once sent; no CV attached when never kept or unreadable
  (logged); the mail server unreachable (not sent, logged without anything
  personal); not found.
- E2E at both widths: a job's application and a general one each reach
  Mailpit with the CV attached (PDF and Word), and are marked sent. E2E
  passed in full (116, 22 skipped).

### Blockers
- None.

## 2026-10-30 — R5.3, R5.5 (server side), D82: the applications inbox's API, the CV download, Delete

### Added
- **The applications inbox's API** (plan §9.5), admin only, every answer
  `no-store`: `GET /api/admin/applications` lists newest first, by job (or
  the general applications), status, "needs you" (new, or the HR email not
  sent) and a search by name, email or phone as typed, a page at a time,
  with the jobs it can be filtered by (each once, by the title it was last
  applied for under); `GET /api/admin/applications/[id]` opens one with
  every answer, its CV as uploaded and its notes; `PATCH` moves it along
  (audited from and to); `POST …/notes` adds a note (audited without what it
  says).
- **The CV download** (plan §9.4, R5.3): `GET /api/admin/applications/[id]/cv`,
  only with the admin's session, gives a kept CV as a file to save under its
  kept name (`Content-Disposition: attachment`, `no-store`, `nosniff`, and
  sandboxed so nothing in it can run), and **every download is recorded**
  (`CV_DOWNLOAD`). A CV not kept (never stored, expired, or a file that
  cannot be read, which is logged) is refused with where to find it: the
  application's HR email (`CV_NOT_KEPT`).
- **Delete** (D82) for both inboxes: `DELETE /api/admin/applications/[id]`
  removes the CV file, then the application and its notes;
  `DELETE /api/admin/enquiries/[id]` removes the enquiry and its notes. Each
  is recorded without anything it held. The confirming dialog comes with the
  screens (R5.5).
- `listApplications`, `getApplication`, `setApplicationStatus`,
  `addApplicationNote`, `downloadApplicationCv`, `deleteApplication`
  (`src/features/careers/api.ts`) and `deleteEnquiry`; `fileResponse`;
  `ApplicationsClient` and `applicationsKey`, apart from the form's
  `CareersClient` so the public page never carries them; the inbox's
  schemas; `APPLICATION_STATUS_LABELS`, `CV_STATUS_LABELS`.

### Changed
- The inboxes' search (`containing`, `matchingPerson`) is shared, in
  `src/lib/text/search.ts`.

### Validation
- Lint, format check, typecheck and the test-path check passed.
- Unit and integration tests passed, coverage 100%: the routes (session,
  another site, unknown queries and statuses, the file's headers, a CV not
  kept); the schemas; the client's endpoints; the search's SQL; against the
  local MySQL, the list (order, job and general, status, needs you, search
  as typed, a renamed job named once), opening with notes by their admins,
  moves recorded once, a note too long refused, the download (bytes, kept
  name, recorded; expired and missing refused), Delete (the CV file, notes
  and row gone, recorded without content; one never kept) and the
  enquiries' Delete; not found for everything asked of a gone application.
- E2E: the applications inbox through the built app (refused without the
  session, listed, moved, noted, its CV downloaded and recorded, a Delete
  from another site refused, then deleted with its file). E2E passed in
  full (117, 23 skipped).

### Blockers
- None.

## 2026-10-30 — R5.5, R5.6, D82: the applications inbox, Today as one stream, Delete (Phase 5 complete)

### Added
- **The Applications inbox** (plan §9.5, R5.5) in the day's log, like the
  enquiries': status tabs, the job (each job with applications, or the
  general ones) and a search as one plain form; a row says when, who applied
  for which job, an HR email not sent or a CV not stored, and where it
  stands. Opened in place: the job and every answer, Call, WhatsApp, Email,
  **the CV** with *Download the CV* while it is kept (a plain link, never
  fetched ahead, since every download is recorded) or why it cannot be
  (not stored, expired, still being saved), Move to, the HR email's Retry,
  the team's notes and Delete. `/admin/applications/[id]`, where HR's email
  leads, opens on it. The rail has its station, with the new count.
- **Today is one stream** (D81, plan §16): enquiries and applications
  newest first, paged together (`GET /api/admin/today`, admin only), "needs
  you" being an arrival still new or one whose email to the team did not go.
  The merge lives in `src/lib/inbox/arrivals.ts`; each feature hands in its
  own rows (`enquirySummaries`, `applicationSummaries`), so lib needs none.
- **Delete, asked first** (D82), in an opened enquiry and an opened
  application: a dialog says what goes and that it cannot be undone, with
  Keep it as the way out; deleted on its own page, the inbox takes its
  place; a failure says so in the dialog.
- **The Phase 5 journey** (R5.6): a nurse applies for a job with a CV; HR's
  email arrives in Mailpit with the CV attached byte for byte; the admin
  follows its link, signs in, finds the application open, downloads the CV
  under its kept name (recorded), shortlists it and deletes it, the file
  with it.

### Changed
- The inboxes share their parts (`src/components/admin`): `InboxLog` (the
  day's log, from `EnquiryLog`), `ReachActions`, `MoveTo`, `EmailNotSent`,
  `TeamNotes` and `DeleteAction`; the enquiries' screens use them unchanged
  in what they show.
- "Needs you" is one rule for both inboxes and Today (`needsAttention`).
- Today's and the enquiries inbox's empty words name what arrives there.

### Notes
- Plan §16 lists failed CV saves under what needs the admin. A CV not stored
  is marked on its row and in its opened view; the application arrives new,
  so it is in "Needs you" until the admin moves it along. It does not stay
  there after: nothing the admin does can bring the file back.

### Validation
- Lint, format check, typecheck and the test-path check passed.
- Unit and integration tests passed, coverage 100%: the shared inbox parts
  (Delete asked, kept, failed, done); Today's screen and its log of both
  kinds; the application row, opened view (every CV state, Move to, Retry,
  a note, Delete on its own page and in a list, a failed load), log (a named
  application above the list, or its failure), filters and screen; the
  rail's Applications count; Today's route and key; against the local
  MySQL, the stream in time order across both tables, needs-you, paging,
  an arrival deleted between the reads, and empty.
- E2E with axe at both widths: an enquiry deleted only once asked; a new
  application in Today and the Applications inbox, found by job and phone,
  opened with its CV and moved along; and the journey above. E2E passed in
  full (122, 24 skipped).
- Screenshots of Today with both kinds, the Applications inbox, an opened
  application and the Delete dialog, at desktop and phone.

### Blockers
- None. Phase 5 is complete.

## 2026-10-30 — Plan: retries for CV saving and automated emails (D83)

### Decisions
- D83 (the user's): a CV that could not be saved, and every automated email
  that failed, get a retry system: a CV is tried again and the applicant is
  asked to send it again when it still fails; a failed email is sent again
  on its own, about three times. Not needed now: built before deployment as
  **R6.10**, beside R6.7's cron. The plan's §9.3 and §17 say so.

### Open questions
- Q46: how a CV is retried (default: 3 tries during the upload, then nothing
  kept and the applicant asked to send it again; a full CV folder refused
  and shown on Today).
- Q47: how emails are retried (default: a cron job every 10 minutes, up to 3
  more tries per email, each recorded, then the admin's Retry; the password
  reset left out).

### Blockers
- None. Both questions are asked when R6.10 starts.

## 2026-10-30 — Plan: Q46 answered (D84)

### Decisions
- D84 (the user's answer to Q46, option (a)): a CV that cannot be saved is
  tried 3 times during the upload; if it still fails, nothing is kept and
  the form says "Something went wrong with your CV upload. Please send it
  again.", beside the CV and above the send action, with what was typed and
  the file still in the form. A full CV folder is refused the same way and
  shown to the admin on Today. Built at R6.10, which now waits on Q47 only.

### Blockers
- None.

## 2026-10-30 — Plan: Q47 answered (D85)

### Decisions
- D85 (the user's answer to Q47, option (a)): a second cPanel cron entry,
  every 10 minutes, calls `POST /api/cron/mail-retry` (`CRON_SECRET`) to
  send again each enquiry alert and HR email not sent, up to 3 more tries,
  each recorded on its row (a small migration); then the admin's Retry. The
  password reset is left out. Plan §21's diagram, §17, the API table, R6.10
  and R8.2 say so; R6.10 no longer waits on a question.

### Blockers
- None.

## 2026-10-30 — R6.3: the Pages editor shaped, and its routes

### Decisions
- D86 (the user's answer to Q19): each page publishes on its own; the Pages
  list, the rail's Pages count and Today show what waits to be published.
- D87 (the user's): the admin can add a section (only the types the page
  allows, up to its limit) and remove one (asked first); the sign stays
  fixed, and a section the page cannot work without is never hidden or
  removed.
- D88 (R6.3 shaped with the user): the Pages editor is the day's log for
  content. `/admin/pages` lists the eight pages with their state; a page's
  sections are rows opened in place; a bar kept in view holds Save draft
  (a button), Preview (a new tab), Publish and Discard draft (asked first).
  Whole-page routes; the plan's `/sections` route is not needed. The brief
  is in `.impeccable/surfaces/src-app-admin-page-tsx.md`.
- D89 (the user's): a section's photo is picked from the media library;
  its list (`GET /api/admin/media`) comes forward from R6.5, and Upload
  joins the picker at R6.5.
- D90 (the user's): sections reorder by the browser's own drag and by
  Move up / Move down, with no drag library; text is edited block by block.
- Plan: §2, §5.2, §14, §16, §29 and Q19 say so.

### Added
- `GET /api/admin/pages`: the eight pages, each with when it was published
  and whether its draft waits (`listPagesForAdmin`, from one query,
  `listDocumentStates`, which compares draft and published in MySQL).
- `GET`/`PUT /api/admin/pages/[key]`: a page's draft, and saving it whole,
  held to its page's rules at the route and refused when it names a photo
  the library does not hold (`IMAGE_NOT_FOUND`).
- `POST /api/admin/pages/[key]/publish` and `/discard`: publish checks the
  draft against the page's rules once more, inside the transaction that
  publishes it, then drops exactly that page's cached reads.
- `GET /api/admin/media`: the library's images, newest first, for the photo
  picker (`listImagesForAdmin`).
- `pageSlug` and `pageFromSlug`: a page is `/admin/pages/home` in the
  admin's addresses; `ADMIN_ROUTES.pages` and the routes above in
  `API_ROUTES`.
- `SECTION_NAMES`: each section type in the admin's plain words ("Top of the
  page", "Ways to reach us", "Text").

### Changed
- `publishDocument` takes an optional check, run on the draft with its row
  held in the same transaction (AGENTS.md §13).
- The page checks name a section by its plain name, not its code: "This page
  needs a visible “Form” section."
- `getImages` shares its row-to-image step with the admin's list.

### Validation
- Typecheck, lint, format check and the test-path check passed.
- Unit and integration tests passed (791), coverage 100%: every route with
  and without a session and from another site; against the local MySQL, the
  page list, a save with a known and an unknown photo, a publish dropping
  only `page:HOME`, a draft the rules refuse left unpublished, discard, the
  audit trail, and the media list and image check.

### Blockers
- None. The screens are next.

## 2026-10-30 — R6.3: the Pages editor's screens

### Added
- `/admin/pages`: the eight pages, each with its state (Published, Changes
  not published, Not published yet) and when it was last published
  (`PagesScreen`, `PageStateChip`).
- `/admin/pages/[page]`: the page editor (`PageEditor`, D88). A bar kept in
  view on desktop names the page and its state and holds Discard draft,
  Preview (a new tab, showing the saved draft), Save draft and Publish.
  Publish checks the page first, asks, and saves unsaved changes before it
  publishes; Discard asks. A mistake opens its section and takes focus to
  the first field that needs attention; the server's own refusals land on
  their fields.
- The sections as numbered rows, one opened in place with its type's fields
  (`SectionList`, `SectionRow`, `SectionFields`, from the spec in
  `features/content/editor.ts`): Hide/Show, Move up/Move down, the browser's
  own drag by the grip with a sky line where the row will land (D90), Remove
  (asked first) and Add a section (only what the page still allows, D87).
  The sign stays first; a section the page needs is never hidden or removed.
  Each move is said aloud to a screen reader.
- The section fields: text lines and paragraphs (`EditorText`), the text
  block by block (`RichTextField`: paragraph, heading, list, link), the
  values (`ValuesField`), the form's choice, and the photo picked from the
  library in a dialog (`PhotoField`, D89), then the page's SEO.
- `LeaveGuard`: leaving a page with unsaved changes, by a link or by
  closing the tab, asks first.
- The rail's "The site" group with Pages, counting the pages that wait to
  be published, and Today's "Not published yet" list in Needs you (D86).
- `PagesClient` (save, publish, discard); `IconButton` in the kit (an action
  that cannot run is marked unavailable, not hidden); the `quiet` button;
  `Field`'s `hideLabel` (kept for screen readers); the grip, chevron-up and
  plus pictograms.

### Changed
- The admin's addresses moved from `routes.ts` to `admin-routes.ts`
  (`ADMIN_ROUTES`, `ADMIN_API_ROUTES`, `ADMIN_PUBLIC_ROUTES`), and the
  application and enquiry forms call their endpoints through a new
  `form.client.ts` in their feature, apart from the inbox's `api.client.ts`.
  Reason: both rode along on every public page whole, and the editor's
  additions took the apply page to 171.0 KB, over its 170 KB budget
  (plan §31). Same reason as `admin-messages.ts`; AGENTS.md §5 and §21 and
  plan §24 and §25 say so.
- `SECTION_NAMES` moved to `admin-messages.ts`: only the admin and the
  server name a section.
- A section's longer text and a value's title take their bounds from
  `TEXT_LIMITS` (`sectionText`, `valueTitle`), not numbers in the schema;
  the pages schema exports `PageDocumentInput` and `SectionInput`.

### Validation
- Typecheck, lint, format check and the test-path check passed.
- Unit and integration tests passed (861), coverage 100%.
- E2E passed (126, phone and desktop; 26 run on one size only): axe on the
  Pages list, the editor with a section open and the photo dialog; on
  desktop, a Privacy headline saved, previewed in a new tab, still old for a
  visitor, published, then new for the visitor; leaving Home with a hidden
  section asks first; Stay keeps the editor, Leave goes without saving.
- First paint, JavaScript (gzip, within 170 KB): Home 159.3 KB, About and
  Careers 160.8 KB, Contact and Request a Quote 168.7 KB (169.5 before this
  row), the apply page 169.1 KB (169.9 before). No admin address or word
  reaches a public page.

### Blockers
- None. R6.9's pages journey is partly covered by
  `tests/e2e/page-editor.spec.ts`; the row stays open for the rest.

## 2026-10-30 — R6.4: the Services and Jobs editors

### Decisions
- D91 (the user's): every open question answered as its default (Q3 – Q9,
  Q11 – Q18, Q21, Q22, Q26, Q28 – Q30, Q40, Q43 – Q45); D38, D60, D73,
  D77, D78 and D79 are the user's from now on. Plan §41 says so.
- D92 (R6.4 shaped with the user): services and jobs open in the Pages
  editor's frame; the services' order is a draft of its own, published or
  discarded on the Services list; a web address follows the name until it
  is edited or published; Close now closes a job at once and Reopen opens it
  again; Archive and Restore; the lists grouped by state.
- D93 – D96 (the user's, for R6.5 – R6.8, asked up front): images uploaded
  in the library and from the picker, with optional source fields;
  Settings one page in groups, a new brochure live with Settings' Publish,
  navigation links picked or https; disk use in Operations, Today warning
  past 80 %; Activity a day's log, filtered by kind.

### Added
- `/admin/services`: the services in their order, each row with its line,
  address and state; drag by the handle or Move up and Move down, each move
  saved as the order's draft at once and said aloud; the order's bar with
  Preview, Discard the new order and Publish the order, both asked first;
  the archived folded below; New service.
- `/admin/services/new` and `/[id]`: the service editor (name, web address,
  line, summary, who it's for, photo; the description block by block; what's
  included; SEO; Archive or Restore, asked first). A new service is made on
  its first save, and the address bar then names it.
- `/admin/jobs`: the jobs grouped Open, Not published yet, Closed, and the
  archived folded below, newest posting first. `/admin/jobs/new` and
  `/[id]`: the job editor (title, address, department, location, terms,
  experience, summary; the dates; the description; responsibilities,
  qualifications, benefits; SEO; whether it takes applications, with Close
  now or Reopen; Archive or Restore).
- Routes: `/api/admin/services` (GET, POST), `[id]` (GET, PUT), `/publish`,
  `/discard`, `/archive`; `/order` (PUT), `/order/publish`, `/order/discard`;
  `/api/admin/jobs` (GET, POST), `[id]` (GET, PUT), `/publish`, `/discard`,
  `/archive`, `/close`. Each checks the session and the site's origin.
- `setRecordClosed` and `getRecordForAdmin` (`lib/content/records.ts`); a
  job's `closed`, false unless the admin closes it, read by every public
  job read and the application's check; `slugify` (`lib/text/slug.ts`).
- The rail's Services and Jobs, counting what waits; Today's "Not published
  yet" lists pages, services, jobs and the services' order
  (`WaitingToPublish`, from the content feature's `UnpublishedPages`).
- `AskedAction` (an action asked first; `DeleteAction` is built on it);
  the `off` status tone (archived).

### Changed
- The Pages editor's frame and fields moved to
  `src/components/admin/editor/`, since three features now use them:
  `DraftEditor` (the bar, its states, Save draft, Preview, Publish and
  Discard, the notices, the dialogs, leaving unsaved), `EditorGroup`,
  `SeoFields`, `EditorText`, `EditorSelect`, `EditorDate`, `SlugField`,
  `PointsField`, `RichTextField`, `PhotoField`, `ItemControls` (Remove now
  optional), `DraftStateChip` (archived too), `DragOrder` (the drag and
  drop the section list and the services' order share), `EditorLoading`,
  `countErrors`. AGENTS.md §5 says so.
- `publishRecord` takes the slug as a function of the held draft, so the
  collection's check runs inside the publishing transaction; a taken slug is
  refused with the field it belongs to.
- The editor's words say "it", not "the page", where every editor uses them.
- A job's department bound is `TEXT_LIMITS.department`.

### Validation
- Typecheck, lint, format check and the test-path check passed.
- Unit and integration tests passed, coverage 100%: every new route with and
  without a session and from another site; against the local MySQL, a
  service made, published, moved (its old address redirecting), refused
  (photo, checks, taken address), reordered, archived and restored; a job
  made, published, closed and reopened on both copies (a save from the
  editor keeps it closed), archived, and every change audited.
- E2E (phone and desktop, axe): the Services list, a service's editor and a
  new one; a new service saved, previewed, published, seen by a visitor and
  archived; a move saving a new order that waits, then discarded; the Jobs
  list and a job's editor; the posting closed at once for visitors, then
  reopened.
- Screens looked at, at 1440 and 390 px: the lists, the order's bar, both
  editors, a new service refused.
- First paint, JavaScript (gzip, within 170 KB): Home 159.3 KB, About,
  Careers and Services 160.8 KB, Contact and Request a Quote 168.8 KB, the
  apply page 169.1 KB. No admin address or word reaches a public page.

### Blockers
- None.

## 2026-10-30 — R6.5: the client logos and the media library

### Added
- `/admin/media`: the library's images, newest first, each saying what it
  shows and where it is used, found by a search (what it shows, its source);
  Upload an image (the file, its alt text or Decorative, and where a stock
  photo came from, D93); an image opened in a dialog, seen large with its
  size, its words changed and saved, each place that uses it a link to its
  editor, and Delete, asked first, only once nothing uses it.
- The photo picker uploads too (D93): Upload a new image, and it is chosen.
  A logo's picker says "logo", is required, and is never removed.
- `/admin/clients`, `/new`, `/[id]`: the logos in their order (drag, Move up
  and Move down, the order's own Publish and Discard, as the services'),
  each with its logo in its 4:3 frame; the editor (organisation, logo,
  website; Archive or Restore). Preview opens the home page, where the
  clients' row shows once a logo is published (D7).
- Routes: `/api/admin/media` (POST, multipart within the image's limit and
  its words'), `/api/admin/media/[id]` (PATCH, DELETE); `/api/admin/clients`
  as the services'. `MEDIA_IN_USE` refuses deleting an image in use, naming
  each place.
- Where a file is used (`mediaUsage`): every page, record and the site's
  content naming it in a draft or a published copy, archived records too.
- The rail's Clients (counting what waits) and Media; Today lists logos and
  their order waiting to be published.
- `imageDetailsSchema` and `imageFileSchema`; `TEXT_LIMITS.alt`;
  `MEDIA_FIELDS_BYTES`.

### Changed
- `RecordOrder` (the ordered list, its order bar and its archived fold) and
  the order's server functions (`listInDraftOrder`, `saveOrderDraft`,
  `publishOrder`, `discardOrderDraft` in `lib/content/ordering.ts`) are
  shared by the services and the logos.
- `storeImage` keeps an image marked decorative with no alt text; a source's
  parts may each be empty.
- A client logo's missing logo is said in the catalogue's words
  ("The logo is required."), and an empty website is kept as none.
- The order's words say "them", for the services and the logos alike.

### Validation
- Typecheck, lint, format check and the test-path check passed.
- Unit and integration tests passed, coverage 100%: against the local MySQL
  and the media folder, an upload in its sizes, a decorative one, each place
  an image is used, a delete refused while it is used (its files kept), its
  words changed (the media cache dropped), a delete with its files, a file
  that will not go put in the error log; a logo added, refused without its
  image, published, reordered, archived, and one whose image left the
  library listed without it.
- E2E (phone and desktop, axe): the library, an image in use, the upload
  dialog; an image uploaded, described anew and deleted; the empty Clients
  list and a new logo's editor; a logo published to the home page's row of
  clients, then archived off it.
- Screens looked at, at 1440 and 390 px: the library, an image's dialog, the
  upload refused without its file and words, the logo picker.
- First paint, JavaScript (gzip, within 170 KB): Home 159.3 KB, Contact and
  Request a Quote 168.8 KB, the apply page 169.2 KB (803 bytes left: the
  catalogue `messages.ts` reaches every public page whole, its error words
  included).

### Blockers
- None.

## 2026-10-30 — R6.6: Settings and the brochure

### Added
- `/admin/settings`: the site's content as one page in groups (D94), with
  the editor's one bar: the company's name and description; the contact
  details (phone, WhatsApp, email, the address line by line, hours, the
  map link, and the office's spot on the map as a latitude and longitude,
  both or neither, D74); social links, one per network; the floating
  WhatsApp button; the header menu and the footer's columns, each link's
  destination picked from the pages, the published services and the
  brochure, or another address typed in; the SEO defaults; the brochure.
- The brochure (plan §12): a PDF, typed by its first bytes, at most 10 MB,
  uploaded into the draft and live with Settings' Publish; once published,
  a PDF neither copy names is deleted with its file.
- `/brochure`: a 307 to the published PDF, 404 without one; `/profile.pdf`
  already redirects to it (D21).
- Routes: `/api/admin/site` (GET, PUT), `/publish`, `/discard`,
  `/brochure` (POST, multipart). The rail's Settings station counts a draft
  waiting; Today lists it.
- `storeBrochure`, `getPdfFile`, `publishedPdfUrl` and `deleteOtherPdfs`
  (`features/media/api.ts`); `brochureFileSchema`.

### Changed
- The editor's bar takes no back link where there is no list (Settings);
  the SEO fields can be required (the site's own defaults); a list's lines
  take their own bound (an address line's).

### Validation
- Typecheck, lint, format check and the test-path check passed.
- Unit and integration tests passed, coverage 100%: against the local MySQL
  and the media folder, the brochure kept, refused when not a PDF or too
  large, its file removed when its row cannot be kept; the site's draft
  saved, refused naming a PDF the library does not hold, published (the
  site cache dropped, /brochure opening it), a replaced or unsaved PDF
  deleted with its file, a draft its checks refuse kept back, discarded.
- E2E (phone and desktop, axe): Settings in its groups; a brochure uploaded
  and published, opened at /brochure and /profile.pdf, the footer's link
  shown, a hidden menu link gone from the header; then put back through the
  same routes, /brochure answering 404 again.
- Screens looked at, at 1440 and 390 px; a link's words and destination sit
  side by side on wider screens.
- First paint, JavaScript (gzip, within 170 KB): Home 159.3 KB, Contact
  168.9 KB, the apply page 169.3 KB (754 bytes left).

### Blockers
- None. At launch, the admin uploads `profile.pdf`, from the user's backup
  of the old site, as the brochure (Q3, D91); the plan's §40 says so.

## 2026-10-30 — R6.7: Operations and the nightly clean-up

### Added
- `/admin/settings/operations` (D95), under a new "Running the site" group
  on the rail: who receives the forms' emails (one to five addresses
  each), how long enquiries and applications are kept and how long CVs
  are kept (1 – 365 days each, D52), saved at once; changing a keeping
  period asks first and says what will be deleted. Each folder's room
  against its budget (§21.2) as a meter, and what the last nightly
  clean-up did.
- Today warns, above what waits to be published, once the media or CV
  folder passes 80 % of its budget, naming each and where to make room.
- The nightly clean-up (plan §18), `POST /api/cron/retention`: enquiries
  and applications past the retention period with their notes and CV
  files; CV files past their expiry, their applications marked expired;
  rate-limit windows older than a day; the error and audit logs past
  their own periods. A CV file that cannot be deleted keeps its row for
  the next night's try and is counted. The run is audited
  (`RETENTION_PURGE`) with its counts only.
- `withCronRoute` (`src/lib/api/cron.ts`): a timed job runs only for
  `CRON_SECRET` as a bearer token, compared in constant time; anything
  else is refused as unsigned. `CRON_SECRET` (at least 32 characters) is
  checked at start and documented in `.env.example`; `CRON_ROUTES` in
  `admin-routes.ts`.
- `/api/admin/operations` (GET, PUT); `purgeExpired`,
  `getOperationsForAdmin` and `saveOperations`
  (`features/settings/api.ts`); `DiskMeter`, `DiskWarning`,
  `RecipientsField`, `OperationsScreen`.

### Changed
- The rail marks only the closest station current, so Operations, under
  Settings, is not Settings as well.
- The plan's §18 gives the cron entry's command for R8.2, and §29 the
  routes as built.

### Validation
- Typecheck, lint, format check and the test-path check passed.
- Unit and integration tests passed (1,061), coverage 100%: against the
  local MySQL and the CV folder, the clean-up deletes only what is past
  its period, keeps a row whose CV file could not be deleted and counts
  it once, marks an application whose CV expired, clears old rate-limit
  windows, and audits the counts; the operations saved and read back with
  each folder's use and the last run.
- E2E (phone and desktop, axe): Operations in its groups, the rail on
  Operations; a keeping period changed only after the admin says so; a
  recipient added, saved and still there after a reload, then put back;
  the clean-up refused without the secret, with a wrong one and with
  another scheme (401, `no-store`), run with it, and its counts then
  shown in Operations.
- Screens looked at, at 1440 and 390 px, the question asked before a
  keeping period changes included.
- First paint, JavaScript (gzip, within 170 KB), unchanged: Home
  159.3 KB, Contact 168.9 KB, the apply page 169.3 KB (724 bytes left).

### Blockers
- None. The cron entry is added on the server at R8.2, after full payment
  (D48).

## 2026-10-30 — R6.8: Activity

### Added
- `/admin/activity` (plan §36, D96), on the rail under "Running the site":
  every change made in the admin, newest first in the day's log, 50 a
  page, narrowed to content, the inbox, settings or sign-ins. Each row
  says when, what was done in plain words ("Published the Home page",
  "Closed the job “Registered nurse”", "Moved an enquiry to Resolved") and
  who: the admin by name, the website itself for the nightly clean-up, the
  sign-in page for a reset, or "an admin account since removed" (an audit
  row outlives its admin's account). What a change was made to opens from
  its line while it is still there.
- Nothing personal reaches the screen: an enquiry or an application is
  only "an enquiry" or "an application"; a setting's change names its
  fields, never their values (a recipient's address stays on the
  server); only a status, or whether a job closed, is shown as a value.
- `listActivity` (`features/activity/api.ts`): the page and its count,
  then the names of what it touched (a service's, a job's, a client's, an
  image's words) and which inbox items are still there: two round trips.
- `GET /api/admin/activity` (`?kind=`, `?page=`), `activityQuerySchema`,
  `ACTIVITY_PAGE_SIZE`; `ACTIVITY_KINDS` beside the admin's routes, so the
  public pages never carry it.
- `AUDIT_ENTITIES` (`constants/statuses.ts`): what an audit row is about,
  named once; every audit write uses it, and Activity sorts by it.

### Changed
- Operations' integration test clears what other suites leave in the
  shared test database (rate-limit windows, the journeys' clean-up runs)
  before it starts.

### Validation
- Typecheck, lint, format check and the test-path check passed.
- Unit and integration tests passed (1,101), coverage 100%: against the
  local MySQL, every kind of change listed newest first with who made it
  and what it was made to, a renamed or deleted record, image or inbox
  item said without its name or link, no recipient's address, visitor's
  name or email anywhere in the answer; each kind's filter; 50 a page.
  Each kind of change's line, and its link while the thing is there.
- E2E (phone and desktop, axe): Activity lists the sign-in just made by
  its admin's name, narrows to sign-ins and to the inbox, the rail on
  Activity; its endpoint refuses without the admin's session (401,
  `no-store`). The whole suite passed.
- Screens looked at, at 1440 and 390 px.
- First paint, JavaScript (gzip, within 170 KB): Contact 168.9 KB and the
  apply page 169.3 KB, byte for byte as before (724 bytes left); Home
  160.8 KB with what the test database now publishes on it.

### Blockers
- None.

## 2026-10-30 — R6.9: the critical journey end to end

### Added
- `tests/e2e/critical-journey.spec.ts` (plan §34): in the built app, a
  family's WhatsApp link from Home opens the company's chat with its words
  written; a school's quote request is sent and the team's alert arrives
  in Mailpit; a nurse applies with a CV and HR's email arrives with it
  attached; the admin signs in through the sign-in page and finds both
  waiting on Today; edits the summary of an existing service ("Elderly
  care"), saves it, previews it (the draft under the preview bar, while a
  visitor still sees the published words), publishes it, and the
  visitor's page changes; Activity records the publish by the admin's
  name. The service is put back through the same routes, and the public
  page shows its words again.
- The editors' own journeys already cover the rest of the row at both
  widths: a page (R6.3), a new service (R6.4), a job closed and reopened,
  a client logo (R6.5) and Settings (R6.6), each edited, previewed where
  it has a page, published and seen by a visitor.

### Validation
- Typecheck, lint and format check passed.
- E2E: the critical journey passed (desktop; each of its parts runs at
  both widths in its own journey), and the whole suite passed after it.

### Blockers
- None.

## 2026-10-30 — R6.10: retries for a CV and for the team's emails

### Added
- A CV is saved while the applicant waits (D84): inside the application's
  own transaction, tried 3 times with a growing pause; a folder with no
  room is not tried again. If it still fails, nothing is kept and nothing
  counts against the applicant's limit, and the form says "Something went
  wrong with your CV upload. Please send it again." beside the CV and
  above the send action, with everything typed and the file still in it
  (`CV_NOT_SAVED`, its cause in the error log). A CV saved for an
  application the database then refuses is deleted.
- Today's disk warning says, once a CV no longer fits in the CV folder,
  that applicants are being asked to send theirs again.
- The mail-retry cron (D85), `POST /api/cron/mail-retry` through
  `withCronRoute` (`CRON_ROUTES.mailRetry`): each enquiry alert and HR
  email not sent, or still marked as sending 10 minutes after it arrived,
  sent again (the HR email with the kept CV), oldest first, at most 10 of
  each a run, up to 3 more tries; each try recorded on its row before it
  is made, so two runs never send one twice. `retryUnsentMail`
  (`lib/inbox/mail-retry.ts`), `retryEnquiryAlerts`,
  `retryApplicationAlerts`; `CV_SAVE_RETRIES` and `MAIL_RETRIES`
  (`limits.ts`).
- Migration `0006_mail_retries`: `email_retries` (0 – 3, checked) and
  `email_retried_at` on enquiries and applications, and an index on the
  email status and arrival for the cron's read.
- The inbox's "not sent" notice says whether the website is still sending
  the email again on its own (and how often it has), or has stopped after
  its tries and waits for the admin's Retry.

### Changed
- A public form marks a field the server names in any refusal, and says
  why above the send action when the refusal is not the visitor's mistake.
- AGENTS.md §10 (the CV exception), §16 and §17 (two timed jobs); the
  plan's §9.3 steps, §17, §21.2, §27 and the cron entry's command for R8.2.

### Validation
- Typecheck, lint, format check and the test-path check passed.
- Unit and integration tests passed (1,117), coverage 100%: against the
  local MySQL, Mailpit and the CV folder, a CV saved on its second try; one
  that never saves keeps nothing and leaves the visitor's sends untouched;
  a full folder refused without trying again; a CV deleted when its row is
  refused; the cron sends what was not sent and what is stuck sending,
  leaves what is still sending, sent or out of tries, stops after 3 tries
  while the mail server is down, and never sends one alert twice when two
  runs meet; the HR email sent again with the kept CV. The route answers
  the CV refusal with its field; the migration's contract.
- E2E (phone and desktop, axe): an enquiry whose alert did not go shows the
  website still trying; the cron refuses without its secret and sends it
  with it; the warning is gone. The whole suite passed.
- First paint, JavaScript (gzip, within 170 KB): the apply page 169.4 KB
  (665 bytes left: the CV message is on every page with the others),
  Contact 169.0 KB, Home 160.9 KB.

### Blockers
- None. Both cron entries are added on the server at R8.2, after full
  payment (D48).

## 2026-10-30 — R6B.1: the redesign's foundation

The user rejected "Follow the Line" and asked for the public site to follow
a reference (Dribbble shot 24320685, "Telehealth Website Design", Eloqwnt
for DocInPoc), with the rail removed everywhere and no bar while scrolling.
Their answers are decisions D97 – D108; Phase 6B builds it.

### Added
- Decisions D97 – D108 and Phase 6B's rows in the plan; §30.1 rewritten for
  the new direction ("Follow the Line", D36, superseded; Atkinson
  Hyperlegible Next, D61, superseded); the public surface brief's direction
  contract (code-led: the reference's frames are the composition, never its
  images or words).
- Inter Tight (D108), self-hosted from Fontsource 5.3.0 (OFL), its variable
  file for the site and two WOFF weights for share pictures, checksums in
  its README.
- The redesign's tokens (D98): forest `#3B6B24` with white (6.3:1) and its
  hover, the pale leaf `#EEF5E2`, a quiet grey for large type only, display
  type roles (hero, display, statement, figure, the footer's running
  words), soft card and frame radii, round pills and a floating shadow;
  the contrast contract extended to every new pairing.
- `Pill` and `PillLink` (`components/ui/pill.tsx`): the round actions,
  forest with an arrow that steps forward, pale beside it, white on forest.

### Changed
- The header is no longer pinned (D107): the logo, the four links in a
  light row with the current one marked, and the forest "Request a quote"
  pill; it scrolls away with the page. The phone leaves the header for the
  page and the floating WhatsApp button.
- The rail is gone (D101): `TheLine`, its stations and "On this page" are
  removed from every public page; sections keep their anchors.
- The admin's left column is a plain list of links in its groups, without
  the line and station dots (D101, the user's choice over a top bar); the
  admin is otherwise unchanged, and its brief says so.
- AGENTS.md §5, §19 and §22 for the new direction and its motion rules
  (nothing moves on its own, WCAG 2.2.2).

### Validation
- Typecheck, lint, format check and the test-path check passed.
- Unit and integration tests passed (1,112), coverage 100%; the token
  contract checks every new colour pairing.
- E2E (phone and desktop, axe): the header scrolls away and no rail runs
  down Home; Inter Tight loads from the site itself; the whole suite passed.
- Screens looked at, at 1440 and 390 px: the header, Home's opening (still
  the old sections until R6B.2), the admin's column.
- First paint, JavaScript (gzip, within 170 KB): the apply page 167.0 KB
  (3,112 bytes left, the rail's code gone), Contact 166.6 KB, Home 158.1 KB.

### Blockers
- None.

## 2026-10-30 — R6B.2: Home in the reference's sections

### Added
- Home rebuilt in the reference's sections and order (D97), each editable
  in the Pages editor (D100), the design locked:
  - **The hero** (Home's sign): faces between round brackets; the headline
    settling from wide spacing into its words (CSS alone, so it costs no
    script) with one phrase on a pale-green highlight; the supporting line;
    WhatsApp (forest) and Request a quote (pale); a card of faces with a
    real fact (D99); a tall care photo, fetched first, with word chips at
    its top and two cards floating at its foot.
  - **The statement** (`STATEMENT`): one large centred sentence, phrase by
    phrase; its darker phrases turn from grey to navy word by word with the
    scroll, an icon chip after a phrase that has one.
  - **The highlights** (`HIGHLIGHTS`): a note, a photo, the green card with
    faces and a figure that counts up, and a photo; they rise in one after
    another.
  - **For hospitals, clinics & schools** (`FOR_INSTITUTIONS`, D105): its
    pill and a heading with an icon between its parts; a team of faces, a
    photo, Doha's reach (faces on soft rings); real figures (D99).
  - **For families** (`FOR_FAMILIES`, D102, D105): the services sliding
    through a large card with the scroll, each with its photo and opening
    its page; a photo card and small feature cards.
  - **How it works** (`PROCESS`): numbered steps with round photos; on a
    wide screen the section holds while the steps travel sideways.
  - **The Contact form** (D104) in the reference's layout: the email as a
    chip beside the heading, the form on a mist panel; Contact and the
    quote page's forms take the same layout.
- The editor's new field kinds: an icon picked by name, a yes or no, a
  group of faces, a group of fields, and a list of items each with its own
  fields; Home's sign shows its hero's fields, no other page's.
- Motion (§30.1): `SettleText`, `StatementWords`, `CountUp`, `ScrollTrack`
  and a staggered `Reveal`; all scroll-linked or once, nothing moving on
  its own (WCAG 2.2.2); reduced motion shows everything in place.
- Kit: `Avatars`, `IconChip`, `PillLabel`; `MediaImage` takes `decorative`;
  pictograms for the chips (heart, shield, calendar, globe, team,
  stethoscope, clipboard) and an inline size.
- Seventeen licensed stock photographs (Unsplash, each source and
  photographer recorded, kept at 1600 px with no metadata): the hero, four
  faces, the cards, the steps, and one for each service (D102), which the
  seed now gives each service.

### Changed
- A page's images are every one its sections name, at any depth, and the
  services' when it shows the families' card (`mediaIds` moves to
  `lib/content/media-ids.ts`).
- The plan's section catalogue (§7.2) holds the new types.
- A page's sections sit in a column that can never be wider than the
  page (`minmax(0, 1fr)`), so no section can push the page sideways; the
  team card's faces are smaller on a phone.
- The page editor's journeys open Home's new sections.
- A dialog test that closed a moment late under load now waits for it.

### Validation
- Typecheck, lint, format check and the test-path check passed.
- Unit and integration tests passed (1,162), coverage 100%: each new
  section with and without its photos, faces, words and figures; the
  statement's layered words; the counter, the sideways track (held,
  drifting, swiped, focusable when nothing in it is); the editor's new
  field kinds (an icon picked or none, a darker phrase, faces added,
  moved and taken away, chips up to three, lists at their bounds); the
  seed's Home and each service's photograph; a page's images at any depth
  and the services' for families.
- E2E (phone and desktop, axe): Home's hero with its photo first, its
  sections and the services in the families' card, the Contact form
  beside the email, the statement darkening with the scroll while every
  word keeps its contrast, the header scrolling away; nothing scrolls
  sideways down to 320 px; the whole suite passed.
- Screens looked at, at 1440 and 390 px, against the reference's frames.
- First paint, JavaScript (gzip, within 170 KB): Home and Contact
  168.8 KB (1,233 bytes left; Home now carries the Contact form), the
  apply page 167.4 KB.

### Blockers
- None. The client's own photographs replace the stock through the admin;
  real figures (patients, nurses) join the counters when the client gives
  them (D99).

## 2026-10-30 — R6B.3: the forest footer and its running words

### Added
- **The running words** (D106): the footer opens with the site's name,
  "AL HIDAYA HEALTH CARE", in its largest type, running sideways as the
  page scrolls to it. The admin edits them in Settings, under the footer
  (`runningWords` in the site content); left empty, there are none. They
  are moved by CSS alone (a scroll-driven animation, `animation-timeline:
  view()`), so the footer adds no script to any page; a browser without
  scroll-driven animations, or a visitor who asked for reduced motion,
  sees them still. They are hidden from screen readers, which read the
  site's name in the logo.
- A white quote pill in the contact column.

### Changed
- The footer is forest (D98) with white words, its quieter words in the
  pale green on forest; the old three-line colour rule above it is gone.
- On a phone the copyright line sits clear of the floating WhatsApp button.
- The seed and the test content carry the running words.

### Validation
- Typecheck, lint, format check and the test-path check passed.
- Unit and integration tests passed (1,164), coverage 100%: the footer
  with and without its running words, the words hidden from screen
  readers and clipped at the page's edge, the quote pill; the site
  schema tidying the words and defaulting them to none.
- E2E (phone and desktop, axe): the whole suite passed (157), the footer's columns and contact details as before.
- Screens looked at, at 1440 and 390 px.
- First paint, JavaScript (gzip, within 170 KB): unchanged from R6B.2
  (Home and Contact 168.8 KB, the apply page 167.4 KB).

### Blockers
- None.

## 2026-10-31 — R6B.4: every other page in the new look

### Decisions
- D109 – D112 (the user's answers, each the recommended option): the other
  pages open like Home's hero, smaller; About, Services, Careers and Contact
  open with a photo from the licensed stock; Services sets out its services
  as photo cards by audience; each page keeps its own sections, redrawn.

### Added
- **The pages' opening** (`PageHero`, D109): the page's name on a pale pill
  (left out where the headline says it), the headline settling into its
  words with a phrase on the highlight, the supporting line, the page's own
  actions as pills, and a tall rounded photo, the page's first paint. Every
  page but Home opens with it (`SignSection`), as do a service, a job, an
  application and the not-found page. About and Services offer WhatsApp and
  a quote, Contact WhatsApp and a call.
- **The highlighted words on every page's sign**, in the Pages editor beside
  the headline (they were Home's only), seeded on About, Services, Careers,
  Contact and the quote page.
- **Service cards** (D111): each service's photo, name (opening its page)
  and summary on a mist card (on a phone a row, its photo small beside its
  words); on Services by audience, under its pill with its actions
  (`AudienceActions`: WhatsApp and a call, or a quote); on a service's page,
  the others for its audience.
- `AUDIENCE_LABELS` ("For families", "For hospitals, clinics & schools")
  with the audiences' vocabulary.
- A quiet white-outlined pill for forest cards, a small icon chip for a
  list's ticks, and the forms' lined look (`ControlsLook`).

### Changed
- Every other section in the new look (D112), with nothing new to edit:
  headings large and light; who we are beside a tall photo; the mission on
  forest and the vision on mist; the values as numbered mist cards; the
  staffing offer as one card with its photo; the client logos on mist cards;
  the jobs as mist cards with an arrow chip; the contact band on forest; the
  ways to reach the company each on a card beside the map, its office a
  forest dot; the admin's text in the lighter headings. Cards rise in one
  after another.
- **A service's page**: its opening under its audience's pill with its
  photo and its audience's actions; what it is beside who it is for and
  what it includes on a mist card; the other services for its audience as
  cards (the page now loads their photos with its own).
- **A job's page and the application**: the opening under Careers' pill,
  with Apply (or, once the job has closed, the general application) and all
  open jobs; the job beside its facts on a mist card (with Apply); the other
  open jobs as cards, when there are any; the application form on a mist
  panel beside what it is for.
- **The forms** take the reference's form: each field a line on the mist
  panel, labels lighter, ticks forest, the CV's box rounded, and the send
  action a forest pill at the form's end. The admin's controls keep their
  boxes.
- **The phone menu** lists the pages in large light words on round rows,
  the current one on the pale green (no station dots, D101), with WhatsApp,
  a call and the quote as pills.
- **The system pages**: not found opens like the other pages; a failed page
  and the last-resort page say so in the same type, with the ways on as pale
  pills.
- **The share pictures**: the headline large and light on white under the
  page's pill (a service's audience, Careers), the company's name on the
  forest band; the bold share font is no longer shipped.
- A comma or other punctuation just after a headline's highlighted words
  stays with them: a line no longer breaks before it.
- The pills' look lives apart from the components (`pill-classes.ts`), so
  a failed page takes it without them: its retry and its ways back (plain
  links that load the page whole, as the last-resort page's do) no longer
  pull a second copy of the link code into the frame's script. Every public
  page's first-paint script is smaller than before R6B.4.
- The site's actions are pills everywhere: `ContactAction` is a pill, the
  arrow link is forest; the admin keeps its buttons, without the line's
  variants.
- The plan's page specs (§6.1, §6.3, §6.4, §6.6), the service's audience
  (§8), the map (§30.6) and the admin's look (§30.5) say what is built; §30.1
  describes the other pages; §30.2 drops the retired sizes.

### Removed
- The line, everywhere it was left (D101): `SignPanel`, `LineRow`,
  `LineStart`, `LineEdge`, `StationMarker` and the service line
  (`ServiceLine`), their words ("You are here", the three lines' names) and
  their tokens (the sign's and the page's sizes, the line's width and
  stations).

### Validation
- Typecheck, lint, format check and the test-path check passed.
- Unit and integration tests passed (1,160), coverage 100%: the pages
  opening with and without its pill, photo, supporting line and actions;
  the sign's actions on each page; the service cards, the audiences'
  actions and the services index by audience; each redrawn section; the
  service page with its neighbours' photos (and one gone from the library);
  the job page open and closed, with and without other jobs; the
  application on its panel; the forms' lined look; the comma after a
  highlight; the share pictures under a pill or none; a page's photos on
  Services; the highlight in every page's sign editor.
- E2E (phone and desktop, axe): the whole suite passed (157): the pages, a service, a job open and closed, the system pages, the forms sent.
- Screens looked at, at 1440 and 390 px: About, Services, a family and a
  staffing service, Careers, a job, the application, Contact, the quote
  page, Privacy, not found and the phone menu.
- First paint, JavaScript (gzip, within 170 KB = 174,080 bytes): Home,
  Contact and the quote page 172,025 bytes (172,847 before); the
  application 170,642 (171,406); About, Services, Careers and Privacy
  163,219 (164,384); a service and a job 161,646.

### Blockers
- None. The client's own photographs replace the stock (D110) through the
  admin.

## 2026-10-31 — R6B.5: the redesign's finish

### Added
- **Every public page at every width** (`tests/e2e/widths.spec.ts`): at
  320, 768 and 1024 px (the journeys already run at 390 and 1440), nothing
  scrolls sideways and axe finds nothing, on Home, About, Services, a
  service, Careers, a job, the application, Contact, the quote page,
  Privacy and Terms.
- **The keyboard's way through the pages** (`tests/e2e/keyboard.spec.ts`):
  on Home, Services, a service, Careers and Contact, at both widths, every
  stop the Tab key reaches is drawn and shows its focus ring.
- **Home with reduced motion** (`home.spec.ts`): the headline in place, the
  statement fully inked, the cards shown and the footer's words still.

### Changed
- The green highlight card's small figure label is white on its translucent
  pill (4.2:1 in the pale green, now 5.0:1).
- **The finish review** (Impeccable's finish reviewer, against the contract
  and the reference's frames, twice): "ship after fixes", then the fixes
  below. Its findings and verdict are kept with the review's captures.
- **Headlines**: the hero size is capped at 60 px on a wide screen (the
  reference's scale), so Home's headline runs in two lines there; tracking
  loosened (hero -0.02em, display -0.018em) and leading raised (1.06, 1.1);
  each settling letter is drawn above the highlight, so the highlight never
  covers the line above's descenders; a highlight stays on one line (the
  editor's hint says "a word or two"), and the seeded highlights are short
  (About's "compassion", the quote page's "the care").
- **Home**: its hero photo is a nurse against a light wall (from the
  licensed stock), and the hero fits the first screen; the space between
  sections is the one section gap (five sections, the hero and the
  statement no longer add their own); the facts take as many columns as
  there are (one under another on a phone); the families' card shows the
  family services only, its row fading at the card's edge, with "All
  services" below it; the green card carries the reference's thin-line
  globe, low behind its faces; its small figure label is white on its pill
  (5.0:1, from 4.2:1); the hero's chips are translucent.
- **The page's pill** is left out wherever the headline already says the
  page's name (Careers, Privacy).
- **Forms**: the words beside a form stay in view as it scrolls by on a
  wide screen (Contact, the quote page, the application); the quote page's
  form is headed "Your request", no longer repeating the page's name.
- About's values carry no numbers; the footer's column labels are in
  sentence case; the staffing band on Services shows a photograph no service
  card does.
- The seed photographs' README says where each is used now.
- The contract (`.impeccable/surfaces/src-app-site-page-tsx.md`) names the
  hero chips' checks, and why they replace the reference's plus buttons.
- "How it works" keeps its pill: the reference sets a pill above its
  process heading too ("For Doctors" over "Experience the process"), pinned
  by D97.
- **`DESIGN.md`** and its sidecar (`.impeccable/design.json`), recorded
  from the built site (Impeccable's documenter): from now on the design
  system's authority (AGENTS.md §22).
- The corners of a photo set in a card are tokens now (`inset` 20 px,
  `thumb` 16 px, and the highlight's `0.18em`), where three were typed by
  hand; the unused label size is gone.

### Validation
- Typecheck, lint, format check and the test-path check passed.
- Unit and integration tests passed (1,160), coverage 100%.
- E2E (phone and desktop, axe): the whole suite passed (172), with the new
  journeys: every page at 320, 768 and 1024 px, the keyboard's way through
  five pages, Home with reduced motion; Home's hero photo and family
  services; the logo journey now scrolls to the logos, as a visitor does,
  before looking at one (it loads as it is reached).
- Impeccable's detector on the running pages at 1440 and 390 px: the card
  in a card on Home is the reference's app card (D102); the low-contrast
  label is fixed.
- Every image on every page loads, at both widths (checked with each lazy
  image loaded for the captures).
- Speed, locally (median of three, a phone at 4x CPU and 9 Mbps): LCP
  about 0.3 s and CLS 0.000 on Home, About, Services and Contact; desktop
  LCP under 0.06 s.
- First paint, JavaScript (gzip, within 174,080 bytes): Home, Contact and
  the quote page 172,042; the application 170,659; About, Services,
  Careers and Privacy 163,236; a service and a job 161,663.

### Blockers
- None.

## 2026-10-31 — R6B.6: the user's review of the public site

### Fixed
- **The page no longer stops short of its end** when scrolled with a wheel
  or trackpad. Lenis knows how far it may scroll by watching the page's
  size, but `html` carries `h-full`, and Lenis's own rule
  (`html.lenis { height: auto }`) sat in the base layer, which Tailwind's
  utilities outrank: `html` stayed the window's height, so once the page
  grew after loading (a section held in place, the fonts) Lenis never knew
  and stopped at the old end, while scrolling up still worked. Lenis's rules
  now sit outside every layer, as Lenis ships them, and Lenis measures the
  page again whenever ScrollTrigger does.
- **Scrolling no longer drags**: Lenis's smoothing follows the hand more
  closely (lerp 0.12 → 0.16), so the page no longer seems to push back.

### Changed
- **The footer's running words loop** endlessly and slowly on their own
  (D113, the user's request; supersedes D106's scroll-driven movement), by
  CSS alone: four copies moved by two, so no seam shows. A round pause
  button beside them (a checkbox drawn as pause and play, no script) stops
  them, as WCAG 2.2.2 asks; asked, the user chose to keep it. With motion
  reduced they stand still and the button is hidden.
- **The footer** (D114): the column headings are larger and bolder (title
  size, semibold, white), their links quieter; the contact column keeps to
  the phone, the email and the hours, then each social network as its line
  mark in a ringed circle beside its name (the address stays on Contact);
  no quote button.
- **The current site's slide sentences** (alhidaya.qa) become Home's
  headings, as editable content, with no new element (D114): "Compassionate
  nursing care for your loved ones" (for families), "Trained nurses who
  deliver excellence every time" (for hospitals, clinics and schools),
  "Affordable nursing care, without compromising quality" (the first
  highlight), "Experience the difference with Al Hidaya" (the form). The
  first slide was already Home's headline.
- **The header offers the brochure** (D116): "Download brochure", with its
  download mark, in the header and the phone menu, in place of Request a
  quote; it saves the PDF published in Settings (the old site's
  `profile.pdf` at launch, D91) as
  `Al-Hidaya-Health-Care-Services-Brochure.pdf`. Until a brochure is
  published, the header keeps Request a quote. The footer no longer links
  the brochure.
- **The phone menu opens smoothly** (D117, the user's request): the sheet
  fades in over the page, its logo and close button where the header's
  were, and its rows rise into place one after another; closing, it fades
  away. CSS only (`@starting-style`, a `rise` keyframe), so no script is
  added; with motion reduced it simply appears. The navy backdrop is gone:
  the sheet covers the screen, so it only showed as a grey flash.
- New pictograms, drawn in the set's line: pause and play, and a plain mark
  for each social network the site links to (Instagram, Facebook, LinkedIn,
  X, YouTube).
- The plan, AGENTS.md and DESIGN.md record the loop as the one exception to
  "nothing moves on its own", the Lenis rules' place, and the header's
  brochure (D116).

### Validation
- Typecheck, lint, format check passed.
- Unit and integration tests passed (1,187, in one run with R6B.7 and
  R6B.8), coverage 100%.
- E2E passed (phone, desktop, axe on every page): 177 in the full run; the
  4 that still used words this batch changed (the page header, the
  Dashboard, the profile's password label, the brochure now in the header)
  passed once updated, re-run with their files. New: the wheel reaches
  Home's very end with the page grown past the window; the footer's words
  run and their button pauses them; the phone menu fades in with its rows
  rising in order, and appears in place with motion reduced.
- First paint, JavaScript (gzip, within 174,080 bytes): Home, Contact and
  the quote page 173,857 (+1,815: the brochure pill in the header and the
  menu, the new marks); the application 172,474; About, Services, Careers,
  Privacy and Terms 165,051; a service and a job 163,478. The footer's loop
  and the menu's motion are CSS, adding no script.

### Blockers
- None.

## 2026-10-31 — R6B.7: the user's review of the admin

### Added
- **Profile** (D115), at `/admin/profile`, from the column's foot: the
  admin's name and sign-in email; their name changed (the column greets them
  by it at once); their password changed with the current one and the new
  one twice. A wrong current password is said under its field; tries are
  limited to 10 an hour; every other session is ended; both changes are
  recorded in the activity log ("Changed the account name", "Changed the
  password"). New endpoints: `PATCH /api/admin/profile`,
  `POST /api/admin/profile/password`, each behind the admin's session.
- **Log out is asked first**, in a dialog, with Cancel.

### Changed
- **Today is the Dashboard.**
- **The admin's column**: each section beside its mark (new pictograms in
  the set's line: dashboard, page, briefcase, image, settings, profile, log
  out); the groups ("Inbox", "Website content", "Administration") under
  bold headings parted by a light rule; the current row marked by its
  highlight alone, not in bold; Profile and Log out at its foot, each with
  its mark; its scroll stays its own, never carrying on into the page (as
  does a dialog's).
- **The sign-in page's panel** no longer draws the old line and its
  station: it names the admin panel, says what it is for, lists what it
  looks after with their marks, and ends on the way back to the website.
- **Every word in the admin** in a plain, professional register: "Action
  required", "could not be saved", "Data retention", "Server storage",
  "Activity log", "Media library", "Client logos", "Resend notification",
  "Cancel"; nothing chatty.
- **In a page's sections**, only the Edit action is lit under the pointer,
  never the section's name beside it; the whole row still opens it.
- Plan: D115; the admin's screen list and §30.5 describe the new column;
  tracker R6B.7 DONE (2026-10-31). `DESIGN.md`: the admin's column.

### Validation
- Typecheck, lint, format check passed.
- Unit and integration tests passed (1,187, in one run with R6B.6 and
  R6B.8), coverage 100%: the profile's routes (no session refused, a wrong
  current password marked on its field, the rate limit), its screen, the
  column's marks, groups and log out asked first.
- E2E passed (phone, desktop, axe on every page): the profile journey (a
  wrong current password said under its field, the name changed and greeted
  at once, the password changed and signed in with); log out asked first on
  a phone, Cancel staying; the page editor reaches the Dashboard.

### Blockers
- None.

## 2026-10-31 — R6B.8: the current site's images in the seed

### Added
- **The current site's client logos** (D118, the user's request and
  choice): the 11 logos alhidaya.qa shows (The View Hospital, Hamad Medical
  Corporation, Military Medical City Hospital, Estithmar Holding, Royal
  Dental Centre, and six nurseries, kindergartens and clinics), in its order,
  in `src/db/seed/clients/` with their names and sources (`SEED_CLIENTS`,
  `clients.ts`). The seed writes each as a client-logo draft named by its
  organisation, its image in the media library, and the clients' order, when
  there are no client logos yet. They are published only once the client
  confirms each may still be named (D7). The journeys' launch state
  publishes them.
- **The current site's photographs** (D118): its 5 slides (cropped to the
  photograph, without the white fade the slider's words sat on), its 2 About
  pictures and its 8 service photographs, in
  `src/db/seed/photos/current-site/`, each with what it shows and where it
  came from. They go into the media library only; no page uses one as
  seeded, the pages keeping their photographs (the current site's are
  smaller than the site draws them). Its 3 wide banners are left out.

### Changed
- **The seed files every photograph in the library on each run**, finding
  those kept before by their source, so a database seeded earlier gains the
  new ones; `importSeedImage` serves both the photographs and the logos.
  `npm run db:seed` reports the client logos and the images stored.
- **The logo tile holds real logos** (`LogoTile`, D118): the logo is fitted
  inside the tile's padding whatever its shape, so a tall logo no longer
  stretches its tile past 4:3, and is multiplied into the mist card, so the
  white background a logo file carries takes the card's colour. The seed's
  logo files are trimmed of their white margins and carry no metadata.
- Plan: D118; §11 notes the seeded logos; tracker R6B.8 DONE (2026-10-31).
  `DESIGN.md`: the logo tile. READMEs for both folders record each image's
  source.
- The journeys: Home shows the 11 logos in order; Clients lists them; the
  added logo's own image comes and goes with publish and archive.

### Local development (no repository change)
- The local database's six sample client logos (and their images) are
  replaced by the current site's 11, published, and the 15 photographs are
  in its media library; its content rows were backed up first.

### Validation
- Typecheck, lint, format check passed.
- Unit and integration tests passed (1,187, in one run with R6B.6 and
  R6B.7), coverage 100%. The seed's integration test stores the 15
  photographs and the 11 logos once each, with their words and sources;
  writes the logos as drafts in the current site's order, none published;
  writes nothing the second time; and writes the logos again once there
  are none, finding their images in the library.
- E2E passed (phone, desktop, axe on every page): Home shows the 11 logos
  in order; Clients lists them; a new logo's image comes with Publish and
  goes with Archive.
- Seen on the local site: every logo tile 4:3 at 390 and 1440 px, the
  logos' white backgrounds taking the tile's colour.

### Blockers
- None. Before launch the client confirms the logos may be shown (D7).

## 2026-10-31 — R6B.9: the user's review of publishing

### Fixed
- **A publish is never lost when the app restarts** (D119, the user's
  choice). The user published a new photo on Home and kept seeing the old
  one on a normal reload; a hard reload showed the new. Cause: Next keeps
  its cached reads on disk but remembers which tags a publish revalidated
  only in memory, so after a restart a page not visited since its publish
  came back as before, and stayed so until published again (a hard reload
  skips the cache only in development). Reproduced against the test
  database on `next dev` and on the standalone build: publish a new Home
  photo, restart without visiting Home, and Home showed the old photo on
  every normal request. On the server, Passenger restarts an idle app, so
  the client would have met it. `experimental.isrFlushToDisk: false` keeps
  the cache in the app's memory only: a restart starts empty and reads the
  database afresh. This assumes one app process; the release checks it
  (§35.3, R8.2).
- **The admin column's logo loads first**: on a short admin page it is the
  largest thing drawn, and Next warned that it loaded lazily.
- **The footer's pause journey** measured the words a frame before the
  pause landed, and failed once; it now waits for that frame.

### Changed
- **Preview saves unsaved changes first** (D120, the user's choice), as
  Publish does: the user had changed a photo, pressed Preview, and seen the
  old one, since Preview showed the last saved draft. Its tab opens at the
  click and goes to the preview once the draft is saved; it closes if the
  draft fails its checks or is refused, said in the editor as on saving. A
  click while a save is under way waits for it. The "Save draft first" hint
  is gone.
- Plan: D119, D120; §14 and §22.1 say how Preview and the cache work; §35.3
  and R8.2 keep the app to one Passenger process; tracker R6B.9 DONE
  (2026-10-31).

### Validation
- Typecheck, lint, format check passed.
- Unit and integration tests passed (1,195), coverage 100%: Preview with
  nothing unsaved is a plain link; with unsaved changes it saves first,
  sends its tab to the preview, waits for a save under way, closes the tab
  on a refusal or a failed check, and still saves when the tab is blocked;
  the column's logo is not lazy; the configuration keeps the cache in
  memory.
- E2E passed (phone, desktop, axe on every page): 180 in the full run, the
  page editor now previewing without saving first and seeing its change;
  the footer's pause journey, once fixed, passed 32 times in a row.
- The restart, against the test database on the standalone build: before
  the fix, a Home photo published and not visited was lost after a restart;
  after it, the new photo shows, nothing is written to the cache's folder
  on disk, and a publish while the app runs still shows at once.
- No public page's script changed (the editor and the column are the
  admin's).

### Blockers
- None. At deploy (R8.2), confirm Passenger runs the app as one process.

## 2026-10-31 — R6B.10: the user's review of the look

### Changed
- **The company is named as its logo reads** (D121, supersedes D5): "Al
  Hidaya Health Care Service" in every title, email, share card, search
  result and the brochure's file name; the footer's copyright gives the
  registered name, "© 2026 Al Hidaya Health Care Service W.L.L. All rights
  reserved." (`UI_TEXT.legalName`). The seed's About, Privacy and Terms
  words follow.
- **The primary green is the logo's** (D122, the user's choice): the
  leaf `#86AE3C` fills the primary pills, the green cards (the highlight's,
  the mission's, the contact band), icon chips and the footer, with navy
  words (6.1:1; white on it would fail at 2.6:1), a hover `#7A9F37`, quieter
  words `#1D393F`, navy focus rings, and a navy logo in the footer
  (`logo-navy.svg`, the white logo recoloured). Green words and marks on
  white or pale take forest `#5B7628`, the leaf deepened only as far as
  reading needs (lighter than the old `#3B6B24`). Pill variants `leaf`,
  `onLeaf`, `onLeafQuiet`; icon chip tone `leaf`; the share picture's band.
- **The admin's blue is the logo's** (D123, the user's choice): the
  admin's column, its phone bar and menu, and the sign-in page's panel take
  the deep blue `#0F64AC` in place of the navy; their softer words are no
  longer faded, so they keep 5.0:1.
- **How it works runs in the families' card; Our services takes its
  place** (D124, the user's request and choices): For families keeps its
  heading, photo and features, and its card runs a "How it works" label and
  the steps as compact numbered cards (edited in For families: `stepsLabel`,
  `steps`); the How it works section type gives way to **Our services**
  (`SERVICES_ROW`): an "Our services" pill and "Nursing care … for every
  need", then every published service as a photo card, with a small **All
  services** pill. Both rows run on their own in an endless loop by CSS
  alone (`LoopRow`), in place of the scroll-driven sideways tracks
  (`ScrollTrack` and its script are gone): each stops under the pointer,
  while anything in it has focus, and by its own pause button (WCAG 2.2.2,
  a `PauseToggle` the footer now shares); the repeats are hidden from screen
  readers and the keyboard; with motion reduced they stand still, wrapped.
- **Every block reveals as it scrolls into view** (D125, the user's
  choice): besides the cards and openings that already did, the form and
  its words, each part of the admin's text (a heading with its words),
  each client logo (in rows of six), the contact details and the map, and
  each audience's heading on Services. Nothing above the fold is hidden;
  nothing moves with motion reduced.
- **Deleting an image is red** (D126, the user's request): the media
  library's Delete, and the Delete in the question it asks first, are white
  on the error red (a `danger` button; `AskedAction` takes `danger`).
- Plan: D121 – D126 (D5 superseded); §7's Home order and catalogue, §30.1's
  motion, §30.2's tokens and §30.5's admin say how they were built; tracker
  R6B.10 DONE (2026-10-31). AGENTS.md (the loops), PRODUCT.md (the name),
  DESIGN.md (the greens, the admin's blue, the loops, the reveals, the red
  Delete) and both surface briefs follow. The brand README names the logo's
  files and the name.

### Local development (no repository change)
- The local database's Home has its steps in For families and Our services
  after it, and its content names the company as the logo does; its rows
  were backed up first. Written straight to the database, so the dev server
  shows them after one hard reload (the cache does not see such a write).

### Validation
- Typecheck, lint, format check passed.
- Unit and integration tests passed (1,197), coverage 100%: the loop (read
  once, its repeats hidden and inert, its timing, its pause), the pause
  button in both tones, For families with its steps, Our services, the
  text in parts, the red Delete and its question, the new greens' pairings
  and focus rings in the token contract.
- E2E passed (phone, desktop, axe on every page): 178 in the full run; the
  5 that met this round's changes passed once updated, re-run with their
  files (36): the Contact form's axe now waits for its panel to rise in;
  the page editor picks the photo card's photo among the steps'; the loop
  journey hovers the row's still frame (a running row never stands still
  for the pointer). Repeated: the Contact form 8 of 8, the loops 16 of 16.
  New: How it works and the services run, stop under the pointer and by
  their buttons, and stand still with motion reduced.
- Seen on the local site at 390 and 1440 px: the leaf pills, cards and
  footer with navy words, the admin's deep blue, both loops, nothing
  scrolling sideways.
- First paint, JavaScript (gzip, within 174,080 bytes): Home, Contact and
  the quote page 173,525 (−332: the sideways track's script is gone); the
  application 172,580; About, Services, Careers, Privacy and Terms 164,666;
  a service and a job 163,584. The loops are CSS.

### Blockers
- None.

## 2026-10-31 — Testers sign in through a tunnel (D127)

### Changed
- `next.config.ts`: the dev server serves its own files to the host of
  `NEXT_PUBLIC_SITE_URL` as well as localhost (`allowedDevOrigins`). With
  the site's address set to a cloudflared tunnel for testers, Next refused
  the tunnel's live-reload connection, the page kept reloading itself and
  the sign-in form was wiped. The production build ignores the setting;
  the same-origin check and Better Auth still trust the site's address
  alone (the user chose to set the address, not widen the check).
- Plan: D127.

### Local development (no repository change)
- `.env.local`'s `NEXT_PUBLIC_SITE_URL` set to the testers' tunnel (that
  line only, at the user's request); set it back to
  `http://localhost:3000` when testing ends.

### Validation
- Typecheck, lint, format check passed.
- Unit and integration tests passed, coverage 100%; the config contract
  checks the setting.
- Through the tunnel: the sign-in page loads once and stays (it reloaded
  itself before), its form answers (an empty send names both fields), and
  a write from the tunnel's address passes the same-origin check.
- E2E not re-run: the setting exists only on the dev server; the E2E run
  serves the production build, which ignores it.

### Blockers
- None.

## 2026-11-01 — R6C.1: Home as Theme 6, the client's simpler look (D128 – D134)

The client found the Phase 6B site too busy and asked for something like the
current alhidaya.qa, new and improved. Of five themes the client chose a
sixth, mixed from them (Theme 6); the user asked for Home first, the other
pages following its look until each is reviewed (R6C.2).

### Added
- Home's slides (D128): one to eight, edited as one list (photo, headline,
  highlighted words, words, an optional button whose wording and link go
  together), five at launch from the current site, none with a button. They
  move on every six seconds by a filling bar, with Previous, Next, the
  count and a small pause; each later photo wipes in, each headline's words
  rise; the first photo only settles (it is the first paint). With motion
  reduced nothing moves on its own (`HeroSlides`, `Words`).
- The short quote (D130): Home's form, with fixed fields (name, mobile,
  email, service, message), beside the ways to reach the company. It is
  stored, emailed and listed as a quote (`SHORT_QUOTE` → `QUOTE`, no
  database change; agent default).
- The services row (D131): rounded cards in a straight band, scrolled by
  two arrows from a small tablet up, swiped on a phone, with All services
  centred under it (`ServicesTrack`).
- The clients' rows (D133): two rows running opposite ways, stopping under
  the pointer, on focus and on a chosen logo until let go (`ClientsRows`).
- Headings' words rise from behind their line as they arrive (`RiseWords`,
  D129).
- The menu's sliding pill (D134, the user's ask): the header's deep-blue
  pill slides from the last page's link to the new one's (a transform from
  where it was, its CSS transition; with motion reduced it simply appears).
- The admin's switches (D134, the user's ask): the floating WhatsApp button
  and a link shown in the menu are switches, a pill with a knob and a small
  Enabled or Disabled beside it, instead of a box to tick (`Switch`, read
  out as a switch). Decorative photos and the forms' consent stay boxes.

### Changed
- About on Home (D129): "About" over the company's name in blue, the photo
  beside, three points and Read more about us, as Theme 5 sets it.
- The header (D132): the logo, the pill menu and the action in one row; it
  slides away going down and comes back going up or on focus.
- The footer (D132): soft white, the colour logo, the admin's columns, the
  contact column with icons and the social links.
- The look (D132): the site on a soft white page (`--color-page`,
  `--color-card`, scoped to the public site), buttons with softer corners
  (`--radius-button`), deep and outline buttons (`deep`, `line`), boxed
  fields everywhere (the underline look is gone from the field kit).
- The section catalogue: Home holds the slides, About, the services row,
  the clients and the form; Statement, Highlights, For institutions and For
  families are removed with their components, the running words and the
  navy logo. The other pages keep their sections in the new look.
- The slides move on when the current photo's drift ends (the same six
  seconds as its bar): the bars are hidden on a phone, so a phone's slides
  never moved on by themselves while the bar drove them.
- The public site's heavier client parts (the slides, the services row,
  the clients' rows, the header, the forms and their fields, the bot
  check) opt out of the React Compiler's memoising (`"use no memo"`, its
  reason beside it): they are rarely redrawn, and the memoising cost Home
  about 3.5 KB of first-paint JavaScript, over the budget.
- Seed: Home as Theme 6, Home first in the menu, the services' photos from
  the current site.
- Plan: §6.1, §7.2, D128 – D134, §30.1's note, R6C.1 and R6C.2. AGENTS.md
  §19 and §22, DESIGN.md and the site's surface brief rewritten for Theme 6.

### Local development (no repository change)
- The local database's Home set to the seed's Theme 6 content, Home put in
  the menu and the services' photos changed, after a backup in the
  scratchpad.

### Validation
- Typecheck, lint, format check passed.
- Unit and integration tests passed (1204), coverage 100%.
- E2E passed (phone, desktop): 185 passed, 41 skipped (one-width
  journeys). New or rewritten: Home's slides (arrows, bars, pause, moving
  on by themselves at both widths), the Theme 6 sections, the services'
  arrows, the clients' rows, the header hiding and returning, the menu's
  pill sliding; the page editor opens Home's slides; a client logo is
  found by its button; the menu link is hidden by its switch.
- The menu's pill seen sliding in the built app (its transform easing to
  none over 640 ms; the minifier had dropped the first version's layout
  read, now a call); the admin's switch seen on, off and focused.
- First paint, JavaScript (gzip, within 174,080 bytes): Home, Contact and
  the quote page 173,307 (176,769 before the memoising opt-out); the
  application 170,960; About, Services, Careers, Privacy and Terms
  166,939; a service 164,157.

### Blockers
- None.

## 2026-11-01 — R6C.2: the other pages in Theme 6 (D135)

The user asked for the other pages after Home, keeping Contact and Careers as
they were; then asked for Contact's form card and its two sections' colours,
and Careers' two sections' colours, to follow Home. Their answers are D135.

### Added
- `PageSplit`: an inner page's opening in Theme 6's straight lines (About,
  Services, a service's page, the quote page, Privacy, Terms, the missing
  page): under a rule, the page's name in deep blue, the headline with its
  phrase in deep blue rising word by word, the line and the actions, the
  photo edge to edge (settling in), or the words alone without one.
- `SectionBand`: a section on the mist or pale-green band edge to edge.
- `ContactWays`: WhatsApp, a call at any hour and the email as rows, out of
  Home's quote band, shared with Talk to us.
- `ServiceCard`: What we do's rounded card, shared with the services grid.
- The icon chip's deep tone (mission and vision).

### Changed
- Talk to us on Home's pale-green band, the ways to reach us beside its
  words.
- The Services page and a service's other services: Home's rounded cards
  in a grid (four, two, one across), each audience under its name.
- The staffing card, the services list and a service's page: Theme 6's
  headings (semibold, rising).
- About: mission and vision as white cards with deep-blue icons on the mist
  band; the values a ruled list with checks beside their heading.
- Contact: its ways to reach us on the mist band (white cards), its form on
  the pale-green band on Home's card ("Your message"). Its opening stays.
- Careers: Open jobs on the pale-green band, its jobs on white cards with
  a pale chip; Before you apply on the mist band (the user's ask). Its
  opening, a job's page and Apply are unchanged, as the user chose; the
  quote page keeps its form layout.
- `PageSections`: a straight-lined page starts under the header, a page
  ending on a band meets the footer, two bands in a row meet.
- `Words`: a word with no space before it (a comma after the phrase) keeps
  to the word before, never parting at a line's end (the Services
  headline's comma stood apart, and wrapped alone on a phone).
- Plan: D135, R6C.2. AGENTS.md §19, DESIGN.md (the inner pages' opening,
  bands, Talk to us, mission, vision and values, the services' cards,
  Contact).

### Local development (no repository change)
- The local database's pages read through today's schemas, so About's
  introduction gained the highlight and points it was saved without (About
  failed to render: "Cannot read properties of undefined"); backed up
  first. The dev server keeps About's old copy until About is published
  once (Publish revalidates its tag).

### Validation
- Typecheck, lint, format check passed.
- Unit and integration tests passed (1215), coverage 100%.
- E2E passed (phone, desktop): 185 passed, 41 skipped (one-width
  journeys); the Contact form's journey finds its form on Home's card.
- Seen in the built app at 1440 and 390 px: About, Services, a service,
  the quote page, Privacy, the missing page, Contact and Careers.
- First paint, JavaScript (gzip, within 174,080 bytes): Home, Contact and
  the quote page 173,449; the application 170,967; About, Services,
  Careers, Privacy and Terms 167,093; a service 164,917.

### Blockers
- None.

## 2026-11-01 — R6C.3: Home's cinematic automatic hero (D136)

### Changed
- The user chose Impeccable's Cinematic hero direction, then asked for the
  client's automatic slider without Previous, Next, Pause or a slide count.
  Only the progression bars remain, including on phones.
- `HeroSlides`: separate wipe and zoom layers, the outgoing photograph held
  at its last frame and a fresh six-second drift on each visit; current
  photographs alone exposed to screen readers. Hover or keyboard focus
  temporarily stops the drift and fill; reduced motion keeps the first slide
  still. No script timer, dependency or extra animation loop.
- `HeroSection` and the motion tokens: coordinate the masked headline words,
  supporting line, optional action, photo note and progress; keep a long
  photo note inside the photograph's edges. Rails scale instead of animating
  layout width. Existing content, section order and Theme 6 retained.
- Plan D136 and Q48 record the user's choice and the timing/hover defaults
  for review. DESIGN.md and the public surface brief describe the built hero.
- No database migration, environment or production-server change.

### Validation
- Local validation in progress; results will be appended below.

### Blockers
- None. The change stays uncommitted for the user's review, as requested.

### R6C.3 follow-up — the slider sticking
- The user reported that automatic playback sometimes stopped until reload.
  Removed hover and mouse-focus pauses: the clock stops only for deliberate
  keyboard focus (`:focus-visible`), so a pointer resting on the image or a
  tap/click cannot leave it stopped. The screen-reader hint names that path.
- Browser regression: hold the pointer on the hero, click it, watch every
  slide and the wrap to the first, then pause and resume by keyboard.

## 2026-11-01 — R6C.4: Mission and Vision with an authored entrance (D137)

### Changed
- The user chose distinct paired panels: deep-blue Mission with white text,
  pale-green Vision with navy text, display headings and unchanged statements.
- After review, replaced the rejected heart with an assembling medical cross,
  using the logo's colours. Its four arms meet while Vision's globe unfolds;
  the rules open, then the masked headings and statements arrive.
- `MissionPanels`: a GSAP timeline scoped to each panel, stopped and reverted
  on navigation, using the existing engine and motion tokens. Transform and
  opacity only, once on entering; reduced motion and slow/failed script load
  show the completed art and words. Panels already on screen stay visible.
- Plan D137, the tracker, DESIGN.md and the public surface brief updated.
- No migration, dependency, content change or production-server change.

### Validation
- Focused MissionSection and MissionPanels unit tests passed.
- Browser, full-suite and coverage validation in progress.

### Blockers
- None. Uncommitted for user review. Admin colours follow this public work.

### R6C.3–R6C.4 browser validation
- Production-build public browser checks passed: 46 passed, two one-width
  skips. Both phone and desktop completed the entire automatic slider loop
  while hovered and clicked, then paused/resumed by deliberate keyboard focus.
- Home and About passed axe; Mission and Vision's panels, headings and
  statements settled correctly. The heart is gone; the medical cross and
  unfolding globe are the user's final choice. Ready for user review.

## 2026-11-01 — R6C.5: the pastel-green admin (D138)

### Changed
- After the public work passed its browser checks, applied the user's chosen
  pastel-green navigation and sign-in panels, navy words and the colour logo;
  leaf marks the current row, forest carries actions, links, focus and switches.
- `AdminLayout` scopes these roles to the admin. White work areas, layouts,
  behaviour and the public site's blue palette stay as they were. A separate
  status token keeps New blue; other statuses and errors keep their colours.
- The plan, DESIGN.md and the admin surface brief record D138.
- No migration, dependency, environment or production-server change.

### Validation
- Full validation in progress; final results follow below.

### Blockers
- None. All changes remain uncommitted for the user's review.

## 2026-11-01 — final validation and entire-codebase Impeccable audit

### Validation
- Lint, format check, typecheck and the standalone production build passed.
- Unit, contract and local MySQL integration: 343 files, 1,217 tests passed;
  statements, branches, functions and lines all 100%.
- Full E2E: 187 passed, 41 intentional one-width skips (5.5 minutes). Phone
  and desktop, axe, publishing, admin workflows, forms, security journeys,
  keyboard focus, reduced motion, and 320/768/1024 px width checks passed.
- Home, Mission/Vision and the green sign-in viewed at desktop and phone;
  the green admin captured in the built app. Admin action/focus is forest,
  while New remains blue; the public palette is isolated.
- Modern-browser first-load JavaScript, gzip: Home/Contact/Quote 173,775 B;
  About/Services/Careers/Privacy/Terms 167,411 B; a service 164,996 B; general
  application 171,046 B. All within 174,080 B; post-paint motion accounted
  separately by D65. Conditional legacy-only polyfills excluded. LCP, INP,
  CLS, Lighthouse and real-device frame timing were not certified by this run.

### Audit
- The user requested `/impeccable audit` on the entire codebase after the
  UI work. Report: `docs/audits/2026-11-01-impeccable-audit.md`, with raw
  detector evidence and bundle measurements beside it. Audit score 15/20.
- Detector: no primary findings; 11 reviewed advisories (10 email-only
  size/radius values and one integration image-fixture colour).
- Verified findings: one P1 (no persistent stop for automatic content), two
  P2 (targets below the project's 44 px rule; incomplete performance gates),
  one P3 (stale Impeccable JSON sidecar). Audit reports these without making
  fixes or reversing the user's design decisions.
- R6C.3–R6C.5 are ready for review; R7.4 records the audit and its open
  findings. Q49 records the unresolved motion-control decision.
- No commit, push or production-server change, as requested.

### Blocker
- Status: OPEN
- Area: Accessibility conformance before release (audit P1, Q49).
- Description: Home cannot be persistently stopped while using the rest of
  the page; choosing one client logo stops only its row.
- What was attempted: Automatic playback, full loop, hover/click behaviour,
  deliberate keyboard pause/resume and reduced motion verified in browsers.
- Why it is blocked: The user removed the slider controls and chose no
  clients' pause button; a persistent replacement needs the user's decision.
- Required decision/input: Whether and where to provide a persistent motion
  control compatible with the progression-only slider.
- Temporary workaround: Reduced motion keeps slides/logos still; keyboard
  focus temporarily pauses Home. Neither is recorded as a full resolution.

## 2026-11-01 — audit findings 3 and 4 (D139), for review

### Changed
- The user corrected the requested scope to the audit's third and fourth
  numbered findings: performance gates and the Impeccable sidecar. The
  automatic-content and 44 px target findings remain unchanged.
- Added a separate production-build performance suite and `test:performance`:
  modern initial JavaScript (including streamed boundary references), mobile
  Lighthouse categories/LCP/CLS, Event Timing interactions and native touch
  scroll; desktop wheel scroll checks long tasks and missed-vsync estimates.
  Every seeded public route is measured serially. Reports keep initial and
  post-paint bytes separate (D65); applications skip only the intentionally
  conflicting noindex/crawlability audit. Thresholds match §31, without retries.
- CI runs the new gates and retains reports on success or failure. Lighthouse
  13.6.0 is a development-only dependency; no new script ships to a visitor.
  `docs/PERFORMANCE.md` explains the profile, procedure, evidence and limits.
- Regenerated `.impeccable/design.json` from current DESIGN.md and source:
  current colour keys and OKLCH ramps, Theme 6 buttons/header/footer/progress,
  Mission/Vision cross and globe, green admin navigation/actions and preserved
  blue New status. Ten self-contained previews use token-bound CSS. Narrative
  is copied from DESIGN.md; that authority was preserved in this follow-up.
- No migration, environment variable, product feature or production change.

### Validation
- Full verification in progress; final results are appended below.

### Blockers
- Physical-device/compositor checks and cached-response time from the server's
  region remain release verification; local lab evidence does not certify them.
- Existing accessibility decision Q49 remains open. Nothing committed or pushed.

## 2026-11-01 — shared-link previews (D140), for review

### Changed
- Updated the existing server-only share-image renderer from the earlier
  green-band composition to Theme 6: original Al Hidaya colour logo, published
  page headline in deep blue, optional pale-green label, domain and blue/leaf
  baseline. Headline size adapts to longer published copy.
- Included the existing logo in standalone image-route file tracing. No new
  dependency, remote fetch, CMS design control, environment variable or migration.
- Added crawler checks for WhatsApp across all 19 published launch routes,
  plus Home checks for Facebook, X, LinkedIn and Slack: complete metadata in
  the initial HTML head, absolute image URLs and readable 1200 × 630 PNGs
  below 300 KB. No messages are sent to a social service.

### Validation
- Verification in progress; final results appended below.

### Blockers
- Live platform appearance and cached-preview refresh require the authorized
  deployment; the client’s server remains untouched. Nothing committed.

## 2026-11-01 — upload security verification (D141), for review

### Changed
- Reviewed image, brochure and CV routes: bounded streaming request reads,
  per-file size/type checks, admin authorization/origin and public-form gates,
  generated storage names and extensions, private CV storage and attachment-only
  downloads, public-folder execution restrictions and nosniff.
- Image decoding now maps failures during every output conversion to
  UPLOAD_TYPE_NOT_ALLOWED before any variant is written. libvips warning
  handling is explicit; the existing 40-million-pixel ceiling remains.
- Added harmless adversarial tests for renamed executable/script/SVG/PDF
  content, forged image signatures, truncated JPEG pixels, excessive decoded
  dimensions, oversized images/brochures and a program disguised as a PDF CV.
  Re-encoding a real image discards appended program text.
- No new runtime dependency, migration, service or server change.

### Validation
- Targeted image/storage/body/hero/share tests: 10 files, 45 tests passed.
- Broader verification in progress; final results appended below.

### Blocker
- Status: OPEN
- Area: Malware scanning, Q52.
- Description: PDF/Word uploads receive signature-based identification, not
  full document validation, disarm/reconstruction or antivirus scanning. DOCX
  identification uses ZIP signature plus a Word path marker; DOC uses OLE magic.
- What was attempted: Reviewed all upload, storage, download and mail paths;
  existing controls and new adversarial tests remain within the approved plan.
- Why it is blocked: A scanner adds infrastructure or an external service
  outside the current architecture (AGENTS.md §29).
- Required decision/input: Whether to investigate a cPanel-compatible scanner.
- Temporary workaround: Existing supported-type/size checks, image re-encoding,
  generated non-executable filenames, isolated private CV storage; no claim
  that signature checks prove a document is valid or malware-free.

## 2026-11-01 — performance verification correction

### Changed
- The first complete current-run performance pass caught font-swap CLS above
  0.05 on Home and three Careers/application pages. Replaced the openings’
  font-dependent ch container widths with equivalent stable em-based tokens.
  No font, headline content, animation or performance threshold changed.
- The touch-scroll probe now travels one viewport beyond the nominal range,
  avoiding a swipe stopping short from rounding/inertia; it still requires
  reaching the bottom and counts the entire gesture.

### Validation
- Focused cold-font desktop Careers/application checks: four passed; previous
  failed CLS values 0.0779–0.0925 fell below 0.001 in the focused pass.
- Full rerun pending. Earlier partial runs are diagnostic evidence, not a pass.

### Resolution — D141 / Q52 scope
- The user chose: “Harden and verify existing checks now; decide malware
  scanning before launch.” The scanner is deferred by that explicit decision,
  not a blocker to finishing the current upload hardening. The launch decision
  remains open; no antivirus, external service or file transfer was added.

### Additional measured Home correction
- Stable em widths fixed the Careers/application shifts, but Home still shifted
  because the tallest hidden slide changed the shared grid height at font swap.
  Added a desktop-only 22 rem minimum copy-area token; longer copy still grows,
  and mobile layout is unchanged. No overflow clipping or hidden text added.

### Upload / share validation follow-up
- Current complete unit/contract/database run: 345 files, 1,224 tests passed;
  statements, branches, functions and lines all 100%.
- Built functional browser run: 188 passed, 43 intentional one-width skips;
  the new oversized fixture was initially zero-filled and hit the type check
  before the size check. Corrected it to carry a valid image/PDF signature.
  The focused desktop media suite then passed all three tests, including every
  disguised-file and size-limit assertion. No application source changed for
  that fixture correction.
- WhatsApp crawler checks passed for all 19 launch routes, plus Home for
  Facebook, X, LinkedIn and Slack. Absolute OG/Twitter image URLs, initial-head
  metadata, 1200 × 630 PNG generation and sub-300 KB size passed on the standalone
  build with the bundled logo/font. Home and long-title cards visually reviewed.
- Full lint, format, typecheck and standalone build passed; dependency audits
  passed, with no known moderate-or-higher advisory in the 97 shipped packages.
- Final Home layout and full performance verification continue below.

## 2026-11-01 — final D139–D141 validation, ready for review

### Validation
- Final standalone performance run: all 40 serial cases passed in 9.1 minutes
  with unchanged thresholds and no retries. Maximum initial modern JS 173,784
  gzip bytes (296 spare), mobile lab LCP 618 ms, scripted INP bound 56 ms and
  combined measured CLS 0.0384; minimum Lighthouse category 96. No scrolling
  long task above 50 ms observed; desktop missed-vsync estimate 0% in this run.
  Post-paint motion: 50,245 gzip bytes, accounted separately under D65.
- Evidence and all 20 route summaries recorded in
  docs/audits/2026-11-01-performance.json; original audit preserved with a
  follow-up recording fixes to numbered findings 3/4 and the additional
  shared-link/upload requests. Findings 1/2 remain unchanged.
- Final Home minimum copy area: 16 affected unit/contract tests passed,
  six phone/desktop opening/axe/font browser checks passed, standalone rebuilt.
  The complete 345-file/1,224-test 100% coverage run and the functional/browser
  fixture correction are recorded immediately above.
- CI coverage uses one worker, matching the successful complete local run and
  avoiding reproduced photo-encoding contention; no test timeout relaxed.
- R7.1 lab gates and R7.4 selected fixes are ready for review. R7.3 records the
  focused upload review without claiming the broader ASVS review complete.
- No schema migration, new environment variable, visitor script or production
  change. Nothing committed or pushed.

### Remaining release checks
- Physical-device/compositor and field responsiveness, server-region cached
  response time and live social-preview caches need release verification.
- The user chose to decide malware scanning before launch (Q52). Current
  PDF/Word signature checks are not full validation or a virus-free guarantee.
- Persistent motion controls remain the existing decision Q49.

## 2026-11-01 — Impeccable harden and polish (D142), for review

### Changed
- Confirmed four regressions before fixing them: public forms sent twice while
  their lazy schema loaded, admin mutations accepted simultaneous submissions,
  and both button families allowed disabled=false to override pending=true.
  Immediate locks now cover validation/request/revalidation, preserve retry
  after errors, and keep pending controls disabled and announced busy.
- Confirmed long headings/contact details widened rendered phone/tablet/desktop
  pages; added resilient wrapping, including masked words and settling text.
  No copy is truncated or replaced and no translation feature was added.
- Standalone navigation/footer/authentication/section links now meet the existing
  44 px target requirement. Footer rows retain a compact rhythm, and the phone
  sign-in band no longer receives excess free grid height above its form.
- Reuse the existing menu when desktop navigation exceeds its safe capacity:
  five links or 42 total label characters (agent default). No saved link is
  removed. The same menu, current state and header action stay available.
- DESIGN.md and the changed Impeccable component previews document the current
  targets and behaviour. Theme 6, green admin, content, animation sequence and
  reduced-motion support are preserved. No infrastructure or server change.

### Validation
- Baseline race/disabled tests: four failed as expected; all pass after fixes.
- Targeted unit suite: eight files, 38 tests passed before the final navigation
  browser checks. Long text no longer widens 390/768/1440 px renders.
- Local rendered Home, About, Contact and sign-in fit at 200% text enlargement
  at 390/768/1440 px. Phone sign-in before/after and public layouts reviewed.
- Final complete verification in progress; results appended below.

### Blockers / limits
- No critique snapshot was returned for the current Home file, so this was an
  independent harden/polish pass. The session’s existing context was retained.
- Persistent motion control Q49 remains unresolved: the user’s progression-only
  hero is preserved. Malware scanning remains the before-launch decision Q52.
- No new claim of physical-device, Safari, screen-reader speech or production
  verification. Nothing committed or pushed.

### D142 verification follow-up
- Complete unit/contract/local-MySQL suite: 345 files, 1,227 tests passed;
  statements, branches, functions and lines all 100%.
- Complete built browser suite: 195 passed, 45 intentional one-width skips
  (5.7 minutes). This includes publishing ten long navigation labels, checking
  all links at 1440 and 390 px, keyboard access to the final link, Escape/focus
  return, and restoring the original published site.
- The manual 1024 px logo/nav overlap check passed; no breakpoint change made.
  One local browser check initially hit an automatic approval-review timeout;
  its permitted retry succeeded, with no permission or server change.
- The hardening detector reports zero primary findings and 11 unchanged
  advisories (email formatting and a fixture colour); they are not new UI defects.
- An additional extreme highlighted heading revealed internal overflow despite
  a fitting page width. Its short phrase remains atomic, while longer highlights
  can wrap inside the heading; punctuation groups share a bounded wrapper.
  Seven affected motion-text unit tests passed. Added real-component browser
  stress markup to check internal scroll width as well as document width.
- Final rebuild, affected browser checks and isolated performance gates pending.

- Final highlighted-heading browser checks: 32 passed, four intentional
  one-width skips, including all public pages’ width/axe checks at 320, 768
  and 1024 px. The 112-character highlighted word now wraps inside its heading
  instead of its previous 2,152 px internal overflow on a 390 px page.
- The admin phone logo’s target also uses the existing 44 px minimum; its
  32 px image and already-44 px menu button keep the bar’s visual height intact.
  Added that assertion to the existing phone-menu/sign-out journey.

## 2026-11-01 — D142 final verification, ready for review

### Validation
- Final hardened standalone build: all 40 serial performance checks passed
  (9.2 minutes), unchanged budgets, no retries. Maximum initial JS 173,897 gzip
  bytes (183 spare), mobile lab LCP 621 ms, scripted INP bound 72 ms, CLS 0.0386;
  minimum Lighthouse category 96. No scrolling task above 50 ms observed; desktop
  missed-vsync estimate 0%. Deferred motion remains 50,245 gzip bytes.
- Complete 345-file/1,227-test run had 100% coverage; full built E2E passed
  195 checks with 45 intentional skips. Final static wrapper corrections passed
  17 affected unit/contract checks and 32 affected browser checks (four skips),
  then the final phone admin target/menu/sign-out check passed.
- Final typecheck, lint, format and standalone build passed. Zero primary
  detector findings and 11 unchanged advisories. No new runtime dependency.
- Source diff reviewed; no temporary scripts, debug output or test fixtures
  were added to shipped source. The D142 report and per-route performance JSON
  preserve this build separately from historical D139 measurements.

### Remaining decisions / release limits
- Q49 persistent motion control and the user-deferred Q52 malware-scanning
  decision remain open before release. Q53 records reviewable layout defaults.
- Physical-device, speech/Safari/Firefox/field/server-region/live-social-cache
  checks are not claimed by local Chromium evidence. Broader ASVS work remains.
- No migration, environment change, production action, commit or push.

## 2026-11-02 — Home services pyramid (D143)

### Changed
- Home alone uses the approved service-card pyramid: 30 px steps, full title/link
  panels on the rear cards and softer rear photographs. The existing arrows and
  touch gestures cycle through published services. The user changed the preview’s
  eight-second interval to the main slider’s shared six-second duration.
- The enhancement loads after paint, stops offscreen/in a hidden tab/during
  deliberate keyboard focus, and leaves manual navigation static for reduced
  motion. A native row remains usable without the motion chunk. Other public
  service grids and the admin are unchanged. No new dependency or migration.

### Validation
- In progress: focused unit/coverage, standalone build, phone/desktop browser,
  responsive/keyboard/axe and isolated performance checks.

### Blockers / limits
- Q49 persistent motion-stop choice remains open under the approved no-pause
  direction. No production action, commit or push; the user reviews first.

### D143 validation completed — 2026-11-02
- Full unit/contract/local-MySQL integration suite: 347 files, 1,239 tests,
  100% coverage. Full built E2E: 198 passed, 44 intentional skips; subsequent
  focused journeys verified real swipe/fresh-tap navigation, no-JavaScript
  fallback, reduced motion, automatic advancement and axe. Final CSS build
  repeated the phone/desktop pyramid journeys (two passed).
- Production CSS RTL centring checked at 390 and 1440 px; general layout
  checked at 320, 390, 768 and 1440 px. The scoped detector returned no findings.
- All 20 route initial-JS budgets passed. The largest is exactly 174,080 gzip
  bytes (170 KiB), leaving no headroom. No limit was relaxed.
- Final-build isolated Home/Contact phone/desktop performance: four passed,
  no retries; LCP ≤ 527 ms, lab interaction bound ≤ 88 ms, CLS ≤ 0.0349,
  no measured scroll long tasks. Lighthouse 100 on measured routes.
  A prior Contact keyup sample failed at 320 ms; it remains disclosed in
  `docs/audits/2026-11-02-home-services-pyramid.md`, alongside the passing
  follow-up, without claiming a confirmed cause. Historical whole-route
  runs remain distinct from this targeted follow-up.
- Q49 and physical-device/field/browser/server-region limits remain open.
  No migration, environment change, production action, commit or push.

## 2026-11-02 — Service and Contact concept images (D144)

### Added
- Five reusable service-detail design concepts, shown consistently with the
  existing Home nursing care content for comparison. All five also checked
  against all eight service titles, correct audience actions and both widths.
- Five Reach us/Send us a message compositions using current company contact
  facts, map geometry, consent and existing fields. Ten desktop and ten phone
  PNGs prepared for client sharing, with two overview sheets and a ZIP.
- These are external review images only. No service-detail or Contact source
  implementation changed. Q54 records the user’s pending design choice.

### Validation
- Desktop 1440 px and phone 390 px render checks: no horizontal overflow,
  broken images or browser-script errors. All 80 service/layout/viewport
  combinations passed title/action and overflow checks. Images visually reviewed.

### Blockers / limits
- The user chooses a service layout and Contact layout before implementation.
  Motion captions describe proposed behavior; the PNGs themselves are static.
  No new dependency, schema, environment, production action, commit or push.
- Final repository lint, typecheck, format check and diff whitespace checks
  passed after the CSS direction correction and review documentation update.

## 2026-11-03 — Contact and service-detail layouts (D145–D147)

### Changed
- Contact follows Blue ribbon: white opening, pastel-blue Reach us, pastel-green
  message section, overlapping form and office/map. Navigation/footer retained.
  Name/phone align; phone guidance is a placeholder with visible labels.
- The Contact headline types fully, holds, deletes from the end and repeats.
  Native opacity animations on the deferred motion path reserve full geometry,
  pause offscreen/hidden and cancel to complete still text for reduced motion.
- Service details follow Care editorial with a large blue heading and tall
  rounded portrait. About is pastel blue; Who it is for and the 24/7 panel are
  omitted, with stored content retained. The user clarified Other services:
  compact thumbnail/title cards on pale green with All services, showing three
  random distinct same-audience published services (fewer when fewer exist),
  excluding the current service. Home and the Services listing keep their cards.
- The service editor supports up to two optional header labels/destinations,
  none by default, governed by existing draft/preview/publish. Safe internal or
  HTTPS links only; count, labels and links validated at save/publish boundaries.
  Missing legacy fields default to empty; no SQL migration is needed.
- Smooth-scroll setup moved to the deferred motion runtime so added behavior
  retains the existing initial-JavaScript budget. No new dependency or frame loop.

### Validation
- Full pre-related-correction coverage: 1,251 tests passed, 100% across all
  metrics. Full built phone/desktop E2E: 203 passed, 45 intentional skips.
  Final related correction and performance validation are recorded below.
- Responsive renders at 320/390/768/1440 px, native type/delete phases,
  reduced-motion cleanup and form alignment checked. A scoped detector returned
  no findings before the related-card correction; later checks are visual/browser.

### Blockers / limits
- Q49 persistent motion-stop and physical-device/field/browser/server-region
  release checks remain. No real client data change, production action, commit
  or push. All edits remain for user review.

## 2026-11-03

### Changed
- D148: Careers’ retained opening can be moved and hidden/restored through the Pages editor; other page locks remain. User requested it hidden now in the local preview. No migration.

### Validation
- In progress; no commit, push or deployment.

### Blockers
- None.

### Changed
- D149: About’s Mission/Vision panels lift and highlight on hover/focus, with transform/opacity-only CSS and a static reduced-motion highlight. Existing entrance animation retained. Validation underway.

### Changed
- D150: Only the main Services page’s All services section now places every service in one pastel-green compact-card grid, without audience groups/actions. Rest of page and Home unchanged. No migration; validation underway.

- D150 follow-up: Services’ Talk to us band uses pastel blue; other pages’ bands and all content/actions are preserved.

- D149 refinement requested by the user: noticeably animate the medical cross’s arms/quarter turn and the globe’s unfolding rings, with an expanding outline. One hover/focus sequence, transform/opacity only; reduced motion stays static.

- D149 final clarification: make the whole card the focal interaction, with perspective tilt/forward zoom, a full-surface light sweep and supporting graphic motion. Keyboard focus receives the same response; reduced motion stays static.

### Changed
- D151: Home quote matches the user’s supplied rounded-panel reference with their pastel-blue background correction: contact tiles left, plain white form right, paired fields and message guidance in placeholders. Existing consent and submission security retained. Main Quote page unchanged; no migration. Validation underway.

### Changed
- D151 follow-up: add the float shadow to Home’s white form card.
- D152: Contact message section adopts the reference layout on pastel green, with heading/map/office/address left and the existing white form right; Reach us unchanged. Remove the superseded overlap/token. Existing fields/security retained; no migration. Validation underway.

- D152 follow-up: apply the same float shadow to Contact’s white form card.

- Remove four unused public-label catalogue entries while keeping the unchanged JavaScript budget; the new form placeholders reuse existing words where possible.

### Changed
- D153: clarify the Contact surface: preserve the green rounded panel and white form; add only a pastel-blue outer backdrop matching Reach us.
- D154: recognizable WhatsApp mark across public/admin contact icons and shared WhatsApp buttons; retain legacy chat keys and remove unused footer control glyphs. No migration/dependency.

- D154 refinement: replace the custom outline with the standard Font Awesome Free WhatsApp brand SVG, served locally/reused via SVG use. Floating shortcut uses requested WhatsApp green and white logo. Source/license in docs/brand/icons.md.
- D149 first-visit bug: move GSAP’s entrance transform to the scene wrapper so the article’s hover transforms remain intact, including first visits/client navigation.

- D152 map follow-up: apply the float shadow to the Contact map frame, retaining its attribution and office data.

### Fixed
- D155: remove the legacy audience filter from Other services, so School nurse staffing and every other detail page sample three distinct other published services across the catalogue. Only show fewer if fewer than three others exist overall. Sampling remains server-side before image collection.

### Validation
- D145–D155 final source: 1,265 tests across 355 unit/contract/local-MySQL files passed with 100% statements/branches/functions/lines. Limited worker count avoids the interrupted run’s worker saturation; thresholds unchanged.
- Final standalone build passed; all 20 public initial-JavaScript sizes passed, maximum 174,079 gzip bytes against 174,080. Browser and isolated lab checks remain in progress.
- Earlier overlapping-database and interrupted-worker runs were discarded; the sequential final suite is green.

### Changed
- D156: About and main Services opening buttons gain a Pages-editor visibility switch, off by default and for legacy records. Preserve the existing labels/links; save/preview/publish controls visibility. Hide both in the local published preview. Individual service-detail button controls unchanged; no migration.

### Validation — final D145–D156 review build
- Final source: 1,271 tests across 355 unit/contract/local-MySQL files passed; statements, branches, functions and lines all remain 100%. Lint, typecheck, formatting and standalone build passed.
- Built-app targeted browser checks: 27 passed, one intentional skip, phone and desktop with axe. Includes first-navigation whole-card Mission/Vision hover, both form layouts/shadows, proper WhatsApp branding, School nurse staffing’s three related cards, optional service header actions, Careers movement/visibility and About/main Services action switches through preview/publish/hide.
- All 14 isolated performance checks passed on seven affected routes: maximum mobile lab LCP 686 ms, scripted INP bound 56 ms, combined CLS 0.0349, minimum Lighthouse category 100, no scrolling long task at the observer threshold and 0% desktop missed-vsync estimate. Lab limits and remaining physical-device/production-region release checks remain; evidence is recorded in docs/PERFORMANCE.md and the Nov 3 audit artifacts.
- All 20 initial JavaScript sizes pass on build NeuDoY-tls_g0bBcMQcAE, maximum 174,079 gzip bytes against the unchanged 174,080 limit (one byte headroom). Future shared-client changes require fresh measurement.
- Local published content: Careers opening hidden; About and main Services opening actions off, with existing content preserved. No SQL migration or production change. Ready for review; nothing staged or committed, as requested.

### Blockers
- No local implementation blocker. Existing release decisions and physical-device/production checks remain recorded in the audit.

## 2026-11-03 — slider pill and approved blended openings

### Changed
- D157: Home slider’s photo pill gets a Hide the slider pill switch in Pages → Home → Page header. It preserves its note/icon and uses authenticated draft/preview/publish. Hide it in the local published preview; keep progression bars. No SQL migration.
- D158: implement the user’s first approved photo/header concept on Home, About and main Services. Full-width dimmed photos, light opening copy, and original coloured logo/nav on a protected light header surface with the shorter fade. Keep existing motion, scroll-away/return header and other routes. No new client route logic, image analyser or dependency.
- D159: fit and centre mobile WhatsApp/Call action text beside each other; shorten the shared brochure button to Brochure while retaining its download icon.

### Validation
- In progress; final results appended below. User review remains required before any commit. No production action.

### Changed — latest image-fade refinement
- D160 supersedes D158’s header-gradient implementation: keep the navbar solid soft white and gently fade the image/overlay at their top through a static 192 px alpha mask into the same light base. Controls and coloured logo never fade. Only Home, About and main Services photo openings; other routes/text-only openings retain their normal header.

### Validation follow-up
- Initial final-source coverage passed 1,276 tests across 355 files at 100% in every metric; lint/typecheck/build passed. An initial 26-case browser run passed 24 checks and exposed a test setup assumption in the two new mobile brochure checks: launch test content intentionally has no brochure and correctly shows Request a quote. The brochure label/icon assertion is moved to the existing workflow that uploads/publishes a brochure, including its mobile menu; the contact-fit test explicitly checks the no-brochure fallback. No product behavior or assertion threshold is weakened. Browser/performance checks are repeated after D160’s CSS refinement.

### Performance correction
- The first isolated D160 run passed five of six cases but caught a real About desktop font rewrap: CLS 0.0592 exceeded the unchanged 0.05 budget. Reserve three heading lines in the two photo page openings before font arrival, while allowing longer headings to grow. Add a delayed-font browser regression and repeat the affected checks; no threshold is raised.

### Validation — completed D157–D160
- Final browser workflow: 27 passed, one intentional skip. Font-stability follow-up after the confirmed CLS correction: seven passed, one intentional skip, including delayed-font geometry and axe. Full source coverage remains 1,276 tests / 355 files at 100% all metrics; 11 token/sidecar/HeaderAction follow-up tests passed. Final lint/typecheck/format/build passed.
- All six final isolated performance checks passed: maximum mobile lab LCP 754 ms, scripted INP bound 56 ms, CLS 0.0420, minimum Lighthouse category 100, no scrolling long task at the observer threshold and 0% desktop missed-vsync estimate. All 20 initial-JS sizes pass at 174,075 gzip bytes maximum, unchanged 174,080 budget. Local lab/release limits documented in docs/PERFORMANCE.md and the D157–D160 review.
- Local Home pill hidden/published with content preserved; earlier About/Services actions and Careers opening stay hidden. No migration, dependency, production update, staging or commit. Ready for user review.

## 2026-11-03 — Impeccable Adapt, public mobile website

### Changed
- D161, user-confirmed scope: public website and mobile menu; desktop/admin retain their styles. Phone-specific heading/body/lead scale and section rhythm, compact image openings/fade, shorter intro/service photo crops, smaller Mission/Vision graphics and related thumbnails, improved form-card space, shorter menu rows, two-column phone footer and short-landscape handling. Preserve all content, approved colours/motion, 44 px targets, 16 px inputs, pyramid rise/timing and stored visibility. No migration/dependency or design controls.
- Add all-public-template responsive/axe checks, phone/tablet/landscape cases and actual synthesized vertical carousel-scroll coverage alongside its existing horizontal swipe/tap journey. Physical-device/browser-engine limitations remain.

### Validation
- In progress; final evidence appended below. No production action, staging or commit.

### Changed — non-sticky public navbar
- D162: keep the navbar at the top in document flow and let it scroll away naturally, without returning on upward scrolling farther down. Remove the hide/show scroll listener, animation-frame bookkeeping, state and retired CSS. Preserve navigation content, page-change pill motion, mobile menu and photo-opening composition. Applies at all widths, as explicitly requested.
- Restart the source coverage check after this new shipping-code change; the interrupted pre-D162 run is not claimed as final validation.

### Changed — matching white navigation surfaces
- D163: Careers and Contact headers use the same soft-white card surface as the other main pages; retain the coloured logo and non-sticky placement. Other section colours remain. Server-rendered page identity scopes the CSS, with no new client logic.

### Validation follow-up
- The first broad adaptation browser pass passed 93 checks with four intentional skips and caught one real 40 px footer-logo target after reducing its image. Keep the image compact and restore an independent 44 px minimum link area; its three focused unit cases passed. No target assertion is weakened.
- Repeated historical test seeds filled the shared local test-media allowance. Browser checks now use isolated temporary media/CV folders. Reversibly quarantine only old unreferenced image variants that are byte-identical to referenced seed images, preserving every file referenced by either local database and all other user uploads. This recovers 237,742,630 bytes from the preview media folder; no database/production content is deleted, and upload budgets remain unchanged. Quarantine manifest is local temporary data, not committed.

### Changed — shared service-detail photo openings
- D164: reuse PageSplit’s current fading photo opening for individual services, with the existing service title/summary over the dimmed full-width photo. Preserve optional published header actions and their editor controls, white non-sticky navbar, no-photo fallback, pastel-blue About and three compact related services. Retire the old arch/title CSS; no new field, dependency or migration.
- Replace the interrupted pre-D164 coverage check with the final source verification after this new requested composition change.

### Validation — completed D161–D164
- Final source: 1,275 tests across 355 files passed at 100% statements, branches, functions and lines. Lint, typecheck, formatting and standalone build passed. Final built-app browser follow-up: 47 passed, three intentional skips, including all 20 public templates with phone/desktop axe, 320/414 px phones, tablet/landscape, 200% text enlargement, non-sticky/white navigation, fading service openings, optional service buttons, Home pill controls and synthesized horizontal/vertical carousel touch gestures. The earlier broad pass also covered Contact/Quote/CV submission and error journeys; its footer-target finding is fixed.
- All 40 final isolated performance cases passed across the 20 public templates and desktop scroll counterparts, unchanged budgets and no retries: maximum mobile lab LCP 735.3 ms, scripted INP bound 64 ms, combined CLS 0.04192, minimum Lighthouse category 96, no scrolling long task at the observer threshold, 0% desktop missed-vsync estimate. All initial-JS budgets passed, maximum 173,894 gzip bytes / 174,080. Build Lvrq97SaI_O7gc0qkYK55; evidence and lab/release limits recorded in docs/PERFORMANCE.md and the mobile Adapt audit.
- R6C.20–R6C.22 ready for user review. No migration, new infrastructure, dependency, client-server action, deployment, staging or commit. Physical-device/other-engine/field/production-region checks remain release checks.

## 2026-11-03 — Careers hidden-opening spacing

### Changed
- Remove the empty pastel-blue strip above Open jobs when Careers’ opening is hidden or moved below another section. Keep the existing inset when the opening is visible first, and preserve the jobs band’s own padding. No content, visibility setting, colour, migration or dependency changes.

### Validation
- In progress. No staging, commit, deployment or client-server action.

### Changed — matching navbar spacing
- Careers and Contact use the same navbar height and vertical spacing token as Home/About/main Services, retaining their white surface and document-flow placement. Photo overlap remains limited to photo openings.

### Validation — completed Careers/navbar spacing follow-up
- Fourteen focused unit/token tests passed. Lint, typecheck, formatting and standalone build passed. Four built-app phone/desktop browser workflows passed: Careers move/hide/preview/publish/restore and all 20 public templates with axe/readable-type/field/overflow checks plus matching header heights. No database schema or write behavior changed.
- Actual preview geometry checked at 320, 390, 768 and 1440 px: Home/Careers/Contact navbar heights and logo/control positions match; Open jobs starts directly after the Careers navbar with zero outer top padding. The full performance/coverage run recorded above predates this small spacing follow-up; it was not rerun. No migration, staging, commit, deployment or client-server action.

## 2026-11-03 — Footer contact alignment

### Changed
- Align Instagram/social icons and labels with footer contact rows: use the same 20 px deep-blue mark and 10 px gap, removing the larger social-only chip that shifted both columns. Preserve contact content, URLs, external-link protections, keyboard focus and 44 px targets. No migration/dependency.

### Validation
- In progress. No staging, commit, deployment or client-server action.

### Validation — completed footer alignment
- Three footer unit tests passed; lint, typecheck, formatting and standalone build passed. Both phone/desktop hardening browser workflows passed, including measured icon/text alignment, wrapping and 44 px touch targets. Restored actual preview also verified at 390 and 1440 px with matching icon and label columns and 44 px Instagram link height.
- No data/write behavior, migration, dependency, staging, commit, deployment or client-server action. Earlier full coverage/performance evidence is unchanged historical evidence; this small presentation follow-up uses focused checks.

## 2026-11-03 — Footer social group

### Changed
- Add Follow us on under the footer Contact details. One published social network shows icon and name; multiple networks show icons side by side with accessible names and 44 px targets. Omit the group when none are published. Preserve URLs, external-link protections and the existing shared social icons. No schema, migration, dependency or CMS control changes.

### Validation
- In progress. No staging, commit, deployment or client-server action.

### Changed — footer logo shine
- D165: add a subtle diagonal highlight masked to the original footer logo. The logo stays stationary; a brief sweep repeats within a seven-second cycle. CSS transform/opacity only, no new client script or image asset. Reduced motion shows the static logo.

### Changed — Instagram optical adjustment
- Move only the footer Instagram mark 2 px toward the inline start, as requested; retain its label position and 44 px link area.

### Changed — slower logo shine
- The user approved the shine’s appearance and requested a slower sweep. Extend the travel to 4.5 seconds in a ten-second cycle, with a quiet pause before repeating. The logo remains stationary; reduced motion remains static.

### Validation — completed footer social/shine refinements
- Thirteen focused footer/token/sidecar tests passed; lint, typecheck, formatting and standalone build passed. Six final built-app phone/desktop workflows passed: zero/one/multiple networks saved/published/restored through the authenticated test API, visible/accessible names, icon-row geometry, keyboard focus, axe, 44 px targets, 2 px Instagram optical offset, logo-mask matching, highlight movement with logo stability, and static reduced motion. The social-layout accessibility check uses steady-state reduced motion; a separate normal-motion workflow tests the shine. Row measurements are relative to the social list to remain stable when keyboard focus scrolls the viewport.
- The user’s final slow refinement uses a 4.5-second travel and ten-second cycle. Actual local preview restored. No schema/write behavior, new dependency/runtime, migration, staging, commit, deployment or client-server action. Full-site coverage/performance evidence above remains historical; these small presentation follow-ups use focused checks.

## 2026-11-03 — Approved footer line-art background

### Changed
- D166: implement the two attached pale-blue outline references together: nurse/older-patient care scene and sparse nursing tools behind the existing footer. The user corrected the earlier filled-colour interpretation. Keep all existing content, social behavior, links, spacing, copyright and ten-second logo shine. Static decorative layer, responsive positioning, no pointer/screen-reader interference; local lazy-loaded artwork and existing icon vocabulary. No new data, CMS control, dependency or migration.

### Validation
- In progress. No staging, commit, deployment or client-server action.

### Changed — user’s exact-artwork fallback
- The user requires the supplementary nursing tools to match the reference exactly or be removed. Remove all four approximate tool drawings and their unused CSS/tokens; keep only the faint nurse-care scene under the explicitly authorized fallback. The flattened mockups do not provide exact separate source artwork. All footer content, layout, social behavior, copyright, WhatsApp and slow logo shine remain. No claim of pixel-identical generated artwork.

## 2026-11-03 — R6C.27: the phone menu, concept 3 (D167)

### Changed
- D167: the phone menu is now the user's chosen concept 3 of three: a
  full-screen sheet in the logo's deep blue, the pages in large white words
  under faint rules (the current one semibold with a leaf arrow), WhatsApp
  (leaf) and Call (white) as two side-by-side tiles with their numbers on one
  line, the brochure (the quote until there is one) on a white button, and a
  faint white mark as a watermark. The email, the hours and "24/7" are not in
  it, as asked (the Call tile reads "Call us"). The brochure keeps D159's
  wording. Modules: `MobileMenu`, `HeaderAction` (a `variant`, `size`),
  `pill-classes` (`onDeep`), `IconChip` (`onLeaf`, `mist`), `UI_TEXT.callUs`,
  `logo-mark-white.svg`, `src/app/globals.css` (menu tokens and keyframes).
  Supersedes D159's outlined pills (its one-line fit stands) and D161's 52 px
  menu rows (the rows now scale with the screen's height, 48 – 76 px).
- Open and close: the sheet drops in from the top and lifts away; closing, the
  dialog waits for the lift to end (`animationend`) before `close()`, so the
  browser's own focus return, Escape and focus trap still apply; Escape and a
  chosen page take the same animated way out; with motion reduced it opens and
  closes at once. Transform and opacity only.
- The user's follow-up, "the contents … seem a little lag or stuck": measured
  first (steady 16.7 ms frames, also with the CPU slowed 4×, so not dropped
  frames); the cause was the motion's design. The rows waited 160 ms and then
  rose on a steep curve against the sheet's downward movement, so the panel
  looked empty and then popped. Now the sheet and its rows share one curve
  (`--ease-settle`), the first row starts at 40 ms and the rows follow the
  sheet down (settling from 14 px above), the first row is visible at about
  70 ms (it was about 200 ms) and the cascade ends smoothly by about 550 ms;
  the menu opens in the tap itself rather than a render later; the watermark is
  a plain white file instead of a CSS filter.

### Changed — the first-paint JavaScript budget
- The menu's new code took Home, Contact and the quote page 348 bytes over
  174,080 (174,428). The small shared pieces the menu uses (`Pictogram`,
  `IconChip`, `PillLink`, `HeaderAction`) now opt out of the React Compiler's
  memoising, as the forms and the header already do (reason beside each):
  172,567 now.

### Validation
- Format check, typecheck and lint passed.
- Unit and integration tests passed (1281), coverage 100%
  (statements 4785/4785, branches 3089/3089, functions 1767/1767, lines
  4249/4249). The Impeccable sidecar copy of the reduced-motion rule is kept
  equal to DESIGN.md.
- Seen in a real browser at 390 × 844 (open, mid-drop, settled, closing) and
  at 320 × 568, 360 × 640, 414 × 896, 844 × 390 and 768 × 1024: no sideways
  overflow, both numbers on one line, the sheet scrolls only where the screen is
  too short. Motion measured frame by frame: steady 16.7 ms frames also with the
  CPU slowed 4×; the sheet 90% down at about 270 ms with its first row visible
  from about 70 ms; closing about 420 ms, then the dialog closes, focus back on
  the menu button, Escape the same way.
- First paint, JavaScript (gzip, within 174,080 bytes): Home, Contact and the
  quote page 172,567; the application 169,502; About, Services, Careers,
  Privacy and Terms 166,209.
- E2E (phone, desktop): one complete run passed, 228 passed and 46 skipped
  (one-width journeys). The menu's specs (the sheet and its rows, closing,
  Escape and a chosen page, reduced motion, the tiles at 320 – 414 px, the long
  menu, responsive widths) passed in every run after their fixes. Later full
  runs, made while the Mac was out of memory (swap 23.7 of 24 GB), failed in
  9 – 17 specs that publish shared content and then reload as a visitor
  (Home's slider pill, Careers', About's and Services' opening buttons, an edit
  seen by a visitor, footer social links, the long navigation, the job, client
  and service editors, the critical journey): a visitor's page still showed the
  earlier content. They are not the menu's, and all 60 passed when run alone
  (`pages`, `page-editor`, `settings-editor`, `services-editor`,
  `clients-editor`, `jobs-editor`, `critical-journey`). Whether they are only
  slow-machine timing or a real staleness in publishing is not settled here; it
  needs a clean-machine rerun.

### Blockers
- None. Left uncommitted with the rest of the Phase 6C refinements (D136 – D166
  are uncommitted in the same tree); no staging, commit, deployment or
  client-server action.

## 2026-11-04 — Completed D166 footer review

### Changed
- Finalize the user-authorized nurse-only fallback: the very faint blue care illustration remains; approximate extra tools are omitted. Existing footer content, destinations, social-count behavior, copyright, responsive layout, WhatsApp and slow ten-second logo shine are preserved. The illustration is not claimed as a pixel-identical extraction of the flattened reference. No new data, migration, dependency or client script.

### Validation
- Final D166 source checks on Nov 3 passed: 13 focused footer/token/sidecar tests, 100% coverage for the two affected footer components, lint, formatting, typecheck and standalone build. Twelve built-app phone/desktop workflows passed, including all 20 public templates with axe, narrow/tablet/landscape layouts, social states, pointer access, wrapping/44 px targets and the preserved normal/reduced-motion shine. Historical full-codebase coverage was not rerun for this change.
- Both targeted Home performance cases passed on Nov 3: mobile lab LCP 540.3 ms, scripted INP bound 64 ms, CLS 0, all Lighthouse categories 100, initial JS 173,895 / 174,080 gzip bytes, no observed scrolling long task and 0% desktop missed-vsync estimate. Preserved log rows exported to the audit; these results precede later D167 menu work, and their original build ID was not saved. No new full-route or physical-device result is claimed.
- Nov 4 preview review: restart the stale local preview after a newer build so CSS/assets match; no source repair needed. Inspect styled phone/desktop screenshots and recheck all eleven footer links at 320/390/768/1440 px: names, hrefs, sizes/positions and footer heights match the original exactly. Later menu work remains intact. R6C.26 ready for review.

### Blockers
- None for D166. The previous automatic-approval usage interruption is resolved for the final preview check. No staging, commit, deployment or client-server action.

## 2026-11-04 — D168 public Font Manager

### Added
- Settings → Font Manager and its admin navigation entry: ten fixed, licensed, self-hosted variable fonts with live specimens and twenty independent public text roles. Existing Inter Tight remains every default; the admin retains its current typography. No new font upload or runtime dependency. D168 is the user-authorized narrow exception to the locked-design rule.
- Independent TYPOGRAPHY draft/published document, authenticated read/save/publish/discard routes, existing page Preview and unsaved-change guard, safe role/font validation, dedicated cache invalidation and readable Settings activity entries. Publishing fonts does not publish unrelated Site Settings drafts.
- Drizzle-generated migration 0007_typography extends the document-key CHECK and initializes both font copies to the existing family. Applied only to local development/test databases. New fonts retain upstream licenses and version/hash provenance; the deployable bundle includes `/fonts/LICENSES.txt`.

### Changed
- Public HTML uses semantic font roles scoped to the public world; text-size utilities cannot override a caption/detail/heading/link family's selection. Sizes, weights, spacing, colours, content and motion remain unchanged.
- The shared admin EditorSelect uses React Hook Form's controlled binding so selecting after a saved/published draft and repeated resets continues to mark changes and enables Save correctly. Regression verified in the compiled app on phone and desktop.

### Validation
- Lint, formatting, typecheck, production build and whitespace checks passed. Full unit/local-MySQL integration suite: 1,299 tests in 364 files passed with 100% statements, branches, functions and lines.
- Complete built-app browser run: 233 passed, 49 existing skips. Final font-specific rerun after semantic precedence refinement: 5 passed, 3 duplicate phone-matrix skips; 600 font/template/width cases, twenty mobile-menu cases, twenty mixed semantic roles, all four used weights, draft/private-preview/publish/discard and axe. Native keyboard selection/reversion also verified in the local preview without saving a change.
- Ten cold, delayed-font contexts: maximum observed CLS 0.003832; one default or two optional-case font requests, including the retained base preload. Home/Contact/school-service performance gates passed: LCP 554.30/683.59/667.76 ms, CLS 0, INP bounds 64/40/32 ms, all Lighthouse categories 100, JS 173,034/173,034/164,020 gzip bytes against 174,080. Build `UrYz8V32qmDEghyuX1Xfm`.
- Scoped Impeccable audit/polish and screenshots reviewed; no open feature findings. Evidence: `docs/audits/2026-11-04-font-manager-review.md`. Verification uses emulated Chromium widths, not physical-device certification.

### Blockers
- None for D168. R6C.28 is ready for review. All previous uncommitted work is preserved; nothing staged, committed, pushed, deployed or changed on the client's server.

## 2026-11-04 — Font Manager navigation icon

### Changed
- Give Font Manager its own typography T pictogram instead of sharing Settings' sliders icon. Use the existing 24-unit grid, round-capped 2-unit strokes and inherited navigation colour. Recorded as the user's D168 refinement; R6C.28 remains ready for review.

### Validation
- Sixteen existing pictogram/grid/admin-shell tests passed. Lint, focused formatting, typecheck, production build and whitespace checks passed. No data or migration change.

### Blockers
- None. Left uncommitted for review; no staging, push, deployment or client-server action.

## 2026-11-04 — D169 expressive fonts and D170 footer shine frequency

### Added
- Five licensed, self-hosted variable faces in the existing public Font Manager: Playfair Display, Cormorant Garamond, Fraunces, Space Grotesk and Syne, retaining the original ten for fifteen total. All twenty text roles keep the existing draft/private-preview/publish/discard flow. Current font choices and defaults remain unchanged. Source versions, file hashes and upstream licenses accompany the files; the public license bundle includes all fifteen. No new migration, upload or dependency.

### Changed
- Footer logo shine repeats after a 2.75-second quiet gap, half the previous 5.5 seconds. Retain the slow 4.5-second sweep, 0.4-second lead-in, stationary logo, artwork, all footer content and reduced-motion behavior; the complete cycle is now 7.25 seconds.

### Validation
- Lint, formatting, typecheck and production build passed. Full unit/local-MySQL integration suite: 1,299 tests in 364 files, 100% statements/branches/functions/lines. Font licenses and byte hashes pass the existing contracts.
- Built-app E2E: 7 passed, 3 duplicate phone-matrix skips; 900 font/template/width cases, thirty narrow-menu cases, all four used weights, twenty mixed semantic roles, phone/desktop save/private-preview/publish/discard with the new families and axe. Fifteen delayed-load contexts: maximum CLS 0.005308 and only the selected optional face plus the retained base preload requested. Footer timing and reduced-motion checks pass on phone and desktop.
- Home mobile performance gates passed: LCP 555.51 ms, CLS 0, INP bound 64 ms, no observed scroll long task, all Lighthouse categories 100; JS 173,059 / 174,080 gzip bytes. Build `luTUt4WwXV9ddjF9MfVBk`.
- Font specimens and editor screenshots reviewed; scoped Impeccable typography detector has zero findings. Evidence and verification limits: `docs/audits/2026-11-04-expressive-fonts-and-shine.md`.

### Blockers
- None for D169/D170; R6C.29/R6C.30 are ready for review. No staging, commit, push, deployment or client-server action; existing uncommitted work is preserved for review.

## 2026-11-04 — D171 match the mobile Home pyramid to laptop

### Changed
- Home's mobile services pyramid keeps five depth positions, matching the laptop composition, instead of hiding the outer pair. Tighten phone spacing from 36% to 16% of stage width and the centre card from 64 to 60 cqw (still capped at 16 rem). Preserve the 30 px steps, rear scales/dimming, full service labels/links, arrows, swipe, six-second advances, keyboard/visibility pauses and reduced motion. Laptop geometry is unchanged. No data, migration, dependency or admin-control change.

### Validation
- Full unit/local-MySQL integration suite: 1,299 tests in 364 files passed, 100% coverage in every category. Lint, typecheck, formatting, production build and scoped Impeccable layout scan passed. Phone/laptop screenshots reviewed.
- Built-app E2E: 4 passed, 2 duplicate-project skips. 624 active-card cases across eight widths, all eight services and all fifteen fonts at phone widths: five layers intersect the viewport; no document or active-label overflow/clipped words; touch target remains at least 44 px. Automatic/manual progression, keyboard pause, reduced motion and axe pass. Synthesized Chromium touch verifies swipe, vertical page scrolling and the following link tap. JavaScript-disabled checks retain all eight service destinations at 390/1440 px.
- Both Home performance gates passed: mobile LCP 596.83 ms, CLS 0, INP bound 80 ms, all Lighthouse categories 100, JS 173,059 / 174,080 gzip bytes; no observed touch-scroll long task. Laptop scroll CLS 0.001813, no observed long task, 0% missed-vsync estimate. Build `EJwKWwl5_ArglqaSUt2lQ`. Evidence and physical-device/browser limitations: `docs/audits/2026-11-04-mobile-pyramid-review.md`.

### Blockers
- None for D171; R6C.31 is ready for review. Existing uncommitted work and the user's open unsaved Font Manager choices are preserved. Nothing staged, committed, pushed, deployed or changed on the client's server.

## 2026-11-04 — D172–D179 consistency and approved page refinements

### Changed
- Public/admin responsive consistency: common public navbar geometry, contain-fit logos and matching shine mask, 44 px controls/links and pagination, no client-logo filter interpolation. Admin controls, reorder actions, fields, switches and logo reflow at doubled text on a narrow screen. Existing data, page order, font assignments and admin/public theme distinction stay.
- Home quote contact squares: WhatsApp green; Call/Email navy. Contact Reach us: off-white rounded cards, bold terms, whole-card first-hover/focus lift and a static reduced-motion shadow. Reach us and the area behind the rounded message panel share deep blue; green panel and white form remain.
- Careers: approved concept three nursing photo with a visible two-layer shadow and no white border; green-gradient rounded Open Jobs panel on Before you apply’s mist background, compact outer spacing. The full-width mobile introduction, job links and general application stay. Decorative one/two/three dots fade in a fixed-width reserve over 2.4 seconds, static for reduced motion. The existing page media picker edits the optional photo through draft/preview/publish. Local approved photo backfill preserves unrelated draft/published fields and has a recovery copy. No SQL migration.
- About/Services Talk to us: three rounded off-white contact cards, navy Phone/Email icon squares, Call us without 24/7. Existing section colours, contact values and reveals stay.
- About’s approved three-panel Values design reveals in sequence, with a subtle diagonal hover shine and no card lift. Who we are’s description aligns with the top of its image on larger screens, retaining mobile order and Home’s layout.
- Service categorisation removed from public cards/catalogues, admin selector/list labels and service share images. Stored historical audience data stays compatible and never controls presentation. Services’ catalogue meets the image opening without an extra blank gap.
- Contact uses the shared navbar background directly and Google’s lazy satellite map inside the existing rounded, shadowed frame. Provider controls/attribution remain visible; confirmed coordinates override the published company/area search. Responsive minimum dimensions include doubled text. Privacy disclosure added in seed and local review copies with backup, preserving unrelated drafts. This user-requested map supersedes D34; no API key, dependency or SQL migration.

### Added
- Five desktop/mobile What we stand for concept boards with current published statements; Concept one was approved and is implemented as three responsive commitment panels, with sequential reveals and stationary hover shine only (D177). Five Open jobs concepts were delivered and concept three approved.
- Responsive consistency, first-hover/reduced-motion, dot-cycle, photo-publishing and enlarged-text browser coverage.

### Validation
- Full unit/DB-contract/local-MySQL integration suite: 1,309 tests in 365 files passed, 100% statements/branches/functions/lines. Lint, typecheck, formatting and production build pass.
- Responsive matrices: 612 layout states, 405 font/size combinations and 33 doubled-text routes. Final focused browser run: 46 passed with nine duplicate-project skips; the new map matrix caught intrinsic aspect-ratio width on the narrowest phone, corrected with explicit column bounds. Rebuilt Contact follow-up: seven passed, one duplicate-project skip; all sixteen map width/text cases pass. Live phone/desktop satellite imagery and the stronger shadow reviewed.
- Initial JavaScript: all twenty public routes pass, maximum 173,402 / 174,080 gzip bytes. All twelve final mobile/desktop performance gates pass across six affected routes, with the live map enabled: LCP ≤722.46 ms, scripted INP bound ≤64 ms, combined CLS ≤0.04192, minimum Lighthouse 99 and no observed scroll long task. Build `xi6uZU75_ddlMNiFdwfpo`; evidence and practical limits in docs/audits/2026-11-04-consistency-review.md.

### Blockers
- None for the approved implementation. Values concept one is approved. No staging, commit, push, deployment or client-server changes; existing uncommitted work and the user’s unsaved Font Manager tab remain.

## 2026-11-05 — Contact map shadow refinement

### Changed
- User requested a more noticeable map shadow: dedicated two-layer navy map shadow replaces the lighter generic float treatment. Static shadow only, with no animated box-shadow.

### Validation
- Included in the final D179 unit/coverage and responsive browser checks above. Live 390/1440 px captures confirm both navy shadow layers; all sixteen map width/text cases pass.

### Blockers
- None. No commit or deployment.

## 2026-11-05 — D180 hydration investigation and regression guards

### Added
- Phone/desktop hydration checks for public/auth routes and signed-in admin lists/editors. Check server HTML, status, real handlers, console hydration diagnostics and uncaught errors. New development-mode CI command covers React’s development-only attribute warnings. No production runtime, visual, dependency, data or schema change.

### Findings
- Both supplied logs differ only by browser-added `__gcr…` attributes, absent from source and raw SSR. Clean Home/login are warning-free and interactive; controlled pre-hydration DOM insertion reproduces both warnings. The precise installed browser tool is unknown. Continued annotation by that tool can still warn; use a clean browser context or disable its page annotations. No new warning suppression or DOM scrubber.

### Validation
- New built-app guard: four tests passed (114 phone/desktop public/auth/admin navigations). Development guard: two passed (46 phone/desktop public/auth navigations). No application hydration diagnostics or uncaught errors. Controlled injection reproduces both supplied warnings; clean Home/login have none and remain interactive. Lint, typecheck and formatting pass.
- Report and per-route evidence: docs/audits/2026-11-05-hydration-review.md. Application source/build is unchanged; preceding D179 1,309-test/100% unit/local-DB coverage and responsive/performance evidence remains applicable. No remote CI run was triggered.

### Blockers
- No application blocker. Browser-owned annotation is outside the application’s control. No commit or deployment.

## 2026-11-05 — D181 Impeccable polish

### Changed
- Compact service thumbnail/title cards now fill their grid row so long titles and supported font choices retain aligned lower edges. Verified existing drift at 640 px: Mother & Newborn card 91.5 px beside Pediatric 88 px. Preserve content, grid, thumbnails, palette, spacing and reveals.
- Shared editor fields are locked in a named native fieldset during pending writes to prevent edits racing response-driven form resets; controls and values restore on failure. The zero minimum width retains narrow/enlarged-text reflow.
- Shared admin editor Preview is dimmed, aria-disabled and removed from sequential focus while saving/publishing/discarding. Block normal and auxiliary activation during writes, including publishing a clean saved draft. Restore Preview after completion or failure; preserve save-before-preview and draft data. Shared action styling supports aria-disabled.

### Validation
- Impeccable context/polish/craft guidance and both surface contracts reviewed. Current public/auth renders inspected at 390/768/1440 px; no horizontal overflow in 27 baseline captures. Red regression reproduced the missing busy state, then targeted unit tests passed (19). Final unit/DB-contract/local-MySQL suite: 1,310 tests, 365 files, 100% coverage in all categories. Lint, typecheck, formatting and build pass.
- Final built browsers: twenty passed, ten duplicate-project skips; 612 responsive states, 180 card/font/width cases, 900 font/template cases, 33 doubled-text routes and 114 hydration navigations. Native controls lock during writes, failure preserves values/restores controls, and Preview cannot open an outdated draft.
- All six relevant performance checks pass on build `b5oPv85kuNL77P04KTIWA`: LCP ≤714.85 ms, scripted INP bound ≤64 ms, CLS ≤0.001813, Lighthouse categories 100, no observed scroll long task. All twenty public JS budgets pass, maximum 173,402 / 174,080 gzip bytes. Actual-content card captures reviewed after image decode. Evidence and limits: docs/audits/2026-11-05-polish-review.md.

### Blockers
- None. No new feature, design control, dependency, migration, data change, commit or deployment. Existing uncommitted changes and the user’s open unsaved editor remain preserved.

## 2026-11-05 — D182/D183 Home points card and faster hero; D184 pyramid proposals

### Changed
- Home’s existing About points share one full-width off-white rounded card, three columns at tablet/desktop and stacked on phones. Titles/descriptions remain, tick marks and icon spacing are omitted, Read more follows the card. Zero points leaves no empty card; default/About Intro keeps its prior list treatment. No content/schema/admin-control change.
- Main hero advances in three seconds with simple labelled SVG previous/next chevrons around the progression rails; no Pause or visible count. Manual navigation wraps and restarts the clock, keyboard-visible focus pauses until leaving, pointer/hover does not stick. Reduced motion retains manual navigation. Flexible rail gaps fit eight bars with enlarged text; base pyramid/inner-photo clock stays six seconds.

### Concepts
- Five cardless service-name concepts and an interactive prototype use real existing photos. The user clarified landscape cards on every screen, with three-vs-five layer comparison and mobile usability as the deciding factor. Production pyramid layout/labels stay pending selection.

### Validation
- Sub-agent work ran concurrently: Home card implementation/visual review, hero implementation, and concept generation. Focused units passed; full unit/local-DB suite: 1,316 tests in 366 files, 100% coverage. Build/typecheck/lint/format and diff checks pass. Built browser suite: 40 passed, 4 duplicate-project skips; Home About matrix covers 15 fonts at 9 widths, and hero controls/eight rails/enlarged text/reduced motion pass. Home mobile/desktop performance: 2 passed, Lighthouse 100 in all categories, LCP 554 ms, INP upper bound 64 ms, maximum CLS 0.001813, no scroll long tasks; all 20 public routes remain below the 170 KiB initial-JS limit (maximum 173,715 / 174,080 bytes). Scoped Impeccable detector: no findings. Prototype: 320 layout states across five styles, two card counts, eight services and four widths; arrows/swipe/autoplay checked. Evidence: `docs/audits/2026-11-05-home-refinements.md`.

### Blockers
- No blocker for approved Home changes. Pyramid implementation awaits user selection after viewing the concepts. No commit, push, deployment or client-server operation.


## 2026-11-05 — D185 approved landscape Home services pyramid

### Changed
- Applied the selected soft photo fade with three landscape cards on every screen: centred highlighted front card, smaller/softer symmetric rear pair. Kept the existing site gutters and bounded the complete stack within them. Service titles are modest, bottom-centred white text without arrows or label cards. Other service surfaces, all published names/links and the six-second carousel behavior remain.
- Final reference clarification preserves the smaller left/right rear pair and centres it vertically around the front, showing upper and lower corner gaps at every width. This replaces the fixed 30 px drop, which extended below short phone photos; equal-height cells prevent title-length drift. A vertical deck interpretation was rejected before completion.
- The track retains native flex layout boxes and uses transforms for enhancement, avoiding the layout shift found in the performance gate. Intrinsic caption height lets enlarged accessibility text reflow rather than clip. Native scrolling fallback, keyboard focus, swipe and reduced motion remain. No dependency, admin control, schema/content/database change.

### Validation
- Focused component/controller units: 16 passed. Final full coverage, built browser/font/layout and performance checks in progress.

### Blockers
- None. No sub-agents used for this task. Nothing committed, pushed or deployed; awaiting user review.


## 2026-11-05 — D186 full uncommitted-work Harden and commit-readiness review

### Changed
- Made hydration guards read raw server HTML through the request context, avoiding Chromium losing a navigation response body during development reloads while retaining every status/annotation/console assertion.
- Fixed open-menu overflow at 200% text: adaptive contact columns, wrapping phone/navigation text, shrink-safe logo and non-shrinking close/arrow targets. Normal phone layouts retain paired contact tiles. Added all-font menu regression coverage.
- Updated the keyboard walk to continue through the requested Google map instead of ending before Contact’s fields, retaining the minimum host-stop and focus checks.
- Fixed the menu remaining open if reduced motion is enabled while its close animation is running; animation cancellation now completes the close and cleans up its listener.
- Restored native horizontal touch swiping for the no-JavaScript/deferred-chunk-failure service row; `pan-y` is scoped to the enhanced custom carousel only. The old fallback links existed but phone gestures were blocked; added a synthesized-touch regression.
- Kept the photo-caption fade opaque before the first glyph even for long/doubled text, instead of stretching its transparent region over a taller caption. An empty published-card list reserves no photo-sized gap.
- Hardened Home’s services gestures against secondary/right-button pointers, mostly vertical page swipes, cancellation, capture loss, window blur, hidden tabs and release outside the carousel. The next gesture works without reload and cleanup removes every listener. No visual redesign or new product feature.

### Review scope
- Full uncommitted tree: public/admin layouts, font manager, draft/preview/publish controls, uploads, forms, SEO/share images, motion, migration, assets/licenses, tests, CI and documentation. Fixed fonts remain allowlisted, optional and self-hosted; draft-only/auth and published-read boundaries retained.
- Review inventory covered 423 paths at the start. No private-key/cloud-secret pattern matches or stray environment/private-key/log files; the one new SQL file is the planned typography migration. 243 untracked files total 16.52 MiB, mostly review evidence and licensed font assets. Nothing staged.

### Validation
- Harden in progress: full browser suite running before the commit-readiness checkpoint and final Polish. Earlier full unit/local-DB suite: 1,317 tests, 100% coverage; final controller simplification will be rechecked. Runtime dependency advisory check: no moderate/high/critical finding in the 97 packages that ship. Scoped scan across all 73 changed UI files found no issues.

### Follow-up validation — 2026-11-06
- First complete E2E sweep: 262 passed, 61 intentional duplicate-project skips, one outdated Contact keyboard expectation. Updated it to continue past Google’s embedded frame; the targeted phone/desktop rerun passed. Final Harden build and complete regression pass in progress. Live-content pyramid review: 264 service/font/width cases (320–1920 px), no layout failures or uncaught errors.

### Blockers
- No blocker currently. Physical-device/Safari/Firefox checks are not available in this environment; browser evidence uses Chromium with emulated sizes and synthesized touch. No commit, push, deployment or client-server change.


## 2026-11-06 — D185/D186 completed local review

### Changed
- Finished Home’s three-card landscape pyramid with smaller rear cards on a shared vertical centre, preserving upper/lower corner gaps on phones as on desktop. Names remain modest, bottom-centred and arrow-free. The complete composition stays within the existing gutters.
- Fixed the measured deferred-enhancement layout shift by retaining the native flex layout boxes and moving cards with transforms only. Explicit zero minimums prevent the track’s content width expanding on small screens. Native horizontal scrolling remains available without enhancement.
- Completed Impeccable Harden, reviewed all uncommitted code/assets/docs for local commit readiness, then completed visual Polish against actual published local content. No further application changes were needed during Polish.

### Validation
- Full unit, DB-contract and local-MySQL integration run: 1,318 tests in 366 files, 100% coverage. Current Menu/SiteHeader and pyramid-controller regression coverage also passed at 100%; combined current-source evidence remains 100% (4,910 statements, 3,229 branches, 1,810 functions, 4,365 lines).
- Broad browser sweep covered 326 cases: 260 passed, 62 deliberate duplicate-project skips and four findings, all resolved and rerun. Affected reruns passed (nine cases plus the final menu case, then seven final pyramid cases); intentional project skips remain. No failed assertion was suppressed or threshold relaxed.
- Development hydration: two cases/46 navigations passed; production public/admin hydration and broader responsive/axe journeys passed in the complete sweep. Readiness retries handle development reloads while retaining every hydration/uncaught-error assertion.
- Final relevant performance evidence: 12 mobile/desktop cases across six templates passed; Lighthouse 100 in all four categories, worst LCP 549 ms, INP upper bound 120 ms, maximum CLS 0.04192 and no scroll long tasks. Home’s final mobile CLS is zero and desktop CLS 0.001813. All 20 route statuses/initial-JS budgets pass, maximum 173,839 / 174,080 bytes.
- Actual-content Polish: 30 page/width layouts and 264 service/font/width states passed at 320–1920 px, with no clipping/overflow or uncaught errors. First-entry Mission and Reach us hover effects, stationary Promise hover, enlarged menu and keyboard-focus return passed. Root visually reviewed the final cards and representative page sections.
- Runtime advisory check: no moderate-or-higher finding in 97 shipped packages. Changed-UI detector scans had no primary findings. Lint, build/typecheck, formatting and diff checks passed; final documentation-format check follows this entry. Details and scope: `docs/audits/2026-11-06-harden-polish.md`.

### Blockers
- None for the local code/review task. Evidence uses Chromium viewports and synthesized touch, not physical Safari/Firefox devices. Existing release checks and previously recorded product decisions remain as documented. Local preview restored at localhost:3210 with published content; actual data, private drafts and user browser tabs were not edited. Nothing staged, committed, pushed or deployed.


## 2026-11-07 — D187 approved bundle readiness

### Changed
- Reviewed the complete pending D136–D186 public/admin bundle for user-authorized local commits, preserving approved visuals, content and private drafts. No additional functional application change was required.
- Aligned the operating guide with the existing three-second hero, non-sticky header, footer shine and Careers dots. Recorded the user's permission to commit the validated bundle in at most three coherent commits, superseding the earlier review hold for this work.

### Validation
- Fresh lint, formatting, Next/TypeScript and standalone build passed. Full unit/DB-contract/local-MySQL run: 1,318 tests in 366 files, 100% statements/branches/functions/lines. Complete production E2E: 264 passed, 62 intentional duplicate-project skips, zero failures. Development hydration: two cases/46 navigations passed.
- Full 40-case performance gate passed on build `_QNMIT61o2sag9LiLs039`: maximum initial JS 173,842 / 174,080 gzip bytes, LCP 686.447 ms, scripted INP bound 64 ms, CLS 0.0419191, minimum Lighthouse category 96, no observed scroll long task and 0% desktop missed-vsync estimate. No retries or relaxed thresholds.
- Current dependency gates passed: no high/critical full-tree advisory, no moderate-or-higher advisory in the 97 shipped packages. The 15 moderate development-tooling advisories remain below the defined full-tree threshold. All 964 source/test/migration file hashes stayed unchanged during verification; credential and diff checks passed.

### Blockers
- None for local commits. Existing physical-device/browser, manual screen-reader, field/server-region and launch security/product decisions retain their recorded status. Tests used only the separate local test database and temporary uploads; no client-server operation, push or deployment.


## 2026-11-07 — D187 verification gates and local commits

### Added
- Committed the pinned development-only Lighthouse runner, shared performance probes/contracts, twenty-route mobile and desktop suites, development hydration configuration and their npm scripts. CI runs the gates serially with the existing thresholds and retains success/failure artifacts; coverage uses one worker for the real photo encodes.
- Recorded the final full-run summary and all-route performance evidence in `docs/audits/2026-11-07-readiness*`, with method, source-hash provenance, migration/commit boundaries and remaining release limits. Updated the tracker and performance guide.

### Validation
- All D187 gates above passed against the exact source/test/migration tree committed here; final formatting and diff/credential scans passed. Feature commit: `d90c605`. The companion verification commit completes the user-authorized two-commit bundle as jaFFa, with no attribution trailer.
- Restored the review app on port 3210 from an isolated copy of the tested standalone build and verified the replacement temporary Cloudflare link. Existing actual content/drafts and local environment credentials remain outside the test writes and commits.

### Blockers
- None for local commits. No push, deployment or client-server change. Existing launch-only checks and decisions remain documented in the readiness review.


## 2026-11-07 — D188 lightweight inline copy formatting

### Added
- Safe, bounded-work inline copy rendering for `**bold**`, `*italic*` and `***both***`, including escaped asterisks and literal unmatched syntax. Public sections, rich-text blocks, service/job copy, action/navigation/footer labels and animated headings reuse the same renderer. HTML and other Markdown remain text.
- One concise hint in eligible admin content editors; existing raw-string Save/Preview/Publish/Discard, permissions, schema limits and cache/audit behavior remain. No toolbar, dependency, upload or migration. Public font roles stay supported; admin typography stays unchanged.
- Plain projections for metadata/share images/structured data, image labels, service choices, automatic slugs, readonly service/job names and submission snapshots; routing and contact/password values remain literal.

### Changed
- Split RiseWords into server-rendered word slots and its client motion wrapper to preserve the public JavaScript budget. Prepared Unicode character ranges before rendering to satisfy React's immutable-render checks.
- Reserved italic ink/caret room only where formatted animated copy needs it, fixing confirmed narrow/enlarged Contact heading overflow. Preserved default copy and all existing animations/reduced-motion behavior.
- Added formatted-copy development hydration fixtures and six functional browser journeys plus a 240-state all-font responsive matrix. ESLint excludes already ignored local `.data/` runtime artifacts, including copied generated preview builds; no application/test source rule was disabled.

### Validation
- Full unit/DB-contract/local-MySQL run: 1,359 tests in 369 files, 100% statements/branches/functions/lines. Complete production browser suite: 270 passed, 62 intentional duplicate-project skips, zero failures. Formatted development hydration: two cases/46 navigations passed.
- All 40 production performance cases passed on build `gLhbjogm1XoQ77FAgEygi`: initial JavaScript ≤173,771 / 174,080 gzip bytes, LCP ≤688.4 ms, scripted INP bound ≤64 ms, CLS ≤0.0419191, minimum Lighthouse category 96, no observed scroll long task and 0% desktop missed-vsync estimate. No retry or threshold relaxation.
- Lint, typecheck, formatting, build, diff checks and the 43-file Impeccable scan passed. Styled Home/About/Contact renders were visually reviewed. Details and evidence: `docs/audits/2026-11-07-inline-formatting.md`.

### Blockers
- None for the local feature. Existing release/device/security decisions remain separate; browser proof uses Chromium emulation. Tests preserved actual content/drafts and used isolated test data. Review preview updated on port 3210; nothing staged, committed, pushed or deployed.

## 2026-11-07 — Admin User manual (D189)

### Added
- User-authorized User manual under Administration, with 37 narrated lessons across 12 topics, numbered written steps, optional English captions and transcripts for new admins.
- Task clips split from the non-captioned walkthrough; private allowlisted asset responses check the admin session, support byte-range seeking and prevent caching. Standalone builds include the bundled training files (approximately 51 MB).

### Validation
- Typecheck, lint, format check and production build passed. All 1,376 unit and local database integration tests passed with 100% statement, branch, function and line coverage.
- All 37 clips and caption files passed duration/format checks. Phone and desktop E2E: 22 cases passed, with 2 existing viewport-specific skips; private access, playback, byte-range seeking, topic navigation, axe and horizontal overflow checks passed. Screenshots: `docs/audits/2026-11-07-user-manual-{phone,desktop}.png`.

### Blockers
- None. No migration or external service is needed. Existing local inbox samples are retained.


## 2026-11-07 — Approved current-work commit before focal points

### Changed
- The user authorized committing the existing D188 inline formatting and D189 User manual together, before implementing image focal points in a separate commit. No push or client-server deployment is authorized.

### Validation
- Fresh lint, formatting and typecheck passed. Full unit/DB-contract/local-MySQL coverage: 1,376 tests in 372 files passed, with 100% statements, branches, functions and lines. Complete production phone/desktop E2E on the current standalone build: 272 passed, 62 intentional viewport-specific skips, zero failures.
- Existing D188 formatted hydration and all-route performance evidence remains applicable to the unchanged public implementation. Source/test inputs were unchanged during verification; secret and diff checks passed. The local review preview includes User manual at the unchanged Cloudflare address. No environment credentials, local uploads or CVs are included.

### Blockers
- None for this local commit. Existing launch-only checks remain as previously recorded.


## 2026-11-07 — D190 per-placement image focal points

### Added
- User-approved inline framing in existing page/service photo fields: click/tap the uncropped photo, use labelled keyboard-accessible x/y ranges, reset, and compare wide/square/portrait crops. Optional whole-percentage coordinates belong to the content reference and its Save → private Preview → Publish/Discard flow. Service references carry framing into the opening, cards and Home pyramid.
- Existing photos without an override retain their desktop/mobile defaults; logos have no framing control. No new uploads, image variants, resizer, table, migration, external service or dependency.

### Fixed
- Preserve framing when the same library photo is reselected; reset it when a different photo is chosen. Keep the editor thumbnail and crop captions contained at narrow/enlarged text sizes.
- Full regression exposed stale published reads in focal points and existing page/font/footer/client workflows. The installed Next expiry handler mixes wall and monotonic clocks; a deterministic local reproduction missed immediate expiry. Add process-shared per-tag revisions to the existing bounded, memory-only cache keys before the normal tag revalidation. This preserves D119's single-process architecture and refreshes only affected content; no timer, disabled cache, new handler or infrastructure.

### Validation
- All 1,388 unit/DB-contract/local-MySQL tests passed with 100% statements, branches, functions and lines. Complete production E2E: 274 passed, 62 intentional skips, zero failures. Targeted publishing regressions: 13 passed / one intentional skip. Development hydration: two cases / 46 navigations passed.
- Native touch/mouse/keyboard, preview/publish/discard, independent same-photo placements, malformed-point/auth rejection, responsive widths, doubled text and axe passed. All 40 performance cases passed with unchanged budgets and no retries. Lint, types, formatting, standalone build, diff/secret checks and Impeccable scan passed. Details: `docs/audits/2026-11-07-focal-points.md`.

### Blockers
- None for the requested separate local commit. No actual published content or private draft was edited by tests. The review app is current on port 3210 and its tunnel URL is unchanged. No push, client-server operation or production deployment. Existing release/device/manual-screen-reader checks remain documented separately.


## 2026-11-09

### Changed
- D191 / R7.3: reviewed the public/admin boundaries, sessions and origin checks, draft publishing, uploads/private downloads, input/SQL, logging, secrets and browser policy before the user-authorized initial GitHub push. Added security headers and fresh document CSP nonces; retained cached published reads and existing map/motion/font/media behavior. Streamed JSON ceilings stop oversized public/auth/content bodies before parsing. Shipped-dependency audits now reject unavailable, malformed or incomplete reports.
- CI runs independent gates side by side; production browser/performance jobs reuse one standalone/static build with separate local test services. Official actions are pinned, checkout credentials are not persisted and permissions remain read-only. A final aggregate check requires all gates. No deployment workflow is added.
- Added the complete `npm run verify` and repository-local pre-push hook. Verification uses only the example's separate local test database and isolated media/CV paths; it preserves the actual `.env.local`, review URL and real content.
- Unit tests explicitly isolate optional/missing environment values, and source lint excludes generated Playwright trace/report bundles so a repeat verification after a browser failure remains valid. Browser screenshots write to per-test report folders rather than overwriting historical audit evidence.

### Validation
- Lint, format check, typecheck, standalone build and diff checks passed. 1,401 unit/integration tests across 376 files passed, with 100% statements/branches/functions/lines. Existing 276 production browser cases and all four corrected security cases passed (278 distinct cases, 62 intentional skips). Development hydration passed at both sizes, covering 46 navigations. The final pre-push hook repeats the complete command before upload.
- All 40 performance cases passed, retaining every existing threshold: maximum initial JS 173,823 / 174,080 gzip bytes; LCP 555.477 ms; scripted interaction upper bound 72 ms; CLS 0; minimum Lighthouse 96; no observed scroll task above 50 ms. Source/history/standalone checks found no tracked private upload/env/key/token patterns; runtime dependency audit is clear, with 15 permitted moderate development-only findings remaining.
- YAML parsed, action references and repository Actions permissions verified. The initial actual GitHub run will be linked in the push delivery. Full review and launch-only boundaries: `docs/audits/2026-11-09-pre-push-security.md`.

### Blockers
- No deployment is authorized. Existing production-only checks (TLS/Apache/proxy boundary, real secrets/Turnstile/mail, manual device/screen-reader approval) and the user's deferred malware-scanning decision remain launch work. This is a source-level review with regression tests, not an independent ASVS certification. No schema migration.


## 2026-11-09 — CI cold-seed fixture

### Changed
- D192 / R7.3a: the first real GitHub run exposed a cold image-fixture deadline: all seed photographs/logos use the real upload encoder, exceeding the old two-minute deadline on the hosted runner. Moved that setup into a bounded ten-minute `beforeAll`, so the dependent idempotence cases cannot race an unfinished seed. All data, output, draft/privacy and idempotence assertions remain unchanged; no production code, image settings, normal test deadline or performance/coverage threshold changes.

### Validation
- All four seed integration cases passed against the isolated local test database, including cold real image conversion (73.85s). Lint, types, formatting and diff checks passed. Full pre-push verification repeats before the correction is uploaded; final GitHub result is linked in delivery.

### Blockers
- No product/schema/deployment change. The first hosted browser results are addressed together by D193 below.


## 2026-11-09 — Hosted browser portability and motion startup

### Changed
- D193 / R7.3b: font matrices request the actual bundled family, retaining every fit/style/load assertion. On Linux, requesting Next's complete stack also loaded an absent local Arial/Times metric fallback and threw NetworkError despite valid bundled fonts. Native touch probes use trusted within-viewport events; the full-page performance sample traverses the entire document with bounded real swipes. It still asserts bottom coverage and all original budgets. Two layout probes wait for resize/animation settlement, preserving their exact limits.
- Below-fold block/word motion initialization yields between independent tasks. Queued callbacks are cancelled on cleanup, retain scoped GSAP reverts and recheck viewport visibility before hiding anything. Visible server content, reduced motion, animation tokens and layout stay unchanged. No streaming/hidden-content change is retained. Initial Home JS is 173,942 / 174,080 gzip bytes.
- Local verification resets only `.next/dev` before development hydration. This prevents stale incremental-cache reload loops without changing the standalone artifact, production behavior or isolated mobile review server. Browser evidence screenshots use per-test output folders, including the focal-point review.

### Validation
- All 1,405 unit/database cases across 377 files passed with 100% statements, branches, functions and lines. All 278 production browser cases passed (62 intentional skips), including no-JavaScript, font, touch and responsive checks. Both development hydration cases passed across 46 route visits. Lint, types, formatting and diff checks passed.
- A local Linux browser reproduced synthetic touch scrollLeft 0 versus trusted touch scrollLeft 205, and missing fallback NetworkError versus successfully loaded bundled font. A separate constrained-CPU comparison reduced blocking time for Home (1312 → 904 ms) and Contact (1594.5 → 981 ms). This is stress evidence, not a substitute for the unchanged reference-profile gates. All 40 reference-profile performance cases passed locally: minimum Lighthouse 96, LCP at most 690.531 ms, CLS 0, scripted-interaction upper bound 64 ms, and no scroll task over 50 ms. Full pre-push verification repeats these gates; hosted results are linked in delivery.
- A fresh isolated mobile preview is available on port 3210 through the requested tunnel; its local URL setting changed to the new temporary hostname after Cloudflare expired the previous tunnel. Existing actual content/account are preserved, and verification uses the separate local test database. No credentials or environment file are committed.

### Blockers
- Hosted CI must pass on the corrected commit before readiness is reported. No schema migration or production deployment.


## 2026-11-09 — Leaner CI, report-only hosted performance and E2E stability

### Changed
- D194 / R7.3c: both hosted runs failed. Hosted evidence: all 20 desktop-scroll performance cases pass; on the mobile Lighthouse profile `/`, `/about`, `/services` and `/contact` score 0.84-0.93 against the 0.95 budget, and `/` and `/about` also miss the INP (184 ms) and long-task (53-108 ms) limits. LCP stays under 1 s and CLS is 0 everywhere; Total Blocking Time (300-650 ms) is the only failing metric. It comes from the JavaScript startup task (about 190 ms), style/layout (about 150 ms) and the HTML parse. A Linux Chromium reproduction (CPU benchmark 2,800-2,900; the runner's is 2,300-2,480) shows the same pages with about 150 ms of run-to-run noise; the same budgets pass on the faster development Mac. Wrapping every page section and the footer in `Suspense` was tried and reverted: React streams boundaries over about 12 KB after the first flush, which moved the layout (CLS 1.0).
- Decided with the user: the performance job stays in CI, now as two jobs (mobile Lighthouse and interactions; desktop scroll), uploads every report and does not block `All gates passed`. The budgets in plan §31 are unchanged and remain strict in `npm run verify` and the pre-push hook. Making the job blocking again is removing one line (`continue-on-error`) and needs a startup-JavaScript, hydration and layout rework (open item).
- CI clean-up (agent defaults): the separate unit job is removed (the coverage job runs every unit and database test); E2E runs as separate `phone` and `desktop` jobs, each on its own database and app instance (about 31 to about 17 minutes); hydration and performance start only MySQL (they never send mail); the service-start action takes the services it needs (`services` input, covered by its contract test); job names and artifact names say what they hold.
- E2E stability: the not-found and Request a Quote axe scans wait for the page opening's finite animations to end (`tests/support/animations.ts`); they caught text mid-fade. The dashboard's grids (`TodayScreen`, `InboxLog`) now use `minmax(0, 1fr)` so the list shrinks to a 320 px screen: at doubled text the Linux font metrics, with rows listed, made the dashboard 2 px wider than the screen (reproduced and verified in Linux Chromium). `E2E_PORT` moves the journeys' app when another server holds 3100.
- Also reviewed and kept: the uncommitted performance work already in the tree (links no longer prefetch, the home slides' clock pauses off screen, the map loads once scrolling settles, the icons are one cached SVG sprite, motion starts in a transition), each with its unit tests.

### Validation
- Format check, lint and typecheck passed. `actionlint` passed on the workflow; the services contract test passed (four cases).

### Blockers
- OPEN (performance, report-only on GitHub): mobile Lighthouse ≥ 95, INP ≤ 150 ms and long task ≤ 50 ms are missed on `/`, `/about`, `/services` and `/contact` on hosted runners. Required: a startup-JavaScript, hydration and layout rework, then the job can block again. Workaround: the budgets stay strict locally.


## 2026-11-09 — A fast pre-push hook

### Changed
- D195 / R7.3c: the pre-push hook now runs `npm run verify:fast` (new, `scripts/verify.mjs --fast`): lint, format, types, both audits and the 100% unit and database coverage, about 15 minutes. The full `npm run verify` (adds build, production E2E, development hydration and the strict performance budgets) took about 70 minutes and CI repeats those browser gates in parallel jobs, so it stays as the full local run. Chosen by the user. README, AGENTS.md §25 and plan §35 describe both commands.
- Correction to the previous entry: the strict performance budgets are enforced by `npm run verify` run by hand, not by the pre-push hook.
- `E2E_PORT` (previous entry) was also used to push while other local servers held ports 3100 and 3101.

### Validation
- Format check passed; `scripts/verify.mjs` checked for syntax. The earlier full push attempt passed lint, format, types, both audits and coverage (378 files, 1,414 tests) before it was stopped at E2E in favour of this change.

### Blockers
- The mobile performance budgets remain the open item recorded above (strict locally by hand, report-only on GitHub).
