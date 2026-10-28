# Al Hidaya Health Care Services — website

The public website and admin panel of **Al Hidaya Health Care Services**
(alhidaya.qa), a nursing care company in Doha, Qatar: nursing care at home
and in clinics, and nurse staffing for hospitals, clinics and schools.

**Stack:** Next.js 16 · TypeScript · Tailwind CSS 4 · GSAP + Lenis ·
Supabase (PostgreSQL, Auth, Storage, RLS) · hosted on the client's cPanel as a
Node.js app.

- [`healthcare-portfolio-website-studio.md`](./healthcare-portfolio-website-studio.md):
  the plan, the source of truth for what is built and in what order.
- [`AGENTS.md`](./AGENTS.md): how to work in this repository.
- [`PRODUCT.md`](./PRODUCT.md): product context for design work.
- [`changelog.md`](./changelog.md): every change, as it is made.

---

## Running it locally

### What you need

- **Node 22** (`.nvmrc`; `nvm use` picks it).
- **Docker**, running: the local Supabase stack runs in it.
- **The Supabase CLI** (`brew install supabase/tap/supabase`).

### First run

```bash
nvm use
npm install
cp .env.example .env.local
npm run db:start        # Postgres, Auth, Storage and Mailpit, in Docker
npm run db:reset        # applies the migrations and loads the local seed
npm run dev
```

Then open <http://localhost:3000>.

The local Supabase runs on **563xx** ports, so it can run beside other local
Supabase projects (clinicdesk uses 553xx):

| | |
|---|---|
| The app | <http://localhost:3000> |
| Supabase API | <http://127.0.0.1:56321> |
| Supabase Studio | <http://127.0.0.1:56323> |
| Mail (Mailpit) | <http://127.0.0.1:56324> |

`supabase status` prints every URL and key the running stack uses.

---

## Checks

```bash
npm run lint
npm run format:check
npm run typecheck
npm test                          # unit tests
npm run test:integration          # against the local Supabase (npm run db:start)
npm run test:coverage             # unit + integration; fails below 100%
npm run build && npm run test:e2e # browser journeys, phone and desktop, port 3100
```

CI (`.github/workflows/ci.yml`) runs all of them on every push to `main` and
every pull request.
