# AGENTS.md

# Al Hidaya Website — Agent Operating Guide

## 1. Purpose

This repository contains the **website and admin panel of Al Hidaya Health
Care Services** (alhidaya.qa), a nursing care company in Doha, Qatar: a
premium, very smooth public site for families, hospitals, clinics, schools and
nurses, and a Content CMS that one admin runs without a developer.

Primary stack:

- Next.js 16 (App Router, React Compiler, `output: "standalone"`) · TypeScript (strict)
- MySQL 8.0 on the client's server · Drizzle ORM (+ Drizzle Kit migrations) ·
  Better Auth (the admin's sign-in)
- Tailwind CSS 4 · GSAP + ScrollTrigger + Lenis · Zod · React Hook Form · SWR
- Nodemailer over the server's cPanel SMTP (recipients on Microsoft 365) ·
  Cloudflare Turnstile · Cloudflare Web Analytics
- Vitest · Testing Library · Playwright + axe
- Everything on the client's **cPanel server** (HostCarts, Singapore): the
  site as a **Node.js app** (Node 22, Passenger), the database, the image and
  CV folders, a cron job; deployed by GitHub Actions over SSH **only after the
  user confirms full payment** (§23)

The authoritative product and architecture specification is:

`healthcare-portfolio-website-studio.md` (**the plan**)

**The plan is the source of truth.** Before implementing anything, read the
relevant section. Its tracker (plan §38) says what is next; its decision log
(plan §2) and open questions (plan §41) say what has been decided and what is
still a default.

The conventions follow clinicdesk (`/Users/jaffa/projects/clinicdesk`). When a
clinicdesk module fits, port it and keep its tests, rather than writing a new
shape.

---

# 2. Non-Negotiable Rules

## 2.1 Follow the plan

Do not invent product requirements. Do not add features because they are
technically interesting. Do not replace an approved architecture without
explicit user approval. If the plan puts a feature in a later phase or in
**Later** (plan §42), do not build it now. If something is ambiguous, stop and
record it as a blocker (§30) instead of guessing.

## 2.2 Ask, don't decide

The user's rule (2026-10-28): **"Ask me all the questions; don't decide
anything yourself."** A decision that belongs to the user is asked, with a
recommended option, and recorded in the plan's decision log. Where the user
delegates, the choice is recorded as **(agent default)** and as an open
question they can overturn.

## 2.3 No scope creep

No unnecessary features, tables, services, abstractions or uploads. No
workers, queues, Redis or microservices. No premature optimisation. No feature
creep disguised as "best practice." Production hardening is allowed when it
protects functionality the plan already specifies.

## 2.4 User-mandated development rules

- **Commits** (plan D27): commit after every completed change. The message is
  **one short, straight conventional line** (`feat: add the quote form`), with
  no body and **no co-author or other attribution trailer**. Commit as
  **`jaFFa <jafakash.14@gmail.com>`**. Commit on `main` once the whole suite
  passes locally, and **do not push**: the user pushes when they choose.
- **One commit per change, docs included:** the code, its tests, the plan's
  decisions and tracker row, `DESIGN.md` and `changelog.md` go in the same
  commit. Docs are never committed on their own.
- **Testing mandate:** unit, database, integration and E2E tests at each step,
  not later. Coverage is 100% and CI enforces it (§24).
- **Local environment:** Docker (MySQL 8.0 and Mailpit, `compose.yaml`). Every env variable is
  documented in `.env.example` and set in `.env.local`.

---

# 3. Required Agent Workflow

```text
1. Read AGENTS.md
2. Read the relevant plan sections and the tracker row
3. Inspect the existing implementation (and clinicdesk's, when porting)
4. Identify dependencies and affected modules
5. Plan the smallest implementation that satisfies the plan
6. Implement
7. Write and run the tests (unit, DB contract, integration, E2E as relevant)
8. Run lint, format check, typecheck, coverage
9. Review for scope creep
10. Update changelog.md and the tracker row
11. Record blockers if any
12. Commit the completed change
```

Never skip the plan review.

---

# 4. Before Coding

Answer internally before touching code:

- What exact requirement am I implementing, and which plan section defines it?
- Which feature owns it?
- Which tables does it touch? Does every public read select only published
  rows, and does every admin route check the session?
- Is it **content**? Then it has a draft and a published copy, and the public
  site reads only the published one (§7).
- Does it handle **personal data** (enquiries, applications, CVs)? Then §8
  applies.
- Is it a write? Is it audited?
- Which cached pages does it change, and which tags does publishing revalidate?
- Does it render on the public site? Then the motion and performance rules
  (§19, §20) apply.
- Which shared constants, schemas, components and hooks already exist?

If the answer needs something the plan does not name, do not implement it: use
the scope-change protocol (§29).

---

# 5. Architecture Rules

**Feature-based architecture.** Code is grouped by domain feature; anything
shared by more than one feature lives in `src/lib`, `src/components`,
`src/hooks` or `src/constants`.

```text
src/
├── app/                  # Next.js routes only: thin; no business logic
│   ├── (site)/           # the public site
│   ├── admin/            # the admin panel
│   └── api/              # REST endpoints (plan §29)
├── assets/brand/         # the logo, pictograms, the map
├── components/
│   ├── site/  admin/     # shells; admin/editor/: the content editor's frame and fields (D92)
│   ├── motion/           # the motion system (Lenis, the line, reveals)
│   ├── sections/         # one component per section type (plan §7.2)
│   └── ui/               # the shared kit
├── constants/            # messages, routes, site, sections, statuses, limits, redirects, uploads
├── db/                   # the Drizzle schema (one file per area) and the client
├── features/<domain>/
│   ├── api.ts            # server data functions
│   ├── api.client.ts     # the endpoints the browser calls
│   ├── form.client.ts    # a public form's endpoint, apart from the admin's (plan §31)
│   ├── components/       # PascalCase screens and parts
│   ├── hooks/            # useXxx.ts
│   └── types.ts
├── hooks/                # shared hooks
├── lib/                  # api, audit, auth, env, errors, files, mail, motion, query,
│                         # rate-limit, seo, storage, text, turnstile, validation
├── proxy.ts              # the /admin signed-in gate (not authorization)
└── instrumentation.ts
```

- **`src/lib` never imports from `src/features`.** Features compose lib
  (ESLint enforces it).
- **No monolithic `service.ts` / `repository.ts` classes.** Small, pure,
  focused functions.
- **Pages are composition only.** A `page.tsx` reads its data and renders
  feature or section components. Logic in a page is a review failure (pages
  are excluded from coverage because they hold none).
- **Strict constant centralisation:** no magic strings, no inline messages.
  Every word is in `src/constants/messages.ts`, the admin's in
  `src/constants/admin-messages.ts` (apart, so the public pages never load
  them, plan §31). For the same reason the admin's addresses are in
  `src/constants/admin-routes.ts`, and a public form calls its endpoint
  through its feature's `form.client.ts`, never the inbox's `api.client.ts`;
  every vocabulary the database knows is in
  `src/constants/statuses.ts` or `sections.ts`.
- **Use the shared UI kit.** A screen never restyles a button, field, panel or
  card. Needed twice → it belongs in `src/components/ui`.
- Files in `src/components/ui` are kebab-case; feature and section components
  are PascalCase; hooks are `useXxx.ts`.

---

# 6. Feature Boundaries

```text
features/
├── auth/         the admin session, sign-in, lockout, password reset
├── content/      pages and sections: read, edit, publish, preview
├── services/
├── careers/      jobs and applications
├── enquiries/    Request a Quote and Contact
├── clients/      client logos
├── media/        uploads, sizes, usage
├── settings/     site content, operations
└── activity/     the audit trail screen
```

Do not create a feature the plan does not list. Auth, mail, file storage,
Turnstile, rate limiting, audit, the error log and SEO are infrastructure in
`src/lib`.

---

# 7. Content, Drafts and Publishing

- The pages are a **fixed set** (plan §7.1); the admin cannot add or delete
  one. Sections come from the catalogue in `src/constants/sections.ts`.
- **Every editable thing keeps a draft and a published copy** (plan §14).
  Save writes the draft; Publish copies it to published in **one SQL
  function**, writes an audit row and **revalidates exactly its cache tags**.
- **The public site reads only published copies**, through published-only
  read functions in `features/*/api.ts`. A draft is never reachable without
  the admin session.
- Preview uses Next.js draft mode, entered only by the signed-in admin.
- Hiding or removing something from a section never deletes the record.
- **The design is locked** (plan D12): never add colour, font, size, spacing,
  layout or animation controls to the admin.
- Content is stored per locale (`{ "en": … }`, plan §33).

---

# 8. Personal Data

Enquiries, applications and CVs are personal data.

- **Never** put them in logs, the error log, URLs, query strings, analytics or
  audit `before/after` values. The logger and `captureError` redact by key; a
  test proves it.
- **CVs live only in the private CV folder** on the server
  (`~/alhidaya-data/cvs/<YYYY-MM>/`): outside `public_html` and the release
  folders, folders `700` and files `600`, never served by Apache, never in the
  media folder. They are **viewable in cPanel's File Manager** (plan D54), so
  their names are readable but sanitised:
  `<date>_<job>_<applicant>_<random id>.<ext from the detected type>`. On the
  website only the signed-in admin downloads one, and each download is
  audited. Each is attached to the HR email (plan §9.3, §9.4).
- **CVs expire on their own admin setting** (1 – 365 days, plan D52).
- **IPs are stored only as a keyed hash** for rate limiting.
- Every answer that carries personal data is `Cache-Control: no-store`.
- **Retention** (plan §18): everything personal is deleted automatically when
  the admin's retention period passes, CV files included.
- When the site starts collecting something new, the Privacy page changes
  with it.

---

# 9. Security

- **The database is reachable only from the app on the same server**; there
  is no row-level security, so access is enforced in the server code, in one
  place per kind (plan §26.1):
  - public reads only through published-only read functions;
  - public writes only through their route handlers (Turnstile, honeypot,
    rate limit, then one transaction);
  - admin reads and writes only through `withAdminRoute`, which checks the
    Better Auth session on every request (`proxy.ts` is not authorization).
- **Least privilege:** the app's database user has data rights only; the
  migration user (schema rights) is used only by the release workflow.
- Every query goes through Drizzle with bound parameters; SQL is never built
  from input.
- The admin session lives in **HttpOnly, Secure, SameSite=Lax cookies** set by
  the server, never in `localStorage`. Public sign-up is disabled. Lockout
  after repeated failures (plan §26.4).
- Secrets live only on the server, validated at start by
  `src/lib/env/server.ts`, listed in `.env.example`, never committed, never
  `NEXT_PUBLIC_`.
- Never log a password, token or secret; never return a token in a body.

---

# 10. Error Handling

As clinicdesk: **one error class**, `AppError` (`src/lib/errors/AppError.ts`),
with `code` (its wording in `ERROR_MESSAGES`), `kind` (fixes the HTTP status)
and `traceId`, built only through the factories in `src/lib/errors/kinds.ts`
(`validationError` 400, `authenticationError` 401, `authorizationError` 403,
`notFoundError` 404, `conflictError` 409, `businessRuleError` 422,
`rateLimitError` 429, `externalServiceError` 502, `internalError` 500).

Never invent an error string at a call site. Never expose stack traces, SQL,
database errors, secrets or tokens; a driver failure goes through
`fromDatabaseError`. **A visitor never sees an internal error from a form**:
a failed email or CV save after the submission is saved is logged and
retried from the admin, and the visitor sees success.

---

# 11. Logging and Audit

- Structured JSON logs (`src/lib/logger.ts`) with the request id, redacted.
- Every API answer carries `x-request-id`; error cards show it.
- **Audit** every admin change (publish, edit, delete, status, settings,
  sign-in and sign-out) through `logActionSafe(...)`: written by the
  server, never failing the request.
- **The error log** takes the server's own failures through `captureError`.
- Retention: error log 30 days; audit log one year.

---

# 12. Validation

- **Zod + React Hook Form.** All schemas, form schemas included, live in
  `src/lib/validation/schemas/`. A component never declares its own schema.
  The public forms check with their Zod schema through `useSchemaForm`, which
  fetches it after first paint, to keep within the JavaScript budget (plan
  D77); React Hook Form is the admin's.
- Reusable pieces in `src/lib/validation/primitives.ts`, bound to
  `VALIDATION_MESSAGES`.
- Each schema exports `XxxInput` (`z.input`) and `XxxPayload` (`z.output`); a
  payload is parsed **once**, at the route boundary.
- **Input hygiene:** every text input is trimmed, whitespace collapsed,
  zero-width and control characters removed, and bounded to its column.
  Passwords are never altered.
- Every message comes from `VALIDATION_MESSAGES`; a schema never falls back to
  Zod's English (a test fails if one does).
- Validate on the client for UX, again on the server; the database's `CHECK`s
  are the last word.
- Section content is validated by its type's schema on every save and
  publish.

---

# 13. Database

- **MySQL 8.0** (plan D49), `utf8mb4`, InnoDB. The schema lives in Drizzle
  (`src/db/schema`); **Drizzle Kit generates the migrations** into
  `drizzle/`, each reviewed and committed, sequential, never edited once
  released. Never change a production schema by hand.
- Foreign keys, unique constraints, `CHECK`s for every vocabulary and bound,
  indexes for real query patterns (every public read is served by an index in
  its own filter and order).
- **Every vocabulary in `src/constants` that the database also knows has its
  `CHECK` kept equal by a DB contract test.**
- Every multi-row or rule-heavy write (publish, submit, purge) is **one
  transaction** in a feature's `api.ts`, with its checks inside.
- No `select *`. A screen or page waits on at most two round trips.
- Every migration has a DB contract test; behaviour that matters has an
  integration test against the local MySQL.
- The seed script is for local development only.

---

# 14. API

REST route handlers, wrapped in `withApiHandler`, admin routes in
`withAdminRoute`. One envelope:

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Human-readable message", "requestId": "req_..." } }
```

- Bodies and queries are parsed by their schema.
- Every answer is `Cache-Control: no-store`.
- `apiRoutes` names every endpoint once; admin screens read through
  `useApiQuery` and write through `useApiMutation`.
- **Public pages never fetch content from the browser**: they are rendered
  and cached on the server (plan §22).

---

# 15. Uploads

- **Admin images** (photos, client logos): JPEG, PNG, WebP or AVIF, typed by
  first bytes, at most 10 MB, SVG refused, metadata stripped, sizes made once
  at upload with sharp (one at a time: the server has 1 GB of memory), **the
  original discarded**, stored in the server's media folder, which no release
  touches. Alt text required.
- **The brochure:** PDF, at most 10 MB, typed by first bytes.
- **CVs:** PDF, DOC or DOCX, at most 5 MB, typed by first bytes; kept only as
  §8 says.
- **Budgets** (plan §21.2, 1 GB disk): media ≤ 250 MB and CVs ≤ 250 MB,
  enforced; an upload past its budget is refused with the reason.
- **The media folder's `.htaccess`:** no listing, no script execution of any
  kind, only image and PDF types, `nosniff`; files `644`, folders `755`, names
  generated by the app.
- Never trust a filename; never expose a storage path.
- No other upload is added unless the plan changes.

---

# 16. Email

- One mail interface (`src/lib/mail`); the client's cPanel SMTP in production,
  from `no-reply@alhidaya.qa`; Mailpit locally. Unset `SMTP_HOST` and mail is
  off, and every send says so.
- Every word of every email lives in `MAIL_TEXT`.
- Reply-To is the visitor's email.
- A failed send never undoes what it was for; it is logged and retryable from
  the admin.

---

# 17. Background Work

**There is no worker, queue or Redis.** Work happens in the request. The one
timed job, the daily retention purge, is a **cPanel cron entry** calling
`POST /api/cron/retention` with `CRON_SECRET` as a bearer token; the secret
lives in the server's environment, never in the repository.

---

# 18. UI/UX

- **Mobile first:** 360, 390 and 414 px first; every screen ships phone,
  tablet and desktop (up to 1440 px and beyond) together.
- **Tokens only** (`src/app/globals.css`): a component never picks a colour,
  size, shadow or duration.
- **The logo's colours only** (plan D35): sky blue, deep blue, leaf green and
  the navy ink. White text only on deep blue or navy; sky and green carry
  navy text (plan §30.2). The one exception is **the error red** (plan D63),
  for errors only, always with an icon and words.
- **Light theme only** (plan D28).
- **Nothing childish:** no cartoons, mascots, clip-art, emoji or playful
  decoration.
- **No invented proof** (plan D7): no statistics, testimonials, ratings,
  awards or licence numbers unless the client supplies real ones. Stock photos
  are never captioned as Al Hidaya staff.
- Touch targets ≥ 44 px; inputs at 16 px; heights in `dvh`; safe areas.
- Status and errors carry text and icon, never colour alone.
- **Accessibility is mandatory:** semantic HTML, labels, keyboard navigation,
  visible focus, focus trapped in dialogs and returned, AA contrast,
  screen-reader support, accessible errors, reduced motion respected.
- **Arabic-ready** (plan §33): logical properties (`ms-`, `me-`, `ps-`, `pe-`,
  `start`, `end`), no text in images, every word in the message catalogue.

---

# 19. Motion and Smoothness

The user's binding requirement: **very smooth, no lag or jank anywhere.**

- **Lenis** for desktop wheel scrolling, driven by **GSAP's ticker**: one
  animation frame loop. Touch devices keep native scrolling.
- **Animate only `transform` and `opacity`** (and SVG `stroke-dashoffset` for
  the line). Never animate layout properties, `filter`, `box-shadow` or large
  `clip-path`.
- **Content is visible by default**; reveals only enhance.
- Motion code is client-only, public-site only, and loaded after first paint;
  the admin never loads it.
- Create ScrollTriggers inside `gsap.context` scopes (what `useGSAP` wraps),
  from the engine `useMotion()` gives once it has loaded, and let them die
  with the component; refresh once after fonts and images settle; never leak listeners
  across navigations.
- **Reduced motion:** Lenis off, lines drawn in full, no scrub, no reveals.
- Durations and eases are tokens. One signature (the line), restrained
  reveals, nothing scattered.

---

# 20. Performance

The budgets in plan §31 are requirements, not goals: LCP ≤ 2.0 s, INP ≤ 150 ms,
CLS ≤ 0.05, no long task over 50 ms while scrolling, ≤ 170 KB of JavaScript per
public route, Lighthouse ≥ 95. A page row's changelog entry records its
numbers.

- Images from pre-made sizes through the custom loader; explicit dimensions;
  the LCP image prioritised.
- Fonts self-hosted, subset, with metric-matched fallbacks.
- No client-side content fetching on public pages.
- Third-party scripts: only Turnstile (on form pages) and the analytics beacon
  (after interactive).

---

# 21. Constants

| File | Holds |
|---|---|
| `messages.ts` | `UI_TEXT`, `ERROR_MESSAGES`, `VALIDATION_MESSAGES`, `MAIL_TEXT`: every word |
| `admin-messages.ts` | `ADMIN_TEXT`: the admin panel's words, kept out of the public pages' JavaScript |
| `site.ts` | fixed company facts, WhatsApp prefill |
| `routes.ts` | every public route and the endpoints the public pages call |
| `admin-routes.ts` | the admin's pages and endpoints, kept out of the public pages' JavaScript |
| `sections.ts` | the section catalogue and its rules |
| `statuses.ts` | statuses, audiences, employment types, with labels |
| `limits.ts` | field bounds, upload sizes, rate limits, retention bounds, lockout |
| `redirects.ts` | the 301 map from the old site |
| `uploads.ts` | allowed types (magic bytes), sizes, image widths |

---

# 22. Impeccable

Impeccable is a design-quality tool. It must not change product scope.

`PRODUCT.md` (product truth) was set on 2026-10-28. The public site's
direction, **"Follow the Line"** (plan §30.1, D36), lives in
`.impeccable/surfaces/src-app-site-page-tsx.md`; every public screen is built
in that world and never invents its own colour, shape or motion. `DESIGN.md`
is written from the built world at R7.4 and is then the design system's
authority.

```text
/impeccable shape <screen>      before building a screen the plan has not shaped (the admin: R6.1)
/impeccable audit <screen>      after building it
/impeccable polish <screen>     before its phase closes
```

---

# 23. Hosting and Deployment

- **No deployment and no change of any kind on the client's server until the
  user confirms full payment** (plan D48). Until then SSH (port 2200, the key
  `~/.ssh/alhidaya_cpanel_rsa` on the developer's machine) is used **only for
  read-only checks**: no files written, moved or deleted, no settings changed,
  not even a backup.
- After that, **every step that changes the server is confirmed with the user
  first** (plan D44). **The user** backs up the old site, gives it to the
  client and clears it and its database before the first deploy (plan D50,
  R0.9); an agent never deletes anything of the old site.
- **Security is a must** (plan D55): every row carries its security tests.
- Production is the client's **cPanel server** (plan §21.1): the Next.js
  **standalone** build as a Node.js app under Passenger (Node 22), MySQL 8.0
  on localhost, 1 GB of memory, **1 GB of disk** (keep to plan §21.2's
  budget). Build on GitHub, never on the server.
- **A release deploys; a push does not.** The release workflow re-runs CI and,
  only when it passes, builds, checks the output (no source, source maps or
  env files), uploads over SSH into a new release folder, migrates the
  database as the migration user, switches, restarts, and keeps the previous
  release for rollback. The media and CV folders sit outside the releases.
- The domain's mail is **Microsoft 365**; the cPanel mail routing must stay
  **Remote**.
- The server's credentials and the content of its `.env` files are never
  written into the repository, the plan, the changelog or a log.

---

# 24. Testing

Every test lives under **`tests/`**; `src/` holds only code that ships:

```text
tests/
├── unit/          mirrors src/ exactly: src/lib/x.ts → tests/unit/lib/x.test.ts
├── contract/      route-shape contracts
├── db/            migration contracts (SQL read as text)
│   └── integration/   against the local MySQL
├── e2e/           Playwright journeys
└── support/       setup, factories, helpers
```

- **One test file, one subject**; `scripts/check-test-paths.mjs` fails on an
  orphan or a test inside `src/`.
- Imports and mocks use `@/` and `@tests/`, never `./` or `../`.
- **Coverage is 100%** over `src/**`, enforced in CI. Excluded:
  `src/app/**/layout.tsx`, `src/app/**/page.tsx` and
  `src/app/**/opengraph-image.tsx` (composition only, covered by E2E),
  `src/instrumentation.ts`. `/* v8 ignore */` only with a reason on the
  same line.
- Components are tested with Testing Library by role and accessible name.
- Integration tests run against the **local** MySQL in Docker only (a guard
  refuses any other database).
- E2E: the built app on port 3100, phone (390×844) and desktop (1440×900),
  **axe on every page**; mail caught by Mailpit, Turnstile in test mode. The
  app runs against the local test database, which the global setup
  (`tests/e2e/global-setup.ts`) migrates, seeds and publishes as at launch.

---

# 25. Quality Gates

CI (`.github/workflows/ci.yml`) on every push to `main` and every PR:

```text
checks: install → lint → format check → typecheck → unit tests
app:    MySQL 8.0 service (every migration) → test:coverage (100%) → build → E2E (phone + desktop, axe)
```

From Phase 7, the performance budgets too, and `npm run verify` with a
pre-push hook. Node 22 everywhere. Prettier at 120 columns; Markdown is left
as written.

---

# 26. Changelog

Every change is recorded in `changelog.md`, appended, never rewritten:

```markdown
## 2026-10-28

### Added
- …

### Changed
- …

### Validation
- Typecheck, lint, format check passed.
- Unit and integration tests passed, coverage 100%.
- E2E passed (phone, desktop).

### Blockers
- None.
```

Each entry names the change, the affected module, the reason, the
validation, the blocker status, and migration notes if any. The tracker row
is set to **DONE (date)** in the same commit.

---

# 27. Definition of Done

A task is complete only when:

- The requirement matches the plan and its tracker row.
- Architecture boundaries are respected.
- Validation exists at the client, the route and the database.
- Errors are catalogue errors.
- Access is correct and tested: public reads return only published content;
  admin routes refuse without a session.
- Personal data stays out of logs and is covered by retention.
- No hard-coded words or vocabularies.
- The screen works at phone, tablet and desktop widths with no axe violations,
  and a public page meets the performance budgets.
- Tests are written and green; coverage is 100%.
- No unrelated feature was added.
- `changelog.md` and the tracker are updated; open blockers recorded.
- The change is committed, code and docs in one commit.

---

# 28. Final Agent Rule

When uncertain:

```text
Do not guess.
Do not expand scope.
Do not invent.
Read the plan.
Record the blocker.
Ask for the decision.
```

The plan wins over agent preferences. The user's explicit requirements win
over generic "best practices".

---

# 29. Scope-Change Protocol

If the work appears to need something outside the plan:

1. Stop that part.
2. Record it in `changelog.md`.
3. Explain why the plan is insufficient.
4. Ask the user for a decision, with a recommendation.
5. Record the decision in the plan's decision log and the section it changes;
   only then implement.

Especially for: new tables, external services, user-facing features, upload
types, authentication methods, infrastructure, admin controls over design.

---

# 30. Blocker Log

A blocker is recorded in `changelog.md` immediately:

```markdown
### Blocker

- Status: OPEN
- Area:
- Description:
- What was attempted:
- Why it is blocked:
- Required decision/input:
- Temporary workaround:
```

Do not silently work around an architectural blocker. When resolved, append a
resolution entry.

<!--
`next dev` appends a "This is NOT the Next.js you know" block here on first
run (Next 16). Keep it: it tells an agent to read node_modules/next/dist/docs
before writing Next.js code, because APIs differ from older training data.
-->
