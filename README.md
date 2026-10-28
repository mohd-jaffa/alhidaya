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
npm run dev
```

Then open <http://localhost:3000>.

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
npm run lint
npm run format:check
npm run typecheck
npm test                          # unit tests
npm run test:integration          # against the local MySQL (npm run services:start)
npm run test:coverage             # unit + integration; fails below 100%
npm run build && npm run test:e2e # browser journeys, phone and desktop, port 3100
```

CI arrives with plan R0.5.
