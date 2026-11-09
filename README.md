# Al Hidaya Health Care Services — website

The public website and admin panel of **Al Hidaya Health Care Services**
(alhidaya.qa), a nursing care company in Doha, Qatar: nursing care at home
and in clinics, and nurse staffing for hospitals, clinics and schools.

**Stack:** Next.js 16 · TypeScript · Tailwind CSS 4 · GSAP + Lenis ·
MySQL 8.0 with Drizzle ORM · Better Auth · everything on the client's cPanel
server as a Node.js app.

- [`healthcare-portfolio-website-studio.md`](./healthcare-portfolio-website-studio.md):
  the plan, the source of truth for what is built and in what order.
- [`AGENTS.md`](./AGENTS.md): how to work in this repository.
- [`PRODUCT.md`](./PRODUCT.md): product context for design work.
- [`changelog.md`](./changelog.md): every change, as it is made.

> **Nothing is deployed to the client's server until full payment is
> confirmed** (plan D48). Until then the server is only read, never changed.

---

## Running it locally

### What you need

- **Node 22** (`.nvmrc`; `nvm use` picks it).
- **npm 11** for installs: npm 10.9, which ships with Node 22, fails on
  Vitest's peer dependencies (plan D47). Use `npx -y npm@11 install` instead
  of `npm install`; nothing global changes.
- **Docker**, running: the local MySQL 8.0 and Mailpit run in it.

### First run

```bash
nvm use
npx -y npm@11 install
cp .env.example .env.local
npm run services:start   # MySQL 8.0.46 and Mailpit, in Docker
npm run db:migrate
npm run db:seed          # missing local content only, saved as drafts
npm run admin:create -- --email admin@example.com --name "Local Admin"
npm run dev
```

Then open <http://localhost:3000/admin/login>. The admin creation command asks
for a password without recording it in shell history. Preview and publish the
seeded drafts from the admin panel to make them public at <http://localhost:3000>.

The local services (`compose.yaml`) bind to this machine only, on **563xx**
ports, so they run beside other projects (clinicdesk uses 553xx):

| | |
|---|---|
| The app | <http://localhost:3000> |
| MySQL | `127.0.0.1:56306` (databases `alhidaya` and `alhidaya_test`) |
| Mail (Mailpit) | <http://127.0.0.1:56324> (SMTP on 56325) |

The app connects as `alhidaya_app`, which has data rights only; migrations
run as `alhidaya_migrator` (plan §26.1). `npm run services:stop` stops both.

---

## Checks

```bash
npm run verify:fast               # the pre-push gates: static, audits, 100% coverage
npm run verify                    # every gate incl. build, E2E, hydration, performance; isolated local test data
npm run lint
npm run format:check
npm run typecheck
npm test                          # unit tests
npm run test:integration          # against the local MySQL (npm run services:start)
npm run test:coverage             # unit + integration; fails below 100%
npm run build && npm run test:e2e # browser journeys, phone and desktop, port 3100
npm run test:hydration            # development-only React hydration diagnostics
npm run test:performance          # Lighthouse, JS/interaction/scroll budgets
npm run audit:shipped             # nothing the app loads at runtime may be vulnerable
```

CI (`.github/workflows/ci.yml`) runs all of them on every push to `main` and
every pull request, against the same `compose.yaml`, and audits the
dependencies: nothing the app loads at runtime may carry a known
vulnerability at moderate or above, and nothing in the tree one at high or
above (plan D55).

Install dependencies with npm 11 to enable the repository-local pre-push hook
(`prepare` configures `.githooks` in this checkout only). Every push runs
`npm run verify:fast`: independent static/security checks together, followed by full
unit and database coverage. `npm run verify` adds build, production journeys, development
hydration and the strict performance budgets; CI runs those browser gates in parallel.
Docker must be running. Verification uses `.env.example` local test settings
and `.data/verify-*` media/CV folders without editing `.env.local` or the real
local database. Test records in `alhidaya_test` are reset by the suites.

CI starts independent gates side by side. E2E and performance share one build
artifact, with separate local databases/runners; the final **All gates passed**
check requires every job. A push runs checks only and does not deploy.
