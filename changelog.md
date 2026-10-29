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
