---
version: 1
slug: "src-app-admin-page-tsx"
primary_target: "src/app/admin/page.tsx"
related_targets: ["src/app/admin/layout.tsx"]
---

## Scope

The admin panel (plan §16, §30.5; R6.1, D80): sign-in, the shell, Today, the
Enquiries section now; Applications (Phase 5) and the content editors
(Phase 6) later, in the same shell. Operate mode.

## Audience and job

One Al Hidaya office staff member, not technical, mostly at a desktop, sometimes
reading on a phone. Daily job: handle new enquiries and applications;
occasionally edit the site. Success: a new enquiry read, answered by call,
WhatsApp or email, moved along and noted without leaving the stream.

## Direction contract

THESIS: the admin is the day's log of a ward's front desk: one stream of what
arrived, newest first and ruled by day, each row handled where it is. It refuses
the dashboard of KPI tiles and charts, the public site's signs and motion, and
page-per-click inbox work.

OWN-WORLD: the site's world, quieter. A navy rail that is the line: sections as
stations on a sky line, the current one the white "You are here" station, new
counts in sky pills. A white work area; mist for an opened row; deep blue for
actions and "New", sky for in progress, leaf for resolved; error red only for
failures, with icon and words. Atkinson Hyperlegible Next at a fixed rem scale;
times in tabular figures; 6 px radii; hairline rules.

STORY: the admin opens on Today and sees what needs them, opens a row, calls,
moves it along, notes it, and trusts nothing was missed.

FIRST VIEWPORT: the rail; "Today" with Needs you / Everything; a day rule; the
newest arrival opened in place (every answer, Call, WhatsApp, Email, Move to,
a note box), the rest as one-line rows with time, title, summary and a status
chip. Phone: a top bar naming the section with a menu; full-width rows.

FORM: the chosen sketch, .impeccable/mocks/decision/dealt-log.html (surface
seed 393284a0, dealt structure, code-led).

FINISH: built to the sketch at desktop and phone with every state; reviewed
against this contract before Phase 4 closes.

## Constraints

Logo colours only (D35), light only (D28); the public site's tokens and kit;
no smooth scroll, motion 150-250 ms for state only, none with reduced motion;
WCAG 2.2 AA, 44 px targets; Arabic-ready logical properties; plain words, no
jargon; no modal for daily work. The admin never loads the public site's motion.

## The content editors (R6.3, shaped 2026-10-30; plan D86 – D90)

The Pages editor sets the pattern Services, Jobs, Clients and Settings follow:
the day's log, for content.

- **Pages** (`/admin/pages`, the first station of "The site"): the eight fixed
  pages as one-line rows with their address and state (Published, Changes not
  published, Never published); the station's sky count is the pages waiting.
  Today lists what waits to be published above its log.
- **A page:** a bar kept in view with the page's name, its state (Unsaved
  changes, Saved, Publishing, Published, Publish failed) and Save draft,
  Preview (new tab, the saved draft), Publish and Discard draft (both asked
  first; Publish saves first; leaving unsaved asks first). Below, the
  sections as numbered rows: a grip, the type, its heading, Hidden when
  hidden; Edit, Hide/Show, Move up/down, Remove (asked first). Edit opens
  the row in place on mist with the type's fields; text block by block;
  a photo picked from the library in a dialog. Add a section offers only
  what the page allows. SEO last. Errors at their field and counted in the
  bar.
- Desktop first; on a phone rows are full width and actions wrap.
