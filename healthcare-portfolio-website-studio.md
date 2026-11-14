# Al Hidaya Health Care Service — Website Product, Architecture & Delivery Plan

> The public website and admin panel of **Al Hidaya Health Care Service**
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

Al Hidaya Health Care Service provides **nursing care at home and in
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
| D5 | *(Superseded by D121, 2026-10-31.)* **The name is "Al Hidaya Health Care Services".** (The logo reads "Al Hidaya Health Care Service WLL".) | 2026-10-28 |
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
| D36 | *(Superseded by D97, 2026-10-30.)* **The design direction is "Follow the Line"**: hospital wayfinding (§30.1), chosen on the Impeccable decision page after one re-roll. **Code-led build**: no image generation was available, so no mock-up comps; the direction contract carries the ambition. | 2026-10-28 |
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
| D61 | *(Superseded by D108, 2026-10-30.)* **Typeface: Atkinson Hyperlegible Next**, with **Noto Sans Arabic** as its Arabic companion, chosen by the user from the specimen of three (R2.1; answers Q10). Self-hosted: one variable file (weights 200 – 800), Latin subset, 34 KB, with a metric-matched fallback; the Arabic file is added when Arabic arrives (§33). | 2026-10-29 |
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
| D75 | **Stock photos come now** (answers Q41): a handful of licensed stock photos (Q11), each source and licence recorded, imported by the seed through the same sizing step the admin's uploads will use (brought forward from R6.5); the admin's media screens stay at R6.5. | 2026-10-29 |
| D76 | **Public pages render per request from cached reads** (answers Q42, option b): each page is server-rendered on request (visible without JavaScript, correct 404s); its database reads are cached with tags (`unstable_cache`) and Publish revalidates exactly its tags, never serving stale content (§22.1). Cache Components is not used: it prerenders cached reads at build, where the client's database is out of reach. | 2026-10-29 |
| D77 | **The public forms load their checks after first paint**: React Hook Form with Zod in the Quote and Contact pages' first load measured ≈ 40 KB gzip more (≈ 194 KB against the 170 KB budget, §31). The forms are plain fields of the browser's own, checked by the same Zod schema the route parses (`src/lib/validation/schemas/enquiries.ts`) through one small hook (`src/hooks/useSchemaForm.ts`), which fetches the schema when the visitor first reaches into the form; React Hook Form stays for the admin (Phase 6), which has no such budget. Each mistake shows beside its field in the catalogue's words, on the visitor's side and the server's alike. **(agent default; Q43)** | 2026-10-29 |
| D78 | **Turnstile is seen only when Cloudflare needs the visitor to act** (`appearance: interaction-only`, Cloudflare's managed check) and is loaded when the visitor first reaches into a form, never in a page's first load (as D77). Its site key is read on the server at request time, so the site's own keys need no new build. When Cloudflare cannot be reached, the form is refused with the outside service's message: nothing is stored unchecked (§10.3: verified before anything is stored). Locally and in the tests, Cloudflare's published test keys. **(agent default; Q44)** | 2026-10-29 |
| D79 | **An enquiry's alert is sent once the visitor has their answer** (Next's `after`, in the same request; no queue, AGENTS.md §17): the visitor never waits on the mail server. The enquiry is marked sent or not sent; one not yet sent (also if the app restarted in that moment) shows with Retry. In production a mail server is reached only over TLS, unless it is on the same machine. **(agent default; Q45)** | 2026-10-29 |
| D80 | **The admin is brought forward into Phase 4**: R6.1 (shape the admin) and R6.2 (its shell, sign-in, overview and data layer) are done before R4.4's inbox screens, so Phase 4 ends with an inbox the team can use. R4.4's server side is done first. | 2026-10-29 |
| D81 | **The admin is "the day's log"** (R6.1, the user's choice of three dealt layouts, and the brief they confirmed): the admin opens on **Today**, one stream of what needs them, newest first and ruled by day, each arrival handled in its own row (every answer, Call, WhatsApp, Email, Move to, notes); the rail is the line with each section a station. Today is the plan's Overview (§16) and carries what it listed. Built for a non-technical admin at a desktop, read on a phone; never like the public site, never cramped, never several clicks for daily work. | 2026-10-29 |
| D82 | **The admin can delete an application or an enquiry from its inbox** (answers the plan's own disagreement between §16 and §9.5, §10.5): a Delete in the opened row, asked first in a dialog; the row, its notes and (for an application) its CV file go at once, and the deletion is audited without what it held. Retention (§18) still deletes the rest on its own. The enquiries' Delete arrives with the applications' (R5.5). | 2026-10-29 |
| D83 | **Retries for a CV that could not be saved and for every automated email that failed** (the user, 2026-10-30: "keep automatic retry … when the applicants are applying with cv, if not properly stored, make them upload again or try again … also if any automated mail is to be sent, and it failed, … keep a retry system like 3 retries"). Not needed now: built before deployment, at R6.10. How a CV is retried is Q46; how the emails are retried is Q47. The admin's own Retry (§9.3, §10.4) stays for what still fails. | 2026-10-30 |
| D84 | **A CV that cannot be saved is sent again by the applicant** (the user's answer to Q46, 2026-10-30: option (a)): the save is tried 3 times during the upload; if it still fails, nothing is kept (not counted against the applicant's limit) and the form says, beside the CV and above the send action, **"Something went wrong with your CV upload. Please send it again."**, with everything typed and the file still in the form. A CV folder past its budget is refused the same way and shown to the admin on Today. AGENTS.md §10 changes for this one case when R6.10 is built. | 2026-10-30 |
| D85 | **A failed automated email is sent again by a second cron job** (the user's answer to Q47, 2026-10-30: option (a)): every 10 minutes a cPanel cron entry calls `POST /api/cron/mail-retry` with `CRON_SECRET`, which sends again each enquiry alert and HR email not sent (the HR email with the kept CV), up to 3 more tries per email, each try recorded on its row (a small migration: the tries and when the last one was); after the third it waits for the admin's Retry, which stays. The admin's password-reset email does not take part: its link lasts minutes, and the admin can ask again. AGENTS.md §17 changes when R6.10 is built. | 2026-10-30 |
| D86 | **Each page publishes on its own** (the user's answer to Q19, 2026-10-30): a page's Publish and Discard draft act on that page alone; the Pages list shows each page's state, the rail's Pages station counts those waiting, and Today lists every page with changes not yet published above its log, each linking to its editor. | 2026-10-30 |
| D87 | **The admin can add and remove sections** (the user, 2026-10-30, settling §16 against §7.1's limits): Add a section offers only the types the page allows that are not at their limit, and puts it at the end; Remove asks first. The sign stays first and fixed; a section the page cannot work without can be moved but neither hidden nor removed. A removed section leaves the site only when the page is published. | 2026-10-30 |
| D88 | **The Pages editor is the day's log for content** (R6.3 shaped with the user, 2026-10-30; the pattern the Services, Jobs, Clients and Settings editors follow): `/admin/pages` lists the eight pages with their state; a page's sections are numbered rows, one opened in place on mist with its type's fields, and the page's SEO last. A bar kept in view names the page and its state, with **Save draft** (a button, as §14), **Preview** (a new tab, showing the saved draft), **Publish** and **Discard draft**, both asked first; Publish saves unsaved changes first, and leaving with unsaved changes asks first. Whole-page routes: `GET /api/admin/pages`, `GET`/`PUT /api/admin/pages/[key]`, `POST …/publish`, `POST …/discard`; the plan's `/sections` route is not needed. | 2026-10-30 |
| D89 | **A section's photo is picked from the media library** (the user, 2026-10-30): R6.3's photo field chooses among the images already kept (the licensed stock, D75) in a dialog, or none; `GET /api/admin/media` (the list) comes forward from R6.5, and Upload joins the picker when R6.5 builds the library. | 2026-10-30 |
| D90 | **Sections reorder by the browser's drag and by buttons; text is edited block by block** (the user, 2026-10-30): the browser's own drag-and-drop on a desktop, and Move up / Move down on every row for the keyboard and phones, with no drag library; a text section is a list of blocks (heading, paragraph, list, link), each its own field, added, moved and removed one at a time, as it is stored (§7.2). No word-processor editor. | 2026-10-30 |
| D91 | **The open questions are answered as their defaults** (the user, 2026-10-30, choosing each recommended option): Q3 (the current `profile.pdf` is the brochure until the admin uploads another), Q4 (PDF, DOC or DOCX, at most 5 MB), Q5 and Q6 (the forms' fields as §10.1 and §10.2), Q7 (the general application at `/careers/apply`), Q8 (180 days each), Q9 (the current eight services in plain English, in today's order, "included" only where the client confirms), Q11 (Unsplash and Pexels, each source recorded), Q12 (the site's own pictograms), Q13 (clinicdesk's majors, D38), Q14 (the WhatsApp prefill as written), Q15 (CSV export Later), Q16 (5 submissions per form per 10 minutes), Q17 (`info@` for Quote and Contact, `hr@` for applications, both editable), Q18 (drafted from what the site does; the client reviews before launch), Q21 (content per locale), Q22 (the pre-switch check under a hidden temporary subdomain), Q26 (Apache serves the media folder), Q28 (the old service photos only where good enough), Q29 (two tables, D60), Q30 (the seed runs once at R8.1, with the user's go-ahead), Q40 (a `<picture>`, D73), Q43 (the forms' checks after first paint, D77), Q44 (Turnstile seen only when needed; refused when Cloudflare cannot be reached, D78), Q45 (the alert after the visitor's answer, D79). D38, D60, D73, D77, D78 and D79 are the user's from now on. | 2026-10-30 |
| D92 | **Services and jobs follow the Pages editor** (R6.4 shaped with the user, 2026-10-30): each opens in the same editor (the bar: Save draft, Preview, Publish, Discard draft; fields in groups; leaving unsaved asks first). **The services' order** is set on the Services list by drag or Move up/Move down and saved as a draft that goes live with its own Publish (asked first) or Discard, as D86; client logos do the same at R6.5. **A web address** is filled in from the name as it is typed until the admin edits it; changing a published one keeps the old address redirecting (§8). **Close now** (asked first) stops a job's applications at once: it stays at its address marked closed, and Reopen undoes it; Archive takes a service or a job off the site, and Restore brings it back. **The lists are grouped by state**: services in the site's order with the archived folded below; jobs as Open, Drafts, Closed and Archived, newest first; each row shows its state and whether changes wait. | 2026-10-30 |
| D93 | **Images are uploaded in the Media library and from the photo picker** (the user, 2026-10-30, for R6.5): an upload asks for its alt text (or Decorative) and, from the picker, is chosen at once. **A stock photo's source** is three optional fields (provider, link, licence), seen only in the admin. | 2026-10-30 |
| D94 | **Settings is one page in groups** (the user, 2026-10-30, for R6.6): company, contact, social links, the WhatsApp button, navigation, footer, SEO defaults and the brochure, with the editor's one bar (Save draft, Preview, Publish, Discard). **A new brochure goes live with Settings' Publish** (it is site content, §13); `/brochure` never changes. **A navigation link** points at one of the site's pages or services, picked from a list, or at an https address typed in, each with its label, order and Visible. | 2026-10-30 |
| D95 | **Disk use shows in Operations** (the user, 2026-10-30, for R6.7): each folder's use against its budget (§21.2); Today warns only once a folder passes 80 %. | 2026-10-30 |
| D96 | **Activity is a day's log** (the user, 2026-10-30, for R6.8): the admin's changes newest first, grouped by day, filtered by kind (content, inbox, settings, sign-ins), 50 at a time: who, what and when, never personal details; kept a year (§36). | 2026-10-30 |
| D97 | **The public site is redesigned after the user's reference** (the user, 2026-10-30: "I didn't like the portfolio design … try to do the 1st one … same to same … images instead of video … contents of Al Hidaya … the colour theme matching the logo … build this in phase 6B"): Dribbble shot 24320685, "Telehealth Website Design" (Eloqwnt for DocInPoc), followed section by section, with its kind of scroll and text motion, in Al Hidaya's words, photos and the logo's colours; the BeU shot (25587716) was the fallback and is not needed. **"Follow the Line" (D36) is superseded.** The studio's images and text are never reused (it is a real client's site): its layout, sections and motion are followed. Built as **Phase 6B**, after R6.10. §30.1 holds the direction; the public surface brief its contract. | 2026-10-30 |
| D98 | **The redesign's greens are the logo's leaf, deepened and lightened** (the user's answer, 2026-10-30, the recommended option): forest `#3B6B24` (6.3:1 with white) for primary pills, the accent card and the footer; a pale tint `#EEF5E2` for audience pills, icon chips and the highlight behind a headline word. Logo colours only (D35). | 2026-10-30 |
| D99 | **Counters show only real facts** (the user, recommended): the reference's counters keep their layout with true facts ("24/7", the number of services, "Across Doha"); a number such as patients or nurses shows only once the client gives it, editable in the admin. D7 stands. | 2026-10-30 |
| D100 | **The new sections are section types in the Pages editor** (the user, recommended): their words, photos and items editable, shown or hidden and reordered; the design locked (D12). | 2026-10-30 |
| D101 | **The rail is removed everywhere** (the user, 2026-10-30): the public line with its stations (and "You are here"), and in the admin the line and station dots of its left column, **which stays as a plain list of links** (the user's choice over a top bar); the admin is otherwise unchanged. | 2026-10-30 |
| D102 | **The reference's app card shows Al Hidaya's services sliding inside it** (the user, recommended), each opening its page; there is no app. | 2026-10-30 |
| D103 | **Every public page takes the new look and motion** (the user, recommended): Home in the reference's sections; About, Services, each service, Careers, each job, Apply, Contact, Request a quote, Privacy, Terms and the system pages restyled in the same language. | 2026-10-30 |
| D104 | **Home's form section is the Contact form** (the user's choice over the quote form), in the reference's layout. | 2026-10-30 |
| D105 | **Home's audience sections are "For Families" and "For Hospitals, Clinics & Schools"** (the user, recommended), in the reference's two layouts. | 2026-10-30 |
| D106 | **The footer's running words read "AL HIDAYA HEALTH CARE"** (the user's choice), editable in Settings. | 2026-10-30 |
| D107 | **The header is not pinned** (the user, 2026-10-30: "no need of the bar shown during scrolling"; recommended layout): the logo, About, Services, Careers, Contact in a light row, and the forest "Request a quote" pill; it scrolls away with the page. The phone moves to the page and the floating WhatsApp button. | 2026-10-30 |
| D108 | **Inter Tight** (the user, recommended), a grotesk like the reference's, self-hosted, replaces Atkinson Hyperlegible Next (D61). | 2026-10-30 |
| D109 | **The other pages open like Home's hero, smaller** (the user, 2026-10-30, recommended; R6B.4): the page's name on a pale pill (left out where the headline says it), the headline settling into its words with a phrase on the pale-green highlight (now editable on every page's sign), the supporting line, the page's own actions as pills, and a tall rounded photo beside it (under it on a phone); a page with no photo shows its words alone. About and Services offer WhatsApp and a quote, Contact WhatsApp and a call; a service its audience's actions; a job Apply. | 2026-10-30 |
| D110 | **About, Services, Careers and Contact open with a photo from the licensed stock already in the project** (the user, recommended): seeded, each replaceable in the admin; never captioned as Al Hidaya's staff (D8). | 2026-10-30 |
| D111 | **Services sets out its services as photo cards by audience** (the user, recommended): "For families" and "For hospitals, clinics & schools", each under its pill with its actions (WhatsApp and a call; a quote), each service a mist card with its photo, name and summary, opening its page; a service's page ends on the others for its audience, the same way. | 2026-10-30 |
| D112 | **Each page keeps its own sections** (the user, recommended): Home's new sections (statement, highlights, how it works, the audiences) stay Home's; the other pages' sections (who we are, mission, values, clients, the services, the jobs, the contact details and band, the admin's text) are redrawn in the new look and motion, with nothing new to edit. | 2026-10-30 |
| D113 | **The footer's running words loop on their own** (the user, 2026-10-31: "the name is not moving like I guessed it will be moving in an infinite loop"): an endless slow loop (48 s) by CSS alone, the one exception to "nothing moves on its own"; a round pause button beside them (a checkbox, no script) stops them (WCAG 2.2.2; asked, the user chose to keep it over removing it or going back to scroll-driven movement), and with motion reduced they stand still. Supersedes D106's scroll-driven movement. | 2026-10-31 |
| D114 | **The current site's slide sentences carry into Home, and the footer is simpler** (the user, 2026-10-31): "Compassionate nursing care for your loved ones" (families), "Trained nurses who deliver excellence every time" (institutions), "Affordable nursing care, without compromising quality" (the first highlight) and "Experience the difference with Al Hidaya" (the form) become those sections' headings, as editable content, with no new element; the footer's column headings are larger and bolder, its contact column keeps to the phone, the email, the hours and each social network with its mark (the address stays on Contact), and it has no quote button. | 2026-10-31 |
| D115 | **The admin's polish** (the user, 2026-10-31): "Today" is the **Dashboard**; each menu section has its mark, the groups ("Inbox", "Website content", "Administration") sit under bold headings parted by a light rule, and the current one is marked by its highlight alone, never bold; the column's scroll stays its own; **Profile** (with its mark) shows the admin's name and sign-in email, renames them, and changes their password with the current one (limited to 10 tries an hour, every other session ended, both recorded in Activity); **Log out** (with its mark) is asked first; the sign-in page's navy panel names the panel, what it looks after and the way back, with no rail; every word in the admin is in a plain, professional register; in a page's sections, only the Edit action is lit under the pointer. | 2026-10-31 |
| D116 | **The header offers the brochure** (the user, 2026-10-31): "Download brochure", in the header and the phone menu, in place of Request a quote, downloading the PDF published in Settings (the old site's `profile.pdf` at launch, D91) under the company's name, `Al-Hidaya-Health-Care-Services-Brochure.pdf`; until a brochure is published the header keeps Request a quote. The footer no longer links the brochure. | 2026-10-31 |
| D117 | **The phone menu opens smoothly** (the user, 2026-10-31: "in small screens the menu opening there is no animation, add something smooth"; the motion itself is the agent default): the sheet fades in over the page (200 ms, its logo and close button where the header's logo and menu button were), its rows rise into place one after another (640 ms, ease-out, 45 ms apart), and closing it fades away; CSS only, so no script is added, and with motion reduced it simply appears. The navy backdrop is dropped: the sheet covers the screen, so it only showed as a grey flash while fading. | 2026-10-31 |
| D118 | **The current site's images are seeded** (the user, 2026-10-31: "there are some images used in the old website, add them to the media library along with other seeded images"; the three choices below are the user's): **its 11 client logos** (The View Hospital, Hamad Medical Corporation, Military Medical City Hospital, Estithmar Holding and seven nurseries, kindergartens and clinics) become the seed's client logos, as drafts with their names in the current site's order, replacing the sample logos on the local database; each is published only once the client confirms it may still be named (D7). **Its 15 photographs** (the 5 slides, the 2 About pictures and the 8 service photographs) go into the media library only, the slides **cropped** to the photograph from the white fade the slider's words sat on; the pages keep their photographs, the current site's being smaller than the site draws them (Q28's answer, D91, stands). Its 3 wide banners, with their overlays, are left out. The seed now files every seed photograph in the library on each run, finding those kept before by their source. **The logo tile holds real logos** (the agent default): a logo fills the tile's padding whatever its shape, the tile always 4:3, and is multiplied into the card so a logo file's white background takes the card's colour; the seed's logo files are trimmed of their white margins. | 2026-10-31 |
| D119 | **Published content is cached in memory only** (the user, 2026-10-31, choosing the recommended option): Next remembers a publish's revalidated tags in memory alone, while its cache keeps reads on disk, so after a restart (Passenger stops an idle app and starts it on the next visit; a deploy restarts it) a page not visited since its publish came back as it was before, and stayed so until published again. Reproduced on `next dev` and on the standalone build. `experimental.isrFlushToDisk: false` keeps the cache in the app's memory (within Next's 50 MB), so a restart starts empty and reads the database afresh. This holds for one app process, the setup for this 1-core server; the release checks Passenger runs one (R8.2). A shared tag store in MySQL (a custom cache handler) was the alternative for several processes. | 2026-10-31 |
| D120 | **Preview saves unsaved changes first** (the user, 2026-10-31, choosing the recommended option; supersedes D88's "showing the saved draft"): as Publish does, Preview saves the draft, then shows it; its tab opens at the click and goes to the preview once saved, and closes if the draft fails its checks or is refused, said in the editor as on saving. The hint "Save draft first" goes. | 2026-10-31 |
| D121 | **The company is named as its logo reads** (the user, 2026-10-31: "in footer copyright, it says services, follow logo that is put service, not services"; everywhere, the user's choice; supersedes D5): "Al Hidaya Health Care Service" in every title, email, share card, search result and the brochure's file name (`Al-Hidaya-Health-Care-Service-Brochure.pdf`); the footer's copyright gives the registered name, "© 2026 Al Hidaya Health Care Service W.L.L. All rights reserved." | 2026-10-31 |
| D122 | **The primary green is the logo's** (the user, 2026-10-31: "make the primary green color to match the green color of the logo, current one feels too dark for the client"; the user's choice of the options): the logo's leaf `#86AE3C` fills the primary pills, the green cards (the highlight's, the mission's, the contact band), icon chips and the footer, with **navy words** (6.1:1; white on it would be 2.6:1), a navy logo in the footer and navy focus rings on it. Green words and marks on white or pale (links, arrows, the pill label, ticks) take forest `#5B7628`, the same green deepened only as far as reading needs, lighter than the old `#3B6B24`. Supersedes D98's forest fill. | 2026-10-31 |
| D123 | **The admin's blue is the logo's** (the user, 2026-10-31: "the blue color in the admin panel, follow the color of the logos blue color"; the user's choice): the admin's column, its phone bar and menu, and the sign-in page's panel take the logo's deep blue `#0F64AC` (the swoosh's blue, already the admin's buttons) in place of the navy, white words at 6.1:1 and the softer words at 5.0:1 (no longer faded to 80%). | 2026-10-31 |
| D124 | **How it works runs in the families' card; the services get a section of their own, both looping** (the user, 2026-10-31: "swap services and how it works … instead of horizontal scroll keep animated scroll in loop … keep services also a small all services button", then "in the place of how it works … i need services, along with for families section where currently the services are being scrolled, keep the how it works"; the choices below the user's): **For families** keeps its heading, photo and features, and its card now runs **How it works**: a "How it works" label, then the steps as compact numbered cards (photo, title, words), edited in the For families section (`stepsLabel`, `steps`). The **How it works** section type gives way to **Our services** (`SERVICES_ROW`, after For families on Home): an "Our services" pill and "Nursing care … for every need", then **every published service** as a photo card opening its page, with a small **All services** pill. Both rows run on their own in an endless loop by CSS alone (`LoopRow`), in place of the sideways tracks (`ScrollTrack` goes, and its script with it): each stops under the pointer, while anything in it has focus, and by its own round pause button (WCAG 2.2.2), like the footer's words; the repeats are hidden from screen readers and the keyboard; with motion reduced they stand still, wrapped. A second exception to "nothing moves on its own" (D113). | 2026-10-31 |
| D125 | **Every block reveals as it scrolls into view** (the user, 2026-10-31: "add in transition animation to the contents of the page"; reveal as you scroll, the user's choice): every page's blocks rise into place once, in order, as before for most: now also the form and its words, each part of the admin's text (a heading with its words), each client logo (in rows of six), the contact details and the map, and each audience's heading on Services. Nothing above the fold is hidden, and nothing moves with motion reduced. | 2026-10-31 |
| D126 | **Deleting an image is red** (the user, 2026-10-31: "just make that delete button red … make sure a confirm will be asked before delete"): the media library's Delete, and the Delete in the question it asks first, are white on the error red (6.6:1; a `danger` button). The error red, otherwise for errors only (D63), also marks this one action that cannot be undone. Delete is still offered only for an image no longer in use. | 2026-10-31 |
| D127 | **Testers sign in through a tunnel** (the user, 2026-10-31: testers on a cloudflared tunnel could not sign in; asked how the tunnel's address should be trusted, they chose to set `NEXT_PUBLIC_SITE_URL` to it rather than add a trusted list). The site's same-origin check and Better Auth already trust that address alone; the dev server is told to serve its own files to that address's host too (`allowedDevOrigins` from `NEXT_PUBLIC_SITE_URL`), or its live-reload connection is refused and the page keeps reloading, wiping the sign-in form. Development only: the production build ignores it, and no check is widened. | 2026-10-31 |
| D128 | **Home's slides** (the client, through the user, 2026-10-31: "Slides there are 4 in the old site, need those in the new one too, considering admin can add more or less slides"; the buttons "not needed on the slides, or else make it editable by admin"; "keep next and previous buttons too"; answers: all five of the current site's slides, an optional button set by the admin, an auto slider with a pause, and one list of slides in the editor). Home's sign is its slides: one to eight, each a photo, a headline with its highlighted words, its words and an optional button (wording and link, both or neither; none at launch); the card on the photo stays (an icon and a note). They move on every six seconds by a bar that fills (a CSS animation, so the pause stops both), with Previous and Next, a bar for each slide and the count; the pause is a small round button with a full touch target; with motion reduced nothing moves on its own. The first photo is the page's first paint and only settles; each later one wipes in over the last; each headline's words rise from behind their line. The hero's faces, chips, photo card and figure (D97) are removed. | 2026-10-31 |
| D129 | **About on Home and headings rising** (the user, 2026-10-31: "About section like theme-5"; about Al Hidaya "in black color and rest in blue but not one below another"; "Headings rise through a mask"). `INTRO` gains its highlighted words and up to six points: its heading large with the phrase in deep blue, flowing on one line; the first paragraph as the lead, the rest beneath; the points as a ruled list beside a check; on Home, Read more about us. Every Theme 6 heading's words rise from behind their line as it scrolls into view (motion only, visible by default). | 2026-10-31 |
| D130 | **The short quote** (the user, 2026-10-31: "Contact form as theme-4"; the client's form "looks same to same as their old one, need some changes"; answers: a short quote form, its questions fixed in code, not editable in the admin). Home's FORM section holds the short quote: name, mobile, email, service and message, with the consent; on a pale-green band, the heading, words and the ways to reach us (WhatsApp, a 24/7 call, email, from Settings) beside the form on a card under a deep-blue strip. A short quote is stored, emailed and listed as a Quote with fewer answers, so the database keeps its two kinds **(agent default)**. The site's forms are boxed now. | 2026-10-31 |
| D131 | **What we do** (the user, 2026-10-31: "like theme-2 but not inside a bubble but straight lines", "individual services card be inside rounded cards", the All services button "in middle like the read more about us, not inside a bubble"). `SERVICES_ROW` holds a heading and words: on a mist band edge to edge, every service as a rounded photo card, its audience and name on a soft-white label, in a row that scrolls sideways, snapping card by card, with two arrows; All services centred below as a plain link. Its loop (D124) is removed. | 2026-10-31 |
| D132 | **Theme 6, the client's look** (the client, 2026-10-31: they wanted the old site's simple structure, then, shown five themes, chose the user's mix: "Navbar use from theme-2", "Slider like theme-2 but … straight lines like theme-4", "About section like theme-5", "What we do section like theme-2", "Contact form as theme-4", "Footer as theme-5"; earlier, "dont use proper white color", and blue-led with green accents). Deep blue leads (the main button, links, the phrase in a heading); the leaf green is an accent (D122's green primary is superseded); soft white wherever white would be on the public site (the admin keeps its own); buttons with rounded corners. The header: the logo, the pages in a floating pill (Home first in the menu), the brochure; it stays at the top and slides away going down, back going up (D107 superseded). The footer: soft white under a rule, the logo in its colours (the running words, D106 and D113, are removed, with their setting). Home's statement, highlights and the two audience sections (D97, D100, D105, D124) are removed. The admin's look is unchanged (the user: "no changes needed in the admin panel or its designs"). Every other page keeps its sections for now, in the new header, footer, colours and buttons, until the user reviews them one by one. | 2026-10-31 |
| D133 | **The clients' rows** (the user, 2026-10-31: "for clients, https://nahrdev.com/ … need the same to same type animation and working"; "no need of pause as clicking a client logo highlights it and pauses the animation"). The logos run in two rows in opposite directions, faded at their ends, grey until the pointer is on one, when it turns to its colours and grows and its row stops; a click or tap does the same until it is clicked again or the visitor clicks elsewhere; a logo with a site opens it instead. No pause button, as the user chose: a chosen logo stops only its own row (WCAG 2.2.2 asks for a way to stop everything that moves on its own; recorded, the user's call). With motion reduced the rows stand still. | 2026-10-31 |
| D134 | **The menu's sliding pill and the admin's switches** (the user, 2026-11-01: "the blue pill which is on the selected page should transition from one to another … animation of the pill shifting should be there"; "for enabling or disabling elements in the admin panel, just a blue box is given, instead keep a toggle pill … with a small text enable or disable"). The header's deep-blue pill slides from the last page's link to the new one's as a page opens (a transform from where it was, at its width; with motion reduced it simply appears). In the admin, what turns something on or off (the floating WhatsApp button, a menu link shown in the menu) is a switch: a pill whose knob slides to the end, deep blue when on, with a small "Enabled" or "Disabled" beside it. A yes-or-no that turns nothing on (a photo is decorative) and the forms' consent stay boxes to tick. | 2026-11-01 |
| D135 | **The other pages in Theme 6** (the user, 2026-11-01: "fix other pages too, for now, contact page let it be as it is now. also the careers page i like the current ui"; answers: the inner pages open in straight lines like Home; a job's page and the Apply page stay like Careers; "Talk to us" like Home's quote band; the services as Home's rounded cards in a grid; the quote page keeps its form layout; About's mission and vision on rounded cards on a mist band, its values a ruled list with checks; then, for Contact: "form element in contact make the same as in home page … just the form rounded corner card", "the form section in the contact page, make the bg color as same as in the home page form sections bg color", "for the reach us section give bg the pastel blue"; and for Careers: "open jobs section in careers page give pastel green bg. for before you apply section give pastel blue bg"). About, Services, a service's page, the quote page, Privacy, Terms and the missing page open with Home's slide in straight lines, still: under a rule, the page's name in deep blue, the headline with its phrase in deep blue rising word by word, the line and the actions, the photo edge to edge (words alone without one). Contact, Careers, a job's page and Apply keep their opening (D109). "Talk to us" sits on Home's pale-green band with WhatsApp, a call at any hour and the email as rows; the Services page and a service's other services show Home's rounded cards in a grid (four, two, one across); the staffing card, the services list and a service's page take Theme 6's headings; mission and vision are white cards with deep-blue icons on the mist band; the values a ruled list with checks beside their heading. On Contact, its ways to reach sit on the mist band (white cards), its form on the pale-green band on Home's card (its strip: "Your message"). On Careers, Open jobs sits on the pale-green band (its jobs on white cards) and its text (Before you apply) on the mist band; its opening stays. Two bands in a row meet; a page ending on a band meets the footer. *(Agent defaults: the missing page's opening; the staffing card's and a service page's headings; the Contact card's strip wording.)* | 2026-11-01 |
| D136 | **Home’s cinematic automatic hero** (the user, 2026-11-01: `/impeccable overdrive the portfolio home page`; chose Cinematic hero; then the client no longer wanted Previous, Next or Pause, and the user removed the count too). Keep Theme 6 and its existing content and section order. Coordinate the photo wipe, rising headline, supporting words, optional action, note and progress indicators as one sequence. Slides advance automatically every six seconds; only the progress bars remain, on phones too. The wipe and photo drift use separate layers, so the outgoing photo holds its last frame beneath the next one; each returning slide starts a fresh drift. Reduced motion keeps the first slide still. **Agent defaults:** the timing tokens and a deliberate keyboard-focus stop with a screen-reader hint (Q48); hovering or clicking never stops automatic playback, after the user reported the slider sticking. The user reviews before any commit; no push or deployment. | 2026-11-01 |
| D137 | **About’s Mission and Vision** (the user, 2026-11-01: asked for Impeccable to improve the dull section visually and in motion, before the admin colours). Chose distinct paired panels: deep-blue Mission with white words, pale-green Vision with navy words, larger headings and restrained line art. Rejected the heart and asked for a stronger focal animation; then chose an assembling medical cross: its four logo-colour arms meet as the section enters, while Vision’s globe unfolds, followed by the masked headings and statements. Existing statements unchanged. One scoped GSAP sequence per panel, transform and opacity only, no loop; motion reduced shows the finished art and words in place. | 2026-11-01 |
| D138 | **Pastel-green admin theme** (the user, 2026-11-01: asked for the blue admin to become pastel green, after Home and then Mission and Vision; chose pastel-green navigation and green accents). The sidebar, mobile bar/menu and sign-in panel use the existing pale leaf with navy text and the colour logo. The active row is leaf with navy words; primary actions, links, focus and switches use forest. Work areas stay white; New keeps its original blue, in-progress sky, resolved leaf and errors red. Theme roles are scoped to `/admin`; the public site remains blue-led. Layout, content and behaviour stay as they are. No commit before the user reviews. | 2026-11-01 |
| D139 | **Audit findings 3 and 4 only** (the user, 2026-11-01: corrected “p2 and p3” to “p3 and p4”, interpreted as the report’s numbered performance and sidecar findings). Add the missing local/CI performance measurements under §31 and refresh `.impeccable/design.json` from the approved built world, preserving `DESIGN.md`. Leave automatic-playback controls and touch targets unchanged. **Agent default (Q50):** a pinned development-only Lighthouse runner, mobile 4× CPU with Fast 4G (40 ms RTT, 9 × 1,024 Kbps down / 1.5 × 1,024 Kbps up), real scripted Event Timing interactions and native touch/wheel scroll probes; intentional noindex application pages skip only the crawlability audit; the deliberate 404 case also skips the conflicting HTTP-status SEO audit while asserting its 404 response separately. The runner uses Playwright’s default Chromium headless shell, as the functional suite does. No product feature, production-server change or commit before review. | 2026-11-01 |
| D140 | **Shared-link previews** (the user, 2026-11-01: “also make sure the preview we see when link is shared in whatsapp or other social media is good”). Verify server-rendered Open Graph and large Twitter cards for all published launch routes. **Agent default (Q51), for review:** update the existing 1200 × 630 renderer to Theme 6: original colour logo, published page headline in deep blue, optional pale-green page label, domain and blue/leaf baseline, with generous inset spacing and adaptive headline size. Keep published-only content and self-hosted assets; no added service, remote image, CMS control or client script. Actual platform-cache refresh is checked after an authorized deployment. | 2026-11-01 |
| D141 | **Upload security review** (the user, 2026-11-01: check maximum size, supported types and disguised programs). Verify existing image/brochure/CV boundaries under §9, §15 and §26.5; normalize complete image-decoder failures before storage and add harmless adversarial endpoint tests. PDF/Word signatures are identification hints, not full document validation or malware scanning. The user chose to harden and verify current controls now, and decide malware scanning before launch (Q52). No scanner or external file transfer is added in this task. | 2026-11-01 |

| D142 | **Impeccable harden and polish** (the user, 2026-11-01). Refine the current public/admin world under §10, §30–§33: repair confirmed duplicate-submit races and pending-state overrides, resilient long-content wrapping, existing 44 px target requirements, and the phone sign-in band’s layout. **Agent defaults, for review:** reuse the existing menu when editable desktop navigation exceeds the header’s safe capacity; preserve Theme 6, statements, section order, green admin palette, automatic progression-only hero and reduced motion. No new product feature, infrastructure, translation, factual copy, server change, commit or push. Persistent-motion decision Q49 remains unresolved; do not restore rejected slider controls. | 2026-11-01 |

| D143 | **Home services pyramid** (the user, 2026-11-02; approved the interactive concept). Home alone: a raised centre service and smaller stepped rear cards, a 30 px step, every card retaining its audience/title/link panel, softer rear photos, the existing Previous/Next arrows, native touch navigation, and no pause button. The latest timing instruction supersedes the preview’s eight seconds: use the same six-second duration as the main Home slider. Preserve published order, links, content and Theme 6. Reduced motion is static with manual navigation; stop automatic advances offscreen, in a hidden tab and during deliberate keyboard focus. Content stays usable without enhancement. No new dependency, CMS design control, production change or commit before review. Q49’s persistent-stop decision remains open. | 2026-11-02 |

| D144 | **Service and Contact design concepts only** (the user, 2026-11-02). Show five reusable service-detail layouts using existing service content, rather than 40 separate directions; also show five distinct compositions for Contact’s Reach us and Send us a message. Deliver shareable images for both requests. Retain company facts, audience-specific actions and existing contact fields. The chosen designs require user review before implementation. No new service/Contact source change, product feature or commit is authorized by the concept request. | 2026-11-02 |

| D145 | **Contact: fifth concept, with the user’s colours and animation** (the user, 2026-11-02). Apply Blue ribbon across Contact’s body: a white headline/lede opening without its old hero photograph, a pastel-blue Reach us band with three contact channels and hours, and the white message panel overlapping the pastel-green section beside the existing map and office details. Navigation and footer stay unchanged. Keep published text, existing fields, consent, bot check and submission behavior; retain optional brochure and missing-content states. Use the existing word rise/reveal grammar, transform and opacity only, once on arrival/scroll with a still reduced-motion path. Service concepts remain unchosen. No new dependency, schema, CMS design setting, production action or commit before review. | 2026-11-02 |

| D146 | **Service-detail concept two and optional header buttons** (the user, 2026-11-02). Apply Care editorial to individual service pages: large blue heading, summary and tall rounded portrait; preserve navigation/footer; Other services follows concept two’s pastel-green band, three random distinct related services in compact thumbnail-and-title cards and All services link (clarified by the user; fewer when fewer are available for the audience). Keep About the service content on a pastel-blue band; omit Who it is for and the 24/7 block. The user chose up to two optional header buttons, editable labels and destinations, hidden by default and governed by draft/preview/publish. Use existing safe internal/HTTPS link rules. Retain stored audience/forWhom content for compatibility and existing service categorisation; no destructive rewrite. Existing motion grammar is required. No new table, migration, dependency, infrastructure, design controls, production action or commit before review. | 2026-11-02 |

| D147 | **Contact opening typewriter loop and aligned fields** (the user, 2026-11-02). The published opening headline types repeatedly (the current words: We are here day and night), with stable reserved geometry and a single screen-reader copy. Native opacity animation on the deferred motion path; pause offscreen/hidden and cancel to plain text for reduced motion. Agent timing default: a six-second cycle with typing, a reading hold, progressive deletion from the end, and a short blank interval (the user clarified full typing then full deletion before retyping), available for review. Keep visible field labels; move Contact’s extra phone guidance into a placeholder so the two top inputs align. Other form help stays unchanged. This is another explicit motion exception; Q49 remains open before release. | 2026-11-02 |
| D148 | **Careers opening can move and hide** (the user, 2026-11-03). The Nursing in Doha page header is retained exactly once, but the Careers editor may reorder it, hide it and show it through the existing draft/preview/publish flow. Hide it now in the local preview; keep its words/photo. Other pages retain the fixed visible first header. When hidden, Open positions becomes the semantic page heading. No migration or new design controls. | 2026-11-03 |
| D149 | **Mission and Vision hover emphasis** (the user, 2026-11-03). Both About cards react as a whole on fine-pointer hover or keyboard focus: a 12 px lift, 24 px forward depth, 1.035 scale and opposing 5-degree perspective tilts, with a shadow layer fading in and a translucent sweep across the full card. The user clarified that whole-card movement is the focal effect, rather than icons alone. The user then requested a more noticeable graphic sequence: Mission’s cross arms separate, turn and reassemble; Vision’s rings fold/unfold and rotate, with an expanding outline highlight. One 900 ms sequence per hover/focus, no loop. Transform and opacity only; reduced motion keeps a static highlight. Preserve the assembling cross/globe entrance, content and colours. | 2026-11-03 |
| D150 | **Only the main Services page’s All services section** (the user, 2026-11-03, clarified section scope): pastel-green band with all published services together in admin order, using the same compact thumbnail/title cards as Other services. No For families / For hospitals, clinics & schools category headings or audience actions in this section. The user subsequently requested pastel blue for Talk to us on this page. Preserve the rest of the page, Home, navigation and footer; stored audience data remains compatible. Existing heading/card reveals remain. | 2026-11-03 |
| D151 | **Home quote section follows the supplied screenshot** (the user, 2026-11-03): inset rounded section, heading/supporting text and three contact tiles on the left; plain white rounded form card on the right, no blue title strip. The user immediately changed the outer background to pastel blue; keep navy text for contrast. Retain the name/mobile and email/service rows, full-width message with guidance in its placeholder, existing consent, Turnstile, validation and submission behavior. Main quote page and other Home sections stay unchanged. | 2026-11-03 |
| D152 | **Contact message section follows Home’s reference form layout** (the user, 2026-11-03). Keep Reach us untouched. The section below is pastel green, with Send us a message, then the published map, Visit our office and office address/directions at the left; the existing Contact form is in a white rounded card at the right. Retain current fields/validation/consent/bot protection. Supersedes the overlapping left form from D145; retire the overlap. Both Home and Contact white form cards receive the user’s requested float shadow. | 2026-11-03 |
| D153 | **Contact backdrop clarification** (the user, 2026-11-03). Keep the rounded message panel pastel green and all element colours unchanged; only the background behind the rounded panel becomes pastel blue, continuous with Reach us. The white form and its shadow remain. | 2026-11-03 |
| D154 | **WhatsApp logo throughout** (the user, 2026-11-03). Use the standard Font Awesome Free WhatsApp brand SVG (CC BY 4.0), replacing the custom approximation, retaining the existing `chat` storage key for compatibility. The floating shortcut uses the user’s requested WhatsApp green (#25d366) with a white brand mark (explicit logo-colour exception). All public/admin WhatsApp icons share it; text-only shared WhatsApp buttons now include the mark too. Remove the unused retired footer play/pause drawings to retain the JavaScript budget. No dependencies or migration. | 2026-11-03 |
| D155 | **Three other services across the full catalogue** (the user, 2026-11-03: School nurse staffing showed only one). Remove the legacy audience restriction when sampling Other services. Choose three distinct published services from the full catalogue, exclude the current service, and show fewer only when fewer than three others exist overall. This supersedes D146’s audience-limited related selection. | 2026-11-03 |
| D156 | **About and main Services opening buttons are optional and hidden now** (the user, 2026-11-03). Pages → About/Services → Page header has one Show the opening buttons switch for the existing WhatsApp/Request a quote pair. Off by default, including legacy records; preserve wording/destinations. Save/Preview/Publish visibility through the existing page workflow. Keep both off in the local published content. Individual service-detail optional label/link buttons remain as D146. No design control or SQL migration. | 2026-11-03 |
| D157 | **Home slider photo pill may hide without losing its content** (the user, 2026-11-03). Add Hide the slider pill to Pages → Home → Page header, using the existing draft/preview/publish workflow. Keep the note/icon stored; absent legacy flags remain visible. Hide it in the local published content now. This is the note pill, not the progression bars. No migration. | 2026-11-03 |
| D158 | **Use the first photo/header blend concept** (the user, 2026-11-03, explicitly choosing the first image over the subsequent softer fade). Home, About and main Services: full-width opening photograph behind a navy dimming layer and opening copy; original coloured logo and navy navigation protected by an opaque light header surface that fades below the controls. Use the first concept’s short fade, not the later extended fade. Preserve existing navigation, automatic slides/progression-only controls, draft actions and reduced motion. Other routes retain their openings. No image-brightness detector, dependency or CMS design control. | 2026-11-03 |
| D159 | **Mobile menu contact text must fit; brochure button wording is Brochure** (the user, 2026-11-03). Keep WhatsApp and Call side by side, their text centred without overflow at phone widths; retain the proper WhatsApp mark. Shorten the shared download-button label to Brochure, retaining its download icon and behavior. | 2026-11-03 |
| D160 | **Fade the image gradually, keep the navbar solid** (the user’s latest refinement, 2026-11-03). Supersede D158’s header-gradient implementation: keep the original coloured logo and navy navigation on solid soft white. Gradually fade in the top of the photo together with its dimming overlay, into the same soft-white base. Home, About and main Services only, and only while their opening has a photo. Other routes and text-only openings keep the normal header/opening. Static image mask, no extra animation or script. | 2026-11-03 |
| D161 | **Impeccable Adapt: public website and mobile menu only** (the user, 2026-11-03; confirmed scope). Fix oversized mobile elements while preserving Theme 6, content, section order, colours, motion, admin and desktop. Agent defaults for review: phone headline scale starts at 32 px, supporting text 17 px, body/forms 16 px minimum, 40 px section rhythm; compact image-opening height/top spacing and gradual image fade; shorter intro/service photo crops, 96 px Mission/Vision artwork, compact related-service thumbnails, roomier form fields through smaller card insets, 52 px menu rows, a two-column phone footer, short-landscape handling. Keep at least 44 px touch targets, all links/content, the approved 30 px service-pyramid rise, stored visibility and reduced motion. Validate touch swipes and vertical scroll over the carousel using synthesized Chromium touch; physical iOS/Android remain release checks. No new feature, dependency or CMS design control. | 2026-11-03 |
| D162 | **Navbar stays at the page top; never sticky or returning on scroll-up** (the user, 2026-11-03). On the public site, keep the existing logo/navigation/menu/brochure and opening-image composition, but let the header scroll away in normal document flow. Remove the hide/show-on-scroll listener and state; the navbar appears again only on returning to the page top. Applies at all widths and reduced motion. Supersedes the D132 return-on-scroll behavior. | 2026-11-03 |
| D163 | **Careers and Contact navbar backgrounds match the white main-page headers** (the user, 2026-11-03). Use the same soft-white card surface and navbar height/vertical spacing as Home/About/Services, preserving their original logo/navigation and the non-sticky behavior of D162. Other section colours remain. | 2026-11-03 |
| D164 | **Individual service openings use the same fading image composition** (the user, 2026-11-03). Replace D146’s editorial title/arched portrait opening with the shared About/main Services photo opening: full-width dimmed photo, service title/summary over it, top of the image fading gradually into the solid white navbar. Preserve the optional published header buttons and admin controls. No-photo services retain a text-only opening. Keep pastel-blue About and three compact related services unchanged. Navbar stays non-sticky. No new CMS field or migration. | 2026-11-03 |
| D165 | **Footer logo shine** (the user, 2026-11-03). Keep the original coloured logo stationary; a subtle diagonal highlight begins at its top-left and travels across its actual shapes, repeating after a short quiet interval. The user’s slower refinement: a 4.5-second sweep within a ten-second cycle, with a quiet pause before repeating. Decorative CSS transform/opacity only, no added client runtime; reduced motion keeps the static logo. Explicit exception to the no-automatic-motion default, limited to the footer. | 2026-11-03 |
| D166 | **Footer care illustration, preserving all existing content** (the user, 2026-11-03). The approved references use extremely faint pale-blue line art. Latest clarification: the extra nursing-tool illustrations must be exact matches or omitted. The available references are flattened mockups; use the user-authorized fallback and keep only the nurse/older-patient care illustration. Remove the approximate tool drawings. Preserve every existing footer item, content/layout, social-link behavior, copyright, floating WhatsApp and the slow D165 logo shine. Decoration stays static, hidden from assistive technology and pointer-transparent, with responsive placement. No new CMS control, data field or dependency. | 2026-11-03 |
| D167 | **The phone menu: deep-blue sheet, smooth open and close** (the user, 2026-11-03, choosing concept 3 of three: "go with concept 3, but no need of the mail id and 24x7 written. also need a proper menu open and close animation, it should be smooth"; then "the opening of the menu seems smooth but the contents in the menu seems like a little lag or stuck type. they should be smooth"). The phone menu is a full-screen sheet in the logo's deep blue: the pages in large white words under faint rules, the current one semibold with a leaf arrow; WhatsApp (leaf tile) and Call (white tile) side by side, each with its number on one line; the brochure (the quote until there is one) on a white button; a faint white mark as a watermark. The email, the hours and "24/7" are not in the menu (the Call tile reads "Call us"); the brochure keeps D159's wording, Brochure. Motion: the sheet drops in from the top and its rows settle after it, all on one curve, the first row starting at once and following the sheet down (not waiting, not rising against it); closing, the rows fade and the sheet lifts away faster, and the dialog closes when it has gone, Escape and a chosen page included; with motion reduced it appears and goes at once. Transform and opacity only. Supersedes D159's two outlined pills in the menu (its fit on one line at 320 – 414 px stands) and D161's 52 px menu rows (the rows scale with the screen's height). *(Agent defaults: the Call tile's wording; the brochure kept as Brochure.)* | 2026-11-03 |
| D168 | **Font Manager, public website only** (the user, 2026-11-04): a fixed library of ten bundled, tested fonts; independent font choices per semantic text type; Save draft → authenticated page Preview → Publish, and Discard. No admin font uploads, no change to the admin's own text. This is an explicit narrow exception to D12's ban on font controls; sizes, weights, colours, layout and motion stay locked. Typography has its own document and cache tag, so publishing fonts cannot publish unrelated Settings drafts. Font Manager uses a dedicated typography T navigation icon, distinct from Settings (user refinement, 2026-11-04). Existing Inter Tight remains every role's default. Agent defaults: the ten readable variable sans faces and the twenty semantic roles documented in DESIGN.md; all assets self-hosted with licenses, optional faces not preloaded. | 2026-11-04 |
| D169 | **Five more expressive fonts** (the user, 2026-11-04): retain the original ten and add five distinctive faces to the existing Font Manager, for fifteen total. No automatic change to selected/published families, role scales or publishing behavior. Agent defaults for review: Playfair Display, Cormorant Garamond, Fraunces, Space Grotesk and Syne; licensed, self-hosted variable fonts with weights 400–700, tested for all existing text roles and responsive templates. No font upload or new runtime dependency. | 2026-11-04 |
| D170 | **Footer logo shine: halve the wait** (the user, 2026-11-04). Keep the existing slow 4.5-second sweep and stationary logo; halve the recurring quiet gap from 5.5 to 2.75 seconds, producing a 7.25-second cycle. Preserve the initial 0.4-second lead-in, opacity timing, transform-only movement of the shine and the static reduced-motion path. Supersedes only D165's repeat interval. | 2026-11-04 |

| D171 | **Match Home’s mobile pyramid to its laptop composition** (the user, 2026-11-04). Keep five visible depth positions on phones too, with the same raised centre, 30 px steps, 88%/76% rear scales, softened rear photos and existing linked panels. Use tighter phone overlap rather than dropping the outer pair. Agent default for review: 60 cqw centre width, capped at 16 rem, and 16% stage-width spacing below 640 px. Preserve desktop geometry, six-second advances, arrows, swipe/page-scroll behavior, reduced motion and all content. No new feature, dependency or CMS control. | 2026-11-04 |

| D172 | **App-wide responsive consistency review** (the user, 2026-11-04): examine the public site and admin across narrow phones, tablets, landscape and laptops; fix verified layout, typography, touch-target, content/action parity and motion inconsistencies within the existing approved design. Preserve all content, visibility settings, font choices, admin workflows and the public/admin theme distinction. No redesign, new feature, dependency or CMS control. Initial verified fixes: common public navbar height/surface on every route, undistorted brand logos and a matching footer-shine mask. Additional findings and evidence are recorded in the review. Leave everything uncommitted for review. | 2026-11-04 |

| D173 | **Home contact-square colours and Contact Reach us cards** (the user, 2026-11-04): Home’s quote-area WhatsApp square uses WhatsApp green; the Call and Email squares use navy. Retain the existing marks and all other tile/form colours. Each of Contact’s three Reach us channels sits inside an off-white rounded card, on the existing pastel-blue ribbon. Follow-up: make the WhatsApp/Phone/Email terms bold and lift/highlight the whole card on hover or keyboard focus; use an independent translate so the first-visit scroll reveal cannot override it, and a static highlight for reduced motion. Preserve existing contact values, links, motion, form behavior and all other page elements. | 2026-11-04 |

| D174 | **Approved Open jobs concept three and continuous dots; deep-blue Contact backdrop** (the user, 2026-11-04). Apply the nurse-photo accent concept to Careers: preserve all jobs, introduction, empty state and application actions; add the approved existing nurse-team photo with a clearly visible two-layer navy shadow and no white border, responsive heading/photo pairing and pale-green-to-mist panel. The photo uses the existing media picker and page draft/preview/publish workflow, with an optional backward-compatible image reference and no SQL migration. Heading reads Open Jobs with decorative dots cycling one → two → three, smoothly fading only the punctuation in a fixed-width reserve; no typewriter or moving words. Agent timing default: 2.4 seconds per cycle. Reduced motion keeps three static dots. This explicitly requested loop is a narrow motion exception. First change Reach us to the existing deep-blue token; retain off-white cards and readable navy details. Extend the same deep blue behind the rounded Send us a message panel, whose pastel-green fill, white form and shadows remain unchanged. Follow-up: extend Before you apply’s pastel-blue background behind the Open Jobs card, retaining the green gradient card and compact outer spacing (16 px phone, 24 px larger screens) above and below it. No commit before review. | 2026-11-04 |

| D175 | **About Talk to us channel cards** (the user, 2026-11-04). Place WhatsApp, Call and Email in individual rounded off-white cards on About, preserving the existing band, icons, values, links and reveals. Shorten the call label to Call us on this variant only, omitting 24/7. Follow-up: Phone and Email icon squares use navy with white marks; apply the same rounded cards and shorter call label to Services’ Talk to us, retaining its pastel-blue band. Other pages retain their labels and styles. No CMS control or migration. | 2026-11-04 |

| D176 | **No service categorisation in the app; remove Services’ empty opening gap** (the user, 2026-11-04). Remove audience labels from Home’s services slider and all service cards, grouped catalogue headings/actions, the admin audience selector/list labels and category wording on service share images. Preserve every service, name, photo, link, order and publish workflow. Historical audience values remain internal for backward compatibility; they no longer control presentation or related selection. No destructive content migration. Remove the redundant inter-section gap between Services’ image opening and All services; hidden sections already leave no wrapper in published or preview reads. No commit before review. | 2026-11-04 |

| D177 | **About Values: approved Promise triptych, hover shine only** (the user, 2026-11-04). Replace About’s What we stand for points with concept one: equal rounded deep-blue, pastel-green and mist panels using the existing commitment headings and statements, three columns on larger screens and stacked on phones. Retain the subtle circular outline decoration and sequential scroll reveals. Follow-up: a subtle diagonal sheen sweeps across the entire card once per fine-pointer hover; no lift, scale, tilt or movement of the card. Reduced motion is static. Other placements retain their existing layout. No new content, CMS control, dependency, data change or commit before review. | 2026-11-04 |

| D178 | **About Who we are description aligns with the photo** (the user, 2026-11-04). On larger screens put the description and photo in the same grid row below the heading, so their top edges align. Keep the existing phone order, all wording, image, reveals and Home layout; without a photo retain the ordinary text layout. No CMS control or data change. | 2026-11-04 |

| D179 | **Contact navbar consistency and Google Maps satellite view** (the user, 2026-11-04). Set the shared navbar’s soft-white card background directly on the component so Contact and every public page share the same base style. Replace Contact’s authored street drawing with a lazy Google Maps satellite iframe, retaining the rounded frame/shadow, published office address, editable pin when set and Open in Google Maps link. Use Google’s public embedded-map route without a new API key or dependency; validate its satellite rendering directly. With no confirmed coordinates, search the published company/address rather than guessing a pin. This explicitly requested Google embed supersedes D34’s no-embed choice for Contact and is a narrow third-party exception. Disclose the Google map in Privacy, preserve unrelated drafts, use an accessible iframe title and stable responsive geometry at least 200 px in both dimensions on supported screens, and verify phone/tablet/laptop plus enlarged text. No design setting, SQL migration, commit or deployment. Follow-up: use a stronger static two-layer navy map shadow, as requested. | 2026-11-04 |
| D180 | **Hydration warning investigation and regression checks** (the user, 2026-11-05). Investigate Home and admin sign-in reports containing browser-added `__gcrremoteframetoken`/`__gcruniqueid` attributes. Compare raw SSR HTML with a clean development browser and a controlled pre-hydration DOM annotation reproduction. Add public/auth and signed-in admin hydration checks, including a development-mode CI pass because React’s detailed attribute warnings are development-only. Preserve real error reporting; do not add annotation scrubbers, client-only forms, new warning suppression or extension-dependent app code. Test/config/docs only unless a genuine app mismatch is reproduced; no UI change, commit or deployment. | 2026-11-05 |
| D181 | **Impeccable polish without redesign** (the user, 2026-11-05). Preserve all approved content/layouts, palette, fonts, motion and draft workflows. Correct verified compact service-card row-height drift for longer titles, and make the shared editor Preview visibly/semantically unavailable during save/publish/discard so it cannot open stale content. Lock the editor’s native controls during these writes so edits cannot race with response-driven form resets. Review phone/tablet/laptop, keyboard and reduced-motion paths; keep runtime and performance budgets. No new controls, dependencies, migration, commit or deployment. | 2026-11-05 |
| D182 | **Home About commitments in one card** (the user, 2026-11-05). Home’s three existing intro points share one full-width off-white rounded card below the description, side by side from tablet width and stacked on narrow screens. Keep headings/descriptions and Read more after the card; omit tick marks and icon spacing. Only Home changes; existing About-page list/values stay. Empty points leave no card/gap, and up to six stored points remain supported. No content/data, CMS-control or schema change. | 2026-11-05 |
| D183 | **Home hero: three-second advance and plain arrows** (the user, 2026-11-05). Halve the main slider interval from six to three seconds; place simple previous/next SVG chevrons before/after the existing progression bars, no Pause or visible count. Wrap manually, restart the slide clock, preserve note visibility and existing reveal/wipe treatment. Scope the three-second token to the hero: services pyramid and other photo openings retain six seconds. Keyboard-visible focus pauses playback, including the new controls; pointer/hover do not stick. Reduced motion remains static with manual navigation. Verify 2–8 slides, narrow/large screens and the public budgets. | 2026-11-05 |
| D184 | **Cardless pyramid label concepts and mobile crop comparison** (the user, 2026-11-05). Show five image concepts using existing service photos/titles without rounded label cards. Use landscape cards on EVERY screen (latest correction), with a three-card proposal (two behind/below, one front/above) and a five-versus-three landscape comparison. Supply a responsive interactive prototype, not only static boards, with particular attention to mobile usability. User selects before any production pyramid layout/label changes; existing live pyramid stays. | 2026-11-05 |

| D185 | **Approved Home landscape pyramid** (the user, 2026-11-05). Apply soft photo fade with three landscape cards on every screen. Keep the front card centred and the two rear cards smaller/softer and symmetrically behind. Contain the complete composition within the current site gutters; no edge bleed. Final screenshot clarification: rear cards remain equally offset left/right and scale around their centre, sharing the front’s vertical centre. Both upper/lower corner gaps stay visible at every width; this supersedes the fixed 30 px drop, which protruded beneath shorter mobile cards. Equal-height native flex items preserve geometry across titles; transforms alone compose the pyramid, retaining layout boxes during deferred enhancement. No vertical deck. Titles sit at the bottom of each photo, centred horizontally in modest text, without a name arrow or rounded label card. Preserve every published service/link, order, manual controls/swipe, six-second automatic advance, keyboard pause, reduced motion and native fallback. Other service surfaces stay unchanged. No new admin control, content write, dependency or migration. No commit before review. | 2026-11-05 |

| D186 | **Full uncommitted-work Harden, commit-readiness review, then Polish** (the user, 2026-11-05). Sweep today’s changes and the complete uncommitted tree for functional, security, draft/preview, edge-case and responsive regressions. Use Impeccable Harden first; resolve confirmed defects and review all unstaged assets/code/docs for commit readiness before Impeccable Polish. Preserve approved visuals/content, no speculative redesign or new features. Verify phone/tablet/wide screens, text enlargement, keyboard/touch/reduced motion, test/build/coverage and runtime budgets. User’s no-commit-before-review requirement persists; this is readiness review only. No extra sub-agents. | 2026-11-05 |

| D187 | **Readiness review and at most two or three commits** (the user, 2026-11-06; verification continued after local midnight). Recheck the complete uncommitted bundle and, only when the local readiness gates pass, commit it in at most three coherent commits. This explicitly lifts the earlier no-commit-before-review restriction for this bundle. Preserve approved visuals, content, private drafts and credentials; use the required author, do not push or deploy. Local commit readiness does not close the remaining launch/device/security decisions. | 2026-11-06 |

| D188 | **Lightweight inline bold and italic website copy** (the user, 2026-11-07; approved the lightweight approach). Existing admin text strings support `**bold**`, `*italic*` and `***both***` in public display copy, with safe React strong/em rendering and the same draft → authenticated Preview → Publish/Discard flow. Keep unmatched markers literal and support escaped asterisks. Preserve headings, highlights, word/letter/typewriter motion, fifteen-font choices, reduced motion and responsive layouts. Plain-text projections serve metadata, sharing images, accessible names, dropdown labels, slugs and submission/email snapshots; URL, phone, email, address and password values remain literal. Add a concise editor hint, no toolbar, HTML, full Markdown dependency, upload, schema/table/migration or new design controls. Scope includes the public copy and its necessary plain-text uses; unchanged copy retains its current rendering. Validate parser safety, private drafts/publishing, markup across words/highlights, mobile/enlarged text and runtime budgets. | 2026-11-07 |

| D189 | **Admin User manual** (the user, 2026-11-07). Add User manual under Administration using the non-captioned admin walkthrough split into categorized instructions for new admins. Provide fixed written steps, short narrated clips, optional captions and transcripts. Serve bundled training assets only to signed-in admins; no new uploads, tables or external service. | 2026-11-07 |

| D190 | **Image focal points, per placement** (the user, 2026-11-07). After committing D188/D189, add framing to existing photo selections in page and service editors. The user chose independent placement references rather than a global Media Library setting. Store optional validated whole-percentage x/y coordinates beside each mediaId in the existing draft/published JSON; no new table or migration. Use an inline click/tap target with equivalent native range controls, reversible reset, and representative crop previews. Reused service references carry that service's framing into its cards, pyramid and opening. Logos remain contain-fit and have no focal-point control. Existing references without a point preserve current desktop/mobile defaults. Save → authenticated Preview → Publish/Discard, auditing and cache invalidation remain the owning document/record's. No new upload, generated variant, runtime image processing, dependency, external service or public-site JavaScript interaction. Necessary publishing hardening: retain Next caching and the D119 single-process memory scope, but include a process-shared per-tag revision in cache keys so a publish cannot serve stale content if Next 16.4.3 misses immediate expiry due to its wall/monotonic clock comparison. No cache handler, database or infrastructure is added. Commit separately; no push or client-server change. | 2026-11-07 |
| D191 | **Pre-push security and parallel CI** (the user, 2026-11-09). Finish R7.3 before the initial push to the private `mohd-jaffa/alhidaya` repository. Add host-only HSTS and browser security headers; a fresh per-response CSP nonce for executable scripts, with dynamic HTML at the root and the existing cached published data reads retained. Inline styles remain permitted for existing animation/focal styles; eval is development-only. Stream JSON within 32 MiB for authenticated content, 64 KiB for enquiries and 16 KiB for authentication; reject before decoding/schema/persistence. Dependency audits fail closed on unavailable/incomplete reports. `npm run verify` and a repository-local pre-push hook run the complete gates using the example local test database and separate media/CV directories without changing `.env.local`. CI runs static gates, security audits, 100% coverage, build and development hydration independently; production E2E and performance reuse one build in separate isolated jobs. Each DB suite/performance worker remains serial internally. Official actions are pinned to verified immutable commits with read-only permissions and no persisted checkout credentials. Push main only and confirm GitHub CI; no production deployment or client-server mutation. Malware scanning remains Q52. | 2026-11-09 |
| D192 | **Cold CI seed fixture** (agent default under the user-requested CI readiness, 2026-11-09). The first GitHub run passed the independent unit/build/static/security/development-hydration gates but the coverage job timed out while encoding all seed photographs and logos. Establish this real cold seed in a bounded ten-minute beforeAll fixture, preserving every assertion and preventing dependent idempotence tests from racing unfinished setup. Normal test deadlines, 100% coverage, public performance budgets, production code and image outputs remain unchanged. Local cold-fixture regression: all four cases passed in 73.85 seconds. Commit the CI correction with its evidence; delivery links the final GitHub run. | 2026-11-09 |
| D193 | **Hosted CI portability and motion startup** (agent default under the requested CI readiness, 2026-11-09). The initial hosted run exposed OS-dependent font probes (FontFaceSet.load also requested missing local Arial/Times fallbacks), Chromium synthetic touch gestures that did not move on Linux, and animation startup blocking the main thread. Load the real bundled font family explicitly in matrices, preserving all style/fit assertions. Use trusted touch events in bounded viewport-sized swipes, retaining full-page coverage assertions and every runtime budget. Wait for responsive/animation settlement in two flaky probes without changing pixel limits. Queue independent below-fold Reveal/word initializers in separate cancellable browser tasks; recheck visibility at execution, preserve GSAP contexts, cleanup, reduced motion, no-JavaScript content, geometry and all motion tokens. No streaming/hidden-content approach is retained. The queue adds 119 gzip bytes and remains under 170 KiB. Local Linux probes reproduced the font/touch causes and confirmed the portable inputs. Under an intentionally constrained Linux CPU the queued version reduced Home blocking from 1312 to 904 ms and Contact from 1594.5 to 981 ms; this stress experiment does not replace the unchanged reference-profile gates. Local verification resets only the generated `.next/dev` cache before development hydration, avoiding stale incremental-state reload loops while preserving the standalone build and review app. No new production service, dependency, database or admin control. | 2026-11-09 |
| D194 | **Leaner CI and a report-only hosted performance job** (the user, 2026-11-09: "make sure the CI is clean and efficient and optimized"; the user chose report-only for the performance job). Both hosted runs failed. The 20 desktop-scroll cases pass; on the mobile Lighthouse profile `/`, `/about`, `/services` and `/contact` score 0.84-0.93 (budget 0.95), `/` and `/about` also miss the INP and long-task limits, while LCP stays under 1 s and CLS 0. Only Total Blocking Time fails (300-650 ms); a Linux Chromium reproduction (CPU benchmark 2,800-2,900, like the runner's 2,300-2,480) shows the same pages and run-to-run noise of about 150 ms, while the same budgets pass on the faster development Mac. Wrapping every page section in `Suspense` was tried and rejected: React streams boundaries over about 12 KB after the first flush, shifting the layout (CLS 1.0). Decided: the performance job stays in CI, runs both projects as separate jobs, uploads every report and does not block `All gates passed`; the budgets (plan §31) are unchanged and remain strict in `npm run verify` and the pre-push hook; making them blocking again is one line and waits on a startup-JavaScript/hydration/layout rework (open item). Cleaned up as agent defaults: the separate unit job is removed (the coverage job runs every unit and database test); E2E runs as separate phone and desktop jobs, each on its own database and app (about 31 to about 17 minutes); only MySQL starts for hydration and performance (no Mailpit); the service start action takes the services it needs. Test fixes: the not-found and Request a Quote axe scans wait for the opening's finite animations (they caught text mid-fade); the dashboard's grids shrink to the screen (`minmax(0, 1fr)`), fixing a 2 px overflow at doubled text on a 320 px phone that only appeared with Linux font metrics when the list had rows. No product feature, schema or production change. | 2026-11-09 |
| D195 | **A fast pre-push hook** (the user, 2026-11-09: "can we do something to speed up the pre push gate"; the user chose the fast hook with heavy gates in CI). The full `npm run verify` took about 70 minutes (coverage 11, build 3, E2E 30, hydration 8, strict performance 16) and CI repeats all of it, now in parallel jobs. The hook runs `npm run verify:fast`: lint, format, types, both audits and the unit and database coverage at 100% (about 15 minutes). Build, E2E, development hydration and performance run in CI; `npm run verify` stays for a full local run. Consequence, accepted: the performance budgets are enforced automatically nowhere (GitHub is report-only, D194) and only when `npm run verify` is run by hand. No product, schema or production change. | 2026-11-09 |
| D196 | **CI in about ten minutes, and one push without the hook** (the user, 2026-11-09: "too long ... CI will take max 10min"; and "push this once without the pre-push hook, I have no time now", so this one push uses `--no-verify`; the hook stays for later pushes). The last run took 19 minutes (coverage 14, E2E 16 and 17, mobile performance 14). The slow suites are sharded across parallel jobs, each on its own database and app: lint, format, types, test layout and both audits share one job; coverage runs in four shards with no per-shard threshold (`COVERAGE_SHARD` in `vitest.config.mts`) and a merge job applies the real 100% (verified locally, including without a database); E2E runs phone and desktop in four shards each (Playwright `--shard`, by test file); performance runs mobile in three shards and desktop in one (`fullyParallel` with one worker per job). Estimated wall-clock about 10 minutes; the cost is about four times the runner minutes per run (about 110). Budgets, thresholds and tests are unchanged. Three of the earlier uncommitted performance edits were reverted because the hosted E2E and performance runs caught real regressions: `Suspense` around the Home hero, Mission and Clients (the hero streamed in late: layout shift 0.37 desktop and 0.70 in the font test, slower LCP), the hero's off-screen pause (broke the D136 playback test) and the map's scroll-idle deferral (broke the keyboard-stops test). Links without prefetch, the icon sprite and motion started in a transition stay. | 2026-11-09 |
| D197 | **Payment confirmed; v1.0.0 may be deployed; the agent takes the backup** (the user, 2026-11-14: "client have agreed on the app, so now its to deploy it safely. release as v1.0.0 … first backup the old site, backup the db … all the backups should reach me, keep in this projects root folder"; asked once whether the client had paid, the answer was "Yes, full payment is confirmed"). D48 is lifted: backups and server steps may start, and **each server change is still confirmed at its checkpoint** in `docs/RELEASE.md` (D44). The backup supersedes D50's "the user backs up": the agent streams it read-only over SSH into `backups/` (git-ignored, mode 700; nothing is written on the server, so its 1 GB quota is untouched) and proves it with a restore drill into a throwaway MySQL. Taken and verified 2026-11-14 as `backups/2026-11-14-pre-v1.0.0`: 11,839 files (228.8 MB) equal to the server's own list at their sizes, the 95 CVs, and the old database (9 tables, every row count equal after the restore). The old database's login is read only inside the remote shell (the user chose "dump on the server"); it is never printed or saved. | 2026-11-14 |
| D198 | **The old site is moved aside, not cleared, and deleted only on the user's word** (the user, 2026-11-14, "Move aside, delete later"; changes the order of D50, §21.2, §35.3 and R8.6). At the cutover, behind the maintenance page, everything in `public_html` except `.well-known/` and the notice moves to `~/old-site-2026-11-14/` (same filesystem, not served, instant to put back); the old database and its user stay untouched. Both sites fit the quota at launch (295 MB old + about 290 MB new of 1,024 MB). The old files and database are deleted only when the user says so, after the client holds the backup (D50) and the new site has run quietly (suggested 14 days). Rollback is therefore a move back, not a restore. | 2026-11-14 |
| D199 | **The launch content is copied from the user's local approved content** (the user, 2026-11-14, "Copy my local approved content"; supersedes Q30's seed-as-drafts for the launch). `scripts/content-export.mts` reads the local database (refusing any other) and writes `release-content/` (git-ignored): `content.sql` (documents, records, media rows and `site_operations`, in one transaction, every `created_by` and `updated_by` cleared) and exactly the media files those rows name. It never exports the admin account, sessions, logs, enquiries, applications or the rate-limit table. Applied to the empty production database at the rehearsal. The seed stays local-only. Exported 2026-11-14: 12 documents, 20 records, 75 media rows, 487 files (18.5 MB); there is no local `site_operations` row, so production starts on the defaults (enquiries to `info@`, applications to `hr@`, Q17). | 2026-11-14 |
| D200 | **Release mechanics (agent defaults under D197).** The server has no `rsync`, so the release uploads a tar over SSH and checks its SHA-256 (replaces §35.3's rsync). The build ships server source maps, six traced `.ts` files and a `public/media/.htaccess`, so `scripts/check-deploy-output.mjs --prune` removes them and then fails the release on any env file, key, map, source, test, docs, Git data or upload. A **maintenance page** covers the cutover window: a static, self-contained notice plus a marked block at the top of `.htaccess` answering every request **503 with `Retry-After`** (SSL challenges excepted), switched only by `scripts/maintenance.sh`, proven in a real Apache by `scripts/test-maintenance-kit.sh`. A hidden **rehearsal host** (Q22) runs the same build first. **Cloudflare Web Analytics is not built for v1.0.0** (only the security policy allows its host; add it right after launch). | 2026-11-14 |
| D201 | **The release is a version tag with a short check (the user, 2026-11-14, under D197 and D200).** `.github/workflows/release.yml` starts only on a pushed `vX.Y.Z` tag (it must equal `package.json` and sit on `main`); a branch push, a pull request or a manual run never deploys, and the rehearsal is dropped ("no need of rehearsal"). Main's own CI stays the long, detailed one and **does not gate a release** (the user will tag before it finishes); the release runs only the important small checks side by side, in about three minutes: that the tag is `vX.Y.Z`, equals `package.json` and sits on `main`, the static and security gates, every unit test, and the build, built **once** with `NEXT_PUBLIC_SITE_URL=https://alhidaya.qa` (Next writes it into the sitemap, robots.txt and canonical links), pruned and checked. Only then does it deploy to the live app (`alhidaya-site`, `alhidaya.qa`) with `scripts/release-deploy.sh` (space check, upload, SHA-256, save the database, migrate with Drizzle Kit through an SSH tunnel, switch, check, tidy, then a check of the live site from the internet) and the server-side `scripts/release-remote.sh`: a release is a new folder under `<app>/releases/`, `current` is one atomic symlink rename, `app.js` is the one stable startup file, and a site that does not answer is **switched back by itself**. The migration login is read from the server's secrets file over that SSH session when needed, so it is stored nowhere else. While the maintenance page is up, a per-window `X-Release-Check` token lets the release's own checks and the smoke test through. The 1 GB quota allows two releases (about 121 MB each): `--keep 2`. `scripts/content-import.sh` loads the approved content (D199) once, into an empty database as the app user. Proven in a Linux container (`scripts/test-release-remote.sh`), in Apache (`scripts/test-maintenance-kit.sh`), on a scratch MySQL and, before the rehearsal was dropped, on the real server. | 2026-11-14 |
| D202 | **The app serves `/media/` itself in production (`SERVE_MEDIA=true`), from `~/alhidaya-data/media` outside `public_html` (agent default, changes §21.3 and AGENTS.md §15).** Found on the real server: Passenger answers every path on the domain, even a file that exists in the document root (`/php.ini` returned the app's 404), so Apache never serves the media folder. The app's own `/media/` route serves only keys the app made, with their own type, `nosniff` and a year's cache; the files are no longer web-reachable by any other path. | 2026-11-14 |
| D203 | **The admin's column shows the build's version beside "Admin panel" (the user, 2026-11-14).** Under the logo, as "Admin panel v1.0.0" (a screen reader hears "version 1.0.0"); the number is the one in `package.json`, written into the build as `NEXT_PUBLIC_APP_VERSION` and read with `publicAppVersion()`, so a release's tag, `package.json` and this label always agree. None is shown when a build carries none. The words are in `ADMIN_TEXT` (`adminVersion`, `adminVersionSaid`). The admin is otherwise unchanged. | 2026-11-14 |
| D204 | **A loader on every admin action that is under way (the user, 2026-11-14: "when we click something, like login button or logout button, the click is processing but nothing shows ... keep a loader for such loading states").** The shared admin `Button` shows a turning ring (`Spinner`, token `--animate-spinner`, transform alone, the words' own colour, a still ring with reduced motion) in place of its mark whenever it is `pending`, besides the busy state it already had, so every button that already marks a pending state (sign in, sign out, save, publish, discard, upload, delete, notes, profile, forgot and reset password, operations) gets it at once. Two gaps are closed: after sign-in and sign-out succeed the page still has to load, so `useNavigation` keeps the button busy until the new page has arrived (a transition around the router's move) instead of looking idle between the answer and the arrival; and the status buttons (`MoveTo`) now show the ring on the one pressed while the others wait. Admin screens already show skeletons while their data loads. Public pages and their pills are unchanged. | 2026-11-14 |
| D205 | **No pre-push hook (the user, 2026-11-14: "remove the pre push hook, dont need that at all").** Supersedes D195's hook: `.githooks/pre-push`, `scripts/install-hooks.mjs` and the `prepare` script are removed, and the checkout's `core.hooksPath` is unset, so nothing runs on a push. `npm run verify:fast` and `npm run verify` stay, run by hand before a commit; CI on `main` is unchanged. | 2026-11-14 |
| D206 | **A release run is named after its tag (the user, 2026-11-14: "for that CI give name which is in release title").** `release.yml` sets `run-name: Release ${{ github.ref_name }}`, so a run started by the tag `v1.0.1` reads "Release v1.0.1" in the Actions list instead of the commit message. A tag-triggered run receives only the tag's name, not the title typed in the GitHub release form; the two are the same when the release is titled with its tag. | 2026-11-14 |
| D207 | **Main's CI keeps only what protects main, and is built to finish well inside ten minutes (the user, 2026-11-14: "improve the CI in main branch, it takes a lot of time, only keep the needed things"; the user chose to drop the performance and development-hydration jobs and to have an estimate, not a run, as proof; on the browser scope they were not sure, so every test is kept: agent default, overturnable).** A run took 14.5 minutes: the build (2 minutes) then the slowest of eight E2E shards (12.5 minutes). Now: the static and security gates, the unit and database tests in four shards merged at 100%, the build, and the phone and desktop journeys (PRODUCT.md: every journey at both, axe on every page) in **eight shards per project**, with Playwright's browser cached by its version. The report-only performance jobs (they missed their budgets on GitHub's runners every time) and the development-hydration job are no longer run there; both stay strict in the local `npm run verify`. `workflow_call` and the `ref` input are gone (the release no longer calls CI, D201). Estimate from the last run's timings: about 8 to 9 minutes; 7 is not promised without cutting desktop E2E or paying for larger runners. `tests/contract/ci-workflow.test.ts` guards the shape (the jobs, the one gate waiting for all, the shard count, the cache, pinned actions). | 2026-11-14 |
| D208 | **The E2E shards are split by measured time, and the seed's images are cached (agent default under D207, after D207's first run took 11 min 16 s, not the estimated 8 to 9).** Measured on that run: the tests themselves take only about 21 minutes in total across the 16 shards, but every shard first spent about 135 seconds in the global setup converting the seed's photographs into their sizes (sharp, AVIF), and Playwright's `--shard` splits by test count, so the heaviest files landed together (the slowest shard 476 s, the lightest 230 s). Now: `scripts/e2e-shard.mjs` gives each shard the spec files that balance by the seconds in `tests/e2e/shard-weights.json` (heaviest first to the lightest shard; a file not listed counts as 10 s and a new spec is never left out; an empty shard is an error, because Playwright with no file runs everything), **six shards for the phone and ten for the desktop** (whose files weigh more; the one heavy file, `consistency.spec.ts`, has a shard of its own); and `tests/support/seed-cache.ts` keeps the library's rows and files between runs in a CI cache keyed by everything that decides them, restoring them in under a second instead of re-making them (a trial: cold 80 s, warm 0.3 s, identical result; a cache that cannot be read is ignored). Estimate from the measured steps: the first run after this change (cache cold) about 9 minutes, later runs about 7. `tests/contract/e2e-shards.test.ts` proves every spec runs exactly once in every shard layout the workflow lists. | 2026-11-14 |


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

`/admin/login`, `/admin` (overview), `/admin/pages` (the eight pages, D88),
`/admin/pages/[page]`, `/admin/services` (+ `/new`, `/[id]`, D92),
`/admin/jobs` (+ `/new`, `/[id]`), `/admin/clients` (+ `/new`, `/[id]`), `/admin/media`, `/admin/enquiries`,
`/admin/applications`, `/admin/settings` (content, contact, navigation, footer,
SEO, brochure), `/admin/settings/operations` (recipients, retention, disk use, the last clean-up),
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

D158/D160 supersede the split opening below with the approved photo/header blend: full-width dimmed photo, white/light-blue copy, original coloured logo on a solid light header; only the photo’s top fades gradually into its light base. D157 allows the note pill to hide independently of the progression bars; it is hidden locally.

As Theme 6, the client's choice (D132):

1. **The slides** (fixed, first, D128): the admin's slides, five at launch from
   the current site, each a photo edge to edge beside its headline (a phrase
   in deep blue), its words and an optional button; they move on every six
   seconds, with Previous and Next, a bar for each and a pause; the card on
   the photo.
2. **About** (D129): the heading large with its phrase in blue, the lead and
   the rest of the words, the points as a ruled list, Read more about us.
3. **What we do** (D131): on a mist band, every service as a rounded photo
   card in a row to scroll, with its arrows, and All services centred below.
4. **Our clients** (D133): the logos in two rows running opposite ways.
   Hidden until logos are supplied.
5. **The short quote** (D130): on a pale-green band, the heading, the words
   and the ways to reach us beside the short form on its card.

Home's earlier sections (the services list, values, the staffing offer,
careers with the three most recent open jobs (D72), the contact band) stay
in its catalogue (§7.1) for the admin to add.

### 6.2 About — `/about`

Its photo opening uses the blended photo opening (D158/D160), with the original coloured logo and readable navy navigation. Without a photo, retain the readable text-only opening.

Page sign; the company's story; mission and vision (rewritten, D6); values;
clients; the contact section.

### 6.3 Services — `/services`

The main page’s photo opening follows the same blended photo opening (D158/D160); individual service details retain D146. Without a photo, retain the text-only opening.

Page sign; the full services index (§8), every service together in admin order
on a pastel-green band using compact thumbnail/title cards, without audience
groups or audience actions (D150); the unchanged institutions section; the
Talk to us section on pastel blue. Other sections, navigation and footer stay.

### 6.4 A service — `/services/[slug]`

D164 supersedes the editorial title/arched photo opening below: use the shared full-width fading photo opening with the service title and summary over it, as About/main Services. Keep the existing optional buttons and all following sections. No-photo records remain text-only.

Care editorial, the approved second concept (D146): a large blue title,
summary and tall rounded portrait, with up to two optional published header
buttons (label/destination), hidden by default. The admin adds, edits,
reorders or removes them through draft/preview/publish; internal/HTTPS safe
links only. About the service keeps the description and confirmed inclusions
on a pastel-blue band. Who it is for and the 24/7 panel are omitted, retaining
legacy stored content. Other services uses concept two’s compact thumbnail/title cards on pale green,
with All services, rather than Home’s portrait cards or duplicate audience
actions. D155 chooses three distinct published services across the full catalogue,
excluding the current service; fewer only if fewer than three others exist overall.
Navigation and footer stay. Opening and scroll animations are required, with
the existing reduced-motion path. The main listing follows §6.3 (D150).

### 6.5 Careers — `/careers`

Optional, movable page sign (D148; currently hidden locally). Its outer top spacing applies only while it is the first visible section; hiding or moving it removes the empty pastel-blue strip. The introduction; the open jobs (title, location, type, closing
date); what Al Hidaya asks of nurses in Qatar (from job requirements, never
generalised into a claim: the seed's *Before you apply* says what the form
asks for); a general application (Q7). **Empty state:** no open jobs says so
and offers the general application.

### 6.6 A job — `/careers/[slug]`

Title, location, employment type, experience, description,
responsibilities, qualifications, optional benefits, posted and closing dates,
**Apply**, under Careers' pill (D109). A closed job stays reachable and
says it is closed, offering the open jobs and the general application; it
carries `noindex` and no `JobPosting`. Structured data `JobPosting` for an
open job (§19).

### 6.7 Contact — `/contact`

The approved fifth concept (D145), with the user’s colours: a white opening,
pastel-blue Reach us ribbon and pastel-green message band. The headline types
fully, holds, deletes from the end, then repeats (D147); it pauses hidden or
offscreen and becomes complete still text with reduced motion. The published
lede remains. The old opening image is retained in content but not shown.

WhatsApp, phone and email span the ribbon; the company’s published hours and
optional brochure remain, untouched by D152. The rounded pastel-green message section
sits on a pastel-blue backdrop matching Reach us (D153) and
puts Send us a message, then the existing styled static map and office details
at the left, and the white form card with a float shadow at the right. No overlap.
Office details: Retaj Building, Bin Naifaa 80,
near Asmakh Mall, first floor, door 109, Al Sadd, Doha, with Open in Google Maps.
The existing Contact fields, consent, bot check and send behavior remain;
name/phone align and extra phone guidance is a placeholder. Keep admin section
order and visibility, with no overlap. The
navigation/footer stay unchanged. Existing word/reveal motion supports the page.

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
| `SIGN` | headline, the highlighted words (D109), supporting line, photo; on Home it is the slides instead (D128): one to eight, each a photo, a headline, its highlighted words, its words and an optional button (wording and link, both or neither), and the card on the photo (an icon and a note); on every other page the page's sign (D109), the page's name and actions fixed | every page (fixed, first except Careers: movable/hideable, D148) |
| `INTRO` | heading, its highlighted words, rich text, optional photo, up to six points (title, line) (D129); on Home it ends on Read more about us | Home, About |
| `SERVICES_INDEX` | heading, intro; shows every published service, in order | Home, Services |
| `VALUES` | heading, up to six items (title, line) | Home, About |
| `MISSION` | mission, vision | About |
| `INSTITUTIONS` | heading, text, photo; ends on Request a Quote | Home, Services |
| `CLIENTS` | heading; shows every published client logo, in order | Home, About |
| `CAREERS_BAND` | heading, text; shows the three most recent open jobs and a link to all (D72) | Home |
| `JOBS_LIST` | intro, empty-state text, optional photo (D174) | Careers |
| `CONTACT_BAND` | heading, text; reads the contact details (§13) | most pages |
| `CONTACT_DETAILS` | heading; contact details and the static map | Contact |
| `FORM` | heading, text; which form (Quote, Contact or the short quote, D130); the short quote on its band beside the ways to reach us, any other beside the site's email as a chip | Home (the short quote, D130), Contact, Quote |
| `RICH_TEXT` | headings, paragraphs, lists, links (no raw HTML) | About, Privacy, Terms |
| `SERVICES_ROW` | heading, text; every published service as a rounded photo card in a row to scroll, each opening its page, and All services; Home enhances this into the approved 30 px pyramid, automatically advancing every six seconds (D143) | Home |

Rich text is stored as structured blocks (heading, paragraph, list, link),
never HTML; links must be internal routes or validated `https` URLs. D188 adds
limited inline bold/italic shortcuts inside existing copy strings, rendered
through safe React nodes with plain-text projections for nonvisual uses.

## 8. Services

A **service** has: name; slug; **audience** (`FAMILIES` or `INSTITUTIONS`,
which sets its actions and its group on Services, D31, D111); short description; full description; **what's
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
date shows as closed on its own, with no admin step. A job's web address can
never be `apply`, which the general application uses (§5.1).

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

Years of experience are a whole number from 0 to 50. The fields go as one
JSON part beside the CV, and the route reads the whole body within 5 MB and
64 KB. An application keeps each answer as the applicant saw it, as an
enquiry does (§10.4). A closed job's form sends the visitor to the job's
page, which says it is closed (§6.6); a renamed job's moves on for good.

### 9.3 What happens on submit

1. The route checks Turnstile, the honeypot and the rate limit, then parses
   the fields and the file (type by magic bytes, size).
2. In one transaction, the rate limit and the job are checked, **the CV is
   saved in the private CV folder on the server** (D41) under its readable
   name (§9.4), and the **application row** is written with it; its original
   name, size and type are stored on the row. The save is tried 3 times, a
   moment apart (D84); if it still fails, or the folder has no room, nothing
   is kept and nothing counts against the limit, and the form says,
   beside the CV and above the send action, "Something went wrong with your
   CV upload. Please send it again.", with everything typed and the file
   still in it. Today warns once a CV no longer fits in the folder.
3. **The HR email** goes to the applications recipient (default
   `hr@alhidaya.qa`) with the details and **the CV attached** (D41).
4. The applicant sees a confirmation. If sending the mail fails, the
   application is still saved, the failure is logged, the mail-retry cron
   sends it again up to three times (D85), and the admin inbox shows the
   email as **not sent**, with how often it was tried and a Retry.

The HR email goes once the applicant has their answer (as D79 for
enquiries), carrying the CV as received, so a CV that could not be saved
still reaches HR. Its attachment is named as the CV is kept (§9.4), never by
the name it was uploaded under. Retry, the admin's or the cron's, sends the
email again with the kept CV; without one (expired, or unreadable) the email
says the CV is not attached. Since R6.10 (D84) every stored application has
its CV kept; *not stored* remains only for what arrived before.

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
internal notes, **Delete** (D82: asked first; the row, its notes and its CV
file go at once, audited). Deleting an application deletes its CV file.

The job filter lists the jobs that have applications, each by the title it
was last applied for under, and the general applications. "Needs you" is a
new application, or one whose HR email was not sent. Delete removes the CV
file first, so a file that cannot be removed leaves the application to try
again.

## 10. Enquiry forms

### 10.1 Request a Quote (Q5 default fields)

Name; organisation (optional); **who it's for** (my family / a hospital / a
clinic / a school / other); service (from published services, optional,
preselected when arriving from a service page); phone; email; preferred contact
(WhatsApp / call / email); message; consent.

### 10.2 Contact (Q6 default fields)

Name; phone; email; message; consent.

**Who it is for** and **preferred contact** are fixed choices
(`CARE_FOR`, `CONTACT_METHODS` in `src/constants/statuses.ts`); the service
is chosen from the published services, and the route refuses one the site
does not show. Every word of both forms is in the catalogue. Each form is
checked by its Zod schema in the browser, fetched once the visitor reaches
into it (D77), and again by `POST /api/enquiries`; a mistake shows beside
its field and takes focus; sent, the thanks replaces the form in place.
Every page with a FORM section can show either form: the section names it.

### 10.3 Protection (D18)

- **Cloudflare Turnstile**, verified on the server before anything is stored.
- A **honeypot** field; a filled one is accepted silently and discarded.
  It is hidden from sight and from screen readers, out of the tab order, and
  named so that no browser fills it in (`src/lib/api/honeypot.ts`).
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
`IN_PROGRESS`, `RESOLVED`), internal notes, **Delete** (D82: asked first;
the row and its notes go at once, audited). CSV export is Later unless the
user asks (Q15).

## 11. Client logos

A **client** has: organisation name; logo (image, §15); alt text; optional
website; sort order; status (`DRAFT`, `PUBLISHED`). Logos sit in **fixed 4:3
containers** with `object-fit: contain`, even padding and centred alignment,
so no logo is stretched or cropped; a logo can be shown in its original colours
or in a single tone (a constant of the design, not an admin control, D12).
**Empty state:** the Clients section stays hidden on the public site until at
least one logo is published (D7). The seed carries the current site's 11 logos as drafts
(D118), published once the client confirms them.

## 12. Brochure

One current PDF (at most 10 MB, typed by its first bytes), uploaded by the
admin (D10). `/brochure` redirects to it; `/profile.pdf` redirects to
`/brochure`. Replacing it keeps the URL.

## 13. Site content and settings

Footer background D166: retain only the faint pale-blue nurse-care scene under the user’s authorized fallback; extra tool drawings are omitted because their exact source artwork is unavailable. Keep the plain copyright strip, all existing content/layout and the slow logo shine.

Footer logo D165: a masked diagonal shine repeats over the stationary logo, with a static reduced-motion path.

Footer social refinement (the user, 2026-11-03): show Follow us on beneath the Contact details when at least one social link is published. One link shows its icon and name, aligned with the contact rows. Multiple links show icons only, side by side with wrapping as needed; each retains an accessible network name and a 44 px target. With no links, omit the heading and list. Preserve URLs and external-link protections. The user’s optical refinement moves only Instagram’s mark 2 px toward the inline start while retaining the label alignment and full target.

Three independent areas:

**Site content** (draft and published, D32): company name and short
description; contact details (phone, WhatsApp, email, address lines, map
link, the office's spot on the map (D74), "available 24/7" line); social links (Instagram today); the floating
WhatsApp button, on or off (D67); header navigation
(labels, order, visibility, from a fixed set of destinations: pages, services,
approved external URLs); footer columns and the footer's running words (D106); SEO defaults; the brochure.

**Font Manager** (D168): public font families only, in an independent `TYPOGRAPHY`
document with its own draft, published copy and cache tag. Twenty text roles
choose from fifteen bundled, licensed faces (D169 adds five to D168's ten). Existing sizes, weights, colours and
layout remain fixed. Save draft, authenticated Preview, Publish and Discard use
the shared editor; publishing typography leaves the Site content draft alone.
The admin's own font stays unchanged, and no font upload is offered.

**Operations** (take effect on save, audited): the enquiries recipient(s),
the applications recipient(s), **retention days (1 – 365, D24)** for enquiries
and applications, and **CV expiry days (1 – 365, D52)**.

## 14. Draft, preview and publish

- Every editable thing (a page's sections and SEO, a service, a job, a client
  logo, site content) keeps a **draft** and a **published** copy.
- **Save draft** writes only the draft. **Preview** opens the real public
  page in Next.js draft mode, showing drafts, with a fixed "Preview" bar and
  **Exit preview**; only a signed-in admin can enter it. Unsaved changes are
  saved first (D120).
- **Publish** copies the draft to published in one database transaction,
  writes an audit row, and **revalidates exactly the cached pages that show
  it** (§22). **Discard draft** resets the draft to the published copy.
- Each item publishes on its own (D86); the admin overview lists every
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
- **Per-placement photo framing (D190):** optional x/y focal coordinates belong to the existing page/service image reference, with its draft/preview/publish lifecycle. Media files and unrelated placements are unchanged.
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
| The Dashboard (the Overview, D81; "Today" until D115) | What needs the admin, newest first in the day's log: new enquiries and applications, failed mails or CV saves, items with unpublished changes (each as its phase builds it); "Everything" for all that arrived. Enquiries and applications are one stream, paged together. "Needs you" is an arrival still new, or one whose email to the team did not go; a CV not stored is marked on its row (it arrives new, so it needs the admin until they move it along: nothing can bring the file back, §9.3). |
| Pages | The eight pages with their state; each page's sections: show/hide, move up/down and drag to reorder, add and remove (D87), edit in place, the page's SEO, save draft, preview, publish, discard (D88). |
| Services | List, order, create, edit, preview, publish, archive. |
| Jobs | List by status, create, edit, close, publish, archive. |
| Clients | Logos: add, order, publish. |
| Media | Upload, alt text, search, usage, delete. |
| Enquiries | §10.5. |
| Applications | §9.5. |
| Settings | Site content (§13), brochure. |
| Operations | Recipients, retention. |
| Activity | The audit trail of admin changes. |
| User manual | Categorized video lessons, written instructions and transcripts for every admin area (D189). |

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
  **Sent again (D83, D85, R6.10):** an enquiry alert or HR email that
  failed, or is still marked as sending 10 minutes after it arrived, is sent
  again by a cron job every 10 minutes (`POST /api/cron/mail-retry`), oldest
  first and at most 10 of each a run, up to three more tries, each recorded
  on its row (`email_retries`, `email_retried_at`) before it is made, so two
  runs never send one twice; then it waits for the admin's Retry, and the
  inbox says which. The password reset is not retried. The cron entry
  (R8.2): `*/10 * * * *`, `curl -fsS -X POST -H "Authorization: Bearer <CRON_SECRET>" https://alhidaya.qa/api/cron/mail-retry`.
- **The enquiry alert** (§10.4, D79): from `noreply@`, to every enquiries
  recipient set in Operations, Reply-To the visitor; who sent it and when
  (Doha time), every answer under its label, and a button to the enquiry in
  the inbox. Sent once the visitor has their answer; marked sent or not
  sent. The mail server is given 10 s to connect and greet and 30 s between
  replies; in production it is reached over TLS unless it is on the same
  machine.

## 18. Retention and privacy

- **The retention period** (D24) is set by the admin, 1 – 365 days (Q8 default
  180 until set).
- **CVs expire on their own setting** (1 – 365 days, D52), which may be
  shorter than the retention period.
- A **daily job** deletes enquiries and applications older than the period,
  their notes and their CV files, and the CV files past the CV expiry: a
  **cPanel cron job** calls
  `POST /api/cron/retention` with `CRON_SECRET` (D39). A file that cannot be
  deleted is retried the next day and shown in the admin. The run is
  audited with its counts only, and Operations shows the last one (R6.7).
  The cron entry (R8.2) runs once a night:
  `curl -fsS -X POST -H "Authorization: Bearer <CRON_SECRET>" https://alhidaya.qa/api/cron/retention`.
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
                 ├─ cron (daily) ──► POST /api/cron/retention
                 └─ cron (every 10 minutes, D85) ──► POST /api/cron/mail-retry
Browser ──► Cloudflare Web Analytics beacon · Turnstile widget
GitHub Actions (on a release) ──► build ──► rsync over SSH ──► migrate ──► switch ──► restart
```

- **No worker, queue, Redis or external database.** Work happens in the
  request; the timed jobs are cPanel cron entries: the daily purge, and the
  mail retry every 10 minutes (D85).
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

The client is not upgrading, so the site is built to fit. The old site is backed
up and verified (D197), moved aside at the cutover and deleted only on the user's
word (D198), so at launch both fit (295 MB old + about 290 MB new of 1,024 MB);
once it is deleted about 950 MB remain:

| Use | Budget |
|---|---|
| Two release folders (live and rollback), standalone builds | ≤ 250 MB |
| The media folder (made image sizes only, the brochure) | ≤ 250 MB, enforced |
| The CV folder | ≤ 250 MB, enforced (about 50 CVs at the 5 MB maximum) |
| The database, logs, mail and Next's cache | ≤ 150 MB |
| Headroom | ≥ 50 MB |

An upload that would pass its budget is refused with the reason; a CV is
refused as one not saved, and the applicant sends it again (D84). The admin overview shows each folder's use and warns at 80 %;
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

- Public pages render on the server **per request**, so they work without
  JavaScript and a missing page answers 404, and their **database reads are
  cached** (D76: Next's `unstable_cache`, `src/lib/content/cache.ts`). Cache
  Components was set aside: it prerenders cached reads at build, where the
  client's database is out of reach. The visitor receives finished HTML, with
  no client-side fetching of content.
- Every published read is tagged (`page:<key>`, `site`, `services`,
  `service:<slug>`, `jobs`, `job:<slug>`, `clients`, `media`). **Publish**
  revalidates exactly its tags (`revalidateContent(publishedTags(…))`, called
  by the admin's publish route, R6); stale content is never served, and the
  next visitor gets fresh HTML.
- **The cache lives in the app's memory only** (D119,
  `experimental.isrFlushToDisk: false`): Next keeps the record of revalidated
  tags in memory, so reads kept on disk would outlive it and come back stale
  after a restart. In memory, a restart starts empty. It assumes one app
  process (§35.3).
- Draft mode (preview) reads the drafts, uncached, for the admin only: draft
  mode on **and** the admin's session still valid (`contentView`).

**Per-tag publish revisions (D190):** within the same single Node process, published-read cache keys include the current in-memory revision of each existing cache tag. Publish increments exactly those tags before Next's normal revalidation. This protects immediate fresh reads from the installed framework's wall/monotonic expiry comparison; Next retains its bounded cache and memory-only storage. Revisions survive module reloads, reset on process restart together with the cache, and add no table, cache handler or infrastructure.

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
Inter Tight is the default (D108). D168/D169 provide fourteen optional Latin variable sans and serif
faces, with fixed allowlisted assignments per public text type. All are bundled
with their licenses and metric-adjusted Arial or Times New Roman fallbacks (`src/assets/fonts/`).
The existing Inter Tight preload remains; optional faces are not preloaded and
load when selected content uses them. Typography has an independent draft and
published document, administered under Settings → Font Manager. The admin
panel keeps Inter Tight. Font sizes, weights, spacing and all other design
controls remain locked.

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
│   ├── (site)/               # the public site: header, footer, smooth scroll
│   │   ├── page.tsx          # /
│   │   ├── about/  services/[slug]/  careers/[slug]/apply/  careers/apply/
│   │   ├── contact/  request-a-quote/  privacy/  terms/
│   │   └── layout.tsx
│   ├── admin/                # the admin panel (signed-in), login under (auth)/
│   ├── api/                  # REST route handlers (§29)
│   ├── brochure/route.ts     # the brochure redirect (307 to the published PDF, 404 without one)
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
│       (careers and enquiries also: form.client.ts, the public form's endpoint, §31)
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
| `admin-messages.ts` | `ADMIN_TEXT`: the admin panel's words, apart so the public pages never load them (§31) |
| `routes.ts` | every public route and the endpoints the public pages call |
| `admin-routes.ts` | the admin's pages and endpoints, apart for the same reason |
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
frame-ancestors `none`, and a nonce-based Content-Security-Policy allowing the app,
Turnstile, analytics, and the approved Google map frame (D191). HTML is rendered
per request so the nonce is never reused; published data keeps its D76/D119 cache.
Executable scripts have no unsafe-inline/eval allowance in production. Existing
inline styles are permitted for GSAP transforms and focal coordinates. JSON reads
are streamed and bounded before decoding: 32 MiB authenticated content, 64 KiB
public enquiries, 16 KiB authentication. This supports the schema's largest escaped
document while bounding request memory; uploads keep their separate limits.

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
| `enquiries` | §10: form, status, email status (with how often the mail-retry cron sent it again and when, D85), fields as submitted (labels and values), name/email/phone for search |
| `enquiry_notes` | internal notes |
| `applications` | §9: job (or none), job title as published when applied for, fields, the CV's stored key, original name, size and type, CV status (`PENDING`, `STORED`, `NOT_STORED`, `EXPIRED`) and email status (`PENDING`, `SENT`, `NOT_SENT`), with how often the mail-retry cron sent it again and when (D85) |
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
| `POST /api/cron/retention` | the daily purge (`CRON_SECRET` as a bearer token, compared in constant time; no session, no origin: the cron entry calls it with curl): enquiries and applications past retention with their CV files, CV files past their expiry, old rate-limit windows and logs; answers the counts (R6.7) |
| `POST /api/cron/mail-retry` | every 10 minutes: emails not sent, tried again up to 3 times (`CRON_SECRET`, D85, R6.10) |
| `POST`/`DELETE /api/admin/session` | sign in (lockout first) and sign out, through Better Auth on the server; its own HTTP routes are never mounted (R1.2) |
| `POST /api/admin/password/forgot`, `/reset` | ask for a reset link (the same answer for any email; rate-limited), and set a new password from it |
| `GET /api/admin/pages`, `/api/admin/pages/[key]` (+ `/publish`, `/discard`) | the pages and their state; a page's draft, saved whole (D88) |
| `/api/admin/services` (+ `[id]`, `/publish`, `/discard`, `/archive`; `/order` + `/publish`, `/discard`) | services: made, saved, published, discarded, archived and restored one at a time; their order a draft of its own (D92) |
| `/api/admin/jobs` (+ `[id]`, `/publish`, `/discard`, `/archive`, `/close`) | jobs, as the services; `/close` closes one at once or opens it again (D92) |
| `/api/admin/clients` (+ `[id]`, `/publish`, `/discard`, `/archive`; `/order` + `/publish`, `/discard`) | client logos, as the services (D92) |
| `/api/admin/media` (GET, POST; + `[id]` PATCH, DELETE) | the library with where each image is used; upload (multipart, the words as one JSON part); an image's words; delete, refused while it is used (D89, D93) |
| `/api/admin/enquiries` (+ `[id]`, `/notes`, `/retry-mail`) | the inbox |
| `/api/admin/applications` (+ `[id]`, `/notes`, `/cv`, `/retry`) | the inbox; `/cv` downloads the CV (§9.4) |
| `/api/admin/site` (GET, PUT; + `/publish`, `/discard`, `/brochure`), `/api/admin/operations` (GET, PUT) | settings: the site's content as one draft, a new brochure uploaded into it (D94); operations: the recipients and keeping periods, saved at once, with each folder's use and the last clean-up (D95) |
| `GET /api/admin/activity` (`?kind=CONTENT\|INBOX\|SETTINGS\|SIGN_INS`, `?page=`) | the audit trail (D96): the admin's changes newest first, 50 a page, each with who made it and what it was made to by name; an enquiry or an application never by a person's details |

## 30. Design system and motion

### 30.1 The direction — the user's reference (D97)

> **Theme 6 (D132) supersedes this direction for the public site, from
> 2026-10-31:** the current site's simple structure in a cleaner look, deep
> blue leading with leaf-green accents on soft white; the header's floating
> pill, the slides (D128), About (D129), What we do (D131), the clients' rows
> (D133), the short quote (D130) and the soft-white footer. `DESIGN.md`
> records it. What follows is the earlier direction, kept for its history.

Pinned by the user (2026-10-30): the telehealth landing language of Dribbble
shot 24320685 (Eloqwnt for DocInPoc), followed section by section in Al
Hidaya's words, photos and the logo's colours. The direction contract lives in
the public site's surface brief (`.impeccable/surfaces/`) and is the authority
for every public screen; `DESIGN.md`, recorded from the built world at the
end of Phase 6B (R6B.5, after the finish review's "ship after fixes" and
its fixes), is the design system's authority. The reference's frames are
the composition the build matches (code-led: no image generation).

**The world.** A white page; pale mist cards with large soft radii; the logo's
leaf green deepened to forest for the primary pills, the accent card and the
footer, and lightened to a pale tint for audience pills, icon chips and the
highlight behind a headline word (D98); navy ink with a quiet grey for the
softer words of a statement; Inter Tight, large, light and tight (D108);
round photo avatars in groups; round pill buttons with an arrow; thin line
pictograms in chips. Licensed stock photography (D8), never captioned as Al
Hidaya's staff.

**Home, in the reference's order.** The split hero: nurse avatars between
round brackets, the headline with one word on a pale-green highlight, the
supporting line, "WhatsApp us" (forest) and "Request a quote" (pale), a card
with an avatar group and a real fact; beside it a tall rounded care photo with
word chips and two floating cards. A statement that darkens word by word as
it scrolls, with inline icon chips. Four highlight cards. "For Hospitals,
Clinics & Schools": a heading with an inline icon, three cards (a team, a
photo, Doha's reach) and real-fact counters. "For Families": the services
sliding in a card (D102), a photo card and small feature cards. How it works:
four steps with round photos, moving sideways while held. The Contact form
(D104). The forest footer with "AL HIDAYA HEALTH CARE" running across it
(D106) above its columns.

**Motion.** A headline's letters settle from wide spacing into the word; a
statement's words turn from grey to ink with the scroll; every block rises in
as it scrolls into view (D125); counters count; the process steps and the
family services run in endless loops (D124), and the footer's words in an
endless slow loop (D113); the phone menu fades in with its rows rising one
after another (D117). Nothing else moves on its own (WCAG 2.2.2): every
other movement follows the scroll or arrives once, and each loop stops by
its own pause button (and, for the two rows, under the pointer or focus).
Reduced motion shows everything in place.

**The other pages (D109 – D112).** Each opens like Home's hero, smaller: the
page's name on a pale pill, the headline settling into its words with a phrase
on the highlight, the supporting line and the page's own actions as pills,
beside a tall rounded photo (licensed stock until the client's own, D110).
Their sections keep their content and take the same language: headings large
and light; mist cards with soft radii for the values (numbered like the
steps), the mission (on forest) and vision, the job cards, the ways to reach
the company and the services (photo cards by audience, D111); the staffing
offer as one card with its photo; the contact band on forest; the forms as
lines on a mist panel with the forest send pill, as the reference draws its
form. A service's and a job's pages and the application follow the same
opening; the system pages say what happened in the same type, with the ways
on as pale pills. Cards rise in one after another as they arrive.

**The header** is not pinned (D107), and **no rail** runs down any page (D101).

*Superseded:* "Follow the Line" (D36, 2026-10-28), the hospital wayfinding
system with its coloured lines, stations and "You are here", built in Phases
2 – 5 and retired in Phase 6B.

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
- **Type roles** (`src/app/globals.css`): section 28 px, title and
  supporting line 21 px, body 17 px, small and label 14 px (the sign's and the
  page's sizes, and the line's width and stations, retired with the line in
  R6B.4). Radii 6 px (the admin's panels and controls) and 4 px (tags);
  durations 120, 200 and 640 ms; an exponential ease-out.
- **The redesign's tokens (Phase 6B, D98; the greens as D122 set them):**
  the logo's leaf `#86AE3C` is the primary fill with navy words (6.1:1), its
  hover `#7A9F37` (5.1:1) and its quieter words `#1D393F` (4.8:1); forest
  `#5B7628`, the leaf deepened only as far as words and marks on white
  (5.2:1), mist (4.8:1) and the pale leaf (4.6:1) need; focus rings navy on
  the leaf; the pale leaf `#EEF5E2` carrying forest or navy text; a quiet grey `#7D8AA0`
  for large type only (3.5:1 on white). Display roles: hero 42 – 76 px,
  display 32 – 52 px, statement 26 – 46 px, figure 40 – 60 px, the footer's
  running words 64 – 176 px, light and tight; cards 28 px radius, photo
  frames 24 px, pills round; a soft floating shadow for cards over a photo.
- **Contrast rules (WCAG AA):** white text only on deep blue, navy or forest;
  sky blue and leaf green carry navy text when text sits on them; body text
  is navy on white; the quiet grey only at large sizes.
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

- **Home’s cinematic slides (D136):** CSS coordinates a 1.1 s photo wipe, the headline’s words, the supporting line and optional action, then the note and progress. The outgoing photo’s drift freezes beneath the incoming wipe. The photo drift and progress share a six-second clock; deliberate keyboard focus on the hero stops both; hovering or clicking never pauses it. No navigation or Pause buttons and no count; reduced motion keeps the first slide still. The wipe is the single-photo clip-path exception to the rule below.
- **Home services (D143):** the centre card leads a 30 px stepped pyramid, retaining every title/link panel while rear photos soften. The existing arrows and swipe move through the published services. A deferred native controller uses the hero’s six-second CSS duration, pauses offscreen/in hidden tabs/during deliberate keyboard focus, and cleans up on navigation; reduced motion keeps static manual navigation. No pause button, as approved. A native row remains usable if enhancement fails.
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

> **D138 (2026-11-01) updates the palette below:** pastel-green navigation, mobile menu and sign-in panel with navy text and the colour logo; forest actions, links, focus and switches; a leaf active row and counts. White work areas and original status/error colours stay. These roles are scoped to `/admin`; the public site stays blue-led.

The same tokens, type and pictograms, quieter: Operate mode, dense where it
helps. Shaped with `/impeccable shape` (R6.1, brought forward, D80) as **the
day's log** (D81): a column in the logo's deep blue (D123) listing its
sections, each with its mark, in
groups under bold headings parted by a light rule, the current one marked by
its highlight, what waits in a sky count (a plain list since D101, without the
line and its stations; D115); at its foot the admin's name, Profile and Log
out (asked first); on a phone a deep-blue bar naming the section, with the list
as a menu. The work area is white; a list is ruled by day with times in even
figures; a row opens in place on mist. Deep blue for actions and "New", sky for
in progress, leaf for resolved, the error red only for failures. Fixed type
sizes (28 px headings), no smooth scroll, motion only for state. The sign-in
screens share the column's deep blue beside a plain form.

### 30.6 The static map

An authored SVG of the streets around Retaj Building, Al Sadd (near Asmakh
Mall), on a mist card with the office as a forest dot (R6B.4), built from
OpenStreetMap data with its attribution, plus **Open in Google Maps** (D34).
No map scripts, no cookies. `scripts/make-map.mts` makes it (a 900 × 600 m
frame centred on Asmakh Mall, the landmark); the office is marked at the spot
set in the site content (D74).

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
enforced in CI; pages, layouts and share-picture routes are composition only
and covered by E2E.

Must cover: public reads return only published content; drafts never leak;
enquiries, applications and CVs unreachable without the admin session; rate
limit and honeypot; Turnstile failure; CV type and size refusals; CV storage
and mail failure paths; publish and
revalidation; section rules (fixed, maxima); redirects (every old URL);
retention purge; lockout; redaction of personal data; reduced motion.

**The critical journey (E2E):** a family taps WhatsApp from Home; an
institution sends a quote; a nurse applies with a CV (mail caught by Mailpit);
the admin signs in, edits a service, previews, publishes, and the public page
changes (`tests/e2e/critical-journey.spec.ts`, R6.9; each part also runs on
its own, at both widths, in its feature's journeys).

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
parallel: static + security (lint, format, typecheck, test layout, dependency audits) | coverage in 4 shards + local DB, merged at 100% | build
build → parallel: E2E phone (6 shards) and desktop (10 shards), axe, split by measured time (D208)
every job → All gates passed (D207: only what protects main, well inside ten minutes)
```

From Phase 7 also the performance budgets (§31): strict in `npm run verify` and no longer run on GitHub's runners (D194, D207). The fast subset (D195) is run by hand; there is no pre-push hook (D205).

### 35.3 Deploying to cPanel

- **A release deploys; a push does not** (as clinicdesk). Publishing a GitHub
  release `vX.Y.Z` (equal to `package.json`) re-runs CI on the tag and, only
  when it passes (D45), **builds on GitHub** (shared hosting has too little
  memory to build), checks the output (`scripts/check-deploy-output.mjs`: no
  source, source maps or env files), **uploads the standalone build over SSH
  as a tar (the server has no rsync, D200)** into a new release folder, **applies new migrations** to the
  server's database as the migration user, switches the app to the new
  folder, and restarts Passenger. The previous release folder stays for an
  instant rollback. As built (D201) the release starts on a pushed `vX.Y.Z` tag and runs a short check
  (tag and version, static gates, unit tests, build; main's long CI does not gate it); there is no rehearsal.
- **The app runs as one Passenger process** (D119): the published-content
  cache lives in its memory, so a second process would not hear of a
  publish. The release workflow and `docs/RELEASE.md` check it (R8.2).
- **The media folder and the CV folder live outside the release folders**,
  so no deploy or rollback ever touches them.
- **Before the first deploy the old site is backed up and verified** (its files,
  its admin panel and its database, kept in `backups/`, D197); at the cutover it
  is moved aside, not cleared, and deleted only on the user's word (D198); the
  user gives the backup to the client (D50). `docs/RELEASE.md` is the checklist.
- The SSH key, host and paths are GitHub secrets. The app's runtime env is
  set in cPanel's Node.js app settings.
- `docs/RELEASE.md` (Phase 8) is the step-by-step guide.

### 35.4 Before code

**Every test passes locally first.** `npm run verify` runs the same gates as CI
(D191): independent static/security checks together, then 100% unit/integration
coverage, build, production E2E, development hydration and performance serially.
It uses `.env.example` local-only test settings and separate `.data/verify-*`
files; `.env.local` and the real local database are untouched. Install dependencies
with Node 22/npm 11. There is no Git hook (D205): run `npm run verify:fast` by hand before a commit
(static, audits and 100% coverage; D195); `npm run verify` adds the browser gates. CI uses isolated services per database job,
reuses a tarred standalone/static artifact and collects separate reports. A push
checks code only; it cannot deploy to cPanel.

## 36. Observability

- Structured JSON logs (request id, redacted) to the app's log on cPanel.
- The `error_log` table takes the server's own failures (`captureError`),
  without personal data, kept 30 days.
- The `audit_log` keeps every admin change (who, what, when), kept a year.
  Activity (`/admin/activity`, R6.8, D96) reads it as a day's log: what
  each change was made to by its name (a page, a service, an image's
  words), an enquiry or an application only as "an enquiry", the fields a
  setting changed by name and never their values.
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
| 6B | The redesign | The public site after the user's reference (D97): new look, sections and motion; the rail removed everywhere; the header unpinned |
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
| R0.9 | The old site (`public_html`, the `alhidaya_hidaya` database) is backed up and verified; **the user** gives the backup to the client and later says when the old site and database are deleted from the server | D50, D197, D198 | Full payment (D48, confirmed) | PARTLY DONE (2026-11-14: the agent's backup is taken and verified, `backups/2026-11-14-pre-v1.0.0`; the hand-over and the deletion are the user's, after the cutover) |

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
| R3.6 | Caching with tags; draft-mode preview | §22, §14 | — | DONE (2026-10-29; Publish's revalidation is wired by the admin's publish route, R6) |
| R3.7 | SEO: metadata, OG images, JSON-LD, sitemap, robots; the 301 map | §19, §5.3 | Q9 | DONE (2026-10-29; `JobPosting` and the closed jobs' `noindex` come with the job page, R5.1; the preview's `noindex` with R3.6; shared-link cards refreshed and all 19 launch routes crawler-verified for review under D140, 2026-11-01) |
| R3.8 | E2E + axe on every public page, phone and desktop; performance numbers recorded | §34, §31 | — | DONE (2026-10-29; every public page of Phase 3 has its journeys with axe at both widths; numbers in the changelog) |

### Phase 4 — Enquiries

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R4.1 | Quote and Contact forms: schemas, UI, success and error states | §10 | Q5, Q6 | DONE (2026-10-29; Q5 and Q6 as their defaults; checks after first paint, D77; Turbopack's grouping of shared code is for R7.1) |
| R4.2 | Turnstile verification, honeypot, rate limit | §10.3 | — | DONE (2026-10-29; Cloudflare's test keys until R8.4; seen only when needed, D78; the rate limit came at R1.5) |
| R4.3 | Alert emails, failure logging, retry | §10.4, §17 | Q17 | DONE (2026-10-29; sent after the answer, D79; Retry is the inbox's, R4.4) |
| R4.4 | Enquiries inbox: list, filters, detail, status, notes | §10.5 | — | DONE (2026-10-29; the inbox in the day's log, D81; deletion stays with retention, §18) |
| R4.5 | Integration + E2E | §34 | — | DONE (2026-10-29; integration against MySQL and Mailpit with each row; the journey from a quote request through its alert's link to the admin moving it along) |

### Phase 5 — Careers

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R5.1 | Careers page, job page, closed and empty states, `JobPosting` | §6.5, §6.6 | — | DONE (2026-10-29; a closed job is `noindex`; `apply` is no job's address) |
| R5.2 | Application form with CV (type by bytes, size); general application | §9.2 | Q4, Q7 | DONE (2026-10-30; the CV is saved in the private folder now, the rest of R5.3 to come; a closed job's form sends the visitor to the job) |
| R5.3 | The CV folder in use: save under a random id, admin-only download, delete with the application | §9.4 | — | DONE (2026-10-30; the download is a file to save under the CV's kept name, `no-store`, `nosniff`, sandboxed, and recorded; a CV not kept is refused with where to find it) |
| R5.4 | Submit: row, CV saved, HR email with the CV attached, failure paths and retry | §9.3 | — | DONE (2026-10-30; the email after the answer, as D79; Retry attaches the kept CV; a CV not stored has no Retry of its own) |
| R5.5 | Applications inbox | §9.5 | — | DONE (2026-10-30; in the day's log like the enquiries, with Today one stream of both, D81; Delete asked first for both inboxes, D82) |
| R5.6 | Integration + E2E (mail caught by Mailpit) | §34 | — | DONE (2026-10-30; a job's application through HR's email, its CV attached, to the admin's download and Delete) |

### Phase 6 — Admin CMS

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R6.1 | `/impeccable shape` the admin (Operate) | §30.5 | — | DONE (2026-10-29; brought forward, D80; the day's log, D81; brief and direction in `.impeccable/surfaces/src-app-admin-page-tsx.md`) |
| R6.2 | Admin shell, sign-in screen, overview; `lib/query` (SWR reads and writes, from clinicdesk) | §16 | — | DONE (2026-10-29; brought forward, D80; Today is the Overview, D81; Applications and the content screens join the rail with their rows) |
| R6.3 | Pages: section list (show/hide, move, drag), section editors per type, preview, publish, discard | §7, §14 | Q19 | DONE (2026-10-30; shaped with the user, D86 – D90) |
| R6.4 | Services and jobs editors | §8, §9.1 | — | DONE (2026-10-30; shaped with the user, D92) |
| R6.5 | Clients and media library (upload pipeline, sizes, alt text, usage, delete) | §11, §15 | — | DONE (2026-10-30; D92, D93; the sizing step and `storeImage` came forward with D75) |
| R6.6 | Settings: site content, navigation, footer, SEO, brochure | §12, §13 | — | DONE (2026-10-30; D94) |
| R6.7 | Operations: recipients, retention (1 – 365), CV expiry (1 – 365), disk use; the daily purge job (cPanel cron) | §13, §18, §21.2, D52 | Q8 | DONE (2026-10-30) |
| R6.8 | Activity (audit trail) | §36 | — | DONE (2026-10-30) |
| R6.9 | E2E: edit → preview → publish → the public page changes | §34 | — | DONE (2026-10-30) |
| R6.10 | Retries (D83): saving a CV tried 3 times during the upload, then nothing kept and the applicant asked to send it again (D84); every enquiry alert and HR email that failed sent again by the mail-retry cron every 10 minutes, up to 3 more tries, each recorded (D85, a migration); the admin's Retry for what still fails | §9.3, §17, D83, D84, D85 | R6.7's cron | DONE (2026-10-30) |
| R6.11 | Categorized User manual with private narrated lesson clips, written steps and transcripts | §16, D189 | Admin walkthrough | DONE (2026-11-07; 37 clips/12 topics, 1,376 tests and 100% coverage, production build and 22 phone/desktop admin/access/manual E2E cases passed) |

### Phase 6B — The redesign (D97 – D108)

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R6B.1 | The foundation: the new direction recorded (§30.1, the surface brief); the greens and the display type as tokens (D98); Inter Tight self-hosted (D108); the rail removed from every public page (D101); the header no longer pinned, with the four links and the forest quote pill (D107); the admin's left column a plain list, without its line and station dots (D101) | D97, D98, D101, D107, D108 | — | DONE (2026-10-30) |
| R6B.2 | Home in the reference's sections (D97, D100): the split hero; the statement; the four highlight cards; "For Hospitals, Clinics & Schools" with its counters (D99, D105); "For Families" with the services sliding in a card (D102, D105); how it works, four steps; the Contact form (D104): each a section type in the Pages editor, seeded, with the new photographs (licensed stock, D8, D75) and their motion | D97, D99, D100, D102, D104, D105 | R6B.1 | DONE (2026-10-30) |
| R6B.3 | The forest footer with its running words, editable in Settings (D106), and its columns | D106 | R6B.1 | DONE (2026-10-30) |
| R6B.4 | Every other public page in the new look and motion (D103): About, Services, each service, Careers, each job, Apply, Contact, Request a quote, Privacy, Terms, the system pages and the share pictures; the old line components retired | D103 | R6B.2 | DONE (2026-10-31; D109 – D112) |
| R6B.5 | The finish: budgets (§31), axe and keyboard at every width, reduced motion, the journeys updated, the finish review against the reference, `DESIGN.md` | §31, §32, §34 | R6B.2 – R6B.4 | DONE (2026-10-31) |
| R6B.6 | The user's review of the redesign, the public site: the scroll that stopped short of the page's end fixed and Lenis made snappier; the footer's words in an endless loop with a pause button (D113); the current site's slide sentences as Home's headings, and a simpler footer (D114); the brochure in the header (D116); the phone menu opening smoothly (D117) | D113, D114, D116, D117 | R6B.5 | DONE (2026-10-31) |
| R6B.7 | The user's review of the admin (D115): the Dashboard, the menu's marks and ruled groups, the profile (name, password), log out asked first, the sign-in page's panel, the professional wording, the menu's own scroll | D115 | R6B.6 | DONE (2026-10-31) |
| R6B.8 | The current site's images in the seed (D118): its 11 client logos as client-logo drafts, its 15 photographs in the media library | D118 | R6B.7 | DONE (2026-10-31) |
| R6B.9 | The user's review of publishing: a publish never lost when the app restarts (D119); Preview saves first (D120); the admin column's logo loaded first | D119, D120 | R6B.8 | DONE (2026-10-31) |
| R6B.10 | The user's review of the look: the company named as its logo reads (D121); the logo's green as the primary, with navy words (D122); the admin in the logo's blue (D123); how it works in the families' card and Our services in its place, both looping (D124); every block revealed as it scrolls in (D125); deleting an image in red (D126) | D121 – D126 | R6B.9 | DONE (2026-10-31) |

### Phase 6C — Theme 6, the client's look (D128 – D138)

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R6C.1 | Home as Theme 6: the slides (D128); About and headings rising (D129); the short quote (D130); What we do (D131); the header, the footer, the colours, the soft whites and the buttons (D132); the clients' rows (D133); the four old Home sections removed; the menu's sliding pill and the admin's switches (D134); the seed and the journeys | D128 – D134 | R6B.10 | DONE (2026-11-01) |
| R6C.2 | Every other public page in Theme 6: the inner pages' straight-lined opening, Talk to us, the services' cards, About's mission, vision and values, Contact's and Careers' bands and Contact's card; Contact's and Careers' openings, a job's page and Apply kept as they are (D135) | D132, D135 | R6C.1 | DONE (2026-11-01) |

| R6C.3 | Home’s cinematic automatic hero: layered photo wipe, coordinated text and frame, progress only; no Previous, Next, Pause or count; reduced motion and deliberate keyboard focus; no pause on hover or click | D136 | R6C.2 | READY FOR REVIEW — all local checks passed (2026-11-01), uncommitted |

| R6C.4 | About’s Mission and Vision as distinct paired panels: assembling medical cross, unfolding globe, masked headings and statements, reduced motion | D137 | R6C.3 | READY FOR REVIEW — phone and desktop browser checks passed, uncommitted |

| R6C.5 | Pastel-green admin navigation and sign-in, forest actions and switches, original status colours, public palette isolated | D138 | R6C.4 | READY FOR REVIEW — all local checks passed (2026-11-01), uncommitted |

| R6C.6 | Home-only services pyramid, 30 px steps, six-second advance, rear labels and softened photos, manual arrows/swipe and reduced motion | D143 | R6C.5 | READY FOR REVIEW (2026-11-02): full coverage 100%, full E2E plus final focused journeys, all 20 initial-JS budgets and four targeted performance cases passed; uncommitted |
| R6C.7 | Five service-detail and five Reach us/message-form image concepts; implement only after the user chooses | D144 | — | CONCEPTS CHOSEN (2026-11-03): Contact five (D145/D147) and service two (D146), with the user’s section-colour, compact related-card and header-action changes; implementation in R6C.8 |
| R6C.8 | Implement approved Contact ribbon/typewriter and service editorial pages with optional published header buttons | D145, D146, D147 | R6C.7 | READY FOR REVIEW (2026-11-03): local checks passed, uncommitted |
| R6C.9 | Careers opening: move, hide, restore; hide the current local opening and its unused top spacing | D148 | — | READY FOR REVIEW (2026-11-03): spacing follow-up verified, uncommitted |
| R6C.10 | Mission/Vision hover lift and highlight | D149 | — | READY FOR REVIEW (2026-11-03): local checks passed, uncommitted |
| R6C.11 | Main Services All services section: unified green compact cards | D150 | — | READY FOR REVIEW (2026-11-03): local checks passed, uncommitted |
| R6C.12 | Home quote reference layout with pastel-blue background | D151 | — | READY FOR REVIEW (2026-11-03): local checks passed, uncommitted |
| R6C.13 | Contact message reference layout, map/office left and form right; preserve Reach us | D152, D153 | — | READY FOR REVIEW (2026-11-03): local checks passed, uncommitted |
| R6C.14 | Standard WhatsApp brand mark everywhere and green floating shortcut | D154 | — | READY FOR REVIEW (2026-11-03): local checks passed, uncommitted |
| R6C.15 | Three distinct Other services across the full published catalogue, excluding current | D155 | — | READY FOR REVIEW (2026-11-03): local checks passed, uncommitted |
| R6C.16 | About and main Services opening-action visibility controls; hide both now | D156 | — | READY FOR REVIEW (2026-11-03): local checks passed, uncommitted |
| R6C.17 | Home slider pill visibility switch; hide the local published pill | D157 | — | READY FOR REVIEW (2026-11-03): local checks passed, uncommitted |
| R6C.18 | Approved photo opening with gradual image fade and solid navbar on Home, About and main Services | D158, D160 | — | READY FOR REVIEW (2026-11-03): local checks passed, uncommitted |
| R6C.19 | Mobile menu contact-label fit and shorter Brochure download label | D159 | — | READY FOR REVIEW (2026-11-03): local checks passed, uncommitted |
| R6C.20 | Impeccable Adapt: public site and mobile menu proportions, touch/landscape/desktop verification | D161 | — | READY FOR REVIEW (2026-11-03), uncommitted |
| R6C.21 | Public navbar in normal flow; white Careers/Contact navigation surfaces | D162, D163 | — | READY FOR REVIEW (2026-11-03), uncommitted |
| R6C.22 | Individual service photo openings match About/main Services; retain optional buttons | D164 | — | READY FOR REVIEW (2026-11-03), uncommitted |
| R6C.23 | Footer Instagram/social icon and label align with contact rows | §13 | — | READY FOR REVIEW (2026-11-03): phone/desktop verified, uncommitted |
| R6C.24 | Footer Follow us on: one network with name, multiple icons in a row | §13 | — | READY FOR REVIEW (2026-11-03): phone/desktop verified, uncommitted |
| R6C.25 | Subtle diagonal shine over the stationary footer logo | D165 | — | READY FOR REVIEW (2026-11-03): slow sweep and reduced motion verified, uncommitted |
| R6C.26 | Faint nurse-care footer background; omit approximate tool art, preserve all content and shine | D166 | — | READY FOR REVIEW (2026-11-04): nurse-only fallback, local checks passed, uncommitted |
| R6C.27 | Phone menu: concept 3 deep-blue sheet, no email or 24/7; smooth open and close, its rows following the sheet | D167 | — | READY FOR REVIEW (2026-11-03): local checks passed, uncommitted |
| R6C.28 | Public Font Manager: fixed ten-font library, role assignments, isolated drafts/preview/publish, responsive validation | D168 | — | READY FOR REVIEW (2026-11-04): 100% coverage, complete browser regression, 600-case font matrix and targeted performance passed; uncommitted |
| R6C.29 | Expand Font Manager with five expressive fonts, retain all existing choices and validate responsive/font-loading behavior | D169 | — | READY FOR REVIEW (2026-11-04): 15 fonts, 100% coverage, 900 layout cases, delayed-load and Home performance gates passed; uncommitted |
| R6C.30 | Halve the footer logo shine pause, preserving the existing slow sweep and reduced motion | D170 | — | READY FOR REVIEW (2026-11-04): 4.5 s sweep / 2.75 s wait, phone/desktop and reduced motion passed; uncommitted |

| R6C.31 | Match the mobile Home pyramid to the five-card laptop composition, preserving readable cards and touch behavior | D171 | R6C.6 | READY FOR REVIEW (2026-11-04): five layers, 624 active-card cases, touch/fallback, 100% coverage and Home performance passed; uncommitted |

| R6C.32 | App-wide responsive/visual consistency review and verified fixes across public and admin screens | D172 | R6C.31 | DONE (2026-11-05; local review, 1,309 tests/100% coverage, responsive matrices and performance gates passed; no commit) |

| R6C.33 | Requested Home contact-square colours and off-white Contact Reach us channel cards | D173 | R6C.32 | DONE (2026-11-05; local review, 1,309 tests/100% coverage, responsive matrices and performance gates passed; no commit) |

| R6C.34 | Five Open jobs refinement concept images with existing content, desktop/mobile and proposed motion; no implementation before selection | User, 2026-11-04 | R6C.32 | DONE (2026-11-04): five separate boards; concept three approved by the user, implementation tracked in R6C.35 |

| R6C.35 | Approved Careers nurse-photo accent, smooth looping heading dots and continuous deep-blue Contact backdrop | D174 | R6C.34 | DONE (2026-11-05; local review, 1,309 tests/100% coverage, responsive matrices and performance gates passed; no commit) |

| R6C.36 | About Talk to us rounded contact cards and shorter call label | D175 | R6C.35 | DONE (2026-11-05; local review, 1,309 tests/100% coverage, responsive matrices and performance gates passed; no commit) |

| R6C.37 | Remove service categorisation throughout the app and redundant Services opening gap | D176 | R6C.36 | DONE (2026-11-05; local review, 1,309 tests/100% coverage, responsive matrices and performance gates passed; no commit) |

| R6C.38 | Five non-list concepts for About’s What we stand for, with current statements and desktop/mobile images | User, 2026-11-04 | R6C.36 | DONE (2026-11-04): five boards delivered; concept one approved, implementation in R6C.39 |

| R6C.39 | About Promise triptych with sequential reveals and stationary hover shine | D177 | R6C.38 | DONE (2026-11-05; local review, 1,309 tests/100% coverage, responsive matrices and performance gates passed; no commit) |

| R6C.40 | About Who we are description aligned with its photo | D178 | R6C.39 | DONE (2026-11-05; local review, 1,309 tests/100% coverage, responsive matrices and performance gates passed; no commit) |

| R6C.41 | Contact shared navbar surface and responsive Google satellite map | D179 | R6C.40 | DONE (2026-11-05; local review, 1,309 tests/100% coverage, responsive matrices and performance gates passed; no commit) |

| R6C.42 | Hydration diagnostics and public/admin development/production regression gates | D180 | R6C.41 | DONE (2026-11-05; controlled reproduction, 160 clean route/screen checks, lint/typecheck/format; no app mismatch reproduced, no commit) |

| R6C.43 | Impeccable polish: compact card alignment, pending-preview state and edit protection during writes | D181 | R6C.42 | DONE (2026-11-05; 1,310 tests/100% coverage, responsive/font/hydration matrices and performance passed; uncommitted for review) |

| R6C.44 | Home About full-width three-column points card without check marks | D182 | R6C.43 | DONE (2026-11-05) |

| R6C.45 | Hero three-second clock and simple manual chevrons around the progress bars | D183 | R6C.43 | DONE (2026-11-05) |

| R6C.46 | Five cardless service-title concept images and mobile three-landscape-card crop comparison | D184 | R6C.43 | DONE (2026-11-05; concepts/prototype delivered; selected soft photo fade with three cards is implemented under D185) |

| R6C.47 | Approved three-card landscape Home pyramid, soft photo fade and modest centred bottom titles within existing gutters | D185 | R6C.46 | DONE (2026-11-07; local checks/review passed; included in the user-authorized D187 commits) |

| R6C.48 | Full uncommitted-work Harden, commit-readiness review and then Polish | D186 | R6C.47 | DONE (2026-11-07; local checks/review passed; included in the user-authorized D187 commits) |

| R6C.49 | Final complete-bundle readiness review and user-authorized commits | D187 | R6C.48 | DONE (2026-11-07): 1,318 tests/100% coverage, 264 E2E cases, development hydration, 40 performance cases and static/build gates passed; bundle recorded in two local commits; no push or deployment |

| R6C.50 | Lightweight inline copy formatting, animated-heading compatibility and clean plain-text projections | D188 | R6C.49 | DONE (2026-11-07; 1,359 tests/100% coverage, 270 E2E cases, formatted development hydration, 240 styled font/width/scale states and all 40 performance cases passed; user authorized the current-work commit on 2026-11-07) |

| R6C.51 | Per-placement photo focal points with crop previews, private drafts and public rendering | D190 | R6C.50 | DONE (2026-11-07; 1,388 tests/100% coverage, 274 E2E cases, development hydration and all 40 performance cases passed; separate user-authorized local commit) |

### Phase 7 — Performance, accessibility and the finish

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R7.1 | Performance budgets in CI; fixes until every page meets them | §31, D139 | — | LOCAL GATES VERIFIED (2026-11-07; D187): fresh full 40-case Lighthouse/JS/interaction/touch/wheel/cadence suite passed on the final bundle, with CI gates and evidence committed. Real-device/compositor, field and server-region checks remain release work (`docs/PERFORMANCE.md`) |
| R7.2 | Accessibility: axe everywhere plus a manual keyboard and screen-reader pass | §32, D142 | — | IN PROGRESS (2026-11-01): automated axe, responsive/long-content/text-enlargement and keyboard/menu checks passed; identified 44 px targets fixed. Manual screen-reader speech and Q49 remain open |
| R7.3 | Security review against OWASP ASVS level 2 (sign-in, sessions, uploads, file access, input, headers and CSP, secrets, logging); fixes; `npm run verify` and the pre-push hook | §26, §35.4, D55 | — | DONE (2026-11-09; D191: broader source review and security fixes; 1,401 unit/DB tests, 100% coverage, 278 distinct production E2E cases after fixture correction, development hydration and all 40 performance cases passed locally; full verify/pre-push hook and parallel CI added. Initial GitHub run to be linked in the push delivery. Q52 remains a launch decision) |
| R7.3a | Cold CI image-seed fixture barrier and bounded setup deadline | D192 | R7.3 | DONE (2026-11-09; four cold-seed integration cases passed locally in 73.85s; unchanged assertions and application budgets; final GitHub validation linked in delivery) |
| R7.3b | Portable hosted font/touch probes and cancellable motion startup tasks | D193 | R7.3 | DONE (2026-11-09; Linux causes reproduced; 1,405 unit/database cases with 100% coverage, 278 production browser cases, both development hydration cases and all 40 performance cases passed locally. Minimum Lighthouse 96, CLS 0 and original thresholds retained; full pre-push checks repeat before upload, with final hosted validation linked in delivery) |
| R7.3c | Leaner and sharded CI, report-only hosted performance, E2E stability fixes and a fast pre-push hook | D194, D195, D196 | R7.3b | READY FOR REVIEW (2026-11-09; workflow validated with actionlint; unit/database coverage, format, lint and types pass locally; hosted CI result linked in delivery. The mobile performance budgets remain an open item: strict locally, report-only on GitHub) |
| R7.4 | Impeccable finish review of the public site; fixes; `DESIGN.md` and `.impeccable/design.json` from the built world | §30.1 | — | AUDIT COMPLETE (2026-11-01), entire codebase: `docs/audits/2026-11-01-impeccable-audit.md`; 15/20 at audit; findings 3/4 local fixes READY FOR REVIEW (D139; 40 performance cases passed, sidecar refreshed); finding 2 identified targets fixed by D142; finding 1/Q49 remains open. D142 harden/polish READY FOR REVIEW (`docs/audits/2026-11-01-impeccable-harden-polish.md`) |
| R7.5 | Client sign-off: copy, images, logos, legal pages | D6, Q18 | Client (§40) | TODO |

### Phase 8 — Deploy and go-live

| ID | Work | Source | Waits on | Status |
|---|---|---|---|---|
| R8.1 | The production MySQL database, created after the old one is cleared (D50), with two users (app: data rights; migrations: schema rights); migrations; the admin account; the media folder (with its `.htaccess`) and the CV folder (`700`) | D39, D49, D54, §21.1 | Full payment (D48), R0.9 | DONE (2026-11-14) |
| R8.2 | cPanel Node.js app (Node 22); env; the release workflow over SSH port 2200 with its own deploy key (build, check, tar upload, migrate, switch, restart, rollback; D200, D201); the daily cron and the mail-retry cron (every 10 minutes, D85); the app kept to one Passenger process (D119); `docs/RELEASE.md` | §35.3, §21.1 | Full payment (D48) | DONE (2026-11-14) |
| R8.3 | The sender mailbox (Q24); mail routing kept Remote; DKIM and DMARC `p=none` added **at HostCarts' DNS** (the world's nameservers are theirs, not this cPanel's, found 2026-11-14); verified with sends to info@ and hr@ in Microsoft 365 | §17 | Full payment (D48) | PARTLY DONE (2026-11-14: mail login and delivery proven; DKIM and DMARC at HostCarts not added, optional) |
| R8.4 | Turnstile keys for alhidaya.qa (replacing the test keys, which always pass; checked before go-live); Cloudflare Web Analytics site | §10.3, §20 | — | OPEN (live on Cloudflare's public test keys; the owner adds the real ones) |
| R8.5 | Pre-switch check on the server; speed from Qatar; the Cloudflare-proxy decision | D25 | Q22 | DROPPED (2026-11-14: no rehearsal; the live site was smoke-tested behind the maintenance page) |
| R8.6 | Switch alhidaya.qa to the Node.js app; every 301 verified live; sitemap to Search Console; the old site's files moved aside at the cutover (behind the maintenance page) and removed only on the user's word, after the backup is verified (D198, §21.2) | D21, §19 | — | DONE (2026-11-14: switched, 301s verified live; the sitemap to Search Console is the owner's) |
| R8.7 | Smoke test; release `v1.0.0` | §35 | — | DONE (2026-11-14: `v1.0.0`) |

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
| ~~**Full payment confirmed by the user** (D48)~~ (confirmed 2026-11-14, D197; each server change is still confirmed at its checkpoint) | R0.9 and every server step |
| **Urgent, today's site:** remove the public `.well-known.zip` and rotate the secrets it exposed; protect `upload/CV` (§40.1) | now, independent of the build |
| The old site backed up (done and verified 2026-11-14, D197), given to the client by the user (D50), and moved aside at the cutover, deleted only on the user's word (D198) | the cutover |
| The GitHub repository (created by the user) | R0.5's first CI run |
| Approval of the rewritten copy, at the user's demo (D70) | R7.5 |
| Client names and permission for their logos, and the logo files | before the Clients section shows (D7) |
| The brochure PDF: `profile.pdf` from the user's backup of the old site (Q3, D91), uploaded in Settings at launch | R8.1 |
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
| Q3 | ~~Reuse the current `profile.pdf` as the brochure?~~ | **Answered by D91:** Yes, until the admin uploads a new one. |
| Q4 | ~~CV rules~~ | **Answered by D91:** PDF, DOC or DOCX; at most 5 MB (size limits confirmed, D52). |
| Q5 | ~~Quote form fields~~ | **Answered by D91:** As §10.1. |
| Q6 | ~~Contact form fields~~ | **Answered by D91:** As §10.2. |
| Q7 | ~~Keep a general application (no job), like today's "Submit your resume"?~~ | **Answered by D91:** Yes, at `/careers/apply`. |
| Q8 | ~~Retention and CV expiry before the admin sets them~~ | **Answered by D91:** 180 days each. |
| Q9 | ~~Service names, slugs, order and "what's included"~~ | **Answered by D91:** The current eight, renamed in plain English during the copy rewrite, in the current order; "included" items only where the client confirms them. |
| Q10 | ~~Typeface~~ | **Answered by D61:** Atkinson Hyperlegible Next, with Noto Sans Arabic. |
| Q11 | ~~Stock photo source~~ | **Answered by D91:** Unsplash and Pexels (free licences), each image's source recorded. |
| Q12 | ~~Pictograms~~ | **Answered by D91:** Drawn for this site in the system's line weight (built in R2.3). |
| Q13 | ~~Dependency majors~~ | **Answered by D91:** clinicdesk's (D38). |
| Q14 | ~~WhatsApp prefilled message~~ | **Answered by D91:** "Hello Al Hidaya, I would like to ask about nursing care." |
| Q15 | ~~CSV export of enquiries and applications~~ | **Answered by D91:** Later. |
| Q16 | ~~Rate limit~~ | **Answered by D91:** 5 submissions per form per 10 minutes per visitor. |
| Q17 | ~~Who receives which email~~ | **Answered by D91:** Quote and Contact → `info@alhidaya.qa`; applications → `hr@alhidaya.qa`; both editable in Operations. |
| Q18 | ~~Legal review of Privacy and Terms~~ | **Answered by D91:** Drafted from what the site actually does; the client reviews before launch. |
| Q19 | ~~Publish per item, or one "publish all"?~~ | **Answered by D86:** per item; the Pages list and Today show what waits. |
| Q20 | ~~Where the daily purge job runs~~ | **Answered by D39:** a cPanel cron job. |
| Q21 | ~~Store content per locale now (`{ "en": … }`)?~~ | **Answered by D91:** Yes (§33). |
| Q22 | ~~Pre-switch check under a hidden temporary subdomain on the server (not a public staging site)?~~ | **Answered by D91:** Yes. |
| Q23 | ~~A floating WhatsApp button on every page, as today?~~ | **Answered by D67:** yes, and the admin can turn it off. |
| Q24 | ~~Send from the existing `noreply@alhidaya.qa`?~~ | **Answered by D53:** yes. |
| Q25 | ~~Upgrade the HostCarts plan?~~ | **Answered by D51:** no; build within §21.2's budget. |
| Q26 | ~~How uploaded images are served~~ | **Answered by D91:** From a media folder inside `public_html` that no release touches, served by Apache (§21.3); verified on the server at R8.2. |
| Q27 | ~~What happens to the old site's 83 CVs and its database?~~ | **Answered by D50:** they go with the user's backup to the client and are cleared from the server; nothing is imported. |
| Q28 | ~~Reuse the old site's service photos (`upload/Services`)?~~ | **Answered by D91:** Only where they are good enough for the new design; otherwise licensed stock (D8). |
| Q29 | ~~Content in two tables (`documents` and `records`), or a table per kind (services, jobs, clients, the site)?~~ | **Answered by D91:** Two tables (D60): one draft-and-publish mechanism everywhere, each kind's rules in its own schema; the database still checks every key and collection. |
| Q30 | ~~How does the approved copy reach the production database?~~ | **Answered by D91:** The seed (`npm run db:seed`, local only today) runs once against the empty production database at R8.1, with the user's go-ahead, after the client approves the copy (R3.1, R7.5); it writes drafts, and the admin publishes them. |
| Q31 | ~~May form errors use a red, the one colour outside the logo's (D35)?~~ | **Answered by D63:** yes, for errors only. |
| Q32 | ~~Show WhatsApp's own logo on WhatsApp actions?~~ | **Answered by D66:** the site's chat pictogram and the word *WhatsApp*. |
| Q33 | ~~Keep the kit preview page (`/kit`, D64), local and test only?~~ | **Answered:** yes, local and test only (D64). |
| Q34 | ~~Motion's weight against the JavaScript budget (§31: ≤ 170 KB, motion included). Measured at R2.4: 133.5 KB at first paint (Next.js and React) + 51.7 KB of motion after paint (GSAP 26.7, ScrollTrigger 17.1, Lenis 5.3) = 185 KB before any page content.~~ | **Answered by D65:** motion is counted outside the first-load budget. |
| Q35 | ~~The sign's "You are here" marker sits above the headline, which Impeccable's audit flags as a kicker. Keep it there, or move it?~~ | **Answered by D68:** (b), moved to where the three lines start; each headline stands alone. |
| Q36 | ~~On a phone, "You are here" can show twice in the first screen (the progress line and where the three lines start). Keep both, or hide the progress line while the lines are on screen?~~ | **Answered by D69:** keep both. |
| Q37 | ~~How the copy goes to the client for approval (R3.1)~~ | **Answered by D70:** reviewed at the user's demo; changes are made in the admin. |
| Q38 | ~~The three lines' names on Home: edited by the admin, or fixed in code?~~ | **Answered by D71:** fixed in code. |
| Q39 | ~~How many open jobs Home's careers section shows~~ | **Answered by D72:** the three most recent, then a link to all. |
| Q40 | ~~Uploaded images as a `<picture>` from their made sizes, or through a custom `next/image` loader?~~ | **Answered by D91:** A `<picture>` (D73): AVIF with a WebP fallback, at every made width, and no script. |
| Q41 | ~~Choose the licensed stock photos now and bring forward the step that makes an image's sizes?~~ | **Answered by D75:** yes. |
| Q42 | ~~How public pages are cached (§22.1)~~ | **Answered by D76:** (b), per-request rendering from cached reads, Publish revalidating exactly its tags. |
| Q43 | ~~The public forms' checks: Zod fetched when the visitor first reaches into the form, without React Hook Form (≈ 164 KB at first paint), or React Hook Form and Zod in the first load (≈ 194 KB, over the 170 KB budget)?~~ | **Answered by D91:** The first (D77). |
| Q44 | ~~Turnstile: seen only when Cloudflare needs the visitor to tick a box, or always shown under the form? And when Cloudflare cannot be reached: refuse the form (nothing kept unchecked), or keep it marked unchecked?~~ | **Answered by D91:** Seen only when needed; refused (D78). |
| Q45 | ~~Send an enquiry's alert after the visitor's answer (fast; a restart in that moment leaves it for Retry), or before it (the visitor waits about a second on the mail server)?~~ | **Answered by D91:** After (D79). |
| Q46 | ~~When an applicant's CV cannot be saved: keep nothing and ask them to send it again, keep the application and ask for the CV, or keep it as now?~~ | **Answered by D84:** (a), tried 3 times, then nothing kept and "Something went wrong with your CV upload. Please send it again." |
| Q47 | ~~How a failed automated email is sent again: a cron job, quick tries in the request, or both? Does the password reset take part?~~ | **Answered by D85:** (a), a cron job every 10 minutes, up to 3 more tries, each recorded; the password reset left out. |
| Q48 | Home’s cinematic hero timings and its deliberate keyboard-focus stop, without a Pause button? | **Agent default (D136), for review:** a 1.1 s wipe, 900 ms words 45 ms apart from 160 ms, supporting line at 480 ms, optional action at 620 ms, note and progress at 760 ms; the six-second clock stops only on deliberate keyboard focus and resumes on leaving. Hover and mouse-focus pauses were removed after the user reported sticking. |
| Q49 | A persistent stop mechanism for Home’s hero/services, Contact’s looping headline and both client-logo rows, while retaining the user’s progression-only slider? | **OPEN after the 2026-11-01 audit:** deliberate keyboard focus and the single chosen logo do not provide a persistent stop while the page remains usable (WCAG 2.2.2). The user chooses any new mechanism; none was added by the audit. |
| Q50 | Performance lab tooling and exact Fast 4G profile? | **Agent default (D139), for review:** Lighthouse 13.6.0 as a development dependency; 4× CPU, 40 ms RTT, 9 × 1,024 Kbps down / 1.5 × 1,024 Kbps up. Lab interactions use actual Event Timing and scroll probes; physical-device and server-region evidence is separate. |
| Q51 | Share-preview composition? | **Agent default (D140), for review:** the current Theme 6 logo/headline card, with page-specific published words and crawler checks; no new editable design controls. |
| Q52 | Malware scanning for PDFs and Word CVs? | **Current task answered by the user (D141), 2026-11-01:** harden and verify existing checks now; decide malware scanning before launch. The launch decision remains open; no scanner or confidential-file transfer to an external service is enabled. |

| Q53 | Hardening/polish layout defaults? | **Agent default (D142), for review:** reuse the existing menu beyond five visible links or 42 total label characters; content-sized phone sign-in band; preserve the current design and content. These defaults can be overturned at review. The 44 px target floor is the existing requirement. |
| Q54 | Which service-detail and Contact compositions should replace the current sections? | **RESOLVED (D145, D146):** Contact’s fifth concept (Blue ribbon) is approved with a white opening, pastel-blue Reach us and pastel-green message section, unchanged navigation/footer and animation. Service concept two (Care editorial) is also approved under D146, with two optional editable header buttons. |
| Q55 | Font Manager library and text-role vocabulary? | **Scope answered by the user (D168/D169):** public website only, fixed bundled library, no font uploads; retain the original ten and add five expressive fonts for fifteen total. **Agent defaults, for review:** the fifteen families and twenty semantic text roles listed in DESIGN.md; the user may replace these choices. Existing font/size/weight/spacing defaults are preserved. |

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
