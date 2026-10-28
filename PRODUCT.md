# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

One responsive Next.js site for every device, phone first. The public site
and the admin panel are the same app. No store app.

## Stack

Chosen by the user (2026-10-28), recorded in the plan's decision log:

- Next.js 16 (App Router, React Compiler) · TypeScript (strict) · Tailwind CSS 4
- GSAP + ScrollTrigger + Lenis for motion and smooth scroll
- Zod · React Hook Form
- Everything on the client's own **cPanel server** (HostCarts, Singapore):
  the site as a **Node.js app** (Node 22, Passenger), **MySQL 8.0** through
  Drizzle ORM, admin sign-in with Better Auth, images and CVs as files on the
  server, a cPanel cron job. Supabase was dropped (2026-10-28).
- Built and deployed by GitHub Actions over SSH on each release, **and only
  after the user confirms the client's full payment**
- Email sent through the server's cPanel mail from `noreply@alhidaya.qa`; the
  company's mailboxes (info@, hr@) are on **Microsoft 365**
- Cloudflare Turnstile (forms) · Cloudflare Web Analytics (cookieless)
- Vitest · Testing Library · Playwright + axe; 100% coverage, as clinicdesk

Conventions follow clinicdesk (`/Users/jaffa/projects/clinicdesk`).

## Users

Four audiences reach the public site, all in Qatar, mostly on phones:

- **Families arranging care** for a parent, a patient coming home from
  hospital, a new mother or a child: home nursing, elderly, palliative,
  chronic, maternity and newborn, and child care. Often worried, often
  deciding quickly, comparing against the cost of a hospital stay.
- **Hospitals and clinics** looking for nurse staffing: procurement or
  nursing managers judging reliability and credentials.
- **Schools** that need a school nurse.
- **Nurses looking for work** in Qatar: they read the job, check the
  requirements (MOPH licence, Dataflow, Prometric) and apply with a CV.

**One admin** (an Al Hidaya staff member) runs the site through the admin
panel: services, jobs, client logos, text and images, enquiries,
applications, the brochure, contact details and SEO.

## Product Purpose

The public website of **Al Hidaya Health Care Services**, a Doha nursing
care company: it presents what they do, earns trust, and turns visits into
care requests, staffing quotes and job applications. The admin panel lets
the company keep it current without a developer, while the design stays
fixed.

**Success:** a family knows within seconds that Al Hidaya brings qualified
nurses to their home and reaches them on WhatsApp or by phone; a hospital,
clinic or school requests a staffing quote; a nurse finds a job and applies
with a CV; and the admin can change any content without breaking the design.

## Positioning

From the company's own material (alhidaya.qa, 2026-10-28):

- **"Quality nursing care at your doorstep"** — care at home and in clinics.
- **Affordable compared with hospital care**, without lowering quality.
- **Nurses available around the clock** (the company's own 24/7 claim).
- **Two businesses under one roof:** home care for families, and nurse
  staffing for hospitals, clinics and schools.
- Values: committed to patients, to leadership and to excellence; care given
  with compassion, dignity and respect for every culture.

## Operating Context

- **Doha, Qatar.** Office: Retaj Building, Bin Naifaa 80, near Asmakh Mall,
  first floor, door 109, Al Sadd, Doha.
- **WhatsApp and the phone are how people reach a business here.**
  Phone and WhatsApp: +974 3130 6555. Email: info@alhidaya.qa (enquiries),
  hr@alhidaya.qa (applications).
- **Different audiences, different next steps:** families go to WhatsApp or
  a call; hospitals, clinics and schools go to the quote form; nurses go to
  Careers.
- **Nursing in Qatar is licensed:** job posts ask for an MOPH licence (or
  home-country registration), Dataflow and Prometric.
- **English at launch, Arabic later** (`/ar`, right-to-left). English URLs
  never change when Arabic arrives.
- **The current site is replaced on the same domain**, with 301 redirects
  from every old URL (`/about_us`, `/service-detail/<slug>`, `/careers`,
  `/contact-us`).

## Capabilities and Constraints

Confirmed by the user (2026-10-28); the plan holds the full decision log.

- **Pages:** Home, About, Services (one list of services, each with its own
  page), Careers (jobs, job detail, apply), Contact, Request a Quote,
  Privacy, Terms.
- **Forms:** Request a Quote and Contact (fixed in code), protected by
  Turnstile, a honeypot and a rate limit. Every submission goes to the admin
  inbox and is emailed to the right mailbox.
- **Job applications** with a CV upload: the CV is kept in a private folder
  on the company's server and attached to the HR email; the application
  details are in the database.
- **Retention:** submissions and CVs are deleted automatically after a period
  the admin sets, at most one year.
- **Admin:** a Content CMS. Edit all text and images, show, hide and reorder
  sections of each page, and manage services, jobs, client logos, enquiries,
  applications, the brochure, contact details, navigation and footer links,
  and SEO. Edits are drafts until **Publish**, with a preview. One admin
  account, email and password.
- **The design is locked:** no colour, font, layout or theme controls in the
  admin.
- **Light theme only** on the public site.
- **The server is small:** 1 GB of disk, 5 GB of bandwidth a month and 1 GB
  of memory on today's hosting plan; whether to upgrade is undecided (plan
  Q25).

## Brand Commitments

- **Name:** Al Hidaya Health Care Services (the user, 2026-10-28). The logo
  reads "Al Hidaya Health Care Service WLL" and
  "الهداية للخدمات الطبية التمريضية ذ.م.م".
- **Logo:** `New Al Hidaya LH-01 (2).jpg` — a blue swoosh holding two
  crosses, a figure and a green leaf, with a bilingual wordmark.
- **Colours come from the logo** (the user, binding): sky blue (≈ `#33A0DA`),
  deep blue (≈ `#0F64AC`) and leaf green (≈ `#86AE3C`), sampled from the
  logo file.
- **Premium and professional, with animation at a professional level and
  nothing childish** (the user, binding): no cartoons, mascots, clip-art or
  playful decoration, even for child and newborn care.
- **Very smooth everywhere** (the user, binding): no lag or jank in scroll or
  animation on any page.
- **The visual world comes from hospitals and healthcare** (the user,
  2026-10-28, standing preference): directions are drawn from medical and
  care settings, always in the logo's colours.
- **Copy is rewritten** in polished professional English from the company's
  real facts, and the client approves it before launch.

## Evidence on Hand

- The company's services, contact details, address, values and one real job
  post (Registered General Nurse – Home Care), from alhidaya.qa.
- The logo file above.
- **Named client logos** — the client will supply names and permission.
- The company brochure (`profile.pdf` on the current site).
- **Photography:** hand-picked licensed stock at launch, replaced by the
  client's own photos through the admin later. Stock is never presented as
  Al Hidaya's own staff in captions or alt text.
- **Absent, and never to be invented:** an MOPH licence number, statistics
  (years, nurses, patients), testimonials, ratings, awards, accreditations
  and a founding year. The site ships without them until real ones are given.

## Product Principles

1. **One obvious next step per audience.** A family, an institution and a
   nurse each find their own way forward without reading the whole site.
2. **Trust is shown, never inflated.** Only real facts, real clients and
   real credentials; nothing made up to fill a section.
3. **Calm, premium, effortless.** Every page loads fast and moves smoothly;
   motion serves comprehension, never decoration for its own sake.
4. **The admin can't break it.** Content is editable; the design is not.
5. **Their data stays private.** Enquiries and CVs are seen only by the
   admin and are deleted on schedule.

## Accessibility & Inclusion

- **WCAG 2.2 AA**; touch targets ≥ 44 px; inputs at 16 px.
- **Reduced motion respected:** every animation and the smooth scroll have a
  calm, motion-free path.
- **Readers under stress and older family members:** generous text, high
  contrast, plain words.
- **Built for right-to-left** so Arabic can arrive without a redesign.
- Full keyboard use, visible focus, screen-reader labels, colour never the
  only signal.
