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
