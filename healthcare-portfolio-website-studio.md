# Al Hidaya Health Care Services — Website Product, Architecture & Delivery Plan

> The public website and admin panel of **Al Hidaya Health Care Services**
> (alhidaya.qa), a nursing care company in Doha, Qatar. A premium,
> very smooth public site, plus a Content CMS the company runs without a
> developer.

**This plan is the source of truth** for what is built and in what order.
`AGENTS.md` says how to work; `PRODUCT.md` holds product truth for design work;
`changelog.md` records every change. The first draft of this document is kept
unchanged at `docs/planning/2026-10-28-initial-draft.md`; §43 lists what
changed and why.

Every decision here was made by the user and is recorded in the decision log
(§2) with its date. Where a detail was not decided, it is an **open question**
(§41) carrying a **default** that is built only if no answer arrives before its
tracker row starts. Nothing in this plan is invented product truth: facts about
the company come from alhidaya.qa and the logo, and anything the company has not
supplied (licence numbers, statistics, testimonials) is absent, not made up.

---

## Contents

**Part I — Product**
1. Overview · 2. Decision log · 3. Audiences and the admin · 4. Scope

**Part II — Specifications**
5. Site map, URLs and redirects · 6. Public pages · 7. Page sections ·
8. Services · 9. Careers and applications · 10. Enquiry forms ·
11. Client logos · 12. Brochure · 13. Site content and settings ·
14. Draft, preview and publish · 15. Media · 16. The admin panel ·
17. Email · 18. Retention and privacy · 19. SEO · 20. Analytics

**Part III — Architecture and engineering**
21. System architecture · 22. Rendering and caching · 23. Technology stack ·
24. Folder structure · 25. Central constants · 26. Security model ·
27. Data model · 28. Migrations · 29. API · 30. Design system and motion ·
31. Performance budgets · 32. Accessibility · 33. Arabic readiness ·
34. Testing and coverage · 35. CI/CD, environments and deployment ·
36. Observability

**Part IV — Delivery**
37. Phases · 38. Tracker · 39. Definition of shippable ·
40. Prerequisites from the client · 41. Open questions · 42. Later ·
43. Changes from the initial draft

---

# Part I — Product

## 1. Overview

Al Hidaya Health Care Services provides **nursing care at home and in
clinics**, and **nurse staffing for hospitals, clinics and schools**, in Doha.
Its current site (alhidaya.qa, © 2022) lists eight services, one job, a phone
number, two email addresses, an address and an Instagram account. Its copy has
grammar errors, and it carries no licence, statistics or testimonials.

The new site has two halves in one Next.js app:

- **The public site** — premium, calm and very smooth: a family, an
  institution and a nurse each find their own next step at once.
- **The admin panel** (`/admin`) — a **Content CMS**: one admin edits every
  text and image, shows, hides and reorders page sections, and manages
  services, jobs, client logos, the brochure, contact details, navigation,
  footer and SEO; reads enquiries and job applications. **The design itself
  is locked**: no colour, font or layout controls.

**Success:** a family reaches Al Hidaya on WhatsApp or by phone within
seconds; a hospital, clinic or school requests a staffing quote; a nurse
applies for a job with a CV; the admin keeps the site current without
breaking its design; and every page loads fast and scrolls without a stutter
on a mid-range phone.

## 2. Decision log

Every decision the user made, with its date. A later change appends a new line;
earlier lines are never rewritten. **(agent default)** marks a choice the agent
made inside a decision the user delegated or framed; each one is also an open
question (§41) the user may overturn.

| ID | Decision | Date |
|---|---|---|
| D1 | **Next.js and Supabase**, built in this folder, production-grade, following clinicdesk's architecture and conventions (`/Users/jaffa/projects/clinicdesk`). | 2026-10-28 |
| D2 | **Four audiences:** families arranging care, hospitals and clinics needing staff, schools needing nurses, and nurses seeking jobs. | 2026-10-28 |
| D3 | **English at launch, Arabic later**, built ready for Arabic (§33). | 2026-10-28 |
| D4 | **English at the root, Arabic later under `/ar`** (`/services` now, `/ar/services` later). No English URL ever changes. | 2026-10-28 |
| D5 | **The name is "Al Hidaya Health Care Services".** (The logo reads "Al Hidaya Health Care Service WLL".) | 2026-10-28 |
| D6 | **Copy is rewritten** in polished professional English from the company's real facts; the client approves it before launch. | 2026-10-28 |
| D7 | **Proof on hand: named client logos only.** The client supplies names and permission. No licence number, statistics or testimonials are shown, and none are invented. | 2026-10-28 |
| D8 | **Imagery: licensed stock at launch, the client's own photos later** through the admin. Stock is never presented as Al Hidaya's staff. | 2026-10-28 |
| D9 | **The main action depends on the audience:** families → WhatsApp or call; hospitals, clinics and schools → Request a Quote; nurses → Careers. | 2026-10-28 |
| D10 | **The brochure PDF stays** downloadable; the admin can replace it. | 2026-10-28 |
| D11 | **Admin scope: a Content CMS**, not the initial draft's full Website Studio. Fixed premium page designs; the admin edits all text and images, shows, hides and reorders sections, and manages services, jobs, client logos, enquiries, applications, the brochure, contact details, navigation and footer links, and SEO. No page builder, theme studio or form builder. | 2026-10-28 |
| D12 | **The design is locked.** Colours, type, layout and motion are fixed in code; the admin cannot change them. | 2026-10-28 |
| D13 | **Nurses apply on the site, with a CV upload.** | 2026-10-28 |
| D14 | **One admin account.** | 2026-10-28 |
| D15 | **Two fixed forms: Request a Quote and Contact**, designed in code. | 2026-10-28 |
| D16 | **Alerts: an email plus the admin inbox.** No auto-reply to the sender. | 2026-10-28 |
| D17 | **Email goes through the client's own mail server** (their cPanel mail, SMTP). | 2026-10-28 |
| D18 | **Spam protection: Cloudflare Turnstile, a honeypot and a rate limit.** | 2026-10-28 |
| D19 | **Hosting: the client's cPanel server, as a Node.js app.** SSH and "Setup Node.js App" are available; the user will provide SSH access. | 2026-10-28 |
| D20 | **Supabase region: the nearest to Qatar**, chosen with the user when the hosted project is created. | 2026-10-28 |
| D21 | **Go-live: swap alhidaya.qa straight to the new site**, with 301 redirects from every old URL. No public staging site. | 2026-10-28 |
| D22 | **Analytics: Cloudflare Web Analytics**: cookieless, so there is no cookie banner. | 2026-10-28 |
| D23 | **CVs go to the client's Google Drive**, a folder the admin connects from the admin panel, **and are attached to the email to HR**. Files are deleted from Drive with the application (D24). | 2026-10-28 |
| D24 | **Retention is set by the admin, at most one year.** Enquiries, applications and their CVs are deleted automatically when it passes. | 2026-10-28 |
| D25 | **DNS stays where it is** (delegated to the agent). alhidaya.qa points at the new app on cPanel; the redirects live in the app. A free Cloudflare proxy in front is decided at go-live, only if the speed check (R8.5) shows the server's distance slows Qatar visitors. **(agent default)** | 2026-10-28 |
| D26 | **Testing as clinicdesk:** unit, integration and Playwright E2E (phone and desktop, axe on every page), **100% coverage enforced in CI**. | 2026-10-28 |
| D27 | **Git as clinicdesk:** one short conventional commit line, authored `jaFFa <jafakash.14@gmail.com>`, **no co-author or other trailer**; a commit after every completed change, with its docs in the same commit; the user creates the GitHub repository and pushes. GitHub Actions runs CI and deploys to cPanel over SSH. | 2026-10-28 |
| D28 | **Light theme only**, on the public site and the admin. | 2026-10-28 |
| D29 | **Motion: GSAP + ScrollTrigger + Lenis** (§30.4). | 2026-10-28 |
| D30 | **This session delivers the plan documents and the Phase 0 scaffold.** The initial draft is archived, not deleted. | 2026-10-28 |
| D31 | **One services list**, not separate paths per audience. Each service names who it is for (§8). | 2026-10-28 |
| D32 | **Draft → preview → publish.** Edits stay private until the admin publishes; the admin can preview the real page first. | 2026-10-28 |
| D33 | **Admin sign-in: email and password**, with a lockout after repeated failures. | 2026-10-28 |
| D34 | **The office location is a styled static map with an "Open in Google Maps" link**: no embedded map, no map cookies. | 2026-10-28 |
| D35 | **The visual world comes from hospitals and healthcare, always in the logo's colours** (standing preference). | 2026-10-28 |
| D36 | **The design direction is "Follow the Line"**: hospital wayfinding (§30.1), chosen on the Impeccable decision page after one re-roll. **Code-led build**: no image generation was available, so no mock-up comps; the direction contract carries the ambition. | 2026-10-28 |
| D37 | **Email is sent from a new `no-reply@alhidaya.qa` mailbox** on their cPanel. | 2026-10-28 |
| D38 | **Dependency majors follow clinicdesk** (TypeScript 5.9, ESLint 9, Vitest 4), not the newest majors (TypeScript 7, ESLint 10, Vitest 5); everything else at its current release. **(agent default, Q13)** | 2026-10-28 |
| D39 | **Supabase is replaced by the client's cPanel database** (supersedes the Supabase part of D1, and D20): **PostgreSQL if their cPanel offers it, otherwise MySQL/MariaDB**, confirmed over SSH (R0.8). The database is reachable only from the app on the same server. | 2026-10-28 |
| D40 | **Images are files on the cPanel server**, in a permanent media folder outside the release folders, served as static files; their records are in the database. **(agent default inside D39; the user asked for images on their cPanel)** | 2026-10-28 |
| D41 | **CVs are saved in a private folder on the cPanel server** (outside `public_html`, never web-reachable) **and attached to the HR email**; deleted at retention (D24). Supersedes D23: no Google Drive. | 2026-10-28 |
| D42 | **Drizzle ORM** for the database: a typed schema and generated SQL migrations (Drizzle Kit). | 2026-10-28 |
| D43 | **Better Auth** for the admin's sign-in (email and password, D33): sessions in the database, HttpOnly cookies. | 2026-10-28 |
| D44 | **The current site is backed up before any change on the server**: its files, its admin panel and its database, kept outside `public_html` and downloaded to the developer's machine. Every step that changes the server is confirmed with the user first. | 2026-10-28 |
| D45 | **Releases deploy from GitHub** once the pipeline passes on the release (confirms §35.3). | 2026-10-28 |
| D46 | **SSH access by key**: a dedicated key pair made on the developer's machine; the client authorises its public key in cPanel; no password is shared. **(agent default)** | 2026-10-28 |
| D47 | **Installs use npm 11**: npm 10.9, bundled with Node 22, fails to resolve Vitest's peer dependencies. **(agent default)** | 2026-10-28 |
| D48 | **Nothing is deployed to, and nothing is changed on, the client's server until the user confirms full payment.** Until then SSH is used only for read-only checks. The backup (D44) and every server step wait for that confirmation. | 2026-10-28 |
| D49 | **The database is MySQL 8.0** (8.0.46 on the server): the server's cPanel does not support PostgreSQL (R0.8), so D39 resolves to MySQL. | 2026-10-28 |
| D50 | **The user backs up the old site before the deploy**, gives the backup to the client, then **clears the old site and its database** from the server to free space (supersedes the developer's backup in D44; every server change still waits for D48). | 2026-10-28 |
| D51 | **No hosting upgrade: the site is built within the 1 GB disk** (and 5 GB monthly bandwidth) of today's plan (§21.2). | 2026-10-28 |
| D52 | **CVs and images keep firm size limits**, and **CVs have their own expiry, set in the admin panel** (1 – 365 days): when it passes the CV file is deleted, while the application record follows the general retention (D24). | 2026-10-28 |
| D53 | **The sender is the existing `noreply@alhidaya.qa`** (supersedes `no-reply@` in D37). | 2026-10-28 |
| D54 | **Uploaded CVs can be opened from cPanel** (File Manager) as well as from the admin panel, **with proper access control on every file**: the CV folder outside `public_html`, private to the account, readable names (§9.4). | 2026-10-28 |
| D55 | **Security is a must**: every row carries its security tests; uploads, file access, sign-in and headers are reviewed against OWASP ASVS level 2 in Phase 7; CI checks dependencies for known vulnerabilities. | 2026-10-28 |
| D56 | **Versions on the server may be updated when needed** (the user), still only after full payment (D48). On shared hosting the MySQL version belongs to HostCarts; the app is chosen to run on what the server offers (Node 22, MySQL 8.0). | 2026-10-28 |
| D57 | **Local and CI images come from registries outside Docker Hub**: AWS's mirror of the official MySQL image and Mailpit's own GitHub registry (Docker Desktop here cannot reach Docker Hub, and CI avoids its pull limits). **(agent default)** | 2026-10-28 |
| D58 | **Each page is stored as one document**, a draft copy and a published copy, with its sections inside in order (not a row per section, as §27 first had it): publishing a page is one atomic write, and every save is checked against the section rules (§7.2). | 2026-10-28 |
| D59 | **A new order of services or client logos waits for Publish** like any other edit (D32): the draft order and the published order are kept apart. | 2026-10-28 |
| D60 | **Content lives in two tables**, following D58: `documents` (keyed: each page, the site's content, each ordering) and `records` (collections: services, jobs, client logos), each row a draft and a published copy, with every kind's rules in its own schema; plus `media` and `site_operations`. Publishing is the same atomic step everywhere. **(agent default)** | 2026-10-29 |
| D61 | **Typeface: Atkinson Hyperlegible Next**, with **Noto Sans Arabic** as its Arabic companion, chosen by the user from the specimen of three (R2.1; answers Q10). Self-hosted: one variable file (weights 200 – 800), Latin subset, 34 KB, with a metric-matched fallback; the Arabic file is added when Arabic arrives (§33). | 2026-10-29 |
| D62 | **The client has no vector logo** (answers Q2): the mark and the wordmark are redrawn as SVG from the JPG, faithfully, for the client to approve (R2.2, R7.5). | 2026-10-29 |
| D63 | **Errors may use red** (answers Q31), the one colour outside the logo's (D35): `#B42318`, 6.6:1 on white, for errors only, always with an icon and words (§30.3). | 2026-10-29 |
| D64 | **A kit preview page at `/kit`**, served only where `KIT_PREVIEW=true` (locally and in the browser tests), never in production: the motion system and the UI kit are tested and screenshotted there (R2.4, R2.8). Confirmed by the user (Q33). | 2026-10-29 |
| D65 | **Motion is counted outside the first-load JavaScript budget** (answers Q34, option a): GSAP, ScrollTrigger and Lenis load after the first paint, so the 170 KB budget is the first paint's, for modern browsers; motion is measured and reported beside it. The real checks still hold: LCP, INP, CLS, long tasks, dropped frames and Lighthouse (§31). | 2026-10-29 |
| D66 | **WhatsApp actions use the site's chat pictogram and the word *WhatsApp*** (answers Q32), not WhatsApp's own logo. | 2026-10-29 |
| D67 | **The floating WhatsApp button stays on every public page**, as on today's site (answers Q23); **the admin can turn it off** in the site content (§13), published like any other edit. | 2026-10-29 |
| D68 | **"You are here" is said where the visitor stands, not above the headline** (answers Q35, option b): on Home the three lines start from a navy "You are here" station, and the line's travelling marker keeps the words; every page's headline stands alone, so the sign has no eyebrow (§7.2). | 2026-10-29 |
| D69 | **On a phone, "You are here" may show twice in the first screen**, in the progress line under the header and where the three lines start; **both stay** (answers Q36, option a): the progress line goes on to name each section as the visitor scrolls. | 2026-10-29 |
| D70 | **The copy is reviewed with the client at the user's demo**, not sent as a document now (answers Q37): whatever the client wants changed is changed **in the admin**, where every page's text, the services, the jobs, the contact details, the links and the SEO are editable (D11). The copy written at R1.8 stands as the launch draft; sign-off is R7.5. | 2026-10-29 |
| D71 | **The three lines' names are fixed in code** (answers Q38, option b): *Care at home*, *Staffing for hospitals, clinics and schools*, *Nurses: join us* live in the message catalogue, like the lines' actions and colours (D9); the Home sign holds only its headline, supporting line and photo. | 2026-10-29 |
| D72 | **Home's careers section shows the three most recent open jobs**, then a link to all of them (answers Q39). | 2026-10-29 |
| D73 | **Uploaded images are drawn as a `<picture>` from their made sizes**, not through a custom `next/image` loader (§22.3 first said a loader): each type is offered at every width it was made at, AVIF first and WebP after it, which a loader cannot do (it answers one address per width, in one type), and no script is sent for an image. **(agent default; Q40)** | 2026-10-29 |
| D74 | **The office's spot on the static map is site content**, which the admin can edit (following D70): a latitude and longitude, empty until the client confirms it. OpenStreetMap has Asmakh Mall but neither Retaj Building nor a Bin Naifaa street, so until then the map marks only the mall, which the address names; nothing is placed by guesswork. **(agent default)** | 2026-10-29 |

## 3. Audiences and the admin

### 3.1 Visitors

| Audience | Situation | What they need | Their line (§30.1) |
|---|---|---|---|
| **Families** | Arranging care for a parent, a patient back from hospital, a new mother or a child; often worried, deciding quickly, mostly on a phone. | To know Al Hidaya sends qualified nurses home, day and night, and to reach them at once. | **Care at home** → WhatsApp, Call |
| **Hospitals and clinics** | Nursing or procurement managers judging an agency's reliability. | Proof of seriousness and a fast way to ask for staff. | **Staffing** → Request a Quote |
| **Schools** | Administrators needing a school nurse. | The school-nurse service and a way to ask. | **Staffing** → Request a Quote |
| **Nurses** | Looking for work in Qatar, in Doha or abroad. | The job, its requirements (MOPH licence, Dataflow, Prometric), and a way to apply with a CV. | **Careers** → Apply |

### 3.2 The admin

One Al Hidaya staff member (D14), signing in at `/admin` with email and
password (D33). They edit content, publish, work through enquiries and applications, and set
retention. Never a developer.

### 3.3 Words

Used consistently in the UI and code: **service**, **job**, **application**,
**enquiry** (a Quote or Contact submission), **client** (an organisation whose
logo is shown), **section**, **draft**, **published**, **publish**, **line**
(an audience's path), **brochure**.

## 4. Scope

### 4.1 V1 (Phases 0 – 8)

- The public site: Home, About, Services (list and each service), Careers
  (jobs, each job, applying), Contact, Request a Quote, Privacy, Terms, and the
  system pages; English; light theme; the "Follow the Line" design; GSAP +
  Lenis motion with a reduced-motion path.
- Forms: Request a Quote, Contact, Job application with CV; Turnstile,
  honeypot, rate limit; email alerts; the admin inbox.
- CVs kept privately on the server and attached to the HR email; automatic
  retention.
- The admin Content CMS (D11) with draft, preview and publish (D32).
- SEO: metadata, Open Graph images, structured data, sitemap, robots, and 301s
  from every old URL.
- Cloudflare Web Analytics.
- Deployment to the client's cPanel through GitHub Actions; the database on
  the same server (D39).

### 4.2 Later (§42)

Arabic content and RTL launch; the client's own photography; testimonials and
figures once real ones exist; anything in §42.

### 4.3 Out of scope

The initial draft's page builder, section library, theme studio, form builder
and theme presets (D11, D12); multiple admins or roles (D14); auto-replies
(D16); a public staging site (D21); dark mode (D28); online payments; patient
records of any kind.

---

# Part II — Specifications

## 5. Site map, URLs and redirects

### 5.1 Public routes

| Route | Page | Source |
|---|---|---|
| `/` | Home | §6.1 |
| `/about` | About | §6.2 |
| `/services` | Services | §6.3 |
| `/services/[slug]` | A service | §6.4 |
| `/careers` | Careers: open jobs | §6.5 |
| `/careers/[slug]` | A job | §6.6 |
| `/careers/[slug]/apply` | Apply for a job | §9.3 |
| `/careers/apply` | General application, no job (Q7) | §9.3 |
| `/contact` | Contact | §6.7 |
| `/request-a-quote` | Request a Quote | §6.8 |
| `/privacy`, `/terms` | Legal | §6.9 |
| `/brochure` | Redirects to the current brochure file | §12 |
| `/sitemap.xml`, `/robots.txt` | Generated | §19 |

Arabic arrives later under `/ar` with the same paths (D4, §33).

### 5.2 Admin routes

`/admin/login`, `/admin` (overview), `/admin/pages/[page]`, `/admin/services`,
`/admin/jobs`, `/admin/clients`, `/admin/media`, `/admin/enquiries`,
`/admin/applications`, `/admin/settings` (content, contact, navigation, footer,
SEO, brochure), `/admin/settings/operations` (recipients, retention),
`/admin/activity`. Never indexed (`noindex`, disallowed in robots).

### 5.3 Redirects from the current site (D21)

Permanent (301), defined once in `src/constants/redirects.ts`, served by
`next.config.ts`, and each one checked by an E2E test.

| Old URL | New URL |
|---|---|
| `/about_us` | `/about` |
| `/contact-us` | `/contact` |
| `/careers` | `/careers` (unchanged) |
| `/service-detail/staffing-solution-of-hospital-and-clinics` | `/services/<its new slug>` |
| `/service-detail/school-nurse-staffing` | `/services/<…>` |
| `/service-detail/home-care-nursing-services` | `/services/<…>` |
| `/service-detail/chronic-patient-care` | `/services/<…>` |
| `/service-detail/child-care` | `/services/<…>` |
| `/service-detail/maternity-and-newborn-care` | `/services/<…>` |
| `/service-detail/palliative-care` | `/services/<…>` |
| `/service-detail/elderly-care` | `/services/<…>` |
| `/service-detail/*` (anything else) | `/services` |
| `/profile.pdf` | `/brochure` |

New slugs follow the approved service names (Q9). A slug the admin later
changes keeps its old slug as a redirect (§8).

## 6. Public pages

Every page is made of **sections** (§7). A page's sections are seeded in the
order below; the admin may hide, show and reorder them, except where a
section is marked **fixed**. Record-driven pages (a service, a job) take their
content from the record.

### 6.1 Home — `/`

1. **The sign** (fixed, first): the headline, standing alone, the
   supporting line, and **the three lines**, starting from a "You are here"
   station (D68), their names and actions fixed (D71): *Care at home* (WhatsApp, Call),
   *Staffing for hospitals, clinics and schools* (Request a Quote), and
   *Nurses: join us* (Careers). These are the working actions, not links to
   them (§30.1).
2. **Who we are**: a short introduction from the About content.
3. **Services**: every published service as a stop on its line (§8).
4. **Why Al Hidaya**: the company's own values and promises: care at home
   at less than a hospital stay, nurses around the clock, care plans fitted to
   needs and budget, compassion and dignity (PRODUCT.md, Positioning).
5. **For institutions**: the staffing offer for hospitals, clinics and
   schools, ending on Request a Quote.
6. **Clients**: the client logo wall (§11). Hidden until logos are supplied.
7. **Careers**: the nurse's line, the three most recent open jobs and a link
   to all of them (D72), Apply.
8. **Contact**: WhatsApp, phone, email, address, the brochure.

### 6.2 About — `/about`

Page sign; the company's story; mission and vision (rewritten, D6); values;
clients; the contact section.

### 6.3 Services — `/services`

Page sign; the full services index (§8), each service on its audience's line;
the institutions section; the contact section.

### 6.4 A service — `/services/[slug]`

The service's sign in its line's colour; who it is for; the description;
**what the care includes**; related services on the same line; the line's
actions (WhatsApp and Call for families; Request a Quote for institutions,
with the service preselected).

### 6.5 Careers — `/careers`

Page sign; the introduction; the open jobs (title, location, type, closing
date); what Al Hidaya asks of nurses in Qatar (from job requirements, never
generalised into a claim); a general application (Q7). **Empty state:** no
open jobs says so and offers the general application.

### 6.6 A job — `/careers/[slug]`

Title, location, employment type, experience, description,
responsibilities, qualifications, optional benefits, posted and closing dates,
**Apply**. A closed job stays reachable and says it is closed, offering the
open jobs and the general application. Structured data `JobPosting` (§19).

### 6.7 Contact — `/contact`

Page sign; WhatsApp, phone, email (`info@`), the address (Retaj Building, Bin
Naifaa 80, near Asmakh Mall, first floor, door 109, Al Sadd, Doha); "available
24/7" (the company's own claim); **the styled static map** with the location
marked and **Open in Google Maps** (D34, §30.6); the Contact form (§10).

### 6.8 Request a Quote — `/request-a-quote`

Page sign and the Quote form (§10). Arriving from a service preselects it.

### 6.9 Privacy and Terms

Rich text the admin edits. Privacy says exactly what the site collects, why,
where it goes (the company's own server and database, its Microsoft 365
mail, Cloudflare for the bot check and analytics), and for
how long (§18). Drafted in Phase 3, reviewed by the client before launch (Q18).

### 6.10 System pages

Not found, error, and loading states, in the design's language: a sign that
says where the visitor is and the way back.

## 7. Page sections

### 7.1 Model

- The **pages** are a fixed set: `HOME`, `ABOUT`, `SERVICES`, `CAREERS`,
  `CONTACT`, `QUOTE`, `PRIVACY`, `TERMS`. The admin cannot add or delete a page
  (D11).
- Each page has an ordered list of **sections**. A section has a stable id, a
  **type** from the catalogue (§7.2), a sort order, a visibility flag and its
  **content**, validated by that type's schema (Zod, `src/lib/validation/schemas`).
- Which types a page may hold, which are **fixed** (cannot be hidden or
  moved), and the most of each type, are constants (`src/constants/sections.ts`).
- Hiding a section keeps its content. Removing a client logo, service or job
  from a section never deletes the record.

### 7.2 Section catalogue

| Type | Content | Used on |
|---|---|---|
| `SIGN` | headline, supporting line, photo; on Home the three lines follow, from their "You are here" station (D68), their names fixed (D71) | every page (fixed, first) |
| `INTRO` | heading, rich text, optional photo | Home, About |
| `SERVICES_INDEX` | heading, intro; shows every published service, in order | Home, Services |
| `VALUES` | heading, up to six items (title, line) | Home, About |
| `MISSION` | mission, vision | About |
| `INSTITUTIONS` | heading, text, photo; ends on Request a Quote | Home, Services |
| `CLIENTS` | heading; shows every published client logo, in order | Home, About |
| `CAREERS_BAND` | heading, text; shows the three most recent open jobs and a link to all (D72) | Home |
| `JOBS_LIST` | intro, empty-state text | Careers |
| `CONTACT_BAND` | heading, text; reads the contact details (§13) | most pages |
| `CONTACT_DETAILS` | heading; contact details and the static map | Contact |
| `FORM` | heading, text; which form (Quote or Contact) | Contact, Quote |
| `RICH_TEXT` | headings, paragraphs, lists, links (no raw HTML) | About, Privacy, Terms |

Rich text is stored as structured blocks (heading, paragraph, list, link),
never HTML; links must be internal routes or validated `https` URLs.

## 8. Services

A **service** has: name; slug; **audience** (`FAMILIES` or `INSTITUTIONS`,
which sets its line, D31); short description; full description; **what's
included** (a list); who it's for (a line); photo and alt text; SEO title and
description; status (`DRAFT`, `PUBLISHED`, `ARCHIVED`); sort order; timestamps;
and its **previous slugs** (each answers with a 301 to the current one).

Seeded from the current site (rewritten, Q9), in this order:

| Current name | Audience |
|---|---|
| Staffing solution of hospital and clinics | Institutions |
| School Nurse Staffing | Institutions |
| Home care nursing services | Families |
| Chronic patient care | Families |
| Child care | Families |
| Maternity and newborn care | Families |
| Palliative care | Families |
| Elderly care | Families |

The current site names wound care, medication management, post-surgical care
and chronic disease management in its copy; they appear as "what's included"
only where the client confirms them for that service (Q9).

## 9. Careers and applications

### 9.1 Jobs

A **job** has: title; slug; department (optional); location; employment type
(`FULL_TIME`, `PART_TIME`, `CONTRACT`); experience required; short and full
description; responsibilities; qualifications; benefits (optional); posted
date; closing date (optional); status (`DRAFT`, `PUBLISHED`, `CLOSED`,
`ARCHIVED`); SEO title and description. A published job past its closing
date shows as closed on its own, with no admin step.

Seeded with the current posting: *Registered General Nurse – Home Care*
(Bachelor's or Diploma in Nursing; at least 2 years' adult nursing
experience; valid home-country registration or MOPH licence; Dataflow and
Prometric; strong communication and organisation).

### 9.2 The application form

Fields (Q7 default): full name; email; phone; where they are now (in Qatar /
outside Qatar); MOPH licence (have / in progress / not yet); Dataflow
(done / not yet); Prometric (passed / not yet); years of nursing experience;
**CV** (PDF, DOC or DOCX, at most 5 MB, typed by its first bytes, Q4); an
optional note; consent to the privacy notice. Turnstile, honeypot and rate
limit as §10.3.

### 9.3 What happens on submit

1. The route checks Turnstile, the honeypot and the rate limit, then parses
   the fields and the file (type by magic bytes, size).
2. The **application row** is written in the database (no file).
3. **The CV is saved in the private CV folder on the server** (D41) under a
   random file name; its original name, size and type are stored on the row.
4. **The HR email** goes to the applications recipient (default
   `hr@alhidaya.qa`) with the details and **the CV attached** (D41).
5. The applicant sees a confirmation. They never see an internal error: if
   saving the file or sending the mail fails, the application is still
   saved, the failure is logged, and the admin inbox shows the CV as **not
   stored** or the email as **not sent**, with a Retry.

### 9.4 Keeping CVs (D41, D52, D54)

- **Where:** `~/alhidaya-data/cvs/<YYYY-MM>/` on the cPanel server, **outside
  `public_html`** (Apache can never serve it) and outside the app's release
  folders (a deploy never touches it).
- **Viewable in cPanel** (D54): anyone with the cPanel login can open the CVs
  in File Manager. Each file is named so a person can find it:
  `<YYYY-MM-DD>_<job>_<applicant>_<id>.<ext>`, where the job and the
  applicant's name are reduced to lowercase letters, digits and hyphens (at
  most 40 characters each) and `<id>` is random: nothing the applicant typed
  reaches the file system unsanitised, and no two names collide. The
  extension comes from the file's detected type, never from its name.
- **Access control:** folders `700`, files `600`, owned by the account's own
  user (the user both cPanel's File Manager and the Node app run as); CageFS
  keeps every other account on the shared server out. On the website, only
  the signed-in admin can download a CV, through
  `GET /api/admin/applications/[id]/cv` (`Content-Disposition: attachment`,
  `no-store`, `nosniff`), and **every download is audited**.
- **Expiry (D52):** CVs expire on their own setting in the admin (1 – 365
  days); the daily job deletes an expired CV's file and the application shows
  *CV expired* until the application itself reaches its retention (D24).
  Deleting an application deletes its CV.
- **Size:** at most 5 MB each (Q4); the folder's total is held to its budget
  (§21.2).
- The server's own backups include the folder; nothing else copies it.

### 9.5 The applications inbox

List (newest first; filter by job and status; search by name, email, phone),
detail (every field as submitted, the job, **Download CV**, the CV and email
status with Retry), status (`NEW`, `IN_REVIEW`, `SHORTLISTED`, `CLOSED`),
internal notes. Deleting an application deletes its CV file.

## 10. Enquiry forms

### 10.1 Request a Quote (Q5 default fields)

Name; organisation (optional); **who it's for** (my family / a hospital / a
clinic / a school / other); service (from published services, optional,
preselected when arriving from a service page); phone; email; preferred contact
(WhatsApp / call / email); message; consent.

### 10.2 Contact (Q6 default fields)

Name; phone; email; message; consent.

### 10.3 Protection (D18)

- **Cloudflare Turnstile**, verified on the server before anything is stored.
- A **honeypot** field; a filled one is accepted silently and discarded.
- A **rate limit** per hashed IP and per form, in the database (Q16 default:
  5 submissions per 10 minutes); refusals answer with a calm message.
- Every field validated by Zod on the client and again on the server; the
  database's `CHECK`s are the last word.

### 10.4 What happens on submit

The enquiry is stored with its **field labels as submitted** (so a later
change to the form never changes history); the alert email goes to the
enquiries recipient (default `info@alhidaya.qa`, Q17); the visitor sees the
success state with the WhatsApp line as the fastest follow-up. A mail failure
never loses the enquiry (logged, shown in the inbox with Retry).

### 10.5 The enquiries inbox

List (newest first; filter by form and status; search), detail, status (`NEW`,
`IN_PROGRESS`, `RESOLVED`), internal notes. CSV export is Later unless the user
asks (Q15).

## 11. Client logos

A **client** has: organisation name; logo (image, §15); alt text; optional
website; sort order; status (`DRAFT`, `PUBLISHED`). Logos sit in **fixed 4:3
containers** with `object-fit: contain`, even padding and centred alignment,
so no logo is stretched or cropped; a logo can be shown in its original colours
or in a single tone (a constant of the design, not an admin control, D12).
**Empty state:** the Clients section stays hidden on the public site until at
least one logo is published (D7).

## 12. Brochure

One current PDF (at most 10 MB, typed by its first bytes), uploaded by the
admin (D10). `/brochure` redirects to it; `/profile.pdf` redirects to
`/brochure`. Replacing it keeps the URL.

## 13. Site content and settings

Two kinds, kept apart:

**Site content** (draft and published, D32): company name and short
description; contact details (phone, WhatsApp, email, address lines, map
link, the office's spot on the map (D74), "available 24/7" line); social links (Instagram today); the floating
WhatsApp button, on or off (D67); header navigation
(labels, order, visibility, from a fixed set of destinations: pages, services,
approved external URLs); footer columns; SEO defaults; the brochure.

**Operations** (take effect on save, audited): the enquiries recipient(s),
the applications recipient(s), **retention days (1 – 365, D24)** for enquiries
and applications, and **CV expiry days (1 – 365, D52)**.

## 14. Draft, preview and publish

- Every editable thing (a page's sections and SEO, a service, a job, a client
  logo, site content) keeps a **draft** and a **published** copy.
- **Save draft** writes only the draft. **Preview** opens the real public
  page in Next.js draft mode, showing drafts, with a fixed "Preview" bar and
  **Exit preview**; only a signed-in admin can enter it.
- **Publish** copies the draft to published in one database transaction,
  writes an audit row, and **revalidates exactly the cached pages that show
  it** (§22). **Discard draft** resets the draft to the published copy.
- Each item publishes on its own (Q19 default); the admin overview lists every
  item with **unpublished changes**.
- The public site reads **only** published copies; drafts are unreachable
  without the admin session (§26).
- States shown in the admin: *Saved*, *Unsaved changes*, *Draft*, *Publishing*,
  *Published*, *Publish failed*. A failed publish keeps the draft intact.

## 15. Media

- **Public images** (photos, client logos) are uploaded by the admin to the
  **media folder on the server** (D40), outside the release folders so a
  deploy never touches it, and served as static files with long-lived cache
  headers. At upload the server checks the
  type by first bytes (JPEG, PNG, WebP, AVIF; SVG is refused), the size (at most
  10 MB), strips metadata, and **makes the responsive sizes once** with sharp
  (AVIF and WebP at fixed widths), so the cPanel server never resizes images
  per request (§22.3).
- **The original is not kept** (§21.2): only the made sizes are stored, the
  largest 2400 px wide. An upload that would take the media folder past its
  budget is refused with the reason.
- **Access control:** the media folder sits under `public_html` (§21.3) with
  its own `.htaccess`: no directory listing, **no script execution of any
  kind** (PHP, CGI, handlers removed), only image and PDF types served,
  `nosniff`. Files are written `644` in folders `755`; nothing there is ever
  executable, and file names are generated by the app.
- **Alt text is required** on every image, or explicitly marked decorative.
- The media library lists, searches and previews; deleting an image that is
  used anywhere is refused with where it is used.
- **CVs are never media** (§9.3).
- Stock images are recorded with their source and licence (Q11) and are
  never captioned as Al Hidaya staff (D8).

## 16. The admin panel

An **Operate** surface (Impeccable) in the same visual world as the public
site, quieter, shaped before it is built (R6.1). Light only (D28). No smooth
scroll. Desktop first; usable on a phone for reading the inbox.

| Screen | Purpose |
|---|---|
| Sign in | Email and password; lockout after 5 failures for 15 minutes (§26.4); forgotten password by email link. |
| Overview | New enquiries and applications; items with unpublished changes; failed mails or CV saves; quick links. |
| Pages | Each page's sections: show/hide, move up/down and drag to reorder, edit, preview, publish, discard. |
| Services | List, order, create, edit, preview, publish, archive. |
| Jobs | List by status, create, edit, close, publish, archive. |
| Clients | Logos: add, order, publish. |
| Media | Upload, alt text, search, usage, delete. |
| Enquiries | §10.5. |
| Applications | §9.5. |
| Settings | Site content (§13), brochure. |
| Operations | Recipients, retention. |
| Activity | The audit trail of admin changes. |

Irreversible actions ask first: publish, delete or archive a record, delete an
enquiry or application, change retention.

## 17. Email

- Sent by the app through the client's cPanel mail over SMTP (D17), from
  `noreply@alhidaya.qa` (D53), behind one mail interface (`src/lib/mail`) so
  the provider is an env change only. Locally: Mailpit, in Docker beside the
  local database.
- **Messages:** new enquiry → enquiries recipient; new application (CV
  attached) → applications recipient; admin password reset → the admin.
- Reply-To is the visitor's email, so the team answers from their own inbox.
- **The recipients are on Microsoft 365** (§21.1): the cPanel server relays
  the site's mail to Outlook because the domain's mail routing is set to
  Remote; that setting must stay Remote, or the site's mail would stop in
  unread local cPanel mailboxes.
- SPF already passes for this server. **DKIM is added in cPanel and a DMARC
  record (`p=none` first) is published** before launch, then verified with
  real sends to info@ and hr@ (R8.3).
- A failed send never undoes what it was for; it is logged and retryable.

## 18. Retention and privacy

- **The retention period** (D24) is set by the admin, 1 – 365 days (Q8 default
  180 until set).
- **CVs expire on their own setting** (1 – 365 days, D52), which may be
  shorter than the retention period.
- A **daily job** deletes enquiries and applications older than the period,
  their notes and their CV files, and the CV files past the CV expiry: a
  **cPanel cron job** calls
  `POST /api/cron/retention` with `CRON_SECRET` (D39). A file that cannot be
  deleted is retried the next day and shown in the admin.
- **Personal data never goes into logs**, error logs, URLs or analytics. The
  logger redacts by key; a test proves it.
- IP addresses are stored only as a keyed hash (`IP_HASH_SECRET`) for rate
  limiting, and expire with the limit window.
- Nothing personal is cached: every form and admin answer is `no-store`.

## 19. SEO

- Per-page title and description from published content, with defaults (§13).
- Canonical URLs on `https://alhidaya.qa`; `noindex` for the admin, previews
  and closed-and-archived jobs.
- Open Graph and Twitter images generated per page in the design's language.
- Structured data (JSON-LD): `MedicalBusiness` (name, address, phone, email,
  opening hours 24/7, logo, `sameAs` Instagram), `Service` per service,
  `JobPosting` per open job, `BreadcrumbList`.
- `sitemap.xml` from published pages, services and open jobs; `robots.txt`.
- The 301 map (§5.3); after go-live, the sitemap is submitted to Google Search
  Console by the client (R8.6).

## 20. Analytics

Cloudflare Web Analytics (D22): one small cookieless beacon, loaded after
the page is interactive, on the public site only, never in the admin or
preview. No cookie banner is needed. Its token is an env value.

---

# Part III — Architecture and engineering

## 21. System architecture

```text
Visitor's browser
   │  HTTPS
   ▼
alhidaya.qa ──► the client's cPanel server (everything below is on this one machine)
                 ├─ Node.js app (Phusion Passenger) running Next.js 16 "standalone"
                 │   ├─ public pages: pre-rendered, cached on disk, revalidated on publish
                 │   ├─ admin panel (Better Auth) and REST route handlers (/api/*)
                 │   ├─ ──► the database: PostgreSQL or MySQL/MariaDB, localhost only (Drizzle)
                 │   ├─ ──► the CV folder (private, outside public_html)
                 │   ├─ ──► cPanel mail (SMTP, noreply@alhidaya.qa)
                 │   └─ ──► Cloudflare Turnstile (server-side verification)
                 ├─ the media folder (public images, served as static files)
                 └─ cron (daily) ──► POST /api/cron/retention
Browser ──► Cloudflare Web Analytics beacon · Turnstile widget
GitHub Actions (on a release) ──► build ──► rsync over SSH ──► migrate ──► switch ──► restart
```

- **No worker, queue, Redis or external database.** Work happens in the
  request; the one timed job is a cPanel cron entry.
- **The database never listens to the internet**: only the app on the same
  machine connects to it (D39).

### 21.1 The server (R0.8, read-only check, 2026-10-28)

| Fact | Found | What it means for the build |
|---|---|---|
| Host | HostCarts shared cPanel, `asian-node010.hostcarts.com`, OVH, **Singapore**; CloudLinux 8 with CageFS; Apache; Let's Encrypt (AutoSSL) | Qatar visitors reach Singapore: caching and the speed check at R8.5 matter (D25) |
| SSH | Port **2200**, user `alhidaya`, key authorised (D46) | The release workflow deploys over port 2200 with its own deploy key (R8.2) |
| Node.js | CloudLinux Node.js Selector with Passenger; **Node 22.22.0** available (also 24.14.0); no apps yet | Matches `.nvmrc` (22) |
| Memory and CPU | **1 GB** physical memory, **1 core** (100 %), 20 entry processes, 100 processes | Build on GitHub only; image processing at upload runs one at a time with sharp's limits; no server-side builds |
| **Disk** | **1 GB** quota: 291 MB used, **733 MB free** (shared with mail, databases and backups) | Tight. Releases, media sizes and CVs are budgeted (§21.2); a plan upgrade is Q25 |
| **Bandwidth** | **5 GB a month**; 1.3 GB already used this month | Image-heavy pages need edge caching or a plan upgrade (Q25, D25) |
| Database | **MySQL 8.0.46**, localhost; **PostgreSQL not supported** by this server; **at most 2 databases** (1 used by the old site, 222 KB) | MySQL 8 (D49); the new site takes the second database slot |
| Email accounts | at most 5; **`noreply@alhidaya.qa` already exists** | Q24: send from the existing `noreply@` |
| Mail | **MX is Microsoft 365** (`alhidaya-qa.mail.protection.outlook.com`): info@ and hr@ live in Outlook. cPanel **mail routing is Remote** (correct). SPF valid and includes this server; **DKIM missing; no DMARC** | Mail sent through cPanel reaches Outlook; DKIM and DMARC are added at R8.3 so it is not junked |
| Outbound | Local SMTP 25/587/465 open; Microsoft 365 and Gmail SMTP reachable; Cloudflare, npm and GitHub reachable | Turnstile verification and mail work from the app |
| Cron | Available; no jobs today | The daily retention job (§18) |
| Subdomains | at most 1, none used | Q22's hidden pre-switch check is possible |
| DNS | Authoritative `ns1/ns2.alhidaya.qa` → `115.84.171.158` (HostCarts DNS); the zone is also present in cPanel's Zone Editor | DKIM/DMARC records are added in cPanel and verified on the public resolvers (R8.3) |
| The current site | **Laravel 9** (end of life) on **PHP 8.1** in `public_html/application` (152 MB), bootstrapped by `public_html/index.php`; uploads in `public_html/upload` (`Services`, `CV`); `profile.pdf` (2.9 MB, the brochure); database `alhidaya_hidaya` | Backed up whole before the switch (D44, R0.9); the brochure can be reused (Q3) |

### 21.2 Living within 1 GB of disk (D51)

The client is not upgrading, so the site is built to fit. Before the deploy,
the user backs up the old site, hands the backup to the client, and clears the
old site and its database from the server (D50), leaving about 950 MB:

| Use | Budget |
|---|---|
| Two release folders (live and rollback), standalone builds | ≤ 250 MB |
| The media folder (made image sizes only, the brochure) | ≤ 250 MB, enforced |
| The CV folder | ≤ 250 MB, enforced (about 50 CVs at the 5 MB maximum) |
| The database, logs, mail and Next's cache | ≤ 150 MB |
| Headroom | ≥ 50 MB |

An upload that would pass its budget is refused with the reason. A CV that
cannot be stored still reaches HR attached to the email, and the inbox marks
it *not stored*. The admin overview shows each folder's use and warns at 80 %;
logs rotate. The budgets are constants (`limits.ts`). Bandwidth (5 GB a month)
is protected by long-lived caching, small made image sizes and lazy loading;
the speed check at R8.5 decides whether the free Cloudflare proxy is added
(D25).

### 21.3 Serving uploaded images

Next.js serves only the files that were in `public/` when it was built, so
images the admin uploads later are **not** in the build. They are written to a
**media folder inside `public_html` that no release touches**, and Apache
serves them directly as static files with long-lived cache headers; the app
only writes them (Q26). The CV folder is the opposite: outside `public_html`,
never served by Apache (§9.4).
- **One app instance** on cPanel: Next's disk cache and on-demand revalidation
  work as-is; nothing needs a shared cache.

## 22. Rendering and caching

### 22.1 Public pages

- Public pages render on the server and are **cached** (Next.js Cache
  Components: `"use cache"` with `cacheTag`/`cacheLife`; the exact API is read
  from `node_modules/next/dist/docs` when Phase 3 starts). The visitor receives
  finished HTML, with no client-side fetching of content.
- Every published read is tagged (`page:<key>`, `services`,
  `service:<slug>`, `jobs`, `job:<slug>`, `clients`, `site`). **Publish**
  revalidates exactly its tags; the next visitor gets fresh HTML.
- Draft mode (preview) bypasses the cache for the admin only.

### 22.2 Forms and admin

Form submissions and every admin read and write go through REST route
handlers (§29), answered `Cache-Control: no-store`.

### 22.3 Images

Next's runtime image optimiser is **not used** for CMS media: shared hosting
should not resize images per request. Sizes are made once at upload (§15) and
drawn as a `<picture>` that offers every made size of each type straight from
the media folder, AVIF first, then WebP (D73); the browser fetches the
smallest that fills its place. Images that ship with the code (pictograms,
the map, brand marks) are SVG or pre-made at build.

### 22.4 Fonts

Self-hosted with `next/font/local` (no third-party font requests), variable
WOFF2, subset, with metric-matched fallbacks so text never shifts on load:
Atkinson Hyperlegible Next (D61), one 34 KB file for every weight, preloaded,
with an Arial fallback sized to its metrics (`src/assets/fonts/`).

## 23. Technology stack

| Layer | Choice | Version at Phase 0 |
|---|---|---|
| Runtime | Node.js 22 (`.nvmrc`, `engines`); the server offers 22.22.0 (§21.1) | 22.x |
| Framework | Next.js (App Router, React Compiler, `output: "standalone"`) | 16.4 |
| UI | React | 19.3 |
| Language | TypeScript, strict (D38) | 5.9 |
| Styling | Tailwind CSS with design tokens in `src/app/globals.css` | 4.3 |
| Motion | GSAP + ScrollTrigger (+ `@gsap/react`), Lenis (D29) | 3.15 / 1.3 |
| Forms | React Hook Form + Zod | 7.x / 4.x |
| Database | MySQL on the client's server (D39, D49) | 8.0 |
| Data layer | Drizzle ORM + Drizzle Kit migrations (D42) | 0.45 / 0.31 |
| Admin auth | Better Auth (D43) | 1.7 |
| Client reads (admin) | SWR, as clinicdesk | 2.x |
| Email | Nodemailer over SMTP | 10.x |
| Images | sharp (at upload only) | 0.35 |
| Bot check | Cloudflare Turnstile | — |
| Analytics | Cloudflare Web Analytics | — |
| Tests | Vitest + Testing Library; Playwright + axe | 4.x / 1.6x |
| Lint/format | ESLint (next config) / Prettier, 120 columns | 9.x / 3.9 |
| Local services | Docker: the database (same engine and major version as the server) and Mailpit | — |
| Package manager | npm 11 (D47) | 11.x |

## 24. Folder structure

As clinicdesk's (`AGENTS.md` §5): feature-based, thin routes.

```text
src/
├── app/                      # routes only: composition, no business logic
│   ├── (site)/               # the public site: header, footer, smooth scroll, the line
│   │   ├── page.tsx          # /
│   │   ├── about/  services/[slug]/  careers/[slug]/apply/  careers/apply/
│   │   ├── contact/  request-a-quote/  privacy/  terms/
│   │   └── layout.tsx
│   ├── admin/                # the admin panel (signed-in), login under (auth)/
│   ├── api/                  # REST route handlers (§29)
│   ├── brochure/route.ts     # the brochure redirect
│   ├── sitemap.ts  robots.ts  opengraph-image.tsx
│   ├── layout.tsx  globals.css  fonts.ts  not-found.tsx  error.tsx  global-error.tsx
├── assets/brand/             # the logo (SVG), pictograms, the map
├── components/
│   ├── site/                 # SiteHeader, SiteFooter, MobileMenu, PreviewBar
│   ├── admin/                # AdminShell, AdminScreen, editors' shared parts
│   ├── motion/               # SmoothScroll (Lenis), TheLine, Reveal: the motion system
│   ├── sections/             # one component per section type (§7.2)
│   └── ui/                   # the shared kit, kebab-case files
├── constants/                # messages, routes, site, sections, statuses, limits, redirects, uploads
├── db/                       # the Drizzle schema (one file per area) and the client
├── features/
│   ├── auth/                 # the admin session, sign-in, lockout, password reset
│   ├── content/              # pages and sections: read, edit, publish, preview
│   ├── services/
│   ├── careers/              # jobs and applications
│   ├── enquiries/            # Quote and Contact
│   ├── clients/              # client logos
│   ├── media/                # uploads, sizes, usage
│   ├── settings/             # site content, operations
│   └── activity/             # the audit trail screen
│       (each: api.ts · api.client.ts · components/ · hooks/ · types.ts)
├── hooks/                    # shared hooks
├── lib/                      # api, audit, auth, env, errors, files, mail, motion, query,
│                             # rate-limit, seo, storage, text, turnstile, validation
├── proxy.ts                  # the /admin signed-in gate (not authorization)
└── instrumentation.ts        # server errors to the error log
drizzle/                      # generated SQL migrations, committed
compose.yaml                  # local services in Docker: the database and Mailpit (563xx ports)
tests/                        # unit/ (mirrors src/), contract/, db/ (+ integration/), e2e/, support/
scripts/                      # check-test-paths, check-deploy-output, deploy helpers
docs/                         # planning/ (the archived draft), brand/, RELEASE.md (Phase 8)
.impeccable/                  # design working files (surface briefs committed; reviews ignored)
```

## 25. Central constants

| File | Holds |
|---|---|
| `messages.ts` | `UI_TEXT`, `ERROR_MESSAGES`, `VALIDATION_MESSAGES`, `MAIL_TEXT`: every word, English now, keyed for Arabic later |
| `site.ts` | the company's fixed facts used before content loads (name, domain), WhatsApp prefill text (Q14) |
| `routes.ts` | every public and admin route |
| `sections.ts` | the section catalogue: types, which pages allow them, fixed ones, maxima |
| `statuses.ts` | content, job, enquiry and application statuses, audiences, employment types, with labels |
| `limits.ts` | field bounds, upload sizes, rate-limit windows, retention bounds (1 – 365), lockout |
| `redirects.ts` | the 301 map (§5.3) |
| `uploads.ts` | allowed image, PDF and CV types (magic bytes), sizes, image widths |

## 26. Security model

### 26.1 Who can reach the data (D39)

- **The database is reachable only from the app on the same server**
  (localhost); no browser, and no other machine, ever talks to it. There is
  no public API to the database, so access is enforced **in the server code**,
  in one place per kind of access:
  - **Public reads** go only through `src/features/*/api.ts` functions that
    select **published, visible** rows and published copies. A draft is
    never selected by a public read; a test proves it for every entity.
  - **Public writes** (enquiries, applications) go only through their route
    handlers, which verify Turnstile, the honeypot and the rate limit before
    one transaction writes the row.
  - **Admin reads and writes** go only through `withAdminRoute`, which checks
    the Better Auth session on every request (the proxy's cookie check is not
    authorization).
- **Least privilege in the database:** the app connects as a user with data
  rights only (select, insert, update, delete on its own tables); migrations
  run as a separate user with schema rights, used only by the release
  workflow.
- Every query is built by Drizzle with bound parameters; no SQL is ever
  assembled from input.

### 26.2 Secrets

Only on the server, validated at start (`src/lib/env/server.ts`), documented
in `.env.example`, never committed: `DATABASE_URL` (and the migration user's
URL, release workflow only), `BETTER_AUTH_SECRET`, SMTP credentials, the
Turnstile secret, `IP_HASH_SECRET`, `CRON_SECRET`. On cPanel they are set in
the Node.js app's environment, never in a file inside `public_html`.

### 26.3 Headers

HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
frame-ancestors `none`, and a Content-Security-Policy allowing only the app,
Turnstile and the analytics beacon; the CSP form that keeps public
pages statically cached is settled in R7.3.

### 26.4 Admin sign-in

**Better Auth** (D43) with email and password; sessions stored in the
database and carried in **HttpOnly, Secure, SameSite=Lax cookies** set by the
server, never in `localStorage`. Public sign-up is disabled; the one admin is
created by a script at setup. **Lockout:** 5 failed attempts for an
email or a hashed IP lock sign-in for 15 minutes (constants). Password reset by
an emailed link.

### 26.5 Uploads

Typed by first bytes, never by the browser's word; bounded in size; images
re-encoded (which strips anything hidden in them); SVG refused; filenames
never trusted; storage paths never shown.

## 27. Data model

Every table: `id uuid` primary key, `created_at`, `updated_at` (trigger),
`created_by`/`updated_by` where a person edits it. Content fields that the
admin edits live in `draft` and `published` MySQL `JSON` columns, validated
by the type's Zod schema on every write; the columns a query filters or orders
on are real columns. The schema is written in Drizzle (`src/db/schema`) for
MySQL 8.0 (D49): `utf8mb4` throughout (Arabic later), InnoDB, enforced `CHECK`s.

| Table | Purpose |
|---|---|
| `user`, `session`, `account`, `verification` | Better Auth's tables: the one admin and their sessions (D14, D43) |
| `media` | §15: path, type, bytes, size, alt, the made sizes |
| `documents` | keyed documents (D58, D60): `PAGE:<key>` for each page (its SEO and sections in order), `SITE` (§13 site content), `ORDER:SERVICES` and `ORDER:CLIENTS` (D59); each a `draft` and a `published` copy |
| `records` | collections (D60): `SERVICES` (§8), `JOBS` (§9.1) and `CLIENTS` (§11), each a `draft` and a `published` copy, its published `slug` and `previous_slugs`, `archived_at` |
| `site_operations` | §13 operations: one row: recipients, retention days, CV expiry days |
| `enquiries` | §10: form, status, email status, fields as submitted (labels and values), name/email/phone for search |
| `enquiry_notes` | internal notes |
| `applications` | §9: job (or none), job title as published when applied for, fields, the CV's stored key, original name, size and type, CV status (`PENDING`, `STORED`, `NOT_STORED`, `EXPIRED`) and email status (`PENDING`, `SENT`, `NOT_SENT`) |
| `application_notes` | internal notes |
| `rate_limits` | keyed hash of scope and key, window start, count |
| `sign_in_attempts` | hashed email/IP, count, locked until |
| `audit_log` | admin changes: action, entity, before/after for non-personal fields, actor |
| `error_log` | server failures (no personal data), with a retention |

Files: the **media folder** (public, D40) and the **CV folder** (private, D41),
both on the server outside the release folders.

## 28. Migrations

The schema lives in `src/db/schema`; **Drizzle Kit generates the SQL
migrations** into `drizzle/`, each reviewed and committed, sequential, and
never edited once released (D42). Every multi-row write (publish, submit,
purge) is **one transaction** in the server code, so the rules hold on either
engine. Each migration has a DB contract test.

| # | Migration |
|---|---|
| 0000 | `auth`: Better Auth's tables; the lockout table |
| 0001 | `logs`: `audit_log`, `error_log` |
| 0002 | `rate_limits`: the fixed-window counters (sign-in resets now, the forms in R1.5) |
| 0003 | `content`: `media`, `documents`, `records`, `site_operations` (D58 – D60) |
| 0004 | `enquiries`: tables, notes |
| 0005 | `applications`: tables, notes |

## 29. API

REST route handlers with clinicdesk's envelope (`{ success, data }` /
`{ success: false, error: { code, message, requestId } }`), wrapped in
`withApiHandler`; admin routes in `withAdminRoute`. Bodies parsed by their
schema; every answer `no-store`; every answer carries `x-request-id`.

| Route | Purpose |
|---|---|
| `POST /api/enquiries` | Quote or Contact (Turnstile, honeypot, rate limit) |
| `POST /api/applications` | multipart application with the CV |
| `GET /api/preview`, `GET /api/preview/exit` | enter and leave draft mode (admin only) |
| `POST /api/cron/retention` | the daily purge (`CRON_SECRET`) |
| `POST`/`DELETE /api/admin/session` | sign in (lockout first) and sign out, through Better Auth on the server; its own HTTP routes are never mounted (R1.2) |
| `POST /api/admin/password/forgot`, `/reset` | ask for a reset link (the same answer for any email; rate-limited), and set a new password from it |
| `/api/admin/pages/[key]` (+ `/sections`, `/publish`, `/discard`) | pages |
| `/api/admin/services` (+ `[id]`, `/publish`, `/order`) | services |
| `/api/admin/jobs` (+ `[id]`, `/publish`) | jobs |
| `/api/admin/clients` (+ `[id]`, `/publish`, `/order`) | client logos |
| `/api/admin/media` (+ `[id]`) | upload, list, alt text, delete |
| `/api/admin/enquiries` (+ `[id]`, `/notes`, `/retry-mail`) | the inbox |
| `/api/admin/applications` (+ `[id]`, `/notes`, `/cv`, `/retry`) | the inbox; `/cv` downloads the CV (§9.4) |
| `/api/admin/site` (+ `/publish`), `/api/admin/operations` | settings |
| `/api/admin/activity` | the audit trail |

## 30. Design system and motion

### 30.1 The direction — "Follow the Line" (D36)

Chosen by the user on the Impeccable decision page (seed `04485a26`, after one
re-roll; healthcare worlds only, D35). The direction contract lives in
`.impeccable/surfaces/` (the public site's surface brief) and is the authority
for every public screen; `DESIGN.md` is written from the built world at the
end of Phase 7.

**Thesis.** *Al Hidaya* means "the guidance". The site works like a great
hospital wayfinding system: it tells every visitor where they are and sends
them down their own coloured line to the right next step. It refuses the
category's template (a smiling-nurse hero, a grid of icon cards, a stats
strip, a testimonial carousel).

**The world.**
- **Ground:** clinical white; **sign panels** in the logo's deep blue with
  white type; detail panels in white with navy type.
- **Three lines, from the logo:** **sky blue** = Care at home (families),
  **deep blue** = Staffing (hospitals, clinics, schools), **leaf green** =
  Careers (nurses). Colour is never the only signal: every line also carries
  its name and pictogram.
- **Type:** **Atkinson Hyperlegible Next** (D61), a signage-grade sans made
  for readers with low vision, with Noto Sans Arabic as its companion; large,
  confident sizes like real signage; tabular figures where digits line up.
- **Pictograms:** one consistent set in the line weight of the system, in the
  manner of hospital symbol systems (Q12).
- **Sign grammar:** "You are here" markers, station dots, arrows, panel
  edges coloured by line, generous signage spacing; every sign keeps a slot
  for its Arabic line (§33).
- **Photography:** licensed stock framed as panels within the sign system
  (D8), never full-bleed decoration.

**First viewport (Home).** A large deep-blue sign panel: the headline
standing alone (e.g. *Nursing care, at your doorstep*, final copy per D6),
the supporting line, and a care photograph in a panel beside it on desktop.
Beneath, **the three lines** start from a navy **"You are here"** station, the
point the visitor stands at (D68), and run across the width, each a coloured
line with a station dot, its destination and its working actions: *Care at
home* → WhatsApp · Call; *Staffing for hospitals, clinics and schools* →
Request a Quote; *Nurses: join us* → Careers. On a phone the sign fills the
width and the three lines stack as large tappable rows.

**Signature interaction: the line.** As the visitor scrolls, the lines draw
onward down the page (scrubbed with the scroll), through each section as a
**station**; the station lights as its section arrives and a **"You are here"**
marker travels along the line. On desktop the line runs in the margin; on a
phone it becomes a slim progress line under the header with the current
station's name. Services are stops on their audience's line.

**Story.** The visitor understands that Al Hidaya brings qualified nurses into
homes and supplies nurses to hospitals, clinics and schools across Doha, day
and night; believes the company is organised and professional; and takes their
line's next step.

**Honest risk.** "Guidance" as wayfinding is the obvious reading of the name,
and it can feel like a transit system rather than care. It is answered by
warm photography, plain caring copy, and restraint: the line guides, it never
performs.

### 30.2 Tokens

- **Logo colours** (sampled from the logo file, set in R2.1): sky blue
  `#33A0DA`, deep blue `#0F64AC`, leaf green `#86AE3C`; the navy ink
  `#0B2440` (the deep blue, darkened) and a secondary ink `#3A5272`; ground
  white, a quiet panel `#F1F6FB`, hairlines `#D5E1ED`; on deep blue, white and
  `#DCE9F6`. **Errors only:** red `#B42318` (D63), with an icon and words.
- **Checked** (`tests/contract/tokens.test.ts`): navy on white 15.7:1; white
  on deep blue 6.1:1; navy on sky blue 5.4:1 and on leaf green 6.1:1; the
  secondary ink 8.0:1 on white; the error red 6.6:1 on white. Focus rings are deep blue on light surfaces
  and white on deep blue (each at least 3:1).
- **Type roles** (`src/app/globals.css`): sign 38 – 68 px, page 32 – 44 px,
  section 28 px, title and supporting line 21 px, body 17 px, small and label
  14 px. Radii 6 px (panels, controls) and 4 px (tags); the line 6 px wide,
  stations 22 px; durations 120, 200 and 640 ms; an exponential ease-out.
- **Contrast rules (WCAG AA):** white text only on deep blue or navy; sky
  blue and leaf green are line and accent colours, carrying navy text when text
  sits on them; body text is navy on white.
- Every colour, size, radius, shadow and duration is a token in
  `src/app/globals.css`. **A component never picks its own value.**

### 30.3 UI rules

- One primary action per view; WhatsApp, Call and Quote look like actions,
  never decoration.
- Touch targets ≥ 44 px; inputs at 16 px; heights in `dvh`; safe areas.
- Forms: labels above fields, errors beside their field, the success state in
  place; nothing lost on an error.
- Status always carries text and an icon, never colour alone.
- **Nothing childish:** no cartoons, mascots, clip-art, emoji or playful
  decoration, even for child and newborn care (PRODUCT.md).

### 30.4 Motion system (D29)

The user's binding requirement: **very smooth, no lag or jank anywhere.**

- **Lenis** for smooth wheel scrolling on desktop, synced to **GSAP's ticker**
  so there is **one animation frame loop**; ScrollTrigger updates from Lenis.
  Touch devices keep native scrolling (no scroll-jacking on phones).
- **Animate only `transform` and `opacity`** (and SVG `stroke-dashoffset` for
  the line). Never layout properties; no animated `filter`, `box-shadow` or
  large `clip-path`.
- **Content is visible by default**: reveals enhance; if JavaScript is slow
  or fails, nothing is hidden.
- Motion code is **client-only, on the public site, loaded after first
  paint**; the admin never loads Lenis or ScrollTrigger.
- ScrollTriggers are created per section and **killed on route change**
  (a `gsap.context` scope, what `useGSAP` wraps, made once the engine has
  loaded: `@gsap/react` would put GSAP in the first paint); Lenis resets on
  navigation; no leaked listeners.
- **Reduced motion** (`prefers-reduced-motion`): Lenis off, lines drawn in
  full, no scrubbing, reveals off, transitions become instant crossfades.
- Durations and eases are tokens; one signature (the line) plus restrained
  reveals, never scattered effects.
- Verified by the performance checks in §31.

### 30.5 The admin's look

The same tokens, type and pictograms, quieter: Operate mode, dense where it
helps, the line only as navigation state. Shaped with `/impeccable shape` before
Phase 6 (R6.1).

### 30.6 The static map

An authored SVG of the streets around Retaj Building, Al Sadd (near Asmakh
Mall), drawn in the line system with a "You are here" station, built from
OpenStreetMap data with its attribution, plus **Open in Google Maps** (D34).
No map scripts, no cookies. `scripts/make-map.mts` makes it (a 900 × 600 m
frame centred on Asmakh Mall, the landmark); the office is a navy station at
the spot set in the site content (D74).

## 31. Performance budgets

Measured on the built app, mid-range Android profile (4× CPU slowdown, Fast 4G),
and enforced in CI from Phase 7:

| Metric | Budget |
|---|---|
| Largest Contentful Paint | ≤ 2.0 s |
| Interaction to Next Paint | ≤ 150 ms |
| Cumulative Layout Shift | ≤ 0.05 |
| Long tasks during a full-page scroll | none over 50 ms |
| Dropped frames during scroll (desktop) | < 5 % |
| JavaScript per public route (gzip, first paint, modern browsers) | ≤ 170 KB; motion, loaded after the first paint, measured beside it (D65) |
| Lighthouse (performance, accessibility, best practices, SEO) | ≥ 95 each |
| Server response for a cached page (from the server's region) | ≤ 200 ms |

Every page row in the tracker states its numbers in its changelog entry.

## 32. Accessibility

WCAG 2.2 AA throughout: semantic HTML, a skip link, labels, full keyboard
use, visible focus, focus trapped in dialogs and returned, accessible errors,
screen-reader names for every line, pictogram and action, colour never the only
carrier, reduced motion respected (§30.4), 200 % zoom without loss. axe runs on
every page in E2E; a manual keyboard and screen-reader pass closes Phase 7.

## 33. Arabic readiness

Arabic is Later (D3), but V1 must not need a redesign to add it:

- **Logical CSS properties** (`margin-inline-start`, not `margin-left`) and
  `dir` on `<html>`; the line, arrows and reveals mirror in right-to-left.
- **Every word in `src/constants/messages.ts`**, keyed so an Arabic catalogue
  can sit beside it; no text in images.
- **Content fields stored per locale** (`{ "en": … }`) from day one, so adding
  Arabic adds data, not migrations (Q21).
- **The chosen typeface has an Arabic companion**: Noto Sans Arabic (D61),
  self-hosted beside the Latin file when Arabic arrives.
- Routes ready for an `/ar` segment without changing English URLs (D4).

## 34. Testing and coverage

As clinicdesk (D26, `AGENTS.md` §31):

| Layer | Tool | Where |
|---|---|---|
| Unit | Vitest + Testing Library (jsdom) | `tests/unit/` mirrors `src/` exactly |
| Route contracts | Vitest | `tests/contract/` |
| Schema and migrations | Vitest (schema and SQL read as text) | `tests/db/` |
| Integration | Vitest against the local database in Docker only | `tests/db/integration/` |
| End to end | Playwright, phone 390×844 and desktop 1440×900, axe on every page | `tests/e2e/` |

**Coverage 100%** (lines, branches, functions, statements) over `src/**`,
enforced in CI; pages and layouts are composition only and covered by E2E.

Must cover: public reads return only published content; drafts never leak;
enquiries, applications and CVs unreachable without the admin session; rate
limit and honeypot; Turnstile failure; CV type and size refusals; CV storage
and mail failure paths; publish and
revalidation; section rules (fixed, maxima); redirects (every old URL);
retention purge; lockout; redaction of personal data; reduced motion.

**The critical journey (E2E):** a family taps WhatsApp from Home; an
institution sends a quote; a nurse applies with a CV (mail caught by Mailpit);
the admin signs in, edits a service, previews, publishes, and the public page
changes.

## 35. CI/CD, environments and deployment

### 35.1 Environments

| | Where | Database |
|---|---|---|
| Local | `npm run dev` | MySQL 8.0 and Mailpit in Docker (`compose.yaml`, 563xx ports), as the server |
| CI | GitHub Actions | the same database as a service container |
| Production | the client's cPanel Node.js app | the cPanel database on the same server (D39) |

No staging (D21).

### 35.2 CI (every push to `main` and every pull request)

```text
checks: install → lint → format check → typecheck → unit tests
app:    the database service (every migration) → test:coverage (unit + integration, 100%)
        → build → E2E (phone + desktop, axe)
```

From Phase 7 also the performance budgets (§31).

### 35.3 Deploying to cPanel

- **A release deploys; a push does not** (as clinicdesk). Publishing a GitHub
  release `vX.Y.Z` (equal to `package.json`) re-runs CI on the tag and, only
  when it passes (D45), **builds on GitHub** (shared hosting has too little
  memory to build), checks the output (`scripts/check-deploy-output.mjs`: no
  source, source maps or env files), **uploads the standalone build over SSH
  with rsync** into a new release folder, **applies new migrations** to the
  server's database as the migration user, switches the app to the new
  folder, and restarts Passenger. The previous release folder stays for an
  instant rollback.
- **The media folder and the CV folder live outside the release folders**,
  so no deploy or rollback ever touches them.
- **Before the first deploy, the user backs up the old site** (its files, its
  admin panel and its database), gives the backup to the client, and clears
  the old site and its database from the server (D50, R0.9).
- The SSH key, host and paths are GitHub secrets. The app's runtime env is
  set in cPanel's Node.js app settings.
- `docs/RELEASE.md` (Phase 8) is the step-by-step guide.

### 35.4 Before code

**Every test passes locally first.** `npm run verify` runs what CI runs, in
order; a pre-push hook runs it (as clinicdesk, from Phase 7).

## 36. Observability

- Structured JSON logs (request id, redacted) to the app's log on cPanel.
- The `error_log` table takes the server's own failures (`captureError`),
  without personal data, kept 30 days.
- The `audit_log` keeps every admin change (who, what, when), kept a year.
- A failed mail, CV save or purge, and disk use near the quota (§21.2), are
  visible in the admin, not only in logs.

---

# Part IV — Delivery

## 37. Phases

| Phase | Name | Outcome |
|---|---|---|
| 0 | Groundwork | Plan and docs; the app scaffold; tooling; tests harness; local MySQL and Mailpit; CI; core library; the server checked; the current site backed up (after payment, D48) |
| 1 | Data and security | Every table (Drizzle, MySQL), admin sign-in (Better Auth), file storage, mail, seed content |
| 2 | Design system | "Follow the Line" built: tokens, type, pictograms, logo SVG, motion system, UI kit, site shell |
| 3 | Public pages | Every public page from published content; SEO; redirects; preview |
| 4 | Enquiries | Quote and Contact end to end, with the inbox |
| 5 | Careers | Jobs, applications with CVs kept privately and emailed, the inbox |
| 6 | Admin CMS | Editing, ordering, media, settings, publish, retention |
| 7 | Performance, accessibility and the finish | Budgets in CI; audits; Impeccable finish review; `DESIGN.md`; client approvals |
| 8 | Deploy and go-live (after full payment, D48) | The production database and folders on cPanel; the release workflow; mail DNS; keys; switch alhidaya.qa; v1.0.0 |

## 38. Tracker

**Status** is **TODO**, **DOING**, **DONE (date)**, **BLOCKED (reason)** or
**LATER (date)**. *Waits on* names the open question (§41) or prerequisite
(§40) the row needs; without an answer it is built on the question's default.
Rows are never deleted. Every row includes its tests (§34), its performance
numbers where it renders a page (§31) and its changelog entry, in the row's
one commit (D27).

### Phase 0 — Groundwork

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R0.1 | This plan; `PRODUCT.md`; the direction contract in the surface brief; `AGENTS.md`; `CLAUDE.md`; `changelog.md`; `README.md`; the archived draft | §2, D30, D36 | — | DONE (2026-10-28) |
| R0.2 | Next.js 16 app: TypeScript strict, Tailwind 4, React Compiler, `output: "standalone"`, ESLint, Prettier (120), Node 22 (`.nvmrc`, `engines`), `@/` and `@tests/` paths, `.gitignore`, npm scripts as clinicdesk | §23, §24 | — | DONE (2026-10-28) |
| R0.3 | Test harness: Vitest unit (jsdom) and integration (local-only guard) projects; coverage at 100%; Playwright (phone + desktop, local-only guard, axe); `check-test-paths.mjs`; `tests/support` | §34 | — | DONE (2026-10-28) |
| R0.4 | Local services: MySQL 8.0 and Mailpit in Docker (`compose.yaml`, 563xx ports); Drizzle config and db scripts; `.env.example`; env validation (`src/lib/env`) | §35.1 | — | DONE (2026-10-28; env validation with R0.6) |
| R0.5 | CI workflow (`checks` + `app`), MySQL 8.0 as a service container, npm 11, `npm audit` (high and above fails) | §35.2, D55 | GitHub repo (§40) for its first run | DONE (2026-10-28; first run waits for the GitHub remote) |
| R0.6 | Core library from clinicdesk: `AppError` + kinds + `fromDatabaseError`; logger with redaction; `lib/api` (handler, responses, client, params); `lib/query` | §29, §36 | — | DONE (2026-10-28; with env validation from R0.4; `params` arrives with the first route, R1.2, and `lib/query` with the admin screens, R6.2) |
| R0.7 | Constants skeleton (`messages`, `routes`, `limits`, `site`); validation primitives and text hygiene; phone (+974 and international) | §25 | — | DONE (2026-10-28; `redirects` arrives with R3.7, once the service slugs are approved) |
| R0.8 | The cPanel server checked over SSH, read-only: Node versions, memory and CPU limits, Passenger, disk, databases, mail routing, outbound SMTP and HTTPS, server location; findings recorded in §21.1 | §21, D19 | — | DONE (2026-10-28) |
| R0.9 | **The user** backs up the old site (`public_html`, the `alhidaya_hidaya` database), gives the backup to the client, then clears the old site and its database from the server | D50 | Full payment (D48) | TODO |

### Phase 1 — Data and security

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R1.1 | The Drizzle client and schema conventions (MySQL 8, `utf8mb4`, timestamps, ids); `0000_auth`: Better Auth's tables and the lockout table | §27, §28 | — | DONE (2026-10-28) |
| R1.2 | Admin sign-in with Better Auth: email and password, sign-up disabled, lockout, sign-out, password reset by email; the create-admin script; `proxy.ts`; `withAdminRoute` | §26.4 | — | DONE (2026-10-28) |
| R1.3 | `0001_logs`: `logActionSafe`, `captureError`, retention | §36 | — | DONE (2026-10-28) |
| R1.4 | `0003_content`: content tables with draft/published; published-only read functions; publish in one transaction | §27, §14 | Q29 | DONE (2026-10-29; the admin's routes over them arrive with its screens, R6) |
| R1.5 | `0004_enquiries`, `0005_applications`: submit in one transaction with the rate limit | §10, §9 | Q16 | DONE (2026-10-29; the forms' schemas, Turnstile and the honeypot come with the forms, R4.1, R4.2, R5.2) |
| R1.6 | File storage (`src/lib/storage`): the media folder (its `.htaccess`, generated names, `644`/`755`) and the private CV folder (readable sanitised names, `600`/`700`), paths from env, the budgets, the disk-use reading for the admin | §9.4, §15, §21.2, D54 | Q26 | DONE (2026-10-28; the media folder is served by Apache, Q26, as checked on the server at R8.2) |
| R1.7 | Mail interface (nodemailer, Mailpit locally), layout, templates | §17 | Q24 | DONE (2026-10-28; the password-reset email; the enquiry and application alerts come with their forms, R4.3 and R5.4) |
| R1.8 | Seed: the current site's content, rewritten as drafts for approval; 8 services; the current job | §8, §9.1, D6 | Q9 | DONE (2026-10-29; `npm run db:seed`, local only; the copy goes to the client at R3.1; how it reaches production is Q30) |
| R1.9 | Integration: public reads return only published rows; drafts, inboxes and CVs unreachable without the admin; admin-only writes; rate limit | §34 | — | DONE (2026-10-29; the inbox and CV routes do not exist yet: the route contract holds each to the session check as it arrives, R4.4, R5.3, R5.5) |

### Phase 2 — Design system ("Follow the Line")

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R2.1 | Type specimen page → **the user picks the face**; tokens (logo colours AA-checked, type scale, spacing, radii, motion); self-hosted fonts | §30.1, §30.2 | Q10 | DONE (2026-10-29; Atkinson Hyperlegible Next, D61; the error red, D63) |
| R2.2 | The logo as SVG (traced faithfully, or the client's vector); favicon and app icons | §30 | Q2 | DONE (2026-10-29; redrawn from the JPG, D62, for the client's approval at R7.5) |
| R2.3 | Pictogram set | §30.1 | Q12 | DONE (2026-10-29; 18 pictograms on a 24-unit grid, `src/assets/brand/pictograms.ts`; WhatsApp's own glyph is Q32) |
| R2.4 | Motion system: Lenis + GSAP ticker, ScrollTrigger lifecycle, `TheLine` (scrubbed draw, stations, the travelling marker), reveals, reduced-motion path | §30.4 | — | DONE (2026-10-29; tested on `/kit`, D64; its weight is Q34) |
| R2.5 | UI kit: sign panel, line row, station marker, buttons (primary, WhatsApp, call), arrow link, fields (text, select, radio, checkbox, file), notices, dialog, logo tile, image frame, skeletons | §30.3 | — | DONE (2026-10-29; shown on `/kit`) |
| R2.6 | Site shell: header sign bar, mobile menu, footer, skip link, "You are here", preview bar | §30.1 | — | DONE (2026-10-29; with the floating WhatsApp button, D67) |
| R2.7 | System pages: not found, error, global error, loading | §6.10 | — | DONE (2026-10-29; the public site has no route-level loading state: it would hide content without JavaScript and turn a 404 into a 200; the admin's come with it, R6) |
| R2.8 | `/impeccable audit` of the kit; screenshots checked by the user | §30 | — | DONE (2026-10-29; audit 19/20, its one finding answered by D68) |

### Phase 3 — Public pages

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R3.1 | Copy: every public text rewritten from real facts, sent to the client for approval | D6 | — | DONE (2026-10-29; written at R1.8; reviewed with the client at the user's demo and changed in the admin, D70; sign-off at R7.5) |
| R3.2 | Section components for the catalogue | §7.2 | — | DONE (2026-10-29; first seen on Home at R3.3) |
| R3.3 | Home, with the first viewport and the line | §6.1, §30.1 | Q41 | DONE (2026-10-29; its photos wait on Q41) |
| R3.4 | About; Services; a service | §6.2 – §6.4 | — | DONE (2026-10-29; photos wait on Q41) |
| R3.5 | Contact with the static map; Request a Quote page shell; Privacy; Terms | §6.7 – §6.9, §30.6 | Q18 | DONE (2026-10-29; the office's spot on the map waits on the client, D74) |
| R3.6 | Caching with tags; draft-mode preview | §22, §14 | — | TODO |
| R3.7 | SEO: metadata, OG images, JSON-LD, sitemap, robots; the 301 map | §19, §5.3 | Q9 | TODO |
| R3.8 | E2E + axe on every public page, phone and desktop; performance numbers recorded | §34, §31 | — | TODO |

### Phase 4 — Enquiries

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R4.1 | Quote and Contact forms: schemas, UI, success and error states | §10 | Q5, Q6 | TODO |
| R4.2 | Turnstile verification, honeypot, rate limit | §10.3 | — | TODO |
| R4.3 | Alert emails, failure logging, retry | §10.4, §17 | Q17 | TODO |
| R4.4 | Enquiries inbox: list, filters, detail, status, notes | §10.5 | — | TODO |
| R4.5 | Integration + E2E | §34 | — | TODO |

### Phase 5 — Careers

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R5.1 | Careers page, job page, closed and empty states, `JobPosting` | §6.5, §6.6 | — | TODO |
| R5.2 | Application form with CV (type by bytes, size); general application | §9.2 | Q4, Q7 | TODO |
| R5.3 | The CV folder in use: save under a random id, admin-only download, delete with the application | §9.4 | — | TODO |
| R5.4 | Submit: row, CV saved, HR email with the CV attached, failure paths and retry | §9.3 | — | TODO |
| R5.5 | Applications inbox | §9.5 | — | TODO |
| R5.6 | Integration + E2E (mail caught by Mailpit) | §34 | — | TODO |

### Phase 6 — Admin CMS

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R6.1 | `/impeccable shape` the admin (Operate) | §30.5 | — | TODO |
| R6.2 | Admin shell, sign-in screen, overview; `lib/query` (SWR reads and writes, from clinicdesk) | §16 | — | TODO |
| R6.3 | Pages: section list (show/hide, move, drag), section editors per type, preview, publish, discard | §7, §14 | Q19 | TODO |
| R6.4 | Services and jobs editors | §8, §9.1 | — | TODO |
| R6.5 | Clients and media library (upload pipeline, sizes, alt text, usage, delete) | §11, §15 | — | TODO |
| R6.6 | Settings: site content, navigation, footer, SEO, brochure | §12, §13 | — | TODO |
| R6.7 | Operations: recipients, retention (1 – 365), CV expiry (1 – 365), disk use; the daily purge job (cPanel cron) | §13, §18, §21.2, D52 | Q8 | TODO |
| R6.8 | Activity (audit trail) | §36 | — | TODO |
| R6.9 | E2E: edit → preview → publish → the public page changes | §34 | — | TODO |

### Phase 7 — Performance, accessibility and the finish

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R7.1 | Performance budgets in CI; fixes until every page meets them | §31 | — | TODO |
| R7.2 | Accessibility: axe everywhere plus a manual keyboard and screen-reader pass | §32 | — | TODO |
| R7.3 | Security review against OWASP ASVS level 2 (sign-in, sessions, uploads, file access, input, headers and CSP, secrets, logging); fixes; `npm run verify` and the pre-push hook | §26, §35.4, D55 | — | TODO |
| R7.4 | Impeccable finish review of the public site; fixes; `DESIGN.md` and `.impeccable/design.json` from the built world | §30.1 | — | TODO |
| R7.5 | Client sign-off: copy, images, logos, legal pages | D6, Q18 | Client (§40) | TODO |

### Phase 8 — Deploy and go-live

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R8.1 | The production MySQL database, created after the old one is cleared (D50), with two users (app: data rights; migrations: schema rights); migrations; the admin account; the media folder (with its `.htaccess`) and the CV folder (`700`) | D39, D49, D54, §21.1 | Full payment (D48), R0.9 | TODO |
| R8.2 | cPanel Node.js app (Node 22); env; the release workflow over SSH port 2200 with its own deploy key (build, check, rsync, migrate, switch, restart, rollback); the daily cron; `docs/RELEASE.md` | §35.3, §21.1 | Full payment (D48) | TODO |
| R8.3 | The sender mailbox (Q24); mail routing kept Remote; DKIM added in cPanel; DMARC `p=none` published; verified with sends to info@ and hr@ in Microsoft 365 | §17 | Full payment (D48) | TODO |
| R8.4 | Turnstile keys for alhidaya.qa; Cloudflare Web Analytics site | §10.3, §20 | — | TODO |
| R8.5 | Pre-switch check on the server; speed from Qatar; the Cloudflare-proxy decision | D25 | Q22 | TODO |
| R8.6 | Switch alhidaya.qa to the Node.js app; every 301 verified live; sitemap to Search Console; the old site's files removed from the server only after the backup is verified (§21.2) | D21, §19 | — | TODO |
| R8.7 | Smoke test; release `v1.0.0` | §35 | — | TODO |

## 39. Definition of shippable

V1 ships when: every tracker row up to R8.7 is DONE; coverage is 100%; E2E and
axe pass on phone and desktop; every page meets §31; the finish review's
verdict is *ship*; `DESIGN.md` exists; the client has approved the copy, images,
logos and legal pages; mail and Turnstile work in production; every old
URL answers with its 301; and no personal data appears in logs.

## 40. Prerequisites from the client

| Item | Needed by |
|---|---|
| ~~SSH access to the cPanel server~~ (done: port 2200, user `alhidaya`, key authorised, 2026-10-28) | R0.8 |
| **Full payment confirmed by the user** (D48) | R0.9 and every server step |
| **Urgent, today's site:** remove the public `.well-known.zip` and rotate the secrets it exposed; protect `upload/CV` (§40.1) | now, independent of the build |
| The old site backed up by the user, given to the client, and cleared from the server with its database (D50) | before R8.1 |
| The GitHub repository (created by the user) | R0.5's first CI run |
| Approval of the rewritten copy, at the user's demo (D70) | R7.5 |
| Client names and permission for their logos, and the logo files | before the Clients section shows (D7) |
| The brochure PDF (or approval to reuse `profile.pdf`) | R6.6 |
| The logo as a vector file, if they have one (Q2) | R2.2 |
| The `noreply@alhidaya.qa` mailbox's password, changed first (§40.1); cPanel access for the DKIM and DMARC records | R8.3 |
| A Cloudflare account (Turnstile, Web Analytics) | R4.2, R8.4 |

### 40.1 Found on today's site (R0.8), for the client to act on now

Found during the read-only check; **nothing was changed** (D48). Both concern
the current site, not the new build:

1. **`public_html/.well-known.zip` (82 MB) is publicly downloadable** at
   `https://alhidaya.qa/.well-known.zip` (HTTP 200, checked by headers only).
   It is a full copy of the old site from September 2023: 13,195 files,
   including **`application/.env`** (which normally holds the database
   password, the app key and mail passwords) and Laravel logs. **Recommended
   now:** move it out of `public_html` (or delete it once the backup exists),
   then **change every secret in that `.env`**: the database user's password,
   the mail account's password, `APP_KEY`, and any API keys.
2. **83 CVs (20 MB) are stored in `public_html/upload/CV`** with no access
   rule. Folder listing is off (404), but each file can be downloaded by anyone
   who knows or guesses its address. **Recommended now:** add a deny rule for
   that folder, and decide how long old CVs should be kept.

## 41. Open questions

Each carries the **default** built if no answer arrives before its row starts.

| Q | Question | Default |
|---|---|---|
| Q1 | ~~Is the CV Google account Workspace or personal Gmail?~~ | **Answered by D41:** no Google Drive. |
| Q2 | ~~Does the client have the logo as a vector (SVG/AI/EPS/PDF)?~~ | **Answered by D62:** no; it is redrawn as SVG from the JPG, for the client to approve. |
| Q3 | Reuse the current `profile.pdf` as the brochure? | Yes, until the admin uploads a new one. |
| Q4 | CV rules | PDF, DOC or DOCX; at most 5 MB (size limits confirmed, D52). |
| Q5 | Quote form fields | As §10.1. |
| Q6 | Contact form fields | As §10.2. |
| Q7 | Keep a general application (no job), like today's "Submit your resume"? | Yes, at `/careers/apply`. |
| Q8 | Retention and CV expiry before the admin sets them | 180 days each. |
| Q9 | Service names, slugs, order and "what's included" | The current eight, renamed in plain English during the copy rewrite, in the current order; "included" items only where the client confirms them. |
| Q10 | ~~Typeface~~ | **Answered by D61:** Atkinson Hyperlegible Next, with Noto Sans Arabic. |
| Q11 | Stock photo source | Unsplash and Pexels (free licences), each image's source recorded. |
| Q12 | Pictograms | Drawn for this site in the system's line weight (built in R2.3). |
| Q13 | Dependency majors | clinicdesk's (D38). |
| Q14 | WhatsApp prefilled message | "Hello Al Hidaya, I would like to ask about nursing care." |
| Q15 | CSV export of enquiries and applications | Later. |
| Q16 | Rate limit | 5 submissions per form per 10 minutes per visitor. |
| Q17 | Who receives which email | Quote and Contact → `info@alhidaya.qa`; applications → `hr@alhidaya.qa`; both editable in Operations. |
| Q18 | Legal review of Privacy and Terms | Drafted from what the site actually does; the client reviews before launch. |
| Q19 | Publish per item, or one "publish all"? | Per item, with an overview of unpublished changes. |
| Q20 | ~~Where the daily purge job runs~~ | **Answered by D39:** a cPanel cron job. |
| Q21 | Store content per locale now (`{ "en": … }`)? | Yes (§33). |
| Q22 | Pre-switch check under a hidden temporary subdomain on the server (not a public staging site)? | Yes. |
| Q23 | ~~A floating WhatsApp button on every page, as today?~~ | **Answered by D67:** yes, and the admin can turn it off. |
| Q24 | ~~Send from the existing `noreply@alhidaya.qa`?~~ | **Answered by D53:** yes. |
| Q25 | ~~Upgrade the HostCarts plan?~~ | **Answered by D51:** no; build within §21.2's budget. |
| Q26 | How uploaded images are served | From a media folder inside `public_html` that no release touches, served by Apache (§21.3); verified on the server at R8.2. |
| Q27 | ~~What happens to the old site's 83 CVs and its database?~~ | **Answered by D50:** they go with the user's backup to the client and are cleared from the server; nothing is imported. |
| Q28 | Reuse the old site's service photos (`upload/Services`)? | Only where they are good enough for the new design; otherwise licensed stock (D8). |
| Q29 | Content in two tables (`documents` and `records`), or a table per kind (services, jobs, clients, the site)? | Two tables (D60): one draft-and-publish mechanism everywhere, each kind's rules in its own schema; the database still checks every key and collection. |
| Q30 | How does the approved copy reach the production database? | The seed (`npm run db:seed`, local only today) runs once against the empty production database at R8.1, with the user's go-ahead, after the client approves the copy (R3.1, R7.5); it writes drafts, and the admin publishes them. |
| Q31 | ~~May form errors use a red, the one colour outside the logo's (D35)?~~ | **Answered by D63:** yes, for errors only. |
| Q32 | ~~Show WhatsApp's own logo on WhatsApp actions?~~ | **Answered by D66:** the site's chat pictogram and the word *WhatsApp*. |
| Q33 | ~~Keep the kit preview page (`/kit`, D64), local and test only?~~ | **Answered:** yes, local and test only (D64). |
| Q34 | ~~Motion's weight against the JavaScript budget (§31: ≤ 170 KB, motion included). Measured at R2.4: 133.5 KB at first paint (Next.js and React) + 51.7 KB of motion after paint (GSAP 26.7, ScrollTrigger 17.1, Lenis 5.3) = 185 KB before any page content.~~ | **Answered by D65:** motion is counted outside the first-load budget. |
| Q35 | ~~The sign's "You are here" marker sits above the headline, which Impeccable's audit flags as a kicker. Keep it there, or move it?~~ | **Answered by D68:** (b), moved to where the three lines start; each headline stands alone. |
| Q36 | ~~On a phone, "You are here" can show twice in the first screen (the progress line and where the three lines start). Keep both, or hide the progress line while the lines are on screen?~~ | **Answered by D69:** keep both. |
| Q37 | ~~How the copy goes to the client for approval (R3.1)~~ | **Answered by D70:** reviewed at the user's demo; changes are made in the admin. |
| Q38 | ~~The three lines' names on Home: edited by the admin, or fixed in code?~~ | **Answered by D71:** fixed in code. |
| Q39 | ~~How many open jobs Home's careers section shows~~ | **Answered by D72:** the three most recent, then a link to all. |
| Q40 | Uploaded images as a `<picture>` from their made sizes, or through a custom `next/image` loader? | A `<picture>` (D73): AVIF with a WebP fallback, at every made width, and no script. |
| Q41 | Home's sign, its introduction and the staffing section have a place for a photo, and there are none yet: the media library that makes their sizes is R6.5. Choose the licensed stock photos now (Q11) and bring forward only the step that makes an image's sizes, so the demo shows them? | Yes: a handful of licensed stock photos, each source and licence recorded, imported by the seed through the same sizing step the admin's uploads will use; the admin's media screens stay at R6.5. |

## 42. Later (unscheduled)

- **Arabic** content, `/ar` routes, RTL QA and launch (D3).
- The client's **own photography** replacing stock (D8).
- **Testimonials**, **figures** and a **licence number**, once real ones are
  supplied (D7).
- CSV export (Q15); auto-reply emails (D16); more than one admin or roles
  (D14); a Cloudflare proxy if not taken at go-live (D25).

## 43. Changes from the initial draft

The initial draft (`docs/planning/2026-10-28-initial-draft.md`) described a
generic healthcare **Website Studio** CMS. This plan replaces it for Al
Hidaya:

- **Admin scope cut to a Content CMS** (D11, D12): no page builder, section
  library, theme studio, presets, typography controls or form builder; the
  section show/hide/reorder idea is kept (§7).
- **Hosting moved from a Cloudflare Pages static export to the client's
  cPanel as a Node.js app** (D19); rendering, caching and deployment rewritten
  for it (§21, §22, §35). The draft's static-export caveats no longer apply.
- **Supabase replaced by the client's own server** (D39, D49): MySQL 8.0 on
  their cPanel, Drizzle ORM (D42), Better Auth (D43), images and CVs as files
  on the server (D40, D41), a cPanel cron job; shaped by the server check
  (§21.1). Nothing is deployed until full payment (D48).
- **Careers:** applications on the site with CVs kept privately on the server
  and emailed to HR (D13, D41), instead of external Google Form links.
- **Forms:** two fixed forms (D15) instead of a form builder.
- **Colours** come from the logo (sky blue, deep blue, leaf green) instead of
  the draft's navy-and-teal palette (§30.2), and the design direction is
  "Follow the Line" (D36).
- Added: the decision log, Arabic readiness (§33), SEO and redirects (§19,
  §5.3), retention (§18), the motion system and performance budgets (§30.4,
  §31), testing at 100% (§34), phases and tracker (§37, §38), open questions
  (§41).
- Removed: the draft's illustrative prototype images (they were never in the
  repository).
