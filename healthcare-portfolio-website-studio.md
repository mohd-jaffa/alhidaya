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
password (D33). They edit content, publish, read and work through enquiries and
applications, connect the Drive folder, and set retention. Never a developer.

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
- CVs to Google Drive and attached to the HR email; automatic retention.
- The admin Content CMS (D11) with draft, preview and publish (D32).
- SEO: metadata, Open Graph images, structured data, sitemap, robots, and 301s
  from every old URL.
- Cloudflare Web Analytics.
- Deployment to the client's cPanel through GitHub Actions; hosted Supabase.

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
SEO, brochure), `/admin/settings/operations` (recipients, retention, Google
Drive), `/admin/activity`. Never indexed (`noindex`, disallowed in robots).

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

1. **The sign** (fixed, first): "You are here", the headline, the
   supporting line, and **the three lines**: *Care at home* (WhatsApp, Call),
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
7. **Careers**: the nurse's line, the latest open jobs, Apply.
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
where it goes (Supabase, the client's mail, Google Drive, Cloudflare), and for
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
| `SIGN` | eyebrow, headline, supporting line, photo, and for Home the three lines | every page (fixed, first) |
| `INTRO` | heading, rich text, optional photo | Home, About |
| `SERVICES_INDEX` | heading, intro; shows every published service, in order | Home, Services |
| `VALUES` | heading, up to six items (title, line) | Home, About |
| `MISSION` | mission, vision | About |
| `INSTITUTIONS` | heading, text, photo; ends on Request a Quote | Home, Services |
| `CLIENTS` | heading; shows every published client logo, in order | Home, About |
| `CAREERS_BAND` | heading, text; shows the latest open jobs | Home |
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
2. The **application row** is written in Supabase (no file).
3. **The CV is uploaded to the connected Google Drive folder** (D23), named
   `<date> <job> <name>.<ext>`; its Drive file id is stored on the row.
4. **The HR email** goes to the applications recipient (default
   `hr@alhidaya.qa`) with the details and **the CV attached** (D23).
5. The applicant sees a confirmation. They never see an internal error: if
   Drive or mail fails, the application is still saved, the failure is
   logged, and the admin inbox shows the CV as **not stored** or the email
   as **not sent**, with a Retry.
6. The CV is held in memory only for the request. It is **never written to
   the server's disk** or to Supabase Storage.

### 9.4 Connecting Google Drive (admin)

`/admin/settings/operations` → **Connect Google Drive**: Google's consent screen
with the narrowest scope (`drive.file`, which only reaches files the app
creates), then the admin picks or creates the folder. The refresh token is
**encrypted at rest** (AES-256-GCM, `TOKEN_ENCRYPTION_KEY`) and never sent to the
browser. The screen shows the connected account, the folder, the last
successful upload, and **Disconnect**. Works with a Workspace or a personal
Google account (Q1); with a personal account the Google Cloud OAuth app must be
in **production** status, or Google expires the connection every 7 days.

### 9.5 The applications inbox

List (newest first; filter by job and status; search by name, email, phone),
detail (every field as submitted, the job, **Open CV in Drive**, the email and
Drive status with Retry), status (`NEW`, `IN_REVIEW`, `SHORTLISTED`,
`CLOSED`), internal notes. Deleting an application deletes its Drive file.

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
link, "available 24/7" line); social links (Instagram today); header navigation
(labels, order, visibility, from a fixed set of destinations: pages, services,
approved external URLs); footer columns; SEO defaults; the brochure.

**Operations** (take effect on save, audited): the enquiries recipient(s),
the applications recipient(s), **retention days (1 – 365, D24)**, and the Google
Drive connection (§9.4).

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
  without the admin session (RLS, §26).
- States shown in the admin: *Saved*, *Unsaved changes*, *Draft*, *Publishing*,
  *Published*, *Publish failed*. A failed publish keeps the draft intact.

## 15. Media

- **Public images** (photos, client logos) are uploaded by the admin to a
  public Supabase Storage bucket, `site-media`. At upload the server checks the
  type by first bytes (JPEG, PNG, WebP, AVIF; SVG is refused), the size (at most
  10 MB), strips metadata, and **makes the responsive sizes once** with sharp
  (AVIF and WebP at fixed widths), so the cPanel server never resizes images
  per request (§22.3).
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
| Overview | New enquiries and applications; items with unpublished changes; Drive status; quick links. |
| Pages | Each page's sections: show/hide, move up/down and drag to reorder, edit, preview, publish, discard. |
| Services | List, order, create, edit, preview, publish, archive. |
| Jobs | List by status, create, edit, close, publish, archive. |
| Clients | Logos: add, order, publish. |
| Media | Upload, alt text, search, usage, delete. |
| Enquiries | §10.5. |
| Applications | §9.5. |
| Settings | Site content (§13), brochure. |
| Operations | Recipients, retention, Google Drive. |
| Activity | The audit trail of admin changes. |

Irreversible actions ask first: publish, delete or archive a record, delete an
enquiry or application, disconnect Drive, change retention.

## 17. Email

- Sent by the app through the client's cPanel mail over SMTP (D17), from
  `no-reply@alhidaya.qa` (D37), behind one mail interface (`src/lib/mail`) so
  the provider is an env change only. Locally: Mailpit, started with the local
  Supabase.
- **Messages:** new enquiry → enquiries recipient; new application (CV
  attached) → applications recipient; admin password reset → the admin.
- Reply-To is the visitor's email, so the team answers from their own inbox.
- SPF, DKIM and DMARC for alhidaya.qa are verified before launch (R8.3).
- A failed send never undoes what it was for; it is logged and retryable.

## 18. Retention and privacy

- **The retention period** (D24) is set by the admin, 1 – 365 days (Q8 default
  180 until set).
- A **daily job** deletes enquiries and applications older than the period,
  their notes, and their CVs in Drive. It runs from the database's scheduler
  (pg_cron + pg_net) calling `POST /api/cron/retention` with `CRON_SECRET`, as
  clinicdesk does (Q20). A Drive file that cannot be deleted is retried next day
  and shown in the admin.
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
alhidaya.qa ──► the client's cPanel server
                 └─ Node.js app (Phusion Passenger) running Next.js 16 "standalone"
                     ├─ public pages: pre-rendered, cached on disk, revalidated on publish
                     ├─ admin panel and REST route handlers (/api/*)
                     ├─ ──► Supabase (PostgreSQL + Auth + Storage), region nearest Qatar
                     ├─ ──► cPanel mail (SMTP, no-reply@alhidaya.qa)
                     ├─ ──► Google Drive API (CVs)
                     └─ ──► Cloudflare Turnstile (server-side verification)
Browser ──► Cloudflare Web Analytics beacon · Turnstile widget · Supabase Storage images
Supabase pg_cron ──► POST /api/cron/retention (daily)
GitHub Actions ──► build ──► rsync over SSH ──► restart the Node app
```

- **No worker, queue, Redis or Edge Function.** Work happens in the request;
  the one timed job uses the database's scheduler.
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
served by a custom `next/image` loader that picks the right pre-made width
straight from Supabase Storage. Images that ship with the code (pictograms,
the map, brand marks) are SVG or pre-made at build.

### 22.4 Fonts

Self-hosted with `next/font/local` (no third-party font requests), variable
WOFF2, subset, with metric-matched fallbacks so text never shifts on load.

## 23. Technology stack

| Layer | Choice | Version at Phase 0 |
|---|---|---|
| Runtime | Node.js 22 (`.nvmrc`, `engines`); the server must offer ≥ 20.9 (R0.8) | 22.x |
| Framework | Next.js (App Router, React Compiler, `output: "standalone"`) | 16.4 |
| UI | React | 19.3 |
| Language | TypeScript, strict (D38) | 5.9 |
| Styling | Tailwind CSS with design tokens in `src/app/globals.css` | 4.3 |
| Motion | GSAP + ScrollTrigger (+ `@gsap/react`), Lenis (D29) | 3.15 / 1.3 |
| Forms | React Hook Form + Zod | 7.x / 4.x |
| Data | Supabase JS (Postgres, Auth, Storage), RLS | 2.x |
| Client reads (admin) | SWR, as clinicdesk | 2.x |
| Email | Nodemailer over SMTP | 10.x |
| Drive | `@googleapis/drive` | 27.x |
| Images | sharp (at upload only) | 0.35 |
| Bot check | Cloudflare Turnstile | — |
| Analytics | Cloudflare Web Analytics | — |
| Tests | Vitest + Testing Library; Playwright + axe | 4.x / 1.6x |
| Lint/format | ESLint (next config) / Prettier, 120 columns | 9.x / 3.9 |
| Database tooling | Supabase CLI, local stack in Docker | 2.109 |

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
├── features/
│   ├── auth/                 # the admin session, sign-in, lockout, password reset
│   ├── content/              # pages and sections: read, edit, publish, preview
│   ├── services/
│   ├── careers/              # jobs and applications
│   ├── enquiries/            # Quote and Contact
│   ├── clients/              # client logos
│   ├── media/                # uploads, sizes, usage
│   ├── settings/             # site content, operations, Drive connection
│   └── activity/             # the audit trail screen
│       (each: api.ts · api.client.ts · components/ · hooks/ · types.ts)
├── hooks/                    # shared hooks
├── lib/                      # api, audit, crypto, env, errors, files, google-drive, mail,
│                             # motion, query, rate-limit, seo, supabase, text, turnstile, validation
├── proxy.ts                  # the /admin signed-in gate (not authorization)
└── instrumentation.ts        # server errors to the error log
supabase/                     # config.toml (local, 563xx ports), migrations/, seed.sql
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

### 26.1 Row-level security

- **RLS on every table**, no exceptions. `anon` has **no** direct table
  access.
- **Public reads** go through `published_*` views or `security definer`
  functions that return only published, visible rows. Drafts are never
  reachable without the admin.
- **Public writes** (enquiries, applications) go only through route
  handlers, which verify Turnstile and then call `security definer` functions
  that enforce the rate limit and the `CHECK`s. There is no public insert
  policy on any table.
- **Admin access:** `is_admin()` (the caller's `auth.uid()` is in `admins`),
  called as `(select public.is_admin())` in policies.
- The **service role** is used only by server code for work no person does as
  themselves (the retention job, writing audit and error rows), never to act
  for the admin.

### 26.2 Secrets

Only on the server, validated at start (`src/lib/env/server.ts`), documented
in `.env.example`, never committed: the Supabase service-role key, SMTP
credentials, the Turnstile secret, the Google OAuth client secret,
`TOKEN_ENCRYPTION_KEY`, `IP_HASH_SECRET`, `CRON_SECRET`. On cPanel they are
set in the Node.js app's environment, never in a file inside `public_html`.

### 26.3 Headers

HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
frame-ancestors `none`, and a Content-Security-Policy allowing only the app,
Supabase, Turnstile and the analytics beacon; the CSP form that keeps public
pages statically cached is settled in R7.3.

### 26.4 Admin sign-in

Supabase Auth email and password; the session in **HttpOnly cookies** set by
the server, never in `localStorage` (as clinicdesk). Sign-up is disabled; the
one admin is created by a script at setup. **Lockout:** 5 failed attempts for an
email or a hashed IP lock sign-in for 15 minutes (constants). Password reset by
an emailed link.

### 26.5 Uploads

Typed by first bytes, never by the browser's word; bounded in size; images
re-encoded (which strips anything hidden in them); SVG refused; filenames
never trusted; storage paths never shown.

## 27. Data model

Every table: `id uuid` primary key, `created_at`, `updated_at` (trigger),
`created_by`/`updated_by` where a person edits it. Content fields that the
admin edits live in `draft` and `published` JSONB, validated by the type's Zod
schema on write and by `CHECK`s on their required keys; the columns a query
filters or orders on are real columns.

| Table | Purpose |
|---|---|
| `admins` | the admin's `auth.users` id and email (D14) |
| `pages` | the fixed pages: key, slug, SEO draft/published, `published_at` |
| `page_sections` | page, type, sort order, visible, fixed, `draft` and `published` content |
| `services` | §8: slug, audience, status, sort order, draft/published, `previous_slugs` |
| `jobs` | §9.1: slug, status, closing date, draft/published |
| `clients` | §11: status, sort order, draft/published (name, media, alt, url) |
| `media` | §15: path, type, bytes, size, alt, the made sizes |
| `site_content` | §13 site content: one row, draft/published |
| `site_operations` | §13 operations: one row: recipients, retention days, Drive connection (token encrypted) |
| `enquiries` | §10: form, status, fields as submitted (labels and values), name/email/phone for search |
| `enquiry_notes` | internal notes |
| `applications` | §9: job (or none), job title as applied, fields, CV name/size, Drive file id, email and Drive status |
| `application_notes` | internal notes |
| `rate_limits` | hashed key, form, window start, count |
| `sign_in_attempts` | hashed email/IP, count, locked until |
| `audit_log` | admin changes: action, entity, before/after for non-personal fields, actor |
| `error_log` | server failures (no personal data), with a retention |

Storage: `site-media` (public read, admin write). No bucket for CVs (D23).

## 28. Migrations

`supabase/migrations/NNNN_snake_name.sql`, sequential, never edited once
released; each with a DB contract test.

| # | Migration |
|---|---|
| 0001 | `foundation`: extensions, `updated_at` trigger, text hygiene helpers |
| 0002 | `admins`: `admins`, `is_admin()`, the lockout table, `anon` locked out |
| 0003 | `logs`: `audit_log`, `error_log`, their retention |
| 0004 | `media`: the table, the `site-media` bucket and its policies |
| 0005 | `site`: `site_content`, `site_operations`, publish functions |
| 0006 | `pages`: `pages`, `page_sections`, the section-type `CHECK`, `publish_page()` |
| 0007 | `services` |
| 0008 | `jobs` |
| 0009 | `clients` |
| 0010 | `enquiries`: tables, `submit_enquiry()` with the rate limit |
| 0011 | `applications`: tables, `submit_application()` with the rate limit |
| 0012 | `retention`: `purge_expired()`, the pg_cron schedule (address and secret in Vault) |

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
| `/api/admin/session` | sign in, sign out, refresh, forgotten and reset password |
| `/api/admin/pages/[key]` (+ `/sections`, `/publish`, `/discard`) | pages |
| `/api/admin/services` (+ `[id]`, `/publish`, `/order`) | services |
| `/api/admin/jobs` (+ `[id]`, `/publish`) | jobs |
| `/api/admin/clients` (+ `[id]`, `/publish`, `/order`) | client logos |
| `/api/admin/media` (+ `[id]`) | upload, list, alt text, delete |
| `/api/admin/enquiries` (+ `[id]`, `/notes`, `/retry-mail`) | the inbox |
| `/api/admin/applications` (+ `[id]`, `/notes`, `/retry`) | the inbox |
| `/api/admin/site` (+ `/publish`), `/api/admin/operations` | settings |
| `/api/admin/drive/connect`, `/callback`, `/disconnect` | Google Drive |
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
- **Type:** one highly legible signage sans with an Arabic companion,
  chosen by the user from a specimen page (R2.1, Q10); large, confident sizes
  like real signage; tabular figures.
- **Pictograms:** one consistent set in the line weight of the system, in the
  manner of hospital symbol systems (Q12).
- **Sign grammar:** "You are here" markers, station dots, arrows, panel
  edges coloured by line, generous signage spacing; every sign keeps a slot
  for its Arabic line (§33).
- **Photography:** licensed stock framed as panels within the sign system
  (D8), never full-bleed decoration.

**First viewport (Home).** A large deep-blue sign panel: a "You are here"
marker, the headline (e.g. *Nursing care, at your doorstep*, final copy per
D6), the supporting line, and a care photograph in a panel beside it on
desktop. Beneath, **the three lines** run across the width, each a coloured
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

- **Logo colours** (sampled from the logo file; exact values are set and
  contrast-checked in R2.1): sky blue ≈ `#33A0DA`, deep blue ≈ `#0F64AC`,
  leaf green ≈ `#86AE3C`, with a navy ink derived from the deep blue.
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
  (`useGSAP` scope); Lenis resets on navigation; no leaked listeners.
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
No map scripts, no cookies.

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
| JavaScript per public route (gzip, first load) | ≤ 170 KB, motion included |
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
- **The chosen typeface has an Arabic companion** (Q10).
- Routes ready for an `/ar` segment without changing English URLs (D4).

## 34. Testing and coverage

As clinicdesk (D26, `AGENTS.md` §31):

| Layer | Tool | Where |
|---|---|---|
| Unit | Vitest + Testing Library (jsdom) | `tests/unit/` mirrors `src/` exactly |
| Route contracts | Vitest | `tests/contract/` |
| Migrations | Vitest (SQL read as text) | `tests/db/` |
| Integration | Vitest against the local Supabase only | `tests/db/integration/` |
| End to end | Playwright, phone 390×844 and desktop 1440×900, axe on every page | `tests/e2e/` |

**Coverage 100%** (lines, branches, functions, statements) over `src/**`,
enforced in CI; pages and layouts are composition only and covered by E2E.

Must cover: anon sees only published content; drafts never leak; enquiries
and applications unreadable by anon; rate limit and honeypot; Turnstile
failure; CV type and size refusals; Drive and mail failure paths; publish and
revalidation; section rules (fixed, maxima); redirects (every old URL);
retention purge; lockout; redaction of personal data; reduced motion.

**The critical journey (E2E):** a family taps WhatsApp from Home; an
institution sends a quote; a nurse applies with a CV (Drive and mail mocked);
the admin signs in, edits a service, previews, publishes, and the public page
changes.

## 35. CI/CD, environments and deployment

### 35.1 Environments

| | Where | Database |
|---|---|---|
| Local | `npm run dev` | local Supabase in Docker (563xx ports, beside clinicdesk's 553xx) |
| CI | GitHub Actions | local Supabase in the runner |
| Production | the client's cPanel Node.js app | hosted Supabase, nearest Qatar (D20) |

No staging (D21).

### 35.2 CI (every push to `main` and every pull request)

```text
checks: install → lint → format check → typecheck → unit tests
app:    local Supabase (every migration) → test:coverage (unit + integration, 100%)
        → build → E2E (phone + desktop, axe)
```

From Phase 7 also the performance budgets (§31).

### 35.3 Deploying to cPanel

- **A release deploys; a push does not** (as clinicdesk). Publishing a GitHub
  release `vX.Y.Z` (equal to `package.json`) re-runs CI on the tag, applies new
  migrations to the hosted Supabase, **builds on GitHub** (shared hosting has
  too little memory to build), checks the output (`scripts/check-deploy-output.mjs`:
  no source, source maps or env files), **uploads the standalone build over
  SSH with rsync** into a new release folder, switches the app to it, and
  restarts Passenger. The previous release folder stays for an instant rollback.
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
- A failed mail, Drive upload or purge is visible in the admin, not only in
  logs.

---

# Part IV — Delivery

## 37. Phases

| Phase | Name | Outcome |
|---|---|---|
| 0 | Groundwork | Plan and docs; the app scaffold; tooling; tests harness; local Supabase; CI; core library; the server checked |
| 1 | Data and security | Every table, RLS, the admin session, mail, seed content |
| 2 | Design system | "Follow the Line" built: tokens, type, pictograms, logo SVG, motion system, UI kit, site shell |
| 3 | Public pages | Every public page from published content; SEO; redirects; preview |
| 4 | Enquiries | Quote and Contact end to end, with the inbox |
| 5 | Careers | Jobs, applications with CVs to Drive and email, the inbox |
| 6 | Admin CMS | Editing, ordering, media, settings, publish, retention |
| 7 | Performance, accessibility and the finish | Budgets in CI; audits; Impeccable finish review; `DESIGN.md`; client approvals |
| 8 | Deploy and go-live | Hosted Supabase; cPanel; mail DNS; keys; switch alhidaya.qa; v1.0.0 |

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
| R0.3 | Test harness: Vitest unit (jsdom) and integration (local-only guard) projects; coverage at 100%; Playwright (phone + desktop, local-only guard, axe); `check-test-paths.mjs`; `tests/support` | §34 | — | TODO |
| R0.4 | Local Supabase on 563xx ports: `config.toml`, empty `seed.sql`, db scripts; `.env.example`; env validation (`src/lib/env`) | §35.1 | — | TODO |
| R0.5 | CI workflow (`checks` + `app`), Supabase CLI pinned | §35.2 | GitHub repo (§40) for its first run | TODO |
| R0.6 | Core library from clinicdesk: `AppError` + kinds + `fromSupabaseError`; logger with redaction; `lib/api` (handler, responses, client, params); `lib/query` | §29, §36 | — | TODO |
| R0.7 | Constants skeleton (`messages`, `routes`, `limits`, `site`); validation primitives and text hygiene; phone (+974 and international) | §25 | — | TODO |
| R0.8 | The cPanel server checked over SSH: Node versions, memory and CPU limits, Passenger, disk, outbound SMTP and HTTPS, server location; findings recorded here | §21, D19 | SSH access (§40) | TODO |

### Phase 1 — Data and security

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R1.1 | `0001_foundation` | §28 | — | TODO |
| R1.2 | `0002_admins`: `is_admin()`, lockout table, `anon` locked out; the create-admin script | §26 | — | TODO |
| R1.3 | `0003_logs`: `logActionSafe`, `captureError`, retention | §36 | — | TODO |
| R1.4 | `0004_media` – `0009_clients`: content tables with draft/published, publish functions, `published_*` views, RLS | §27, §14 | — | TODO |
| R1.5 | `0010_enquiries`, `0011_applications`: submit functions with rate limit | §10, §9 | Q16 | TODO |
| R1.6 | Admin session: cookies, sign-in, lockout, refresh, sign-out, password reset; `proxy.ts`; `withAdminRoute` | §26.4 | — | TODO |
| R1.7 | Mail interface (nodemailer, Mailpit locally), layout, templates | §17 | — | TODO |
| R1.8 | Seed: the current site's content, rewritten as drafts for approval; 8 services; the current job | §8, §9.1, D6 | Q9 | TODO |
| R1.9 | Integration: anon reads only published; drafts and inboxes unreachable; admin-only writes; rate limit | §34 | — | TODO |

### Phase 2 — Design system ("Follow the Line")

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R2.1 | Type specimen page → **the user picks the face**; tokens (logo colours AA-checked, type scale, spacing, radii, motion); self-hosted fonts | §30.1, §30.2 | Q10 | TODO |
| R2.2 | The logo as SVG (traced faithfully, or the client's vector); favicon and app icons | §30 | Q2 | TODO |
| R2.3 | Pictogram set | §30.1 | Q12 | TODO |
| R2.4 | Motion system: Lenis + GSAP ticker, ScrollTrigger lifecycle, `TheLine` (scrubbed draw, stations, the travelling marker), reveals, reduced-motion path | §30.4 | — | TODO |
| R2.5 | UI kit: sign panel, line row, station marker, buttons (primary, WhatsApp, call), arrow link, fields (text, select, radio, checkbox, file), notices, dialog, logo tile, image frame, skeletons | §30.3 | — | TODO |
| R2.6 | Site shell: header sign bar, mobile menu, footer, skip link, "You are here", preview bar | §30.1 | — | TODO |
| R2.7 | System pages: not found, error, global error, loading | §6.10 | — | TODO |
| R2.8 | `/impeccable audit` of the kit; screenshots checked by the user | §30 | — | TODO |

### Phase 3 — Public pages

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R3.1 | Copy: every public text rewritten from real facts, sent to the client for approval | D6 | Client approval (§40) | TODO |
| R3.2 | Section components for the catalogue | §7.2 | — | TODO |
| R3.3 | Home, with the first viewport and the line | §6.1, §30.1 | — | TODO |
| R3.4 | About; Services; a service | §6.2 – §6.4 | — | TODO |
| R3.5 | Contact with the static map; Request a Quote page shell; Privacy; Terms | §6.7 – §6.9, §30.6 | Q18 | TODO |
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
| R5.3 | Google Drive connection in Operations (OAuth `drive.file`, folder, encrypted token, status, disconnect) | §9.4 | Q1 | TODO |
| R5.4 | Submit: row, Drive upload, HR email with the CV attached, failure paths and retry | §9.3 | — | TODO |
| R5.5 | Applications inbox | §9.5 | — | TODO |
| R5.6 | Integration + E2E (Drive and mail mocked) | §34 | — | TODO |

### Phase 6 — Admin CMS

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R6.1 | `/impeccable shape` the admin (Operate) | §30.5 | — | TODO |
| R6.2 | Admin shell, sign-in screen, overview | §16 | — | TODO |
| R6.3 | Pages: section list (show/hide, move, drag), section editors per type, preview, publish, discard | §7, §14 | Q19 | TODO |
| R6.4 | Services and jobs editors | §8, §9.1 | — | TODO |
| R6.5 | Clients and media library (upload pipeline, sizes, alt text, usage, delete) | §11, §15 | — | TODO |
| R6.6 | Settings: site content, navigation, footer, SEO, brochure | §12, §13 | — | TODO |
| R6.7 | Operations: recipients, retention (1 – 365); the daily purge job | §13, §18 | Q8, Q20 | TODO |
| R6.8 | Activity (audit trail) | §36 | — | TODO |
| R6.9 | E2E: edit → preview → publish → the public page changes | §34 | — | TODO |

### Phase 7 — Performance, accessibility and the finish

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R7.1 | Performance budgets in CI; fixes until every page meets them | §31 | — | TODO |
| R7.2 | Accessibility: axe everywhere plus a manual keyboard and screen-reader pass | §32 | — | TODO |
| R7.3 | Security headers and CSP; dependency audit; `npm run verify` and the pre-push hook | §26.3, §35.4 | — | TODO |
| R7.4 | Impeccable finish review of the public site; fixes; `DESIGN.md` and `.impeccable/design.json` from the built world | §30.1 | — | TODO |
| R7.5 | Client sign-off: copy, images, logos, legal pages | D6, Q18 | Client (§40) | TODO |

### Phase 8 — Deploy and go-live

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R8.1 | Hosted Supabase (region with the user), migrations, the admin account | D20 | — | TODO |
| R8.2 | cPanel Node.js app; env; the release workflow (build, check, rsync, switch, restart, rollback); `docs/RELEASE.md` | §35.3 | R0.8 | TODO |
| R8.3 | `no-reply@` mailbox; SPF, DKIM, DMARC verified; test sends | §17, D37 | Client DNS access (§40) | TODO |
| R8.4 | Google OAuth app in production; Turnstile keys for alhidaya.qa; Cloudflare Web Analytics site | §9.4, §10.3, §20 | — | TODO |
| R8.5 | Pre-switch check on the server; speed from Qatar; the Cloudflare-proxy decision | D25 | Q22 | TODO |
| R8.6 | Switch alhidaya.qa; every 301 verified live; sitemap to Search Console | D21, §19 | — | TODO |
| R8.7 | Smoke test; release `v1.0.0` | §35 | — | TODO |

## 39. Definition of shippable

V1 ships when: every tracker row up to R8.7 is DONE; coverage is 100%; E2E and
axe pass on phone and desktop; every page meets §31; the finish review's
verdict is *ship*; `DESIGN.md` exists; the client has approved the copy, images,
logos and legal pages; mail, Drive and Turnstile work in production; every old
URL answers with its 301; and no personal data appears in logs.

## 40. Prerequisites from the client

| Item | Needed by |
|---|---|
| SSH access to the cPanel server (host, user, key or password) | R0.8 |
| The GitHub repository (created by the user) | R0.5's first CI run |
| Approval of the rewritten copy | R3.1, R7.5 |
| Client names and permission for their logos, and the logo files | before the Clients section shows (D7) |
| The brochure PDF (or approval to reuse `profile.pdf`) | R6.6 |
| The logo as a vector file, if they have one (Q2) | R2.2 |
| A `no-reply@alhidaya.qa` mailbox and its password; DNS access for SPF/DKIM/DMARC | R8.3 |
| A Google account for the CV folder (Workspace or personal, Q1) and a Google Cloud project for the OAuth app | R5.3, R8.4 |
| A Cloudflare account (Turnstile, Web Analytics) | R4.2, R8.4 |
| A Supabase account / organisation for the hosted project | R8.1 |

## 41. Open questions

Each carries the **default** built if no answer arrives before its row starts.

| Q | Question | Default |
|---|---|---|
| Q1 | Is the CV Google account Workspace or personal Gmail? | The Drive connection supports both; with Gmail the OAuth app is set to production status. |
| Q2 | Does the client have the logo as a vector (SVG/AI/EPS/PDF)? | The mark and wordmark are redrawn as SVG from the JPG, faithfully, for the client to approve. |
| Q3 | Reuse the current `profile.pdf` as the brochure? | Yes, until the admin uploads a new one. |
| Q4 | CV rules | PDF, DOC or DOCX; at most 5 MB. |
| Q5 | Quote form fields | As §10.1. |
| Q6 | Contact form fields | As §10.2. |
| Q7 | Keep a general application (no job), like today's "Submit your resume"? | Yes, at `/careers/apply`. |
| Q8 | Retention before the admin sets it | 180 days. |
| Q9 | Service names, slugs, order and "what's included" | The current eight, renamed in plain English during the copy rewrite, in the current order; "included" items only where the client confirms them. |
| Q10 | Typeface | Chosen by the user from a specimen of three signage sans faces with Arabic companions (R2.1). |
| Q11 | Stock photo source | Unsplash and Pexels (free licences), each image's source recorded. |
| Q12 | Pictograms | Drawn for this site in the system's line weight. |
| Q13 | Dependency majors | clinicdesk's (D38). |
| Q14 | WhatsApp prefilled message | "Hello Al Hidaya, I would like to ask about nursing care." |
| Q15 | CSV export of enquiries and applications | Later. |
| Q16 | Rate limit | 5 submissions per form per 10 minutes per visitor. |
| Q17 | Who receives which email | Quote and Contact → `info@alhidaya.qa`; applications → `hr@alhidaya.qa`; both editable in Operations. |
| Q18 | Legal review of Privacy and Terms | Drafted from what the site actually does; the client reviews before launch. |
| Q19 | Publish per item, or one "publish all"? | Per item, with an overview of unpublished changes. |
| Q20 | Where the daily purge job runs | Supabase pg_cron + pg_net calling the app, as clinicdesk. |
| Q21 | Store content per locale now (`{ "en": … }`)? | Yes (§33). |
| Q22 | Pre-switch check under a hidden temporary subdomain on the server (not a public staging site)? | Yes. |
| Q23 | A floating WhatsApp button on every page, as today? | Decided in R2.6 with the user, from the built shell. |

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
- **Careers:** applications on the site with CVs to Google Drive and email
  (D13, D23), instead of external Google Form links.
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
