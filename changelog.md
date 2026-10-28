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
