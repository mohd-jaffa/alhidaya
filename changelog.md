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
